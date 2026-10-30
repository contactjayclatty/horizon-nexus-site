// Builds the static site into dist/. No dependencies: Node 22+ only.
//   BASE=/horizon-nexus-site/ node build.mjs   (the GitHub Pages project path; the default)
//   BASE=/ node build.mjs                      (serve from a domain root)
import { mkdir, writeFile, readFile, cp, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeArt } from "./scripts/art.mjs";
import { MILESTONES, STABILIZATION, IMPLEMENTED, PLANNED_FEATURES, TARGETS, MODULES, NOTICE, USER_PROVIDED, REPO, HORIZON, HORIZON_SITE, HORIZON_MODS } from "./src/content.mjs";
import { icon } from "./src/icons.mjs";
import { DOCS } from "./src/docs.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE ?? "/horizon-nexus-site/").replace(/\/?$/, "/");
const SITE = (process.env.SITE_URL ?? "https://contactjayclatty.github.io/horizon-nexus-site/").replace(/\/?$/, "/");
const out = join(root, process.env.OUT ?? "dist");
export const u = (p = "") => BASE + p.replace(/^\//, "");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const NAV = [
  ["", "Home"], ["features/", "Features"], ["architecture/", "Architecture"], ["docs/", "Docs"],
  ["roadmap/", "Roadmap"], ["changelog/", "Changelog"], ["downloads/", "Downloads"], ["faq/", "FAQ"], ["contributing/", "Contributing"],
];

