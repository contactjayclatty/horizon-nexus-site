// Builds the static site into dist/. No dependencies: Node 22+ only.
//   BASE=/horizon-nexus-site/ node build.mjs   (the GitHub Pages project path; the default)
//   BASE=/ node build.mjs                      (serve from a domain root)
import { mkdir, writeFile, readFile, cp, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeArt } from "./scripts/art.mjs";
import { MILESTONES, FUTURE, FEATURES, NOTICE, USER_PROVIDED, REPO, HORIZON, HORIZON_SITE, HORIZON_MODS } from "./src/content.mjs";
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
  return `<!doctype html>
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
<meta property="og:image:alt" content="Horizon Nexus: a blue block portal in a pixel-art night landscape, with the line Extend the Engine. Connect the Systems.">
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
    <a class="nav-mark" href="${u()}"><img src="${u("media/nexus-icon.svg")}" alt="" width="28" height="28"><span>Nexus</span><small>for Horizon</small></a>
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
}

const badge = (state) => ({ done: '<span class="badge done">Completed</span>', dev: '<span class="badge dev">Proposed / In development</span>', future: '<span class="badge future">Future research</span>' })[state];
const mini = (spec) => `<div class="mini" aria-hidden="true">${spec.split(" ").map((c) => `<i class="${c}"></i>`).join("")}</div>`;
const flow = (nodes, label) => `<ol class="flow" aria-label="${esc(label)}">${nodes.map(([n, s, cls = ""]) => `<li><div class="block-node ${cls}">${esc(n)}${s ? `<small>${esc(s)}</small>` : ""}</div></li>`).join("")}</ol>`;
const CURRENT = [["Horizon Engine", "the host game"], ["Nexus Runtime", "compiled in", "hot"], ["Systems", "modular Rust"], ["Typed Events", "bounded batches"], ["Subscribers", "independent"]];
const PLANNED = [[".nmod", "package", "planned"], ["Loader", "discovery", "planned"], ["Validation", "manifest + deps", "planned"], ["Native Build", "Cargo", "planned"], ["Nexus Registration", "ordered", "planned"], ["Horizon", "runs it"]];
const v3 = MILESTONES[2], v4 = MILESTONES[3];

const pages = {};

pages[""] = {
  title: "Home", description: "Horizon Nexus: modular Rust systems, deterministic schedules and typed events for the Horizon engine. Extend the Engine. Connect the Systems.",
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="container">
    <p class="kicker reveal">Horizon Nexus · v0.3 · Rust</p>
    <h1 class="display reveal" id="hero-title">Extend the Engine. Connect the Systems.</h1>
    <p class="tag2 reveal">Built Block by Block.</p>
    <p class="lede reveal">Nexus is a modular systems runtime for the Horizon engine: Rust systems on deterministic schedules, talking through typed events. It is compiled into the engine today. A standalone mod loader is proposed for v0.4.</p>
    <div class="actions reveal">
      <a class="button primary large" href="${u("docs/")}">Read the docs</a>
      <a class="button large" href="${u("roadmap/")}">See the roadmap</a>
    </div>
  </div>
</section>
<div class="container launcher">
  <section class="panel reveal" aria-labelledby="state-title">
    <div class="panel-head"><h2 class="panel-title" id="state-title">Nexus development state</h2><span class="badge user">User-provided</span></div>
    <div class="launcher-bar">
      <div class="segmented" aria-label="Side (illustrative)"><span class="on">Client</span><span>Server</span></div>
      <div class="version-select" aria-label="Current milestone">v0.3 · 2a01521ee <span aria-hidden="true">▾</span></div>
      <a class="button primary" href="${u("downloads/")}">Status: in development</a>
    </div>
    <ol class="rows">
      <li><span class="idx">01</span><span><span class="name">Runtime</span><span class="detail">Compiled into the Horizon engine</span></span><span class="badge done">Ready</span></li>
      <li><span class="idx">02</span><span><span class="name">Typed events</span><span class="detail">Multiple-subscription delivery validated in-game</span></span><span class="badge done">v0.3</span></li>
      <li><span class="idx">03</span><span><span class="name">Tests</span><span class="detail">18/18 passed, strict Clippy passed</span></span><span class="badge done">Passing</span></li>
      <li><span class="idx">04</span><span><span class="name">Standalone .nmod loader</span><span class="detail">Not implemented yet</span></span><span class="badge dev">v0.4</span></li>
    </ol>
  </section>
</div>
<section class="section"><div class="container">
  <div class="section-head reveal overview"><img class="portal-art" src="${u("media/portal.svg")}" alt="Pixel art: a frame of dark blue blocks around a glowing blue core, with module blocks docking at its sides" width="192" height="192" loading="lazy"><div><p class="kicker">01 · Overview</p><h2 class="title">What Nexus is</h2>
  <p>Nexus organises engine-side behaviour in Horizon into small Rust systems. Each system has a lifecycle, runs at a known point in a deterministic schedule, and sends or receives typed events instead of sharing state. It is built into the engine; it does not yet load mods from separate packages.</p></div></div>
  <div class="grid three">
    <div class="panel reveal"><h3 class="panel-title">Compiled in</h3><p>Nexus remains compiled into the engine. There is no separate installer.</p></div>
    <div class="panel reveal"><h3 class="panel-title">Deterministic</h3><p>The same systems run in the same order, and same-stage events dispatch in a deterministic order.</p></div>
    <div class="panel reveal"><h3 class="panel-title">Honest scope</h3><p>Nexus is not a Fabric or Forge loader. Java mods do not run through it.</p></div>
  </div>
</div></section>
<section class="section"><div class="container">
  <div class="section-head reveal"><p class="kicker">02 · Core systems</p><h2 class="title">Seven building blocks</h2></div>
  <div class="grid four">${FEATURES.map((f) => `<div class="panel feature reveal"><p class="micro">${f.ms}</p><h3 class="panel-title">${esc(f.name)}</h3><p>${esc(f.body)}</p>${mini(f.mini)}</div>`).join("")}</div>
  <div class="actions"><a class="button" href="${u("features/")}">All features</a></div>
</div></section>
<section class="section"><div class="container">
  <div class="section-head reveal"><p class="kicker">03 · Architecture</p><h2 class="title">How the pieces connect</h2><p>Today, and what v0.4 proposes.</p></div>
  <div class="panel reveal"><div class="panel-head"><h3 class="panel-title">Current</h3><span class="badge done">v0.3</span></div>${flow(CURRENT, "Current architecture")}</div>
  <div class="panel reveal" style="margin-top:12px"><div class="panel-head"><h3 class="panel-title">Planned</h3><span class="badge dev">v0.4 proposed</span></div>${flow(PLANNED, "Planned architecture")}</div>
  <div class="actions"><a class="button" href="${u("architecture/")}">Architecture in detail</a></div>
</div></section>
<section class="section"><div class="container grid two">
  <div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Latest milestone: v0.3 Inter-System Events</h2><span class="badge done">Completed</span></div>
    <p class="micro">Commit ${v3.commit} · user-provided</p>
    <div class="stats"><div class="stat"><div class="stat-value">18/18</div><div class="stat-label">tests passed</div></div><div class="stat"><div class="stat-value">64</div><div class="stat-label">events per delivery batch</div></div><div class="stat"><div class="stat-value">Pass</div><div class="stat-label">strict Clippy</div></div></div>
    <ul>${v3.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <a class="button small" href="${u("changelog/")}">Changelog</a>
  </div>
  <div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Loader roadmap</h2><span class="badge dev">v0.4</span></div>
    <ol class="rows">${v4.items.map((i, n) => `<li><span class="idx">${String(n + 1).padStart(2, "0")}</span><span class="name">${esc(i)}</span><span class="badge">Planned</span></li>`).join("")}</ol>
    <div class="actions"><a class="button small" href="${u("roadmap/")}">Full roadmap</a></div>
  </div>
</div></section>
<section class="section"><div class="container">
  <div class="panel raised reveal"><div class="panel-head"><h2 class="panel-title">On GitHub</h2><span class="badge">Open source website</span></div>
    <p>This website is developed in the open. The Nexus engine work lives on an independent development branch of Horizon and is not published in this repository.</p>
    <div class="actions"><a class="button primary" href="${REPO}">Website repository</a><a class="button" href="${REPO}/issues">Report a site issue</a><a class="button" href="${HORIZON}">Horizon upstream</a></div>
  </div>
</div></section>`,
};

