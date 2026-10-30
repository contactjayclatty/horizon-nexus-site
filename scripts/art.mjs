// Nexus pixel art, drawn in code (the same approach as Horizon's scripts/art.mjs and
// launcher/src/art.rs, written fresh for Nexus): a dark-blue stone tile and a night landscape
// with a block portal. Nothing here comes from Minecraft. `node scripts/art.mjs` writes public/media/.
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { png } from "./png.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
export function rng(seed) {
  let x = seed >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x >>> 8) / (1 << 24); };
}
const ch = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const shade = (c, by) => ch(c).reduce((o, v) => (o << 8) | Math.min(255, Math.max(0, v + by)), 0);
const mix = (a, b, t) => { const [x, y] = [ch(a), ch(b)]; return x.reduce((o, v, i) => (o << 8) | Math.round(v + (y[i] - v) * t), 0); };

// Stone: the page colour in close shades with darker flecks (Horizon uses shades 0, 2, -2, 5, -4).
export function stone(page, n, shades = [0, 3, -2, 6, -4]) {
  const s = shades.map((b) => shade(page, b)); const next = rng(0x9e3779b9);
  const out = Array.from({ length: n * n }, () => { const v = next(); return s[v < 0.5 ? 0 : v < 0.78 ? 1 : v < 0.93 ? 2 : 3]; });
  for (let k = 0; k < Math.floor((n * n) / 50); k++) {
    const x = Math.floor(next() * n), y = Math.floor(next() * n), len = 1 + Math.floor(next() * 3);
    for (let i = 0; i < len; i++) { out[y * n + ((x + i) % n)] = s[4]; out[((y + 1) % n) * n + ((x + i + 1) % n)] = s[4]; }
  }
  return out;
}

export const MIDNIGHT = {
  sky: [0x050b18, 0x08122a, 0x0c1b3d, 0x102652, 0x163468, 0x1d4580, 0x285a9a],
  moon: [0xeaf6ff, 0xa5dcff, 0x62b6ff],
  far: 0x14305a, mid: 0x0e2244, near: 0x091830, top: 0x1f4a7c, trees: 0x050d1c,
  frame: 0x0a1424, frameHi: 0x1c3552, glow: [0x287be4, 0x62b6ff, 0xa5dcff],
};

