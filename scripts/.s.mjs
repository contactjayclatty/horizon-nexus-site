import { chromium } from "playwright";
const [out, ...pages] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const w of (process.env.W ?? "390,1440").split(",").map(Number)) for (const pg of pages) {
  const p = await b.newPage({ viewport: { width: w, height: w < 900 ? 844 : 900 }, reducedMotion: "reduce" });
  await p.goto(process.env.URL + pg + "?a=" + Date.now()); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelectorAll(".reveal").forEach(e => e.classList.add("in")));
  const name = (pg.replace(/\/$/, "").replace(/\//g, "-") || "home");
  await p.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: !process.env.VIEW, });
}
await b.close();
