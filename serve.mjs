// Serves dist/ under the base path, like GitHub Pages: node serve.mjs (PORT=4321, BASE=/horizon-nexus-site/).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const dist = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const BASE = (process.env.BASE ?? "/horizon-nexus-site/").replace(/\/?$/, "/");
const port = Number(process.env.PORT ?? 4321);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const send = async (file, code = 200) => { res.writeHead(code, { "content-type": types[extname(file)] ?? "application/octet-stream" }); res.end(await readFile(file)); };
  if (!p.startsWith(BASE)) return send(join(dist, "404.html"), 404);
  let file = normalize(join(dist, p.slice(BASE.length)));
  if (!file.startsWith(dist)) return send(join(dist, "404.html"), 404);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); await send(file); }
  catch { await send(join(dist, "404.html"), 404); }
}).listen(port, () => console.log(`http://localhost:${port}${BASE}`));
