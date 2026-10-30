// Builds the static site into dist/. No dependencies: Node 22+ only.
//   BASE=/horizon-nexus-site/ node build.mjs   (the GitHub Pages project path; the default)
//   BASE=/ node build.mjs                      (serve from a domain root)
import { mkdir, writeFile, readFile, cp, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeArt } from "./scripts/art.mjs";
import { MILESTONES, LATEST, AUDIT, UPDATED, FOCUS, STABILIZATION, IMPLEMENTED, TARGETS, MODULES, NOTICE, USER_PROVIDED, DEFINITION, NO_RELEASE, NO_JAVA, OUT_OF_SCOPE, REPO, HORIZON, HORIZON_SITE, HORIZON_MODS } from "./src/content.mjs";
import { icon } from "./src/icons.mjs";
import { DOCS } from "./src/docs.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE ?? "/horizon-nexus-site/").replace(/\/?$/, "/");
const SITE = (process.env.SITE_URL ?? "https://contactjayclatty.github.io/horizon-nexus-site/").replace(/\/?$/, "/");
const out = join(root, process.env.OUT ?? "dist");
export const u = (p = "") => BASE + p.replace(/^\//, "");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const NAV = [["", "Home"], ["features/", "Features"], ["roadmap/", "Roadmap"], ["docs/", "Docs"], ["releases/", "Releases"]];
const MORE = [["architecture/", "Architecture"], ["downloads/", "Downloads"], ["faq/", "FAQ"], ["contributing/", "Contributing"]];

function layout({ path, title, description, body, bodyClass = "" }) {
  const isCurrent = (p) => (p === "" ? path === "" : path.startsWith(p));
  const li = ([p, l]) => `<li><a href="${u(p)}"${isCurrent(p) ? ' aria-current="page"' : ""}>${l}</a></li>`;
  const links = NAV.map(li).join("") + `<li><a href="${REPO}">GitHub</a></li>`;
  const more = MORE.map(li).join("");
  const moreOpen = MORE.some(([p]) => isCurrent(p));
  const fullTitle = path === "" ? "Horizon Nexus: Extend the Engine. Connect the Systems." : `${title} · Horizon Nexus`;
  const html = `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#080f1d">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${SITE}${path}">
<link rel="icon" href="${u("favicon.svg")}" type="image/svg+xml">
<link rel="icon" href="${u("favicon-32.png")}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${u("apple-touch-icon.png")}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Horizon Nexus">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Horizon Nexus: a blue block portal in a pixel-art night landscape, with the line Change the Game. Extend the Engine.">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${u("fonts/PixelifySans-Bold.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u("fonts/Geist-Regular.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u("assets/tokens.css")}">
<link rel="stylesheet" href="${u("assets/style.css")}">
<script>document.documentElement.classList.replace("no-js","js")</script>
<script type="module" src="${u("assets/site.js")}"></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to the content</a>
<header class="nav">
  <div class="container nav-inner">
    <a class="nav-mark" href="${u()}" aria-label="Horizon Nexus home"><img src="${u("media/nexus-icon.svg")}" alt="" width="36" height="36"><span class="nav-word"><span>Nexus</span><small>Horizon modding</small></span></a>
    <nav aria-label="Main" class="nav-main"><ul class="nav-links">${links}</ul></nav>
    <div class="nav-end">
      <details class="more"><summary class="button small${moreOpen ? " is-current" : ""}">More</summary><ul class="more-list">${more}</ul></details>
      <button class="button small menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="menu"><span data-label>Menu</span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden><nav aria-label="Main (menu)"><ul>${links}</ul><p class="micro menu-label">More</p><ul>${more}</ul></nav></div>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="container">
    <img class="footer-logo" src="${u("media/nexus-logo.svg")}" alt="Horizon Nexus" width="256" height="44">
    <div class="footer-cols">
      <div><h2>Nexus</h2><ul class="foot-links">${[...NAV.slice(1), ...MORE].map(([p, l]) => `<li><a href="${u(p)}">${l}</a></li>`).join("")}</ul></div>
      <div><h2>Source</h2><ul><li><a href="${REPO}">Website source</a></li><li><a href="${HORIZON}">Horizon upstream</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li></ul></div>
    </div>
    <p class="disclaimer">${esc(NOTICE)} Minecraft is a trademark of Mojang Synergies AB. This site contains no Minecraft code, textures or assets; all artwork is original and drawn in code. Milestone details are developer-reported.</p>
        <p class="footer-word" aria-hidden="true">NEXUS</p>
  </div>
</footer>
</body>
</html>
`;
  return html.replace(/<a ([^>]*?)href="(https?:\/\/[^"]+)"/g, (m, pre, url) => `<a ${pre}href="${url}" rel="noopener"`);
}

