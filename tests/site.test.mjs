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
  for (const p of ["index.html", "features/index.html", "architecture/index.html", "docs/index.html", "roadmap/index.html", "changelog/index.html", "downloads/index.html", "faq/index.html", "contributing/index.html", "releases/index.html", "404.html",
    ...["system-lifecycle", "execution-stages", "typed-events", "engine-integration", "api-limitations", "planned-extensibility", "security-model", "mod-packaging", "installation-architecture", "developer-setup"].map((s) => `docs/${s}/index.html`)])
    assert.ok((await stat(join(dist, p))).isFile(), p);
});

test("internal links and assets resolve under the base path", async () => {
  const broken = [];
  for (const [f, s] of html) for (const m of s.matchAll(/(?:href|src)="([^"#]+)/g)) {
    const url = m[1];
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
    assert.doesNotMatch(text, /(?<!(?:once|when|until|after) )v0\.4(?:[bcd]|b\.1)?(?: [A-Za-z:]+){0,4} (?:is|was|has been|now) (?:complete|completed|released|shipped|available)\b/i, `${f} v0.4 claimed done`);
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
  for (const s of ["The Horizon modding platform", "Change the game.", "Create, modify and extend Horizon with a powerful Rust-native modding framework and loader.", "Explore Nexus", "Documentation", "Currently in development. Standalone installation is not yet available.", "Latest Development", "v0.4b.1", "Current", "In progress, not completed", "View development roadmap"]) assert.ok(main.includes(s), s);
  assert.doesNotMatch(main, /18\/18|32\/32|fb43e5954|0fcc557b1/, "home shows engineering detail");
  const nav = home.slice(home.indexOf('class="nav-links"'), home.indexOf("</ul>", home.indexOf('class="nav-links"')));
  assert.deepEqual([...nav.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]), ["Home", "Features", "Roadmap", "Docs", "Releases", "GitHub"]);
});

test("releases page: no public release, v0.4a first and marked completed", () => {
  const r = html.find(([f]) => f.endsWith("dist-test/releases/index.html"))[1];
  assert.ok(r.includes("No public standalone Nexus release is available yet."));
  const order = ["Audit:", "v0.4a:", "v0.3:", "v0.2:", "v0.1:"].map((v) => r.indexOf(v));
  assert.deepEqual([...order].sort((a, b) => a - b), order); assert.ok(order[0] > 0);
  assert.match(r, /fb43e5954/); assert.match(r, /does not install or execute/);
  const road = html.find(([f]) => f.endsWith("dist-test/roadmap/index.html"))[1];
  assert.match(road, /v0\.4b\.1[^]*>Current</); assert.doesNotMatch(road, /underway|Planned, authorized/);
  for (const [f, s] of html) { const i = s.indexOf('v0.4b.1: '); if (i > 0) assert.doesNotMatch(s.slice(i, i + 300), /badge[^"]*">Completed</, `${f} v0.4b.1 status`); } assert.doesNotMatch(road, /Requested/);
  assert.match(r, /Pre-v0\.4b audit and hardening[^]*8f809e822[^]*33\/33/);
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