pages["features/"] = {
  title: "Features", description: "The implemented Nexus features: modular Rust systems, deterministic schedules, typed events, multiple subscribers, lifecycle, client/server isolation and controlled engine actions.",
  body: `<div class="container page-main">
<p class="kicker">Features · implemented by v0.3 (user-provided)</p><h1 class="display page-title">What Nexus does today</h1>
<p class="lede">Each feature below is implemented on the Nexus development branch, per the developer's own validation. The descriptions explain what each name means; implementation details are not public. None of it requires a separate install: it is part of the engine build.</p>
<div class="grid two" style="margin-top:32px">
${FEATURES.map((f, i) => `<section class="panel reveal" aria-labelledby="f${i}"><div class="panel-head"><h2 class="panel-title" id="f${i}">${esc(f.name)}</h2><span class="badge done">${f.ms}</span></div><p>${esc(f.body)}</p>${featureDiagram(i)}</section>`).join("")}
</div>
<div class="callout warn" style="margin-top:24px"><p>Not a feature yet: installing standalone <code>.nmod</code> packages. That is the v0.4 proposal. See the <a href="${u("roadmap/")}">roadmap</a>.</p></div>
</div>`,
};
function featureDiagram(i) {
  const d = [
    flow([["System A"], ["System B"], ["System C"]], "Independent systems"),
    flow([["Tick"], ["Stage 1"], ["Stage 2"], ["Stage 3"]], "A fixed order each tick (illustrative stage names)"),
    flow([["Producer", "emits typed event", "hot"], ["Event<T>", "typed"], ["Receiver", "of T"]], "Typed event flow"),
    `<div class="grid three" aria-label="One event, three subscribers"><div class="block-node hot">Event</div><div class="block-node">Subscriber 1</div><div class="block-node">Subscriber 2</div></div>`,
    flow([["Start"], ["Run", "each scheduled tick", "hot"], ["Stop", "safe cleanup"]], "System lifecycle"),
    `<div class="grid two" aria-label="Client and server sides kept apart"><div class="block-node">Client systems<small>client side only</small></div><div class="block-node">Server systems<small>server side only</small></div></div>`,
    flow([["System"], ["Engine action", "controlled set", "hot"], ["Engine"]], "Controlled engine actions"),
  ];
  return `<div style="margin-top:16px">${d[i]}</div>`;
}