const BADGE = { done: ["done", "Completed"], planned: ["planned", "Planned"], progress: ["dev", "Current"], idea: ["idea", "Idea, not promised"], dev_reported: ["user", "Developer-reported"], goal: ["planned", "Goal"], now: ["done", "Works today"], none: ["", "Not available"] };
const badge = (k) => `<span class="badge ${BADGE[k][0]}">${BADGE[k][1]}</span>`;
const flow = (nodes, label) => `<ol class="flow" aria-label="${esc(label)}">${nodes.map(([n, s, cls = ""]) => `<li><div class="block-node ${cls}">${esc(n)}${s ? `<small>${esc(s)}</small>` : ""}</div></li>`).join("")}</ol>`;
const CURRENT = [["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered Systems", "Rust"], ["Typed Event Dispatcher", "same stage, fixed order"]];
const FRAMEWORK = [["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned", "planned"], ["Mod Systems", "your code", "planned"]];
const LOADER = [[".nmod", "manifest", "done"], ["Validation", "v0.4a", "done"], ["Dependencies", "v0.4a", "done"], ["Native Build", "planned", "planned"], ["Registration", "planned", "planned"], ["Horizon", "runs it", "done"]];
const DONE = MILESTONES.filter((m) => m.state === "done"), PLANNED = MILESTONES.filter((m) => m.state === "planned");
const head = (kicker, title, text = "", id = "") => `<div class="section-head reveal"><p class="kicker">${kicker}</p><h2 class="title"${id ? ` id="${id}"` : ""}>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`;
const card = ({ ic, title, body, b, extra = "", cls = "" }) => `<section class="panel card reveal ${cls}"><div class="card-top">${ic ? icon(ic, 40) : ""}${b ? badge(b) : ""}</div><h3 class="panel-title">${esc(title)}</h3>${body ? `<p>${body}</p>` : ""}${extra}</section>`;
const ticks = (xs, cls = "") => `<ul class="ticks ${cls}">${xs.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const commit = (c) => `<p class="commit"><span class="micro">Commit</span> <code>${c}</code> <span class="micro">developer-reported, not an upstream link</span></p>`;
const diagram = (nodes, title, img, alt, b) => `<section class="panel reveal diagram"><div class="panel-head"><h3 class="panel-title">${esc(title)}</h3>${badge(b)}</div>${flow(nodes, title)}<img src="${u(`media/${img}`)}" alt="${esc(alt)}" width="960" height="200" loading="lazy" class="diagram-img"></section>`;
const DIAGRAMS = () => `${diagram(CURRENT, "Current runtime", "architecture-current.svg", "Horizon, then Nexus Runtime, then Registered Systems, then Typed Event Dispatcher", "now")}
${diagram(FRAMEWORK, "Planned framework", "architecture-framework.svg", "Horizon Engine, then Nexus APIs, hooks and registries, then mod systems", "planned")}
${diagram(LOADER, "Loader pipeline", "architecture-loader.svg", ".nmod, Validation and Dependencies (done in v0.4a), then Native Build and Registration (planned), then Horizon", "goal")}`;
const moduleCard = (m) => card({ ic: m.icon, title: m.name, b: "idea", cls: "module", body: esc(m.body), extra: m.note ? `<p class="note">${esc(m.note)}</p>` : "" });

const pages = {};

pages[""] = {
  title: "Home", description: "Horizon Nexus: create, modify and extend Horizon with a Rust-native modding framework and loader. In development.",
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="kicker reveal">The Horizon modding platform</p>
      <h1 class="display hero-display reveal" id="hero-title"><span class="sr-only">Horizon Nexus: </span>Change the game.</h1>
      <p class="lede reveal">Create, modify and extend Horizon with a powerful Rust-native modding framework and loader.</p>
      <div class="actions reveal"><a class="button primary large" href="${u("features/")}">Explore Nexus</a><a class="button large" href="${u("docs/")}">Documentation</a></div>
      <p class="availability reveal"><span class="badge dev">In development</span> Currently in development. Standalone installation is not yet available.</p>
    </div>
    <div class="hero-art reveal"><img src="${u("media/portal.svg")}" alt="Pixel art: a glowing blue Nexus portal of blocks, with module blocks connecting at its sides" width="420" height="420"></div>
  </div>
</section>
<section class="section"><div class="container">
  ${head("Two parts, one platform", "Framework and mod loader")}
  <div class="grid two">
    ${card({ ic: "framework", title: "Nexus Framework", b: "now", cls: "pillar", body: "Build new features, change existing mechanics and extend how Horizon works.", extra: `<p class="status">The core runs today, compiled into Horizon. Engine APIs and hooks come next.</p><a class="button" href="${u("features/")}">How the framework works</a>` })}
    ${card({ ic: "package", title: "Nexus Mod Loader", b: "planned", cls: "pillar", body: "Package, install and manage native Horizon mods through a unified system.", extra: `<p class="status">Package checks exist. Installing and running mods does not yet.</p><a class="button" href="${u("docs/mod-packaging/")}">How the loader will work</a>` })}
  </div>
</div></section>
<section class="section"><div class="container">
  ${head("Why Nexus", "Made for Horizon")}
  <div class="grid four why">
    ${card({ ic: "engine", title: "Built for Horizon", b: "now", body: "A Rust-native framework designed around Horizon's architecture." })}
    ${card({ ic: "lifecycle", title: "Modular by design", b: "now", body: "Independent systems with defined lifecycles and predictable scheduling." })}
    ${card({ ic: "tools", title: "Extend almost anything", b: "goal", body: "The long-term aim: broad engine changes through APIs, hooks and trusted native extensions." })}
    ${card({ ic: "workflow", title: "One modding platform", b: "goal", body: "Framework and loader working together, from writing a mod to installing it." })}
  </div>
</div></section>
<section class="section"><div class="container">
  <section class="panel raised status-strip reveal" aria-labelledby="latest">
    <div>${icon("package", 48)}</div>
    <div class="status-text"><p class="micro">Latest Development, ${UPDATED}</p><h2 class="panel-title" id="latest">Current: ${FOCUS.ver}, ${esc(FOCUS.name.toLowerCase())}</h2>
    <p>${FOCUS.status}. In progress, not completed. Latest completed: the pre-v0.4b audit (33/33 tests). Development is progressing through v0.4, the final planned feature milestone, followed by stabilization.</p>
    <p class="tags">${badge("done")} <span class="micro">v0.1 to v0.4a, audit</span> ${badge("progress")} <span class="micro">${FOCUS.ver}</span> ${badge("planned")} <span class="micro">rest of v0.4</span></p></div>
    <a class="button primary" href="${u("roadmap/")}">View development roadmap</a>
  </section>
</div></section>`,
};

