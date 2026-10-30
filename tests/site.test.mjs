// Static checks on a real production build: node --test tests/*.test.mjs
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist-test");
const BASE = "/horizon-nexus-site/";
async function walk(d) { const out = []; for (const e of await readdir(d, { withFileTypes: true })) { const p = join(d, e.name); e.isDirectory() ? out.push(...(await walk(p))) : out.push(p); } return out; }
let files, html;
before(async () => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: root, env: { ...process.env, OUT: "dist-test", BASE } });
  files = await walk(dist);
  html = await Promise.all(files.filter((f) => f.endsWith(".html")).filter((f) => !/http-equiv="refresh"/.test(readFileSync(f, "utf8"))).map(async (f) => [f, await readFile(f, "utf8")]));
});

test("every required page is built", async () => {
  for (const p of ["index.html", "features/index.html", "architecture/index.html", "docs/index.html", "roadmap/index.html", "changelog/index.html", "downloads/index.html", "faq/index.html", "contributing/index.html", "releases/index.html", "docs/glossary/index.html", "404.html",
    ...["system-lifecycle", "execution-stages", "typed-events", "engine-integration", "api-limitations", "planned-extensibility", "security-model", "mod-packaging", "installation-architecture", "developer-setup"].map((s) => `docs/${s}/index.html`)])
    assert.ok((await stat(join(dist, p))).isFile(), p);
});