pages["architecture/"] = {
  title: "Architecture", description: "The current Nexus architecture inside the Horizon engine, and the proposed v0.4 .nmod loader pipeline.",
  body: `<div class="container page-main">
<p class="kicker">Architecture</p><h1 class="display page-title">Current and planned</h1>
<p class="lede">Nexus today is a runtime compiled into Horizon. v0.4 proposes a loader that validates packages before anything is compiled.</p>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Current architecture</h2><span class="badge done">v0.1 to v0.3</span></div>
${flow(CURRENT, "Current architecture")}
<img src="${u("media/architecture-current.svg")}" alt="Diagram: Horizon Engine, then Nexus Runtime, then Systems, then Typed Events, then Subscribers" width="960" height="200" style="margin-top:20px" loading="lazy">
<ul><li>The Horizon engine hosts the Nexus runtime; Nexus is part of the engine build.</li><li>The runtime owns systems and runs them on deterministic schedules.</li><li>Systems emit typed events. Dispatch is deterministic within a stage and delivered in bounded batches of 64 events.</li><li>Any number of independent subscribers can receive an event type.</li></ul>
</div></section>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Planned architecture</h2><span class="badge dev">v0.4 proposed</span></div>
${flow(PLANNED, "Planned architecture")}
<img src="${u("media/architecture-planned.svg")}" alt="Diagram: .nmod package, then Loader, then Validation, then Native Build, then Nexus Registration, then Horizon" width="960" height="200" style="margin-top:20px" loading="lazy">
<ul><li><b>.nmod</b>: a standalone package with a manifest.</li><li><b>Loader</b>: discovers packages on disk, with path-traversal and symlink-escape checks.</li><li><b>Validation</b>: unique IDs, versions, sides, stages, dependencies and conflicts checked before any code is built.</li><li><b>Native Build</b>: mods are native Rust and need a compiler toolchain. Native code is not sandboxed and may run during Cargo compilation, so trust approval must come first.</li><li><b>Nexus Registration</b>: mods register in a deterministic order.</li></ul>
<div class="callout warn"><p>This pipeline is a proposal. None of it is released.</p></div>
</div></section>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Proposed compatibility metadata</h2><span class="badge dev">v0.4</span></div>
<p>The v0.4 proposal keeps three versions separate:</p>
<table class="prose"><thead><tr><th>Concept</th><th>Meaning</th></tr></thead><tbody><tr><td>Nexus API version</td><td>The Nexus API a mod requires.</td></tr><tr><td>Horizon compatibility</td><td>The Horizon source/API range a mod supports.</td></tr><tr><td>Horizon revision</td><td>The exact Horizon revision a compiled installation was built against.</td></tr></tbody></table>
</div></section>
</div>`,
};