export function scene(p, seed, w, h) {
  const next = rng((Math.imul(seed, 0x2545f491) | 1) >>> 0);
  const out = new Array(w * h).fill(0);
  const horizon = Math.floor(h * 0.62), band = horizon / p.sky.length;
  for (let y = 0; y < h; y++) {
    const f = y / band, i = Math.min(Math.floor(f), p.sky.length - 1), d = f - i > 0.85 && i + 1 < p.sky.length;
    for (let x = 0; x < w; x++) out[y * w + x] = d && (x + y) % 2 ? p.sky[i + 1] : p.sky[i];
  }
  const rect = (x, y, rw, rh, c) => { for (let yy = Math.max(y, 0); yy < Math.min(y + rh, h); yy++) for (let xx = Math.max(x, 0); xx < Math.min(x + rw, w); xx++) out[yy * w + xx] = c; };
  for (let k = 0; k < 60; k++) { const sx = Math.floor(next() * w), sy = Math.floor(next() * horizon * 0.8); out[sy * w + sx] = next() < 0.3 ? 0xa5dcff : 0x4f7fb5; }
  for (let k = 0; k < 4; k++) {
    const cx = Math.floor(next() * w), cy = Math.floor(horizon * (0.15 + next() * 0.35)), cw = 10 + Math.floor(next() * 14);
    const c = mix(p.sky[Math.min(Math.floor(cy / band) + 1, p.sky.length - 1)], 0xffffff, 0.08);
    rect(cx, cy, cw, 2, c); rect(cx + 3, cy - 2, Math.max(cw - 6, 0), 2, c);
  }
  // A square moon, sliced like Horizon's sun.
  const mx = Math.floor(w * 0.18), my = Math.floor(h * 0.16), r = Math.floor(h * 0.1);
  for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r - dy * dy)); const t = (dy + r) / (2 * r); if ((my + dy) % 4) rect(mx - half, my + dy, half * 2, 1, p.moon[t < 0.45 ? 0 : t < 0.8 ? 1 : 2]); }
  const ridge = (base, amp, rough) => { let y = base, v = 0; return Array.from({ length: w }, (_, x) => { if (x % 2 === 0) { v = (v + (next() - 0.5) * rough) * 0.86; y += v + (base - y) * 0.06; } return Math.max(Math.round(Math.min(Math.max(y, base - amp), base + amp)), 0); }); };
  let near = [];
  const layers = [[p.far, horizon - h * 0.1, h * 0.12, 3.2, null], [p.mid, horizon + h * 0.02, h * 0.09, 2.6, null]];
  for (const [c, base, amp, rough, top] of layers) { const hs = ridge(base, amp, rough); hs.forEach((y, x) => { for (let yy = y; yy < h; yy++) out[yy * w + x] = c; }); }
  const hs = ridge(horizon + h * 0.18, h * 0.07, 2.2);
  hs.forEach((y, x) => { for (let yy = y; yy < h; yy++) out[yy * w + x] = p.near; if (y < h) out[y * w + x] = p.top; });
  near = hs;
  // The Nexus portal: a frame of blocks on the middle ridge with a glowing, banded core.
  const px = Math.floor(w * 0.66), pw = 22, ph = 30, pt = Math.min(...near.slice(px, px + pw)) - ph + 2;
  for (let gy = -6; gy < ph + 6; gy++) for (let gx = -8; gx < pw + 8; gx++) {
    const yy = pt + gy, xx = px + gx; if (yy < 0 || yy >= h || xx < 0 || xx >= w) continue;
    const dist = Math.max(gx < 0 ? -gx : gx >= pw ? gx - pw + 1 : 0, gy < 0 ? -gy : gy >= ph ? gy - ph + 1 : 0);
    if (dist > 0 && (xx + yy) % 2 === 0 && dist < 6) out[yy * w + xx] = mix(out[yy * w + xx], p.glow[0], 0.35 - dist * 0.05);
  }
  rect(px, pt, pw, ph, p.frame);
  for (let y = 0; y < ph; y += 4) for (let x = 0; x < pw; x += 4) if (y === 0 || x === 0 || y >= ph - 4 || x >= pw - 4) { rect(px + x, pt + y, 4, 4, p.frame); rect(px + x, pt + y, 4, 1, p.frameHi); rect(px + x, pt + y, 1, 4, p.frameHi); }
  for (let y = 4; y < ph - 4; y++) for (let x = 4; x < pw - 4; x++) { const v = (x * 3 + y * 5 + (y >> 1)) % 7; rect(px + x, pt + y, 1, 1, p.glow[v < 3 ? 0 : v < 6 ? 1 : 2]); }
  for (let k = 0; k < Math.floor(w / 26); k++) { const tx = 4 + Math.floor(next() * (w - 10)); if (Math.abs(tx - px - pw / 2) < 20) continue; const ty = near[tx]; rect(tx - 2, ty - 8, 5, 5, p.trees); rect(tx - 1, ty - 10, 3, 2, p.trees); rect(tx, ty - 3, 1, 3, p.trees); }
  return out;
}

export async function writeArt(media) {
  await mkdir(media, { recursive: true });
  await writeFile(join(media, "stone-nexus.png"), png(stone(0x080f1d, 64), 64, 64));
  await writeFile(join(media, "stone-panel.png"), png(stone(0x142840, 64, [0, 3, -3, 5, -6]), 64, 64));
  await writeFile(join(media, "scene-nexus.png"), png(scene(MIDNIGHT, 7, 240, 72), 240, 72));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { await writeArt(join(site, "public", "media")); console.log("art written to public/media/"); }