pages["features/"] = {
  title: "Features", description: "What Nexus does now, and what it is intended to enable.",
  body: `<div class="container page-main">
<p class="kicker">Features</p><h1 class="display page-title">What Nexus does</h1>
<p class="lede">Two questions, answered separately: what works now, and what Nexus is meant to enable.</p>
<nav class="jump" aria-label="On this page"><a class="button small" href="#now">Works now</a><a class="button small" href="#targets">Intended to enable</a><a class="button small" href="#future">Future possibilities</a></nav>
<section class="section band now" aria-labelledby="now">${head("Implemented · developer-reported", "What Nexus does now", "", "now")}
<div class="grid four">${IMPLEMENTED.map((f) => card({ ic: f.icon, title: f.name, b: "now", body: `${esc(f.body)} <span class="micro">${f.ms}</span>` })).join("")}</div></section>
<section class="section band" aria-labelledby="targets">${head("Engineering targets", "What Nexus is intended to enable", "These are goals for the full framework. They are not implemented today, and not every area will necessarily get an API.", "targets")}
<ul class="chips big reveal">${TARGETS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
<section class="section band" aria-labelledby="future">${head("Ideas", "Future possibilities", "Modules that show what the framework could make possible. They are not built, and not promised for v0.4.", "future")}
<div class="grid four">${MODULES.map(moduleCard).join("")}</div></section>
</div>`,
};