pages["roadmap/"] = {
  title: "Roadmap", description: "The Horizon Nexus development timeline: v0.1 to v0.3 completed, v0.4 standalone loader proposed and in development.",
  body: `<div class="container page-main">
<p class="kicker">Roadmap</p><h1 class="display page-title">Built block by block</h1>
<p class="lede">Three milestones complete, one in development. Commits are from the developer's independent branch (user-provided).</p>
<ol class="timeline" style="margin-top:32px">
${MILESTONES.map((m) => `<li class="reveal"><div class="ver">${m.ver}</div><section class="panel${m.state === "dev" ? " raised" : ""}"><div class="panel-head"><h2 class="panel-title">${esc(m.name)}</h2>${badge(m.state)}</div>
<p>${esc(m.summary)}</p>${m.commit ? `<p class="micro">Commit ${m.commit}</p>` : `<p class="micro">No release commit</p>`}
<div class="progress" role="img" aria-label="${m.state === "done" ? "Complete" : "Early: in development"}"><span style="width:${m.pct}%"></span></div>
${m.items.length ? `<ul>${m.items.map((i) => `<li>${m.state === "dev" ? "Planned: " : ""}${esc(i)}</li>`).join("")}</ul>` : ""}</section></li>`).join("")}
<li class="reveal"><div class="ver">Next</div><section class="panel well"><div class="panel-head"><h2 class="panel-title">Future research</h2>${badge("future")}</div><p>Ideas being researched. Nothing here is planned for a release yet.</p><ul>${FUTURE.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section></li>
</ol></div>`,
};

pages["changelog/"] = {
  title: "Changelog", description: "Validated Nexus milestones v0.1, v0.2 and v0.3, and the proposed v0.4.",
  body: `<div class="container page-main prose">
<p class="kicker">Changelog</p><h1 class="display page-title">Changelog</h1>
<div class="callout"><p>${esc(USER_PROVIDED)}</p></div>
<h2>v0.4: Standalone Nexus Loader <span class="badge dev">Proposed</span></h2>
<p>Proposed / in development. Not released. Planned scope: ${v4.items.map(esc).join(", ")}.</p>
<h2>v0.3: Inter-System Events <span class="badge done">Completed</span></h2>
<p class="micro">Commit 2a01521ee</p>
<ul><li>Typed event production, and delivery to multiple independent subscribers, validated in-game.</li><li>Dedicated event dispatch, validated.</li><li>Deterministic same-stage dispatch.</li><li>Delivery in bounded batches of 64 events.</li><li>Safe lifecycle cleanup.</li><li>On a dedicated server, an owner-console <code>/say</code> is deliberately dropped and logged, because that adapter requires an integrated-server owner.</li><li>Validation: 18/18 tests passed; strict Clippy checks passed.</li></ul>
<h2>v0.2: Engine Integration <span class="badge done">Completed</span></h2>
<p class="micro">Commit 52aedd384</p>
<p>Engine Integration. A detailed change list has not been published.</p>
<h2>v0.1: Systems Runtime <span class="badge done">Completed</span></h2>
<p class="micro">Commit 0fcc557b1</p>
<p>Systems Runtime. A detailed change list has not been published.</p>
</div>`,
};

