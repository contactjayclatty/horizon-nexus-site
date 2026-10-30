// Renders the raster icons and the social image with Playwright (a dev-only tool, not a site
// dependency): node scripts/raster.mjs. Writes public/favicon-32.png, apple-touch-icon.png, og.png.
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const icon = (await readFile(join(pub, "favicon.svg"), "utf8"));
for (const [size, name] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<style>html,body{margin:0;background:#080f1d}svg{width:${size}px;height:${size}px;display:block}</style>${icon}`);
  await p.screenshot({ path: join(pub, name) });
}
const font = (f) => `url(data:font/woff2;base64,${Buffer.from(f).toString("base64")})`;
const pix = await readFile(join(pub, "fonts/PixelifySans-Bold.woff2"));
const geist = await readFile(join(pub, "fonts/Geist-Regular.woff2"));
const scene = (await readFile(join(root, "dist/media/scene-nexus.png"))).toString("base64");
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<style>@font-face{font-family:P;src:${font(pix)}}@font-face{font-family:G;src:${font(geist)}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#050b18 url(data:image/png;base64,${scene}) 60% 100%/2100px auto no-repeat;image-rendering:pixelated;font-family:G}
.v{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,15,29,.94),rgba(8,15,29,.7) 50%,rgba(8,15,29,0) 80%)}
.t{position:absolute;left:72px;top:110px;color:#f1f7ff}.k{font:500 22px G;color:#9fbad8;letter-spacing:.08em;text-transform:uppercase}
h1{font:700 76px/1.02 P;margin:18px 0;max-width:12ch}.s{font:700 30px P;color:#a5dcff}.n{font:400 18px G;color:#9fbad8;margin-top:36px}</style>
<div class="v"></div><div class="t"><div class="k">Horizon Nexus</div><h1>Change the Game. Extend the Engine.</h1><div class="s">The Rust-native framework and mod loader for Horizon.</div><div class="n">Independent project. Not affiliated with Mojang or Microsoft.</div></div>`);
await p.waitForTimeout(300);
await p.screenshot({ path: join(pub, "og.png") });
await b.close();
console.log("raster assets written");