pages["roadmap/"] = {
  title: "Roadmap", description: "Nexus development roadmap: completed milestones, the current step, planned v0.4 work and final stabilization.",
  body: `<div class="container page-main">
<p class="kicker">Roadmap</p><h1 class="display page-title">Built block by block</h1>
<p class="lede">What is done, what is happening now and what is planned. v0.4 is the final planned feature milestone. No v0.5 or v1.0 features are planned, and there are no dates.</p>
<ol class="road reveal" aria-label="Roadmap at a glance">${MILESTONES.map((m) => `<li class="${m.state}"><span class="road-block" aria-hidden="true"></span><b>${m.ver}</b><span>${m.state === "done" ? "Done" : "Planned"}</span></li>`).join("").replace('<li class="planned"><span class="road-block" aria-hidden="true"></span><b>v0.4b</b>', '<li class="current"><span class="road-block" aria-hidden="true"></span><b>v0.4b.1</b><span>Current</span></li><li class="planned"><span class="road-block" aria-hidden="true"></span><b>v0.4b</b>')}<li class="planned"><span class="road-block" aria-hidden="true"></span><b>Then</b><span>Stabilize</span></li></ol>
<p class="legend micro"><span class="key done"></span> Completed <span class="key current"></span> Current <span class="key planned"></span> Planned</p>

<section class="section" aria-labelledby="completed">${head("01", "Completed", "Developer-reported milestones on an independent Horizon branch.", "completed")}
<div class="grid two">${[...DONE].reverse().map((m) => card({ ic: m.icon, title: `${m.ver}: ${m.name}`, b: "done", body: esc(m.summary), extra: `${ticks(m.items, "done")}${commit(m.commit)}` })).join("")}</div>
<p class="more-link"><a href="${u("releases/")}">Validation results are on the Releases page</a></p></section>

<section class="section" aria-labelledby="current">${head("02", "Current focus", "", "current")}
<p class="muted">Updated ${UPDATED}. Work marked Current is in progress and not completed.</p>
<section class="panel current-panel reveal"><div class="panel-head"><h3 class="panel-title">${FOCUS.ver}: ${esc(FOCUS.name)}</h3><span class="tags">${badge("progress")}${badge("dev_reported")}</span></div><p><b>${FOCUS.status}.</b> ${esc(FOCUS.body)}</p>${ticks(FOCUS.items)}</section></section>

<section class="section" aria-labelledby="planned">${head("03", "Planned", "Goals for the rest of v0.4. None of this exists yet.", "planned")}
<div class="grid three">${PLANNED.map((m) => card({ ic: m.icon, title: `${m.ver}: ${m.name}`, b: "planned", cls: "planned-card", body: esc(m.summary), extra: ticks(m.items) })).join("")}</div></section>

<section class="section" aria-labelledby="stabilize">${head("04", "Final stabilization", "", "stabilize")}
<section class="panel well reveal"><div class="panel-head"><h3 class="panel-title">After v0.4</h3>${badge("planned")}</div><p>Once v0.4 is finished, the work turns to quality:</p>${ticks(STABILIZATION, "cols")}<p><b>After successful stabilization, development pauses.</b> No v0.5 or v1.0 features are currently planned.</p></section></section>
</div>`,
};