test("internal links and assets resolve under the base path", async () => {
  const broken = [];
  for (const [f, s] of html) for (const m of s.matchAll(/(?:href|src)="([^"#]+)/g)) {
    const url = m[1].split("?")[0];
    if (/^(https?:|mailto:)/.test(url)) continue;
    if (!url.startsWith(BASE)) { broken.push(`${f}: ${url} (not under base)`); continue; }
    let target = join(dist, url.slice(BASE.length));
    try { if ((await stat(target)).isDirectory()) target = join(target, "index.html"); await stat(target); } catch { broken.push(`${f}: ${url}`); }
  }
  for (const css of files.filter((f) => f.endsWith(".css"))) for (const m of (await readFile(css, "utf8")).matchAll(/url\("([^"]+)"\)/g)) {
    try { await stat(join(dirname(css), m[1])); } catch { broken.push(`${css}: ${m[1]}`); }
  }
  assert.deepEqual(broken, []);
});

test("in-page anchors exist", () => {
  for (const [f, s] of html) for (const m of s.matchAll(/href="#([^"]+)"/g)) assert.ok(s.includes(`id="${m[1]}"`), `${f} #${m[1]}`);
});

test("every page has a title, description, canonical, og:image, lang, one h1 and alt on images", () => {
  for (const [f, s] of html) {
    assert.match(s, /<html lang="en"/, f); assert.match(s, /<title>[^<]+<\/title>/, f);
    assert.match(s, /name="description" content="[^"]{20,}"/, f); assert.match(s, /rel="canonical"/, f); assert.match(s, /og:image" content="https:/, f);
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${f} h1 count`);
    for (const m of s.matchAll(/<img [^>]*>/g)) assert.match(m[0], /alt="/, `${f} ${m[0]}`);
  }
});

test("honesty: notices present, v0.4 never called complete, no fake downloads", () => {
  for (const [f, s] of html) {
    assert.match(s, /not approved by or associated with Mojang or Microsoft/, `${f} Mojang notice`);
    assert.match(s, /developer-reported/i, `${f} developer-reported label`);
    assert.doesNotMatch(s, /(?<!(?:once|when|until|after) )v0\.4[bcd]?(?: [A-Za-z]+){0,3} (?:is|was|has been) (?:complete|completed|released|shipped)\b/i, `${f} v0.4 claimed complete`);
    assert.doesNotMatch(s, /href="[^"]+\.(?:exe|dmg|msi|zip|jar|nmod)"/i, `${f} download link`);
    assert.doesNotMatch(s, /cargo install|npm install nexus|curl [^<]*\| ?sh/i, `${f} invented install step`);
  }
});

test("no secrets in the repository", async () => {
  const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
  const pattern = /(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abp]-[A-Za-z0-9-]{10,})/;
  for (const f of tracked) {
    if ([".png", ".woff2", ".webp"].includes(extname(f))) continue;
    try { assert.doesNotMatch(await readFile(join(root, f), "utf8"), pattern, f); } catch (e) { if (e.code !== "ENOENT" && e.code !== "EISDIR") throw e; }
  }
});

// WCAG contrast of the token pairs the site actually uses.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
const lum = (h) => { const [r, g, b] = hex(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
test("text colour pairs meet WCAG AA (4.5:1)", async () => {
  const css = await readFile(join(root, "src/tokens.css"), "utf8");
  const t = Object.fromEntries([...css.matchAll(/--([a-z-]+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
  const pairs = [];
  for (const fg of ["ink", "ink-soft", "muted", "accent", "highlight"]) for (const bg of ["page", "deep", "side", "panel", "raised", "button", "well"]) pairs.push([fg, bg]);
  pairs.push(["on-face", "face"]);
  const fails = pairs.map(([f, b]) => [f, b, ratio(t[f], t[b])]).filter(([, , r]) => r < 4.5).map(([f, b, r]) => `${f} on ${b}: ${r.toFixed(2)}`);
  assert.deepEqual(fails, []);
});

test("scope: no em-dashes, no Fabric/Forge plans, no invented versions or percentages", () => {
  const ALLOWED = ["Nexus is a native Rust modding platform for Horizon and does not load Java Fabric or Forge mods.", "Fabric, Forge and NeoForge compatibility are out of scope."];
  for (const [f, s] of html) {
    const text = s.replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(s, /\u2014/, `${f} em-dash`);
    const fabric = ALLOWED.reduce((x, a) => x.split(a).join(""), text).replace(/Fabric or Forge mods\?/g, "");
    assert.doesNotMatch(fabric, /Fabric|Forge|NeoForge|compatibility research|Java mod (?:compat|bridge)/i, `${f} Fabric/Forge mention`);
    assert.doesNotMatch(text.replace(/no (?:planned )?v0\.5 or v1\.0 (?:milestones|features)/gi, ""), /\bv0\.[5-9]\b|\bv1\.0\b/, `${f} invented version`);
    assert.doesNotMatch(text, /\b\d{1,3}\s?%/, `${f} percentage`);
    assert.doesNotMatch(text, /(?<!(?:once|when|until|after) )v0\.4(?:[cd]|b\.[234])(?: [A-Za-z:]+){0,4} (?:is|was|has been|now) (?:complete|completed|released|shipped|available)\b/i, `${f} v0.4 claimed done`);
    assert.doesNotMatch(text, /v0\.4a[^.]{0,40}\b(?:in development|not (?:yet )?implemented|proposed)\b/i, `${f} stale v0.4a status`);
    assert.doesNotMatch(s, /href="[^"]*\/commit\/(?:0fcc557b1|52aedd384|2a01521ee|fb43e5954)/, `${f} fabricated commit link`);
    assert.doesNotMatch(s, /href="[^"]*\/releases\/(?:tag|download)\//, `${f} fabricated release link`);
  }
});

test("future modules are labelled as ideas, never as available", () => {
  const page = html.find(([f]) => f.endsWith("dist-test/features/index.html"))[1];
  for (const name of ["Nexus Performance", "Nexus Cinematics", "Nexus World Tools", "Nexus Quality of Life"]) {
    const i = page.indexOf(name); assert.ok(i > 0, name);
    assert.match(page.slice(i - 400, i + 50), /Idea, not promised/, `${name} label`);
  }
  assert.match(page, /does not keep them loaded and ticking/);
});

test("home is short, has the exact hero copy and the primary nav", () => {
  const home = html.find(([f]) => f.endsWith("dist-test/index.html"))[1];
  const main = home.slice(home.indexOf("<main"), home.indexOf("</main>"));
  assert.ok((main.match(/<section class="(?:hero|section)/g) || []).length <= 5, "too many home sections");
  for (const s of ["The Horizon modding platform", "Change the game.", "Create, modify and extend Horizon with a powerful Rust-native modding framework and loader.", "Explore Nexus", "Documentation", "Currently in development. Standalone installation is not yet available.", "Latest Development", "CRISIS AVERTED. BACK TO BUILDING: NEXUS v0.4b.2", "No blocks were harmed.", "View development roadmap"]) assert.ok(main.includes(s), s);
  assert.doesNotMatch(main, /18\/18|32\/32|fb43e5954|0fcc557b1/, "home shows engineering detail");
  const nav = home.slice(home.indexOf('class="nav-links"'), home.indexOf("</ul>", home.indexOf('class="nav-links"')));
  assert.deepEqual([...nav.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]), ["Home", "Features", "Roadmap", "Docs", "Releases", "GitHub"]);
});

test("releases page: no public release, local milestones newest first", () => {
  const r = html.find(([f]) => f.endsWith("dist-test/releases/index.html"))[1];
  assert.ok(r.includes("No public standalone Nexus release is available yet."));
  const order = ["v0.4b.1:", "Audit:", "v0.4a:", "v0.3:", "v0.2:", "v0.1:"].map((v) => r.indexOf(v));
  assert.deepEqual([...order].sort((a, b) => a - b), order); assert.ok(order[0] > 0);
  assert.match(r, /fb43e5954/); assert.match(r, /does not install or execute/);
  const road = html.find(([f]) => f.endsWith("dist-test/roadmap/index.html"))[1];
  assert.match(r, /Locally committed development milestones/); assert.match(r, /Publicly downloadable releases/);
  assert.match(r, /9198d320e[^]*35\/35 distinct tests passing/); assert.match(r, /external \.nmod package installation is not available yet/);
  assert.match(road, /v0\.4b\.2: Secure \.nmod package staging and generated registration[^]*In development[^]*SHA-256 content integrity verification/);
  assert.match(road, /v0\.4b\.1 Complete: Native Mod Registration Foundation/);
  assert.doesNotMatch(road, /underway|Planned, authorized|Next, not started/);
  for (const v of ["v0.4b.3", "v0.4b.4", "v0.4c to d"]) for (const [f, s] of html) { const i = s.indexOf(`${v}: `); if (i > 0) assert.doesNotMatch(s.slice(i, i + 300), /badge[^"]*">(?:Completed|Current|In progress)</, `${f} ${v} status`); }
  assert.doesNotMatch(road, /Requested/);
  assert.match(r, /Pre-v0\.4b audit: stabilization and resource-safety fixes[^]*8f809e822[^]*33\/33/);
  assert.match(r, /Typed Inter-System Events/);
});

test("old docs URLs redirect to existing pages", async () => {
  for (const f of files.filter((x) => x.endsWith("index.html"))) {
    const s = await readFile(f, "utf8"); const m = s.match(/url=([^"]+)"/);
    if (!/http-equiv="refresh"/.test(s)) continue;
    let target = join(dist, m[1].slice(BASE.length)); if ((await stat(target)).isDirectory()) target = join(target, "index.html");
    assert.ok((await stat(target)).isFile(), m[1]);
  }
});
test("no unrendered template placeholders", () => { for (const [f, s] of html) assert.doesNotMatch(s, /\$\{/, f); });

test("readability: docs, features and architecture are written for players first", () => {
  const strip = (x) => x.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
  const sentences = (x) => strip(x).split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).filter((s) => /[a-z]/i.test(s));
  const targets = html.filter(([f]) => /dist-test\/((features|architecture|roadmap|releases|downloads|faq|contributing|docs(\/[^/]+)?)\/index|404)\.html$/.test(f));
  assert.ok(targets.length >= 19, `found ${targets.length} pages`);
  for (const [f, s] of targets) {
    const main = s.slice(s.indexOf("<main"), s.indexOf("</main>"));
    const leads = [...main.matchAll(/<p class="lead-plain">([^]*?)<\/p>/g)].map((m) => m[1]);
    assert.ok(leads.length >= 1, `${f} has no plain lead`);
    for (const l of leads) {
      const ss = sentences(l);
      assert.ok(ss.length <= 2, `${f} lead has ${ss.length} sentences: ${strip(l)}`);
      assert.ok(strip(l).split(" ").length <= 40, `${f} lead too long: ${strip(l)}`);
    }
    if (!/faq|404/.test(f)) assert.match(main, /What this means for you/, `${f} missing "What this means for you"`);
    const devAt = main.indexOf('<section class="for-devs"');
    const plain = (devAt > 0 ? main.slice(0, devAt) : main).replace(/<details[^]*?<\/details>/g, "").replace(/<table[^]*?<\/table>/g, "");
    for (const [, p] of plain.matchAll(/<p(?: class="(?:lead-plain|caption|term)")?>([^]*?)<\/p>/g))
      for (const sn of sentences(p)) assert.ok(sn.split(" ").length <= 30, `${f} long plain sentence: ${sn}`);
    if (!/developer-setup|glossary|404/.test(f)) assert.ok(/<p class="lead-plain">/.test(main.slice(0, main.indexOf("<h2") > 0 ? main.indexOf("<h2") : undefined)), `${f} lead must come before the first heading`);
  }
});

test("home tracker lists done, building and planned in order", () => {
  const home = html.find(([f]) => f.endsWith("dist-test/index.html"))[1];
  const tr = home.slice(home.indexOf('class="track"'), home.indexOf("</ol>", home.indexOf('class="track"')));
  const at = ["Done", "Building now", "Planned"].map((x) => tr.indexOf(`<span class="t-state">${x}</span>`));
  assert.ok(at.every((x) => x > 0) && at[0] < at[1] && at[1] < at[2], "tracker order");
  assert.match(tr, /aria-current="step"[^]*v0\.4b\.2/); assert.doesNotMatch(tr, /%/);
});

test("home banner shows the in-development milestone with an indeterminate bar", async () => {
  const { CURRENT_MS } = await import("../src/content.mjs");
  assert.equal(CURRENT_MS.ver, "v0.4b.2");
  const home = html.find(([f]) => f.endsWith("dist-test/index.html"))[1];
  const i = home.indexOf('class="build-banner"');
  assert.ok(i > home.indexOf("</header>") && i < home.indexOf('class="hero"'), "banner sits below the nav, above the hero");
  const banner = home.slice(i, home.indexOf("</aside>", i));
  assert.ok(banner.includes(`CRISIS AVERTED. BACK TO BUILDING: NEXUS ${CURRENT_MS.ver}`));
  assert.match(banner, /class="buddy"/); assert.doesNotMatch(banner, /complete|breach|outage|lost/i);
  for (const [f, s] of html) { const t = s.replace(/<[^>]+>/g, " "); assert.doesNotMatch(t, /Paused, Investigation|INVESTIGATION UNDERWAY|DEVELOPMENT PAUSED|v0\.4b\.2 is paused/, f); }
  assert.match(home, /assets\/style\.css\?v=[0-9a-f]{10}"/, "css is cache-busted");
  assert.match(banner, /roadmap\//); assert.match(banner, /role="progressbar"/); assert.match(banner, /Building\.\.\./);
  assert.doesNotMatch(banner, /aria-valuenow|\d+\s*%/, "progress must be indeterminate");
  const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.build-banner::before, \.live-dot, \.indet i, \.buddy, \.sweat, \.phew \{ animation: none/);
  for (const [f, s] of html) assert.doesNotMatch(s, /(?:mod installation|native compilation) (?:works|is available)/i, f);
});

test("v4.0: docs list folds on phones, footer shows live status, social meta is complete", () => {
  for (const [f, s] of html) {
    if (f.includes("/docs/") && !f.includes("redirect") && s.includes('class="docs-nav"')) assert.match(s, /<details class="docs-toc" data-docs-toc><summary>[^]*?All docs \(\d+\)/, f);
    if (/http-equiv="refresh"/.test(s)) continue;
    for (const m of ["twitter:title", "twitter:description", "twitter:image", 'name="color-scheme"']) assert.ok(s.includes(m), `${f} missing ${m}`);
    assert.match(s, /class="foot-status"[^]*?Now building v0\.4b\.2/, f);
    assert.doesNotMatch(s, /\d+\s*%\s*(?:done|complete)/i, f);
  }
});

test("v4.0: roadmap has jump links and folds long completed lists", () => {
  const road = html.find(([f]) => f.endsWith("dist-test/roadmap/index.html"))[1];
  for (const id of ["completed", "current", "planned"]) { assert.ok(road.includes(`href="#${id}"`)); assert.ok(road.includes(`id="${id}"`)); }
  assert.match(road, /<details class="more-items"><summary>What it added \(\d+\)<\/summary>/);
});

test("v5 phase 1: source note once, no filler, footer folds, tables stack, joke only in banner", () => {
  const docs = html.filter(([f]) => f.includes("dist-test/docs/") && !/http-equiv="refresh"/.test(html.find(([g]) => g === f)[1]));
  const full = docs.filter(([, s]) => s.includes("Not verified against public upstream. There is no public API reference yet"));
  assert.equal(full.length, 1, "full source note appears on one doc page only");
  for (const [f, s] of html) {
    if (/http-equiv="refresh"/.test(s)) continue;
    assert.doesNotMatch(s, /<span>example<\/span>|<th>Goals<\/th>/, f);
    assert.match(s, /<details class="foot-links-fold" data-fold-wide><summary>Site links<\/summary>/, f);
    assert.doesNotMatch(s, /<table>/, `${f} has an unstacked table`);
  }
  const road = html.find(([f]) => f.endsWith("dist-test/roadmap/index.html"))[1];
  const panel = road.slice(road.indexOf('class="panel current-panel'));
  assert.doesNotMatch(panel.slice(0, 2000), /went for a little wander/);
  const faq = html.find(([f]) => f.endsWith("dist-test/faq/index.html"))[1];
  assert.equal((faq.match(/being built\?/g) || []).length, 0);
});

test("v5 phase 2: docs have an on-page list and labelled pager, devs box is one style", () => {
  const te = html.find(([f]) => f.endsWith("dist-test/docs/typed-events/index.html"))[1];
  assert.match(te, /<nav class="on-page" aria-label="On this page">[^]*?href="#for-developers"/);
  assert.match(te, /class="button pager-prev"[^]*?<small>Previous<\/small>[^]*?class="button pager-next"[^]*?<small>Next<\/small>/);
  const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
  assert.match(css, /\.for-devs \{ border: 2px solid/);
});
