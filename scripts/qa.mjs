// Browser QA (dev-only, needs Playwright): serves dist/ under the base path, screenshots pages at
// 390, 768, 1440 and 1920 px into qa/screenshots/, and fails on horizontal overflow, failed
// requests, missing alt text, small tap targets on phones or a broken keyboard menu.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = 4398, BASE = "/horizon-nexus-site/", origin = process.env.QA_URL ?? `http://localhost:${port}${BASE}`;
const server = process.env.QA_URL ? null : spawn(process.execPath, [join(root, "serve.mjs")], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 500));
const out = join(root, "qa/screenshots", process.env.QA_URL ? "live" : "local");
await mkdir(out, { recursive: true });
const pages = ["", "features/", "architecture/", "docs/", "docs/event-dispatch/", "roadmap/", "changelog/", "downloads/", "faq/", "contributing/", "nope/"];
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let problems = 0; const bad = (m) => { problems++; console.log("FAIL", m); };
for (const w of [390, 768, 1440, 1920]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 900 ? 860 : 1000 }, reducedMotion: "reduce" });
  for (const path of pages) {
    const p = await ctx.newPage();
    const failed = [];
    p.on("requestfailed", (r) => failed.push(r.url()));
    p.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("/nope/")) failed.push(`${r.status()} ${r.url()}`); });
    await p.goto(origin + path, { waitUntil: "networkidle" });
    const m = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      fontsOk: document.fonts.check('16px "Pixelify Sans"') && document.fonts.check('16px "Geist"'),
      small: [...document.querySelectorAll("a, button, summary")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 24 && getComputedStyle(e).display !== "inline"; }).map((e) => e.textContent.trim().slice(0, 30)),
    }));
    const name = (path.replace(/\/$/, "").replace(/\//g, "-") || "home");
    if (m.overflow > 0) bad(`${w} ${path}: horizontal overflow ${m.overflow}px`);
    if (m.noAlt) bad(`${w} ${path}: ${m.noAlt} images without alt`);
    if (!m.fontsOk) bad(`${w} ${path}: fonts not loaded`);
    if (w === 390 && m.small.length) bad(`${w} ${path}: small targets ${m.small.join(" | ")}`);
    if (failed.length) bad(`${w} ${path}: failed requests ${failed.join(", ")}`);
    if (["", "docs/", "roadmap/", "downloads/", "nope/", "faq/"].includes(path)) await p.screenshot({ path: join(out, `${name}-${w}.png`), fullPage: w <= 768 ? false : true });
    await p.close();
  }
  await ctx.close();
}
// Keyboard: the phone menu opens with Enter, closes with Escape, and focus is visible.
const ctx = await b.newContext({ viewport: { width: 390, height: 860 } });
const p = await ctx.newPage(); await p.goto(origin, { waitUntil: "networkidle" });
await p.keyboard.press("Tab");
const skip = await p.evaluate(() => document.activeElement.className);
if (skip !== "skip") bad(`first Tab focuses "${skip}", not the skip link`);
await p.focus("[data-menu-button]"); await p.keyboard.press("Enter");
if (await p.isHidden("#menu")) bad("menu did not open with Enter");
await p.screenshot({ path: join(out, "home-390-menu.png") });
await p.keyboard.press("Escape");
if (!(await p.isHidden("#menu"))) bad("menu did not close with Escape");
const outline = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
if (outline === "none") bad("no visible focus outline on the menu button");
await b.close(); server?.kill();
console.log(problems ? `${problems} problem(s)` : "browser QA passed"); process.exit(problems ? 1 : 0);