pages["releases/"] = {
  title: "Releases", description: "Completed Nexus development milestones, and public release availability.",
  body: `<div class="container page-main narrow">
<p class="kicker">Releases</p><h1 class="display page-title">Releases</h1>
<section class="panel window reveal" aria-labelledby="public"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title" id="public">Public downloadable releases</h2>${badge("none")}</div>
<p class="big-note">${NO_RELEASE}</p><p class="muted">There are no Nexus installers, packages, tags or GitHub Releases. See <a href="${u("downloads/")}">Downloads</a> for status.</p></section>
<section class="section" aria-labelledby="history">${head("Development milestone history", "Completed milestones", `${esc(USER_PROVIDED)} They are development milestones, not published releases. Most recent first.`, "history")}
<div class="stack">${[...DONE].reverse().map((m) => `<article class="panel release reveal" id="${m.ver.replace(".", "")}"><div class="panel-head"><h3 class="panel-title">${m.ver}: ${esc(m.name)}</h3><span class="tags">${badge("done")}${badge("dev_reported")}</span></div>
<p>${esc(m.summary)}</p>${commit(m.commit)}
<div class="release-cols"><div><h4 class="h-small">Changes</h4>${ticks(m.items, "done")}</div>${m.validation ? `<div><h4 class="h-small">Reported validation</h4>${ticks(m.validation)}</div>` : ""}</div>
${m.note ? `<div class="callout warn"><p>${esc(m.note)}</p></div>` : ""}</article>`).join("")}</div></section>
</div>`,
};

pages["architecture/"] = {
  title: "Architecture", description: "The current Nexus runtime, the planned framework layers and the loader pipeline.",
  body: `<div class="container page-main">
<p class="kicker">Architecture</p><h1 class="display page-title">How Nexus fits together</h1>
<p class="lede">The runtime that works today, the framework layers planned around it, and the loader pipeline.</p>
<div class="stack section">${DIAGRAMS()}</div>
<div class="grid two section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Today</h2>${badge("now")}</div>${ticks(["The Nexus runtime is compiled into Horizon.", "Registered systems run on a deterministic schedule.", "Typed events are offered to enabled systems of the same stage, in a fixed order.", "v0.4a validates and resolves .nmod packages. It does not compile or run them."])}</section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Two depths of modding</h2>${badge("goal")}</div><div class="layers"><div class="layer"><b>High-level APIs</b><span>everyday mods</span></div><div class="layer"><b>Engine hooks</b><span>deeper behaviour changes</span></div><div class="layer deep"><b>Trusted native source changes</b><span>when a mod must change the engine itself</span></div></div></section>
</div>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Trusted native code</h2>${icon("shield", 32)}</div>
<p>Nexus mods are native Rust. They are not sandboxed, and compiling them can run code. Trust must be approved before compilation. Package validation catches broken or conflicting mods; it does not make untrusted code safe.</p></div></section>
</div>`,
};

pages["downloads/"] = {
  title: "Downloads", description: "Nexus has no public standalone release yet.",
  body: `<div class="container page-main">
<p class="kicker">Downloads</p><h1 class="display page-title">Nothing to download yet</h1>
<p class="lede">${NO_RELEASE} The runtime is compiled into Horizon on an independent development branch that is not published here.</p>
<div class="grid two section">
<section class="panel window reveal"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title">Nexus</h2>${badge("none")}</div>
<div class="launcher-bar"><div class="version-select">Latest milestone: ${LATEST.ver}</div><span class="button primary" aria-disabled="true">No download</span></div>
<ol class="rows"><li><span class="idx">01</span><span><span class="name">Installer</span><span class="detail">Does not exist yet</span></span><span class="badge">None</span></li><li><span class="idx">02</span><span><span class="name">.nmod installation</span><span class="detail">Package checks done (v0.4a). Install planned (v0.4c).</span></span>${badge("planned")}</li><li><span class="idx">03</span><span><span class="name">Profiles and rollback</span><span class="detail">Planned (v0.4d)</span></span>${badge("planned")}</li></ol></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Horizon itself</h2><span class="badge">Upstream</span></div>
<p>These belong to the upstream Horizon project. Nexus is not part of them.</p>
<ul class="links"><li><a href="${HORIZON}">Horizon source</a></li><li><a href="${HORIZON}/releases">Horizon releases</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li></ul></section>
</div></div>`,
};

