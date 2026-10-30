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

test("home is short, has the exact hero copy, the status card and the primary nav", () => {
  const home = html.find(([f]) => f.endsWith("dist-test/index.html"))[1];
  const main = home.slice(home.indexOf("<main"), home.indexOf("</main>"));
  assert.ok((main.match(/<section class="(?:hero|section)/g) || []).length <= 5, "too many home sections");
  for (const s of ["Horizon Nexus", "Native Rust modding for Horizon.", "A source-compiled modding framework and package loader built to extend Horizon through native Rust APIs, events and engine integration.", "Latest completed", "v0.4b.1", "In development", "v0.4b.2", "Latest checkpoint", "4.3e", "Next checkpoint", "4.4a (not complete)", "Internal tests", "156/156 passing at latest verified checkpoint", "Horizon Nexus can validate native mod packages, preserve verified archives, safely extract their contents, independently audit extracted files, verify their cryptographic provenance, and publish versioned integrity manifests. Native mod installation, user trust approval and runtime activation remain in development.", "Public availability", "Not yet released", "Currently in active development. Public downloads will become available after installation support and security validation are complete."]) assert.ok(main.includes(s), s);
  assert.doesNotMatch(main, /18\/18|32\/32|fb43e5954|0fcc557b1|3\.4b|ZIP 9/, "home shows engineering detail");
  assert.doesNotMatch(main, /production[- ]ready|100% secure|fully sandboxed|safe to run any mod/i);
  const nav = home.slice(home.indexOf('class="nav-links"'), home.indexOf("</ul>", home.indexOf('class="nav-links"')));
  assert.deepEqual([...nav.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]), ["Home", "Features", "Roadmap", "Development"]);
  for (const p of ["docs/", "releases/", "faq/", "search/"]) assert.ok(home.slice(home.indexOf("<footer")).includes(`href="/horizon-nexus-site/${p}"`), `footer links ${p}`);
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
  assert.match(road, /v0\.4b\.2: Secure package loading and installation foundations[^]*In development/);
  assert.match(road, /v0\.4b\.1: Native mod registration foundations/);
  assert.doesNotMatch(road, /underway|Planned, authorized|Next, not started/);
  for (const v of ["v0.4b.3", "v0.4b.4", "v0.4c to d"]) for (const [f, s] of html) { const i = s.indexOf(`${v}: `); if (i > 0) assert.doesNotMatch(s.slice(i, i + 300), /badge[^"]*">(?:Completed|Current|In progress)</, `${f} ${v} status`); }
  assert.doesNotMatch(road, /Requested/);
  assert.match(r, /Pre-v0\.4b audit: stabilization and resource-safety fixes[^]*8f809e822[^]*33\/33/);
  assert.match(r, /Typed event bus and deterministic dispatch/);
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

test("v5 phase 3: releases jump list and folds, glossary A to Z, plain target list, no fake download bar", () => {
  const get = (p) => html.find(([f]) => f.endsWith(`dist-test/${p}`))[1];
  const rel = get("releases/index.html");
  assert.match(rel, /<nav class="jump" aria-label="Jump to a milestone">/);
  assert.equal((rel.match(/<details class="more-items" open>/g) || []).length, 1, "only the newest release is open");
  const g = get("docs/glossary/index.html");
  assert.match(g, /<nav class="jump az"/);
  for (const m of g.matchAll(/href="#(g-[^"]+)"/g)) assert.ok(g.includes(`id="${m[1]}"`));
  assert.match(get("features/index.html"), /<ul class="target-list/);
  const dl = get("downloads/index.html");
  assert.doesNotMatch(dl, /launcher-bar|No download<\/span>/);
});

test("v5 phase 4: search page and index, per-page share images, minified css", async () => {
  const s = html.find(([f]) => f.endsWith("dist-test/search/index.html"))[1];
  assert.match(s, /<label for="q"[^>]*>Search the site<\/label><input id="q" type="search"/);
  assert.match(s, /aria-live="polite"/);
  const idx = JSON.parse(readFileSync(join(dist, "search.json"), "utf8"));
  assert.ok(idx.length >= 20 && idx.every((p) => p.t && p.u.startsWith(BASE) && typeof p.x === "string"));
  assert.ok(idx.some((p) => /typed events/i.test(p.t)));
  const road = html.find(([f]) => f.endsWith("dist-test/roadmap/index.html"))[1];
  assert.match(road, /og:image" content="[^"]*og\/roadmap\.png"/);
  await stat(join(dist, "og/roadmap.png"));
  assert.doesNotMatch(readFileSync(join(dist, "assets/style.css"), "utf8"), /\/\*/);
});

test("v6: calm home, checkpoint list, new roadmap, development page", () => {
  const get = (p) => html.find(([f]) => f.endsWith(`dist-test/${p}`))[1];
  const home = get("index.html");
  assert.doesNotMatch(home, /build-banner|CRISIS AVERTED|wander|No blocks were harmed|role="progressbar"|class="buddy"/);
  for (const [f, s] of html) assert.doesNotMatch(s.replace(/<[^>]+>/g, " "), /v0\.4b\.[34]\b|went for a little wander|CRISIS AVERTED/, f);
  const road = get("roadmap/index.html"), dev = get("development/index.html");
  const want = [["3.1", "ZIP dependency migration", "Complete"], ["3.2", "Archive consistency gate", "Complete"], ["3.3", "Entry metadata security validation", "Complete"], ["3.4a", "Collision and manifest checks", "Complete"], ["3.4b", "Resource limits and preflight report", "Complete"], ["4.0", "Security review", "Complete"], ["4.1a", "Archive-size cap and directory rules", "Complete"], ["4.1b", "SHA-256 archive identity", "Complete"], ["4.2a", "CRC-32 and compressed size", "Complete"], ["4.2b", "Private archive custody", "Complete"], ["4.2c-a", "Extraction path planning", "Complete"], ["4.2c-b", "Capability-based filesystem security", "Complete"], ["4.2c-c", "Streaming content verification", "Complete"], ["4.2c-d", "Secure mod extraction", "Complete"], ["4.3a", "Snapshot integrity audit", "Complete"], ["4.3b", "Cryptographic provenance", "Complete"], ["4.3c", "Unicode filename security", "Complete"], ["4.3d", "Versioned snapshot manifests", "Complete"], ["4.3e", "Atomic manifest publication", "Complete"], ["4.4a", "Explicit native-mod trust-request foundation", "Next"], ["", "Genuine user approval before native compilation", "Planned"], ["", "Controlled native build, installation and loading", "Planned"]];
  for (const page of [road, dev]) {
    const items = [...page.slice(page.indexOf('<ol class="checklist">')).split("</ol>")[0].matchAll(/<li class="ck-[a-z]+">[^]*?<\/li>/g)].map((m) => m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    assert.deepEqual(items, want.map(([id, n, st]) => [id, n, st].filter(Boolean).join(" ")));
  }
  assert.match(dev, /156\/156 tests passing at the latest verified checkpoint \(Nexus Loader 135\/135, Nexus Runtime 21\/21\)/);
  assert.match(dev, /21 development checkpoints completed/);
  assert.match(road + dev, /Next is 4\.4a[^<]*It is not complete\./);
  for (const p of [road, dev]) {
    assert.match(p, /<li class="ck-next"><span class="ck-mark"[^>]*><\/span><span class="ck-name"><b>4\.4a<\/b>/, "4.4a is Next");
    assert.doesNotMatch(p, /<li class="ck-done"><span class="ck-mark"[^>]*><\/span><span class="ck-name"><b>4\.4a<\/b>/, "4.4a must not be complete");
    const ids = [...p.slice(p.indexOf('<ol class="checklist">')).split("</ol>")[0].matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, "no duplicate checkpoints");
    assert.equal((p.match(/class="tl-step tl-/g) || []).length, 3);
    for (const n of ["Atomic manifest publication", "Actual bounded file extraction", "v0.4c: Expanded gameplay and engine modding APIs", "Comprehensive final audit, then a development pause"]) assert.ok(p.includes(n), n);
  }
  assert.match(road, /156\/156 tests passing/);
  const rel = get("releases/index.html");
  for (const p of [home, road, dev, rel]) { assert.doesNotMatch(p, /\b(?:84|115)(?:\/115)? (?:passing|tests)|\d+% (?:complete|done)/); }
  for (const p of [home, rel]) { assert.match(p, /156\/156/); assert.match(p, /4\.3e/); assert.match(p, /4\.4a/); }
  assert.doesNotMatch(home + road + dev, /Bounded extraction \(|Snapshot validation<|not actually unpacked|Unpacking and installing mods are not done yet/);
  for (const v of ["v0.4c: Expanded gameplay and engine modding APIs", "v0.4d: SDK, package tooling, mod profiles, versioning, rollback and broader extensibility", "Final hardening"]) assert.ok(road.includes(v), v);
  assert.match(road, /feature development is planned to pause pending further direction/);
  assert.match(dev, /older ZIP dependencies under security review/);
  assert.doesNotMatch(home, /older ZIP dependencies/);
  assert.match(dev, /not sandboxed/);
  for (const [f, s] of html) assert.doesNotMatch(s, /\/home\/|\/Users\/|C:\\|recover(?:y|ed) (?:procedure|branch)/i, `${f} workstation path or recovery detail`);
  const dl = get("downloads/index.html");
  assert.ok(dl.includes("Currently in active development. Public downloads will become available after installation support and security validation are complete."));
  assert.doesNotMatch(dl, /<a [^>]*class="button[^"]*"[^>]*>\s*Download/i);
});

test("pixel font ligatures are off so 'fi' never misreads", () => {
  const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
  assert.match(css, /\*, \*::before, \*::after \{ font-variant-ligatures: none; font-feature-settings: "liga" 0/);
});

test("v6.2: maybe-someday vision is labelled as an idea, not a plan", () => {
  const get = (p) => html.find(([f]) => f.endsWith(`dist-test/${p}`))[1];
  const feat = get("features/index.html");
  const sec = feat.slice(feat.indexOf('aria-labelledby="vision"')).split("</section>")[0];
  assert.match(sec, /This is an idea, not a plan\./);
  assert.match(sec, /not on the roadmap/);
  assert.match(sec, /built for Horizon only, and none of the uses below exist/);
  for (const w of ["Game engines", "Desktop software", "Servers", "Installers", "Developer tools", "Simulators"]) assert.ok(sec.includes(w), w);
  assert.doesNotMatch(sec, /v\d|reveal|\b20\d\d\b/);
  for (const p of ["index.html", "roadmap/index.html"]) assert.doesNotMatch(get(p), /universal foundation/);
});