pages["downloads/"] = {
  title: "Downloads", description: "Horizon Nexus has no public standalone installer yet. Status and verified public resources.",
  body: `<div class="container page-main">
<p class="kicker">Downloads</p><h1 class="display page-title">No installer yet</h1>
<p class="lede">Nexus does not have a public standalone installer. It is compiled into the Horizon engine on an independent development branch, and that build is not published here.</p>
<div class="grid two" style="margin-top:32px">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Nexus</h2><span class="badge dev">In development</span></div>
<div class="launcher-bar"><div class="version-select">v0.3 · source only</div><span class="button primary" aria-disabled="true" role="link" aria-label="Download unavailable: no public build">Not available</span></div>
<ol class="rows"><li><span class="idx">01</span><span><span class="name">Standalone installer</span><span class="detail">Not built</span></span><span class="badge">None</span></li><li><span class="idx">02</span><span><span class="name">.nmod packages</span><span class="detail">Planned for v0.4</span></span><span class="badge dev">Planned</span></li><li><span class="idx">03</span><span><span class="name">Launcher integration</span><span class="detail">Planned for v0.4</span></span><span class="badge dev">Planned</span></li></ol>
</section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Verified public resources</h2><span class="badge">Upstream</span></div>
<p>These belong to the upstream Horizon project, not to Nexus. Nexus is not part of them.</p>
<ul><li><a href="${HORIZON}">Horizon engine and launcher source</a></li><li><a href="${HORIZON}/releases">Horizon releases</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li><li><a href="${HORIZON_MODS}">Horizon mods registry</a></li></ul>
<p class="muted">Follow upstream's own instructions to install Horizon.</p></section>
</div></div>`,
};

const FAQ = [
  ["What is Nexus?", `A modular systems runtime for the Horizon engine: Rust systems, deterministic schedules and typed events. It is compiled into the engine on an independent development branch.`],
  ["Is it a mod loader yet?", `No. Standalone <code>.nmod</code> installation is not implemented. A loader is the v0.4 proposal, which is in development.`],
  ["How does it compare with Fabric and Forge?", `They are Java mod loaders. Nexus is native Rust inside Horizon. Fabric and Forge mods do not run through Nexus; any compatibility bridge is speculative future research.`],
  ["How will .nmod work?", `Proposed for v0.4: a package with a versioned manifest that the loader discovers, validates (IDs, versions, sides, stages, dependencies, conflicts) and orders deterministically before anything is compiled. The design may change.`],
  ["What about .hnmod?", `<code>.hnmod</code> is upstream Horizon's native source mod format (see the <a href="${HORIZON_MODS}">horizon-mods</a> registry). Interoperability with it is future research for Nexus, not a commitment.`],
  ["Is compiling required?", `Yes. Nexus is compiled into the engine today, and the planned native mods are source-built Rust, so installing them will need a Rust toolchain. Do not expect to install a source-built mod without a compiler.`],
  ["Can I install Nexus today?", `No public build exists. See <a href="${u("downloads/")}">Downloads</a>.`],
  ["Is native mod code sandboxed?", `No. Native <code>.nmod</code> code is unsandboxed and may execute during Cargo compilation (build scripts and macros). Trust approval must come before compilation.`],
  ["How will engine updates work?", `The v0.4 proposal separates three versions: the Nexus API a mod needs, the Horizon source/API range it supports, and the exact Horizon revision a compiled install used. Version compatibility and rollback are planned, not built.`],
];
pages["faq/"] = {
  title: "FAQ", description: "Answers about Horizon Nexus: what it is, mod loading, Fabric and Forge, .nmod, .hnmod, compiling, sandboxing and updates.",
  body: `<div class="container page-main"><p class="kicker">FAQ</p><h1 class="display page-title">Questions</h1>
<div class="faq" style="margin-top:32px">${FAQ.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}</summary><div class="answer"><p>${a}</p></div></details>`).join("")}</div></div>`,
};

pages["contributing/"] = {
  title: "Contributing", description: "How to contribute to the Horizon Nexus website, and how that differs from Horizon engine development.",
  body: `<div class="container page-main prose"><p class="kicker">Contributing</p><h1 class="display page-title">Help build it</h1>