const FAQ = [
  ["What is Nexus?", DEFINITION],
  ["Can I install it?", `Not yet. ${NO_RELEASE} The runtime is compiled into Horizon, and standalone <code>.nmod</code> installation is not implemented.`],
  ["What works today?", `The framework core: systems, scheduling, lifecycle, engine integration and typed events (v0.1 to v0.3), plus a package library that validates and resolves <code>.nmod</code> manifests (v0.4a). v0.4a does not build, install or run mods.`],
  ["How much of the game can mods change?", `The aim is broad: blocks, items, entities, world generation, rules, physics, rendering, HUD, audio, input, networking, saved data and more. These are engineering targets, not current features.`],
  ["Can mods change the engine itself?", `That is the plan. Beyond APIs and hooks, Nexus aims to support trusted native source-level extensions.`],
  ["Are native mods sandboxed?", `No. Native Rust source mods are not sandboxed, and compiling them can run code. Trust must be approved before compilation.`],
  ["Do I need a compiler?", `For Nexus mods, yes. They are source-built Rust and will need a Rust toolchain.`],
  ["Does Nexus load Fabric or Forge mods?", `${NO_JAVA} ${OUT_OF_SCOPE}`],
  ["What about .hnmod?", `<code>.hnmod</code> is upstream Horizon's native source mod format (see <a href="${HORIZON_MODS}">horizon-mods</a>). Interoperability remains an architectural consideration.`],
  ["Is v0.4 the last version?", `It is the final planned feature milestone. After it comes stabilization, then development pauses. No v0.5 or v1.0 features are planned.`],
  ["Is Nexus official?", `No. It is an independent project, not an official Mojang or Microsoft product, and not an officially endorsed part of upstream Horizon.`],
];
pages["faq/"] = {
  title: "FAQ", description: "Short answers about Horizon Nexus.",
  body: `<div class="container page-main narrow"><p class="kicker">FAQ</p><h1 class="display page-title">Questions</h1>
<div class="faq-list section">${FAQ.map(([q, a]) => `<section class="panel reveal"><h2 class="panel-title">${esc(q)}</h2><p>${a}</p></section>`).join("")}</div></div>`,
};

pages["contributing/"] = {
  title: "Contributing", description: "How to contribute to the Horizon Nexus website.",
  body: `<div class="container page-main"><p class="kicker">Contributing</p><h1 class="display page-title">Help with the site</h1>
<div class="grid two section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">This website</h2><span class="badge">This repo</span></div>
<p>Fixes to pages, design, accessibility and docs go to <a href="${REPO}">contactjayclatty/horizon-nexus-site</a>.</p>
<pre><code>git clone ${REPO}
cd horizon-nexus-site
node build.mjs
node serve.mjs
node --test tests/*.test.mjs</code></pre>
<p>Node 22 or newer, nothing to install. Read <code>CONTRIBUTING.md</code> and <code>AGENTS.md</code> first.</p></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">The engine</h2><span class="badge">Not here</span></div>
<p>Nexus engine code is not in this repository. Horizon engine work happens upstream at <a href="${HORIZON}">horizon-rust/horizon</a> under its own rules.</p>
<h3 class="h-small">We accept</h3>${ticks(["Accurate content that matches src/content.mjs", "Original art only", "Keyboard, contrast and reduced-motion friendly changes"])}</section></div>
</div>`,
};

const docNav = (slug) => `<nav class="docs-nav" aria-label="Documentation"><p class="micro">Docs</p><ul>${DOCS.map((d) => `<li><a href="${u(d.slug ? `docs/${d.slug}/` : "docs/")}"${d.slug === slug ? ' aria-current="page"' : ""}>${esc(d.title)}</a></li>`).join("")}</ul></nav>`;
DOCS.forEach((d, i) => {
  const prev = DOCS[i - 1], next = DOCS[i + 1];
  const href = (x) => u(x.slug ? `docs/${x.slug}/` : "docs/");
  pages[d.slug ? `docs/${d.slug}/` : "docs/"] = {
    title: d.title, description: d.description,
    body: `<div class="container page-main docs">${docNav(d.slug)}<article class="prose"><p class="kicker">Docs · ${i + 1} of ${DOCS.length}</p><h1 class="title">${esc(d.title)}</h1>${d.body({ u, esc, flow, CURRENT, TARGETS })}
<nav class="pager" aria-label="Previous and next">${prev ? `<a class="button" href="${href(prev)}"><span aria-hidden="true">◀</span> ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="button" href="${href(next)}">${esc(next.title)} <span aria-hidden="true">▶</span></a>` : ""}</nav></article></div>`,
  };
});

