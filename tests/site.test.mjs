// Static checks on a real production build: node --test tests/*.test.mjs
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
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
  html = await Promise.all(files.filter((f) => f.endsWith(".html")).map(async (f) => [f, await readFile(f, "utf8")]));
});

test("every required page is built", async () => {
  for (const p of ["index.html", "features/index.html", "architecture/index.html", "docs/index.html", "roadmap/index.html", "changelog/index.html", "downloads/index.html", "faq/index.html", "contributing/index.html", "404.html",
    ...["architecture", "runtime-lifecycle", "nexus-system", "execution-stages", "typed-events", "event-dispatch", "security", "limitations", "developer-setup", "mod-loading"].map((s) => `docs/${s}/index.html`)])
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
    assert.match(s, /user-provided|provided by the Nexus developer/i, `${f} user-provided label`);
    assert.doesNotMatch(s, /v0\.4(?: [A-Za-z]+){0,3} (?:is|was|has been) (?:complete|completed|released|shipped)\b/i, `${f} v0.4 claimed complete`);
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