<div class="grid two"><section class="panel"><div class="panel-head"><h2 class="panel-title" style="border:0;margin:0;padding:0">This website</h2><span class="badge">This repo</span></div>
<p>Fixes to the site's pages, design, accessibility and docs go to <a href="${REPO}">contactjayclatty/horizon-nexus-site</a>.</p>
<pre><code>git clone ${REPO}
cd horizon-nexus-site
node build.mjs     # builds dist/
node serve.mjs     # http://localhost:4321/horizon-nexus-site/
node --test tests/*.test.mjs</code></pre>
<p>Needs Node 22 or newer. No packages to install. Read <code>CONTRIBUTING.md</code> and <code>AGENTS.md</code> first.</p></section>
<section class="panel"><div class="panel-head"><h2 class="panel-title" style="border:0;margin:0;padding:0">The engine</h2><span class="badge">Not here</span></div>
<p>Nexus engine code is not in this repository. Horizon engine development happens upstream at <a href="${HORIZON}">horizon-rust/horizon</a> under its own rules. This site is not part of upstream Horizon.</p></section></div>
<h2>What we accept</h2><ul><li>Accurate content: claims must match the milestone data in <code>src/content.mjs</code>.</li><li>Original art only. No Minecraft textures or assets.</li><li>Accessible changes: keyboard, contrast and reduced motion.</li></ul>
</div>`,
};

// Docs pages
const docNav = (slug) => `<nav class="docs-nav" aria-label="Documentation"><ul>${DOCS.map((d) => `<li><a href="${u(d.slug ? `docs/${d.slug}/` : "docs/")}"${d.slug === slug ? ' aria-current="page"' : ""}>${esc(d.title)}</a></li>`).join("")}</ul></nav>`;
DOCS.forEach((d, i) => {
  const prev = DOCS[i - 1], next = DOCS[i + 1];
  const href = (x) => u(x.slug ? `docs/${x.slug}/` : "docs/");
  pages[d.slug ? `docs/${d.slug}/` : "docs/"] = {
    title: d.title, description: d.description,
    body: `<div class="container page-main docs">${docNav(d.slug)}<article class="prose"><p class="kicker">Docs</p><h1 class="title">${esc(d.title)}</h1>${d.body({ u, esc, flow, CURRENT, PLANNED })}
<div class="pager">${prev ? `<a class="button" href="${href(prev)}">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="button" href="${href(next)}">${esc(next.title)} →</a>` : ""}</div></article></div>`,
  };
});

const notFound = layout({ path: "404", title: "Missing block", description: "This page does not exist.", body: `<div class="container missing">
<p class="kicker">Error 404</p><h1 class="display">Missing block</h1>
<div class="grid404" aria-hidden="true">${"iiiiiiigiiiiiii".split("").map((c) => `<i${c === "g" ? ' class="gone"' : ""}></i>`).join("")}</div>
<p class="lede">This page was mined out, or never placed. Check the address, or head back.</p>
<div class="actions" style="justify-content:center"><a class="button primary large" href="${u()}">Back to Nexus</a><a class="button large" href="${u("docs/")}">Docs</a></div></div>` });

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
await writeFile(join(out, "media/architecture-current.svg"), diagramSvg(CURRENT, "Current: Horizon Engine to Subscribers"));
await writeFile(join(out, "media/architecture-planned.svg"), diagramSvg(PLANNED, "Planned (v0.4 proposal): .nmod to Horizon"));
for (const f of ["tokens.css", "style.css", "site.js"]) await cp(join(root, "src", f), join(out, "assets", f));
for (const [path, p] of Object.entries(pages)) {
  await mkdir(join(out, path), { recursive: true });
  await writeFile(join(out, path, "index.html"), layout({ path, ...p }));
}
await writeFile(join(out, "404.html"), notFound);
await writeFile(join(out, ".nojekyll"), "");
await writeFile(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
await writeFile(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("")}</urlset>\n`);
console.log(`built ${Object.keys(pages).length + 1} pages into ${out} with base ${BASE}`);