const notFound = layout({ path: "404", title: "Missing block", description: "This page does not exist.", body: `<div class="container missing">
<p class="kicker">Error 404</p><h1 class="display">Missing block</h1>
<div class="grid404" aria-hidden="true">${"iiiiiiigiiiiiii".split("").map((c) => `<i${c === "g" ? ' class="gone"' : ""}></i>`).join("")}</div>
<p class="lede">This page was mined out, or never placed.</p>
<div class="actions center"><a class="button primary large" href="${u()}">Home</a><a class="button large" href="${u("docs/")}">Docs</a><a class="button large" href="${u("roadmap/")}">Roadmap</a></div></div>` });

function diagramSvg(nodes, title) {
  const w = 960, bw = Math.floor((w - 40 - (nodes.length - 1) * 24) / nodes.length);
  const g = nodes.map(([n, s, cls], i) => {
    const x = 20 + i * (bw + 24), face = cls === "hot" ? "#1f6ad0" : cls === "planned" ? "#0a1829" : "#1c3552";
    const bev = cls === "hot" ? "#4c9af0" : "#3a6596";
    const arrow = i < nodes.length - 1 ? `<rect x="${x + bw + 4}" y="98" width="16" height="4" fill="#62b6ff"/>` : "";
    return `<g><rect x="${x}" y="60" width="${bw}" height="80" fill="#02060d"/><rect x="${x + 2}" y="62" width="${bw - 4}" height="76" fill="${face}"${cls === "planned" ? ' stroke="#365f8e" stroke-dasharray="6 4" stroke-width="2"' : ""}/><rect x="${x + 2}" y="62" width="${bw - 4}" height="2" fill="${bev}"/><rect x="${x + 2}" y="134" width="${bw - 4}" height="4" fill="#040910"/>
<text x="${x + bw / 2}" y="96" text-anchor="middle" font-family="Pixelify Sans, monospace" font-size="${bw < 140 ? 14 : 17}" fill="#f1f7ff">${esc(n)}</text><text x="${x + bw / 2}" y="118" text-anchor="middle" font-family="Geist, sans-serif" font-size="12" fill="#c9dcf0">${esc(s || "")}</text></g>${arrow}`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 200" shape-rendering="crispEdges" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${w}" height="200" fill="#080f1d"/><text x="20" y="36" font-family="Pixelify Sans, monospace" font-size="18" fill="#9fbad8">${esc(title)}</text>${g}</svg>`;
}

await rm(out, { recursive: true, force: true });
await mkdir(join(out, "assets"), { recursive: true });
await cp(join(root, "public"), out, { recursive: true });
await writeArt(join(out, "media"));
await writeFile(join(out, "media/architecture-current.svg"), diagramSvg(CURRENT, "Current runtime (v0.3)"));
await writeFile(join(out, "media/architecture-framework.svg"), diagramSvg(FRAMEWORK, "Planned framework (v0.4b)"));
await writeFile(join(out, "media/architecture-loader.svg"), diagramSvg(LOADER, "Loader pipeline (v0.4a done, rest planned)"));
for (const f of ["tokens.css", "style.css", "site.js"]) await cp(join(root, "src", f), join(out, "assets", f));
for (const [path, p] of Object.entries(pages)) {
  await mkdir(join(out, path), { recursive: true });
  await writeFile(join(out, path, "index.html"), layout({ path, ...p }));
}
await writeFile(join(out, "404.html"), notFound);
// Old docs URLs from the first version of the site, kept working as redirects.
const MOVED = { "docs/architecture/": "architecture/", "docs/runtime-lifecycle/": "docs/system-lifecycle/", "docs/nexus-system/": "docs/", "docs/event-dispatch/": "docs/typed-events/", "docs/security/": "docs/security-model/", "docs/limitations/": "docs/api-limitations/", "docs/mod-loading/": "docs/mod-packaging/", "changelog/": "releases/" };
for (const [from, to] of Object.entries(MOVED)) {
  await mkdir(join(out, from), { recursive: true });
  await writeFile(join(out, from, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${u(to)}"></head><body><p>This page moved to <a href="${u(to)}">${u(to)}</a>.</p></body></html>\n`);
}
await writeFile(join(out, ".nojekyll"), "");
await writeFile(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
await writeFile(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("")}</urlset>\n`);
console.log(`built ${Object.keys(pages).length + 1} pages into ${out} with base ${BASE}`);
