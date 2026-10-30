// Original 12x12 pixel icons, inlined as SVG (no extra requests). Palette:
// o outline, r raised, b Nexus blue, e electric blue, h ice highlight, w white, y warm accent.
const P = { o: "#02060d", r: "#2a4c75", b: "#287be4", e: "#62b6ff", h: "#a5dcff", w: "#f0f7ff", y: "#f5c062", g: "#5fd39a" };
const G = {
  runtime: ["............", ".oooo..oooo.", ".obbo..oeeo.", ".obbo..oeeo.", ".oooo..oooo.", "............", "............", ".oooo..oooo.", ".ohho..obbo.", ".ohho..obbo.", ".oooo..oooo.", "............"],
  engine: ["....oooo....", "...oeeeeo...", ".oooehheooo.", ".oe.ohho.eo.", ".oe.ohho.eo.", ".oooehheooo.", "...oeeeeo...", "....oooo....", "....obbo....", "..oobbbboo..", "..obbbbbbo..", "..oooooooo.."],
  events: ["............", ".ooo........", ".obbo.......", ".obbbo......", ".obbbeooooo.", ".obbbeeeeeeo", ".obbbeooooo.", ".obbbo......", ".obbo.......", ".ooo........", "............", "............"],
  schedule: ["............", ".oooooooooo.", ".orrrrrrrro.", ".oooooooooo.", ".obo.oeo.oho", ".obo.oeo.oho", ".ooo.ooo.ooo", "............", ".oooooooooo.", ".obbbeeehhho", ".oooooooooo.", "............"],
  fanout: ["........ooo.", "........oho.", ".......oooo.", ".ooo..oe....", ".obbooe.ooo.", ".obbbeeeoho.", ".obbooe.ooo.", ".ooo..oe....", ".......oooo.", "........oho.", "........ooo.", "............"],
  lifecycle: ["...oooooo...", "..oeeeeeeo..", ".oeoooooo...", ".oeo........", ".oeo....ooo.", ".oeo....obo.", ".oeo....obo.", ".oeo....obo.", "..oeoooobo..", "...obbbbo...", "....oooo....", "............"],
  sides: [".ooooo.ooooo", ".obbbo.oeeeo", ".obwbo.oehe.", ".obbbo.oeeeo", ".ooooo.ooooo", "...o.....o..", "...o.....o..", ".ooooo.ooooo", ".orrro.orrro", ".ooooo.ooooo", "............", "............"],
  package: ["............", "...oooooo...", "..oeeeeeeo..", ".oeeehheeeo.", ".oooooooooo.", ".obbbbbbbbo.", ".obbbhhbbbo.", ".obbbhhbbbo.", ".obbbbbbbbo.", ".obbbbbbbbo.", ".oooooooooo.", "............"],
  framework: ["............", "....oooo....", "....ohho....", "..oooooooo..", "..oeeeeeeo..", "..oooooooo..", "oooooooooooo", "obbbbbbbbbbo", "oooooooooooo", "orrrrrrrrrro", "oooooooooooo", "............"],
  workflow: ["............", ".ooo....ooo.", ".obo....oeo.", ".obooooooeo.", ".obbbbbbbeo.", ".obooooooeo.", ".obo....oeo.", ".ooo....ooo.", "......oo....", ".....ohho...", "......oo....", "............"],
  tools: ["..ooo.......", ".ohheo......", ".oheeo......", "..oeeooo....", "...ooeeoo...", ".....oeeoo..", "......oorbo.", ".......obbbo", ".......obbbo", "........ooo.", "............", "............"],
  performance: ["............", ".......oooo.", "......oyyo..", ".....oyyo...", "....oyyyyoo.", "...oooyyyo..", ".....oyyo...", "....oyyo....", "...oyo......", "...oo.......", "..o.........", "............"],
  camera: ["............", "..ooo.......", ".oeeeooooo..", ".oooooooooo.", ".obbboooobbo", ".obbohhoobo.", ".obbohhoobbo", ".obboooobbo.", ".obbbbbbbbo.", ".oooooooooo.", "............", "............"],
  world: ["...oooooo...", "..ogggbbbo..", ".ogggbbbbbo.", ".oggbbbgggo.", ".obbbbggggo.", ".obbbgggbbo.", ".oggbbbbbbo.", ".ogggbbbggo.", "..obbbgggo..", "...oooooo...", "............", "............"],
  qol: ["............", "..oo....oo..", ".oeeo..oeeo.", ".oeeeooeeeo.", ".oeeeeeeheo.", ".oeeeeeeeeo.", "..oeeeeeeo..", "...oeeeeo...", "....oeeo....", ".....oo.....", "............", "............"],
  shield: ["............", ".oooooooooo.", ".obbbbbbbbo.", ".obbbhhbbbo.", ".obbbhhbbbo.", ".obbbbbbbbo.", "..obbhhbbo..", "..obbbbbbo..", "...obbbbo...", "....oooo....", "............", "............"],
  construction: ["..o......o..", ".oyo....oyo.", "oooooooooooo", "oyyyoyyyoyyo", "oyyoyyyoyyyo", "oyoyyyoyyyoo", "oooooooooooo", ".oro....oro.", ".oro....oro.", ".oro....oro.", "oooooooooooo", "............"],
};
export function icon(name, size = 40, label = "") {
  const g = G[name];
  if (!g) throw new Error(`no icon ${name}`);
  const rects = g.flatMap((row, y) => [...row].map((c, x) => (P[c] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${P[c]}"/>` : ""))).join("");
  const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true" focusable="false"`;
  return `<svg class="pix" width="${size}" height="${size}" viewBox="0 0 12 12" shape-rendering="crispEdges" ${a11y}>${rects}</svg>`;
}
export const ICONS = Object.keys(G);