function layout({ path, title, description, body, bodyClass = "" }) {
  const isCurrent = (p) => (p === "" ? path === "" : path.startsWith(p));
  const links = NAV.map(([p, l]) => `<li><a href="${u(p)}"${isCurrent(p) ? ' aria-current="page"' : ""}>${l}</a></li>`).join("");
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
    <nav aria-label="Main"><ul class="nav-links">${links}</ul></nav>
    <div class="nav-end">
      <a class="button small gh" href="${REPO}">GitHub</a>
      <button class="button small menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="menu"><span data-label>Menu</span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden><nav aria-label="Main (menu)"><ul>${links}<li><a href="${REPO}">GitHub</a></li></ul></nav></div>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="container">
    <img class="footer-logo" src="${u("media/nexus-logo.svg")}" alt="Horizon Nexus" width="256" height="44">
    <div class="footer-cols">
      <div><h2>Nexus</h2><ul><li><a href="${u("features/")}">Features</a></li><li><a href="${u("architecture/")}">Architecture</a></li><li><a href="${u("roadmap/")}">Roadmap</a></li><li><a href="${u("changelog/")}">Changelog</a></li></ul></div>
      <div><h2>Learn</h2><ul><li><a href="${u("docs/")}">Documentation</a></li><li><a href="${u("faq/")}">FAQ</a></li><li><a href="${u("downloads/")}">Downloads</a></li><li><a href="${u("contributing/")}">Contributing</a></li></ul></div>
      <div><h2>Source</h2><ul><li><a href="${REPO}">This website on GitHub</a></li><li><a href="${HORIZON}">Horizon engine (upstream)</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev (upstream)</a></li><li><a href="${HORIZON_MODS}">Horizon mods registry (upstream)</a></li></ul></div>
    </div>
    <p class="disclaimer">${esc(NOTICE)} Minecraft is a trademark of Mojang Synergies AB. This site contains no Minecraft code, textures or assets; all artwork is original and drawn in code.</p>
    <p class="disclaimer">${esc(USER_PROVIDED)}</p>
    <p class="footer-word" aria-hidden="true">NEXUS</p>
  </div>
</footer>
</body>
</html>
`;
  return html.replace(/<a ([^>]*?)href="(https?:\/\/[^"]+)"/g, (m, pre, url) => `<a ${pre}href="${url}" rel="noopener"`);
}

const BADGE = { done: ["done", "Completed"], dev: ["dev", "In development"], planned: ["planned", "Planned"], idea: ["idea", "Idea, not scheduled"], user: ["user", "User-provided"], goal: ["planned", "Goal, not a feature"], core: ["done", "Core completed"] };
const badge = (k) => `<span class="badge ${BADGE[k][0]}">${BADGE[k][1]}</span>`;
const flow = (nodes, label) => `<ol class="flow" aria-label="${esc(label)}">${nodes.map(([n, s, cls = ""]) => `<li><div class="block-node ${cls}">${esc(n)}${s ? `<small>${esc(s)}</small>` : ""}</div></li>`).join("")}</ol>`;
const CURRENT = [["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered Systems", "modular Rust"], ["Typed Event Dispatcher", "same stage, fixed order"]];
const FRAMEWORK = [["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned, v0.4b", "planned"], ["Mod Systems", "your code", "planned"]];
const LOADER = [[".nmod", "package", "planned"], ["Validation", "v0.4a", "planned"], ["Dependencies", "v0.4a", "planned"], ["Native Build", "v0.4b", "planned"], ["Registration", "v0.4b", "planned"], ["Horizon", "runs it", "done"]];
const done = MILESTONES.filter((m) => m.state === "done"), v4 = MILESTONES.filter((m) => m.state !== "done");
const v3 = MILESTONES[2];
const pip = (m) => `<li class="pip ${m.state}"><span class="pip-block" aria-hidden="true"></span><span class="pip-ver">${m.ver}</span><span class="pip-name">${esc(m.name)}</span>${badge(m.state)}</li>`;
const track = (label = "Milestones") => `<ol class="track" aria-label="${label}">${MILESTONES.map(pip).join("")}<li class="pip after"><span class="pip-block" aria-hidden="true"></span><span class="pip-ver">After</span><span class="pip-name">Stabilization, then pause</span><span class="badge planned">Planned</span></li></ol>`;
const head = (kicker, title, text = "", id = "") => `<div class="section-head reveal"><p class="kicker">${kicker}</p><h2 class="title"${id ? ` id="${id}"` : ""}>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`;
const card = ({ ic, title, body, b, extra = "", cls = "" }) => `<section class="panel card reveal ${cls}"><div class="card-top">${ic ? icon(ic, 40) : ""}${b ? badge(b) : ""}</div><h3 class="panel-title">${esc(title)}</h3>${body ? `<p>${body}</p>` : ""}${extra}</section>`;
const moduleCard = (m) => card({ ic: m.icon, title: m.name, b: "idea", cls: "module", extra: `<ul class="ticks">${m.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>${m.note ? `<p class="note">${esc(m.note)}</p>` : ""}` });
const MODULE_NOTE = `<div class="callout warn reveal"><p><b>Ideas, not deliverables.</b> These are examples of modules that might be built after Nexus development pauses, if and when it resumes. None is built, scheduled or promised, and none is part of v0.4.</p></div>`;
const diagram = (nodes, title, img, alt, b) => `<section class="panel reveal diagram"><div class="panel-head"><h3 class="panel-title">${esc(title)}</h3>${badge(b)}</div>${flow(nodes, title)}<img src="${u(`media/${img}`)}" alt="${esc(alt)}" width="960" height="200" loading="lazy" class="diagram-img"></section>`;
const DIAGRAMS = () => `${diagram(CURRENT, "Current runtime", "architecture-current.svg", "Horizon, then Nexus Runtime, then Registered Systems, then Typed Event Dispatcher", "done")}
${diagram(FRAMEWORK, "Planned framework", "architecture-framework.svg", "Horizon Engine, then Nexus APIs, hooks and registries, then mod systems", "planned")}
${diagram(LOADER, "Planned loader", "architecture-loader.svg", ".nmod, then Validation, then Dependencies, then Native Build, then Registration, then Horizon", "planned")}`;

const pages = {};

pages[""] = {
  title: "Home", description: "Horizon Nexus: the Rust-native modding framework and mod loader for the Horizon engine. Change the Game. Extend the Engine.",
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <img class="hero-logo reveal" src="${u("media/nexus-logo.svg")}" alt="Horizon Nexus" width="384" height="66">
      <p class="kicker reveal">The Rust-native framework and mod loader for Horizon</p>
      <h1 class="display reveal" id="hero-title">Change the Game. Extend the Engine.</h1>
      <p class="tag2 reveal">Extend the Engine. Connect the Systems.</p>
      <p class="lede reveal">Nexus is a modding framework and mod loader for the Horizon engine, written in Rust. The goal: new gameplay, changed behaviour and deeper engine changes, shipped as native <code>.nmod</code> packages. The runtime and typed events work today. The loader is in development.</p>
      <div class="actions reveal"><a class="button primary large" href="${u("roadmap/")}">See the roadmap</a><a class="button large" href="${u("docs/")}">Read the docs</a></div>
    </div>
    <section class="panel window reveal" aria-labelledby="state-title">
      <div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title" id="state-title">Development state</h2>${badge("user")}</div>
      ${track()}
      <p class="micro window-foot">v0.4 is the last planned feature milestone. No percentages or dates are published.</p>
    </section>
  </div>
</section>
<section class="section"><div class="container">
  ${head("01 · Two pillars", "One framework. One loader.")}
  <div class="grid two">
    ${card({ ic: "framework", title: "Nexus Framework", b: "core", body: "The runtime mods build on: systems with a lifecycle, deterministic schedules and typed events. v0.4 adds engine APIs, hooks and registries.", extra: `<p class="status"><b>Today:</b> runtime, systems and typed events (v0.1 to v0.3). <b>Next:</b> APIs and hooks (v0.4b, planned).</p>`, cls: "pillar" })}
    ${card({ ic: "package", title: "Nexus Loader", b: "dev", body: "Finds, validates, orders, builds and registers <code>.nmod</code> packages, so mods install without editing the engine source.", extra: `<p class="status"><b>Today:</b> not usable. <b>Now:</b> package foundation (v0.4a, in development).</p>`, cls: "pillar" })}
  </div>
</div></section>
<section class="section"><div class="container">
  ${head("02 · Shipped", "Completed milestones", "Three milestones are complete. Commits are from the developer's branch.")}
  <div class="grid three">${done.map((m) => card({ ic: m.icon, title: `${m.ver}: ${m.name}`, b: "done", body: esc(m.summary), extra: `<p class="micro">Commit ${m.commit}</p>` })).join("")}</div>
  <div class="panel well reveal v3-stats"><div class="stats"><div class="stat"><div class="stat-value">18/18</div><div class="stat-label">v0.3 tests passed</div></div><div class="stat"><div class="stat-value">Pass</div><div class="stat-label">strict Clippy</div></div><div class="stat"><div class="stat-value">64</div><div class="stat-label">events per delivery batch</div></div><div class="stat"><div class="stat-value">In-game</div><div class="stat-label">multi-system delivery validated</div></div></div></div>
</div></section>
<section class="section"><div class="container">
  ${head("03 · Not built yet", "Planned for v0.4: Complete Nexus Framework and Mod Loader", "The loader is one part of v0.4, not the whole of it.")}
  <div class="grid four">${v4.map((m) => card({ ic: m.icon, title: `${m.ver}: ${m.name}`, b: m.state, body: esc(m.summary) })).join("")}</div>
</div></section>
<section class="section"><div class="container">
  ${head("04 · The aim", "What mods should be able to change", "Target capabilities across Horizon. These are goals, not features that exist today.")}
  <ul class="chips big reveal">${TARGETS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div></section>
<section class="section"><div class="container">
  ${head("05 · Architecture", "How it fits together")}
  <div class="stack">${DIAGRAMS()}</div>
  <div class="actions"><a class="button" href="${u("architecture/")}">Architecture in detail</a></div>
</div></section>
<section class="section"><div class="container">
  ${head("06 · Why a full framework", "What it could enable, one day", "Examples of modules a flexible framework could make possible.")}
  ${MODULE_NOTE}
  <div class="grid four">${MODULES.map(moduleCard).join("")}</div>
</div></section>
<section class="section"><div class="container">
  <div class="panel raised reveal gh-panel"><div class="gh-art">${icon("workflow", 64)}</div><div><h2 class="panel-title">On GitHub</h2>
    <p>This website is developed in the open. The Nexus engine code is on an independent development branch of Horizon and is not in this repository.</p>
    <div class="actions"><a class="button primary" href="${REPO}">Website repository</a><a class="button" href="${REPO}/issues">Report a site issue</a><a class="button" href="${HORIZON}">Horizon upstream</a></div></div>
  </div>
</div></section>`,
};

pages["features/"] = {
  title: "Features", description: "Nexus features, split into implemented today, planned for v0.4, and future possibilities.",
  body: `<div class="container page-main">
<p class="kicker">Features</p><h1 class="display page-title">What works, what's next</h1>
<p class="lede">Three groups, kept apart on purpose: what is implemented now, what v0.4 plans, and ideas for later.</p>
<nav class="jump" aria-label="On this page"><a class="button small" href="#today">Implemented today</a><a class="button small" href="#v04">Planned for v0.4</a><a class="button small" href="#future">Future possibilities</a></nav>
<section class="section" aria-labelledby="today">${head("By v0.3 · user-provided", "Implemented today", "", "today")}
<div class="grid three">${IMPLEMENTED.map((f) => card({ ic: f.icon, title: f.name, b: "done", body: esc(f.body) })).join("")}</div></section>
<section class="section" aria-labelledby="v04">${head("v0.4a to v0.4d", "Planned for v0.4", "v0.4a is in development. The rest is planned. None of it can be used yet.", "v04")}
<div class="grid three">${PLANNED_FEATURES.map((f) => card({ ic: "package", title: f.name, b: f.ms === "v0.4a" ? "dev" : "planned", body: `${esc(f.body)} <span class="micro">${f.ms}</span>` })).join("")}</div></section>
<section class="section" aria-labelledby="future">${head("Goals and ideas", "Future possibilities", "", "future")}
<h3 class="h-pixel reveal">Target capabilities</h3><p class="muted reveal">Areas the framework aims to let mods change. Not implemented.</p>
<ul class="chips reveal">${TARGETS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
<h3 class="h-pixel reveal" style="margin-top:32px">Example modules</h3>${MODULE_NOTE}
<div class="grid four">${MODULES.map(moduleCard).join("")}</div></section>
</div>`,
};

pages["architecture/"] = {
  title: "Architecture", description: "The current Nexus runtime, the planned framework layers and the planned .nmod loader pipeline.",
  body: `<div class="container page-main">
<p class="kicker">Architecture</p><h1 class="display page-title">Runtime, framework, loader</h1>
<p class="lede">What runs today, and what v0.4 plans to add around it.</p>
<div class="stack" style="margin-top:32px">${DIAGRAMS()}</div>
<div class="grid two section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Today: the runtime</h2>${badge("done")}</div><ul><li>Nexus is compiled into Horizon.</li><li>The runtime registers systems and runs them on deterministic schedules.</li><li>The dispatcher offers each typed event to enabled systems in the same stage, in a fixed order. Systems inspect events and handle the ones relevant to them.</li><li>Delivery is in batches of at most 64 events.</li></ul></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Two depths of modding</h2>${badge("goal")}</div><div class="layers"><div class="layer"><b>High-level APIs</b><span>common tasks, ordinary mods</span></div><div class="layer"><b>Engine hooks</b><span>deeper behaviour changes</span></div><div class="layer deep"><b>Trusted native source changes</b><span>where a mod must change the engine itself</span></div></div></section>
</div>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Trusted native code</h2>${icon("shield", 32)}</div>
<p>Nexus mods are Rust compiled into the game. They are <b>not sandboxed</b> and run with the player's permissions. Code can run during Cargo compilation too, so trust must be approved <b>before</b> a mod is built. Validation (v0.4a) catches broken or conflicting packages; it does not make untrusted code safe.</p></div></section>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Compatibility metadata</h2>${badge("planned")}</div>
<div class="table-wrap"><table class="data"><thead><tr><th>Concept</th><th>Meaning</th></tr></thead><tbody><tr><td>Nexus API version</td><td>The Nexus API a mod requires.</td></tr><tr><td>Horizon compatibility</td><td>The Horizon source/API range a mod supports.</td></tr><tr><td>Horizon revision</td><td>The exact Horizon revision a compiled install was built against.</td></tr></tbody></table></div>
<p class="muted">Horizon's <code>.hnmod</code> format remains an interoperability consideration.</p></div></section>
</div>`,
};

pages["roadmap/"] = {
  title: "Roadmap", description: "The Horizon Nexus roadmap: v0.1 to v0.3 completed, v0.4a in development, v0.4b to v0.4d planned, then stabilization and a pause.",
  body: `<div class="container page-main">
<p class="kicker">Roadmap</p><h1 class="display page-title">Built block by block</h1>
<p class="lede">v0.4 is the last planned feature milestone: the complete Nexus framework and mod loader. After it, stabilization, then a pause. There are no planned v0.5 or v1.0 milestones, and no dates.</p>
<div class="panel well reveal" style="margin-top:24px">${track("Roadmap at a glance")}</div>
<ol class="timeline section">
${MILESTONES.map((m) => `<li class="reveal ${m.state}"><div class="ver"><span class="ver-block" aria-hidden="true">${icon(m.icon, 32)}</span>${m.ver}</div><section class="panel${m.state === "dev" ? " raised current" : ""}"><div class="panel-head"><h2 class="panel-title"><span class="sr-only">${m.ver}: </span>${esc(m.name)}</h2>${badge(m.state)}</div>
<p>${esc(m.summary)}</p>${m.commit ? `<p class="micro">Commit ${m.commit} · user-provided</p>` : ""}
${m.items.length && m.state !== "done" ? `<ul class="ticks">${m.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}${m.state === "done" && m.items.length ? `<ul class="ticks done">${m.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}</section></li>`).join("")}
<li class="reveal after"><div class="ver"><span class="ver-block" aria-hidden="true">${icon("tools", 32)}</span>After</div><section class="panel well"><div class="panel-head"><h2 class="panel-title">After v0.4: Final stabilization</h2>${badge("planned")}</div><p>Once v0.4 is complete, work shifts from features to hardening:</p><ul class="ticks cols">${STABILIZATION.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section></li>
<li class="reveal after"><div class="ver"><span class="ver-block" aria-hidden="true">${icon("lifecycle", 32)}</span>Then</div><section class="panel well"><div class="panel-head"><h2 class="panel-title">Development pauses</h2>${badge("planned")}</div><p>After stabilization, development pauses. Any later work, such as the example modules on the <a href="${u("features/#future")}">Features</a> page, is at the developer's discretion and not scheduled.</p></section></li>
</ol></div>`,
};

pages["changelog/"] = {
  title: "Changelog", description: "Completed Nexus milestones v0.1, v0.2 and v0.3, and work in progress on v0.4a.",
  body: `<div class="container page-main narrow">
<p class="kicker">Changelog</p><h1 class="display page-title">Changelog</h1>
<div class="callout"><p>${esc(USER_PROVIDED)}</p></div>
<div class="stack section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">In progress: v0.4a Package Foundation</h2>${badge("dev")}</div><p>Not a release. Work on manifest parsing, package discovery, dependency resolution, version compatibility and validation.</p></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">v0.3: Inter-System Events</h2>${badge("done")}</div><p class="micro">Commit 2a01521ee</p>
<ul class="ticks done"><li>Typed event production, and delivery to multiple systems, validated in-game.</li><li>Dedicated event dispatch, validated.</li><li>Deterministic same-stage dispatch order.</li><li>Delivery in bounded batches of 64 events.</li><li>Safe lifecycle cleanup.</li><li>On a dedicated server, an owner-console <code>/say</code> is deliberately dropped and logged, because that adapter needs an integrated-server owner.</li><li>18/18 tests passed; strict Clippy checks passed.</li></ul></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">v0.2: Engine Integration</h2>${badge("done")}</div><p class="micro">Commit 52aedd384</p><p>Engine Integration. A detailed change list has not been published.</p></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">v0.1: Systems Runtime</h2>${badge("done")}</div><p class="micro">Commit 0fcc557b1</p><p>Systems Runtime. A detailed change list has not been published.</p></section>
</div></div>`,
};

pages["downloads/"] = {
  title: "Downloads", description: "Horizon Nexus has no installer yet. Status and verified public resources.",
  body: `<div class="container page-main">
<p class="kicker">Downloads</p><h1 class="display page-title">No installer yet</h1>
<p class="lede">There is no Nexus installer and no <code>.nmod</code> package to download. Nexus is compiled into the Horizon engine on an independent development branch, which is not published here.</p>
<div class="grid two section">
<section class="panel window reveal"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title">Nexus</h2>${badge("dev")}</div>
<div class="launcher-bar"><div class="version-select">v0.3 · source only</div><span class="button primary" aria-disabled="true">No download</span></div>
<ol class="rows"><li><span class="idx">01</span><span><span class="name">Installer</span><span class="detail">Does not exist yet</span></span><span class="badge">None</span></li><li><span class="idx">02</span><span><span class="name">.nmod packages</span><span class="detail">Package foundation in development (v0.4a)</span></span>${badge("dev")}</li><li><span class="idx">03</span><span><span class="name">Install management</span><span class="detail">Profiles and rollback (v0.4d)</span></span>${badge("planned")}</li></ol></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Verified public resources</h2><span class="badge">Upstream</span></div>
<p>These belong to the upstream Horizon project. Nexus is not part of them.</p>
<ul class="links"><li><a href="${HORIZON}">Horizon engine and launcher source</a></li><li><a href="${HORIZON}/releases">Horizon releases</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li><li><a href="${HORIZON_MODS}">Horizon mods registry</a></li></ul>
<p class="muted">To install Horizon, follow upstream's own instructions.</p></section>
</div></div>`,
};

const FAQ = [
  ["What is Nexus?", `A Rust-native modding framework and mod loader for the Horizon engine. The aim is for mods to add gameplay, change behaviour, override engine systems and extend rendering and world simulation, packaged as native <code>.nmod</code> extensions.`],
  ["What works today?", `The framework's core: a systems runtime, engine integration and typed events between systems (v0.1 to v0.3). It is compiled into the engine.`],
  ["Is the loader ready?", `No. v0.4a, the package foundation, is in development. Compilation, registration and APIs (v0.4b), a real install workflow (v0.4c) and ecosystem tools (v0.4d) are planned.`],
  ["How much of the game will mods be able to change?", `The target is broad: blocks, items, crafting, entities, world generation, rules, rendering, HUD, audio, networking, saved data, commands and engine hooks. These are goals. Not every subsystem exposes an API today.`],
  ["Can mods change the engine itself?", `That is planned. Beyond high-level APIs and hooks, Nexus aims to support trusted native source-level changes where a mod needs them.`],
  ["Is native mod code sandboxed?", `No. Nexus mods are trusted native Rust. They run with the player's permissions and can run code during Cargo compilation, so trust must be approved before a mod is built.`],
  ["Is compiling required?", `Yes. Nexus mods are source-built Rust, so installing one will need a compiler toolchain.`],
  ["Does Nexus load Fabric or Forge mods?", `Nexus is a native Rust modding platform for Horizon and does not load Java Fabric or Forge mods.`],
  ["What about .hnmod?", `<code>.hnmod</code> is upstream Horizon's native source mod format (see the <a href="${HORIZON_MODS}">horizon-mods</a> registry). Interoperability with it remains an architectural consideration.`],
  ["Is there a v0.5 or v1.0?", `No. v0.4 is the last planned feature milestone. After it comes stabilization, then development pauses.`],
  ["Can I install Nexus today?", `No public build exists. See <a href="${u("downloads/")}">Downloads</a>.`],
  ["How will engine updates work?", `The plan keeps three versions apart: the Nexus API a mod needs, the Horizon range it supports, and the exact Horizon revision it was built against. Compatibility diagnostics and rollback are v0.4d goals.`],
];
pages["faq/"] = {
  title: "FAQ", description: "Answers about Horizon Nexus: the framework, the loader, native Rust mods, trust, compiling, Java mods, .hnmod and the roadmap.",
  body: `<div class="container page-main narrow"><p class="kicker">FAQ</p><h1 class="display page-title">Questions</h1>
<div class="faq section">${FAQ.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}</summary><div class="answer"><p>${a}</p></div></details>`).join("")}</div></div>`,
};

pages["contributing/"] = {
  title: "Contributing", description: "How to contribute to the Horizon Nexus website, and how that differs from Horizon engine development.",
  body: `<div class="container page-main"><p class="kicker">Contributing</p><h1 class="display page-title">Help build the site</h1>
<div class="grid two section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">This website</h2><span class="badge">This repo</span></div>
<p>Fixes to pages, design, accessibility and docs go to <a href="${REPO}">contactjayclatty/horizon-nexus-site</a>.</p>
<pre><code>git clone ${REPO}
cd horizon-nexus-site
node build.mjs
node serve.mjs
node --test tests/*.test.mjs</code></pre>
<p>Node 22 or newer. No packages to install. Read <code>CONTRIBUTING.md</code> and <code>AGENTS.md</code> first.</p></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">The engine</h2><span class="badge">Not here</span></div>
<p>Nexus engine code is not in this repository. Horizon engine development happens upstream at <a href="${HORIZON}">horizon-rust/horizon</a> under its own rules. This site is not part of upstream Horizon.</p>
<h3 class="h-pixel">What we accept</h3><ul class="ticks"><li>Accurate content that matches <code>src/content.mjs</code>.</li><li>Original art only.</li><li>Keyboard, contrast and reduced-motion friendly changes.</li></ul></section></div>
</div>`,
};

// Docs pages
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
<p class="lede">This page was mined out, or never placed. Check the address, or pick a way back.</p>
<div class="actions center"><a class="button primary large" href="${u()}">Back to Nexus</a><a class="button large" href="${u("docs/")}">Docs</a><a class="button large" href="${u("roadmap/")}">Roadmap</a></div></div>` });

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
await writeFile(join(out, "media/architecture-loader.svg"), diagramSvg(LOADER, "Planned loader (v0.4a to v0.4b)"));
for (const f of ["tokens.css", "style.css", "site.js"]) await cp(join(root, "src", f), join(out, "assets", f));
for (const [path, p] of Object.entries(pages)) {
  await mkdir(join(out, path), { recursive: true });
  await writeFile(join(out, path, "index.html"), layout({ path, ...p }));
}
await writeFile(join(out, "404.html"), notFound);
// Old docs URLs from the first version of the site, kept working as redirects.
const MOVED = { "docs/architecture/": "architecture/", "docs/runtime-lifecycle/": "docs/system-lifecycle/", "docs/nexus-system/": "docs/", "docs/event-dispatch/": "docs/typed-events/", "docs/security/": "docs/security-model/", "docs/limitations/": "docs/api-limitations/", "docs/mod-loading/": "docs/mod-packaging/" };
for (const [from, to] of Object.entries(MOVED)) {
  await mkdir(join(out, from), { recursive: true });
  await writeFile(join(out, from, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${u(to)}"></head><body><p>This page moved to <a href="${u(to)}">${u(to)}</a>.</p></body></html>\n`);
}
await writeFile(join(out, ".nojekyll"), "");
await writeFile(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
await writeFile(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("")}</urlset>\n`);
console.log(`built ${Object.keys(pages).length + 1} pages into ${out} with base ${BASE}`);
