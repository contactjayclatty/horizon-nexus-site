// Builds the static site into dist/. No dependencies: Node 22+ only.
//   BASE=/horizon-nexus-site/ node build.mjs   (the GitHub Pages project path; the default)
//   BASE=/ node build.mjs                      (serve from a domain root)
import { mkdir, writeFile, readFile, cp, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { writeArt } from "./scripts/art.mjs";
import { MILESTONES, LATEST, AUDIT, UPDATED, CURRENT_MS, HIGHLIGHT, CHECKPOINTS, REMAINING, PLAIN_PROGRESS, PROGRESS, LATEST_DEV, STATUS, AVAILABILITY, TESTS_NOTE, SECURITY_PLAIN, DEV_NOTES, SCOPE, STABILIZATION, IMPLEMENTED, TARGETS, MODULES, NOTICE, USER_PROVIDED, DEFINITION, NO_RELEASE, NO_JAVA, OUT_OF_SCOPE, REPO, HORIZON, HORIZON_SITE, HORIZON_MODS, VISION } from "./src/content.mjs";
import { icon } from "./src/icons.mjs";
import { DOCS, lead, you, devs } from "./src/docs.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE ?? "/horizon-nexus-site/").replace(/\/?$/, "/");
const SITE = (process.env.SITE_URL ?? "https://contactjayclatty.github.io/horizon-nexus-site/").replace(/\/?$/, "/");
const out = join(root, process.env.OUT ?? "dist");
export const u = (p = "") => BASE + p.replace(/^\//, "");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const NAV = [["", "Home"], ["features/", "Features"], ["roadmap/", "Roadmap"], ["development/", "Development"]];
// Not in the top nav: reached from the footer and the Development page.
const MORE = [["docs/", "Docs"], ["releases/", "Releases"], ["faq/", "FAQ"], ["search/", "Search"], ["architecture/", "Architecture"], ["downloads/", "Downloads"], ["contributing/", "Contributing"]];

const ogKey = (path) => (path || "home").replace(/\/$/, "").replace(/\//g, "-");
const ogFor = (path) => (existsSync(join(dirname(fileURLToPath(import.meta.url)), "public/og", `${ogKey(path)}.png`)) ? `og/${ogKey(path)}.png` : "og.png");
function layout({ path, title, description, body, bodyClass = "" }) {
  const isCurrent = (p) => (p === "" ? path === "" : path.startsWith(p));
  const li = ([p, l]) => `<li><a href="${u(p)}"${isCurrent(p) ? ' aria-current="page"' : ""}>${l}</a></li>`;
  const links = NAV.map(li).join("");
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
<meta property="og:image" content="${SITE}${ogFor(path)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Horizon Nexus: a blue block portal in a pixel-art night landscape, with the line Change the Game. Extend the Engine.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${ogFor(path)}">
<meta name="color-scheme" content="dark">
<link rel="preload" href="${u("fonts/PixelifySans-Bold.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u("fonts/Geist-Regular.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u("assets/tokens.css")}?v=${HASH["tokens.css"]}">
<link rel="stylesheet" href="${u("assets/style.css")}?v=${HASH["style.css"]}">
<script>document.documentElement.classList.replace("no-js","js")</script>
<script type="module" src="${u("assets/site.js")}?v=${HASH["site.js"]}"></script>
</head>
<body class="${bodyClass}" id="top">
<a class="skip" href="#main">Skip to the content</a>
<header class="nav">
  <div class="container nav-inner">
    <a class="nav-mark" href="${u()}" aria-label="Horizon Nexus home"><img src="${u("media/nexus-icon.svg")}" alt="" width="36" height="36"><span class="nav-word"><span>Nexus</span><small>Horizon modding</small></span></a>
    <nav aria-label="Main" class="nav-main"><ul class="nav-links">${links}</ul></nav>
    <div class="nav-end">
      <button class="button small menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="menu"><span data-label>Menu</span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden><nav aria-label="Main (menu)"><ul>${links}</ul><p class="micro menu-label">Also on this site</p><ul class="menu-more">${more}</ul><p class="menu-status">${icon("construction", 16)} Now building ${CURRENT_MS.ver}. <a href="${u("roadmap/")}#current">See the roadmap</a></p></nav></div>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="container">
    <img class="footer-logo" src="${u("media/nexus-logo.svg")}" alt="Horizon Nexus" width="256" height="44">
    <details class="foot-links-fold" data-fold-wide><summary>Site links</summary><div class="footer-cols">
      <div><h2>Nexus</h2><ul class="foot-links">${[...NAV.slice(1), ...MORE].map(([p, l]) => `<li><a href="${u(p)}">${l}</a></li>`).join("")}</ul></div>
      <div><h2>Source</h2><ul><li><a href="${REPO}">Website source</a></li><li><a href="${HORIZON}">Horizon upstream</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li></ul></div>
    </div></details>
    <p class="foot-status"><span class="badge dev">${icon("construction", 14)}In development</span> Now building ${CURRENT_MS.ver}. ${esc(NO_RELEASE)} <a href="#top">Back to top</a></p>
    <p class="disclaimer">${esc(NOTICE)} Minecraft is a trademark of Mojang Synergies AB. This site contains no Minecraft code, textures or assets; all artwork is original and drawn in code. Milestone details are developer-reported.</p>
        <p class="footer-word" aria-hidden="true">NEXUS</p>
  </div>
</footer>
</body>
</html>
`;
  const html2 = html.replace(/<table>([^]*?)<\/table>/g, (t, inner) => { const ths = [...inner.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]); return `<table class="stack">${inner.replace(/<tr>([^]*?)<\/tr>/g, (r, cells) => { let n = 0; return `<tr>${cells.replace(/<td>/g, () => `<td data-label="${ths[n++] ?? ""}">`)}</tr>`; })}</table>`; });
  return html2.replace(/<a ([^>]*?)href="(https?:\/\/[^"]+)"/g, (m, pre, url) => `<a ${pre}href="${url}" rel="noopener"`);
}

const BADGE = { done: ["done", "Completed"], planned: ["planned", "Planned"], progress: ["dev", "In development"], idea: ["idea", "Idea, not promised"], dev_reported: ["user", "Developer-reported"], goal: ["planned", "Goal"], now: ["done", "Works today"], none: ["", "Not available"] };
const badge = (k) => `<span class="badge ${BADGE[k][0]}">${k === "progress" ? icon("construction", 14) : ""}${BADGE[k][1]}</span>`;
const flow = (nodes, label) => `<ol class="flow" aria-label="${esc(label)}">${nodes.map(([n, s, cls = ""]) => `<li><div class="block-node ${cls}">${esc(n)}${s ? `<small>${esc(s)}</small>` : ""}</div></li>`).join("")}</ol>`;
const CURRENT = [["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered Systems", "Rust"], ["Typed Event Dispatcher", "same stage, fixed order"]];
const FRAMEWORK = [["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned", "planned"], ["Mod Systems", "your code", "planned"]];
const LOADER = [[".nmod", "manifest", "done"], ["Validation", "v0.4a", "done"], ["Dependencies", "v0.4a", "done"], ["Native Build", "planned", "planned"], ["Registration", "seam done v0.4b.1", "planned"], ["Horizon", "runs it", "done"]];
const DONE = MILESTONES.filter((m) => m.state === "done"), PLANNED = MILESTONES.filter((m) => m.state === "planned"), UPCOMING = MILESTONES.filter((m) => m.state !== "done");
const head = (kicker, title, text = "", id = "") => `<div class="section-head reveal"><p class="kicker">${kicker}</p><h2 class="title"${id ? ` id="${id}"` : ""}>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`;
const card = ({ ic, title, body, b, extra = "", cls = "" }) => `<section class="panel card reveal ${cls}"><div class="card-top">${ic ? icon(ic, 40) : ""}${b ? badge(b) : ""}</div><h3 class="panel-title">${esc(title)}</h3>${body ? `<p>${body}</p>` : ""}${extra}</section>`;
const ticks = (xs, cls = "") => `<ul class="ticks ${cls}">${xs.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const commit = (c) => `<p class="commit"><span class="micro">Commit</span> <code>${c}</code> <span class="micro">developer-reported, not an upstream link</span></p>`;
const diagram = (nodes, title, img, alt, b, cap = "") => `<section class="panel reveal diagram"><div class="panel-head"><h3 class="panel-title">${esc(title)}</h3>${badge(b)}</div>${flow(nodes, title)}<img src="${u(`media/${img}`)}" alt="${esc(alt)}" width="960" height="200" loading="lazy" class="diagram-img">${cap ? `<p class="caption">${cap}</p>` : ""}</section>`;
const DIAGRAMS = () => `${diagram(CURRENT, "Current runtime", "architecture-current.svg", "Horizon, then Nexus Runtime, then Registered Systems, then Typed Event Dispatcher", "now", "Works today. The game runs Nexus, Nexus runs the systems, and the systems pass messages.")}
${diagram(FRAMEWORK, "Planned framework", "architecture-framework.svg", "Horizon Engine, then Nexus APIs, hooks and registries, then mod systems", "planned", "Planned. Mods will plug into the game through ready-made commands and plug-in points.")}
${diagram(LOADER, "Loader pipeline", "architecture-loader.svg", ".nmod, Validation and Dependencies (done in v0.4a), then Native Build and Registration (planned), then Horizon", "goal", "Part done. Nexus can already find and check mod packages. Building them and adding them to the game is planned.")}`;
const moduleCard = (m) => card({ ic: m.icon, title: m.name, b: "idea", cls: "module", body: esc(m.body), extra: m.note ? `<p class="note">${esc(m.note)}</p>` : "" });

const HASH = Object.fromEntries(["tokens.css", "style.css", "site.js", "search.js"].map((f) => [f, createHash("sha256").update(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "src", f))).digest("hex").slice(0, 10)]));
const pages = {};

const statusCard = (extra = "") => `<section class="status-card" aria-labelledby="status-title"><div class="status-head"><span class="status-icon">${icon("construction", 20)}</span><h2 class="status-title" id="status-title">Current status</h2></div>
<dl class="status-list">${STATUS.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
<p class="status-note">${esc(AVAILABILITY)}</p>${extra}</section>`;
const CHECK_LABEL = { done: "Complete", next: "Next", planned: "Planned" };
const checklist = () => `<ol class="checklist">${CHECKPOINTS.map(([id, name, st]) => `<li class="ck-${st}"><span class="ck-mark" aria-hidden="true"></span><span class="ck-name">${id ? `<b>${id}</b> ` : ""}${esc(name)}</span><span class="ck-state">${CHECK_LABEL[st]}</span></li>`).join("")}</ol>`;

const progress = () => `<div class="progress-tl" role="group" aria-label="Development progress">${[["done", "Completed within v0.4b.2", PROGRESS.done], ["next", "In development, not complete", PROGRESS.next], ["later", "Later", PROGRESS.later]].map(([k, t, xs]) => `<section class="tl-step tl-${k}"><h4 class="tl-title"><span class="tl-dot" aria-hidden="true"></span>${t}</h4><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}</div>`;

const STATE_LABEL = (m) => m.label || (m.state === "done" ? "Complete" : m.state === "current" ? "In development" : "Planned");
const miniRoad = () => `<ol class="mini-road" aria-label="Roadmap summary">${MILESTONES.filter((m) => m.ver !== "Audit").map((m) => `<li class="mr-${m.state}"><span class="mr-ver">${m.ver === "Final" ? "Final audit" : m.ver}</span><span class="mr-state">${esc(STATE_LABEL(m))}</span><span class="mr-sum">${esc(m.summary.replace(/^(Planned|In development, not released|Final planned feature milestone)\. /, ""))}</span></li>`).join("")}</ol>`;
const latestDev = (tech = false) => `<section class="panel latest-dev"><div class="panel-head"><h3 class="panel-title"><b>${LATEST_DEV.id}</b> ${esc(LATEST_DEV.title)}</h3><span class="tags">${badge("done")}${badge("dev_reported")}</span></div>${ticks(LATEST_DEV.plain, "done")}<p class="callout warn">${esc(LATEST_DEV.caveat)}</p>${tech ? `<p class="muted">${esc(LATEST_DEV.tech)}</p>` : ""}</section>`;

pages[""] = {
  title: "Home", description: "Horizon Nexus: native Rust modding for Horizon. A source-compiled modding framework and package loader. In active development.",
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <h1 class="display hero-display" id="hero-title">Horizon Nexus</h1>
      <p class="hero-tag">Native Rust modding for Horizon.</p>
      <p class="lede">A source-compiled modding framework and package loader built to extend Horizon through native Rust APIs, events and engine integration.</p>
      <div class="actions"><a class="button primary large" href="${u("features/")}">See what it can do</a><a class="button large" href="${u("development/")}">Development status</a></div>
    </div>
    ${statusCard(`<p class="status-plain">${esc(PLAIN_PROGRESS)}</p><a class="status-link" href="${u("roadmap/")}">See the full roadmap</a>`)}
  </div>
</section>
<section class="section"><div class="container">
  ${head("What exists and what does not", "Foundations and work in progress")}
  <div class="grid two">
    ${card({ ic: "framework", title: "Nexus Framework", b: "now", cls: "pillar", body: "Existing foundations: the Rust runtime, deterministic lifecycle, typed events, allowlisted commands and native registration, compiled into Horizon.", extra: `<p class="status">Wider gameplay and engine APIs (blocks, items, entities, world generation and more) are roadmap targets, not finished.</p><a class="button" href="${u("features/")}">What works today</a>` })}
    ${card({ ic: "package", title: "Nexus Package Loader", b: "progress", cls: "pillar", body: "Done internally: package validation, private custody, safe extraction, integrity audits, provenance checks, manifests and a launcher connection.", extra: `<p class="status">In progress: choosing a .nmod in the launcher, a consent dialog, installation and loading. The launcher cannot run .nmod packages yet.</p><a class="button" href="${u("development/")}">How it is going</a>` })}
  </div>
</div></section>
<section class="section"><div class="container">
  ${head("Roadmap", "Where Nexus is heading")}
  ${miniRoad()}
  <p class="more-link"><a href="${u("roadmap/")}">Full roadmap</a></p>
</div></section>
<section class="section"><div class="container narrow-block">
  ${head("Latest development", "Launcher connected to the loader")}
  ${latestDev()}
</div></section>
<section class="section"><div class="container narrow-block">
  ${head("The package format", "What is a .nmod?")}
  <p>A .nmod is one file that holds a Nexus mod: its Rust source plus a manifest saying what it is, what it needs and what it can do. Nexus checks the file, unpacks it into a private folder and audits it. The plan is that you approve it before any native code is built. Installing and running .nmod packages is not possible yet.</p>
  <p class="more-link"><a href="${u("docs/mod-packaging/")}">How .nmod packages work</a></p>
</div></section>
<section class="section"><div class="container">
  ${head("Safety", "Checked first, trusted by you")}
  <ul class="plain-points">${SECURITY_PLAIN.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div></section>
<section class="section"><div class="container">
  ${head("Read more", "Docs and source")}
  <ul class="link-grid">${[[u("docs/"), "Docs", "How Nexus works, in plain words"], [u("development/"), "Development", "Checkpoints and test results"], [u("releases/"), "Releases", "Finished milestones"], [REPO, "Website source", "This site on GitHub"], [HORIZON, "Horizon source", "The Horizon engine (upstream)"]].map(([h, t, d]) => `<li><a href="${h}"><b>${t}</b><span>${esc(d)}</span></a></li>`).join("")}</ul>
</div></section>`,
};

pages["features/"] = {
  title: "Features", description: "What Nexus does now, and what it is meant to make possible, in plain words.",
  body: `<div class="container page-main">
<p class="kicker">Features</p><h1 class="display page-title">What Nexus does</h1>
${lead("Nexus is a toolkit for changing Horizon. This page shows what works today, what is planned, and what is only an idea.")}
${you("You cannot install Nexus or its mods yet. The \"Works today\" list is what exists inside development builds of Horizon.")}
<nav class="jump" aria-label="On this page"><a class="button small" href="#now">Works today</a><a class="button small" href="#targets">Planned</a><a class="button small" href="#future">Ideas</a></nav>
<section class="section band now" aria-labelledby="now">${head("Implemented · developer-reported", "What Nexus does now", "", "now")}
${lead("These are the building blocks that already work. Each card says it in plain words first.")}
<p class="muted">A <b>system</b> is a mini machine that runs every game tick. An <b>event</b> is a message one system leaves for another. More words are in the <a href="${u("docs/glossary/")}">glossary</a>.</p>
<div class="grid four">${IMPLEMENTED.map((f) => card({ ic: f.icon, title: f.name, b: "now", body: esc(f.plain), extra: `<details class="dev-detail"><summary>For developers</summary><p>${esc(f.body)} <span class="micro">${f.ms}</span></p></details>` })).join("")}</div></section>
<section class="section band" aria-labelledby="targets">${head("Intended scope", "What Nexus is meant to make possible", "", "targets")}
${lead("Nexus is meant for engine-level Rust modding, well beyond events. These areas are planned and their APIs do not exist yet.")}
${you("The foundations above work today. The areas below are the goal for later v0.4 steps, not a finished catalogue.")}
<ul class="target-list reveal">${SCOPE.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
<p class="muted">${esc(NO_JAVA)}</p></section>
<section class="section band" aria-labelledby="future">${head("Ideas", "Future possibilities", "", "future")}
${lead("These are example mod packs the toolkit could one day allow. They are not built and not promised for v0.4.")}
<div class="grid four">${MODULES.map(moduleCard).join("")}</div></section>
<section class="section vision" aria-labelledby="vision"><div class="section-head"><p class="kicker">Maybe someday</p><h2 class="title" id="vision">Imagine Nexus as a universal foundation</h2></div>
<p class="vision-note"><b>This is an idea, not a plan.</b> It is not on the roadmap and has no dates or versions. Nexus today is built for Horizon only, and none of the uses below exist.</p>
<div class="vision-core">${icon("framework", 32)}<h3 class="panel-title">Nexus Core</h3><p>Reusable Rust infrastructure</p><p class="vision-parts">Packages, security checks, dependencies, events and extensions</p></div>
<p class="vision-arrow" aria-hidden="true">&darr;</p>
<ul class="vision-grid">${VISION.map(([ic, t, d]) => `<li>${icon(ic, 28)}<h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ul></section>
</div>`,
};

pages["roadmap/"] = {
  title: "Roadmap", description: "Nexus roadmap: completed milestones, v0.4b.2 in development with its checkpoint list, and planned v0.4 work.",
  body: `<div class="container page-main">
<p class="kicker">Roadmap</p><h1 class="display page-title">Built block by block</h1>
${lead("What is finished, what is being built now, and what comes next.")}
${you("Nothing here can be installed yet. v0.4 is the last planned feature stage. No v0.5 or v1.0 features are planned, and there are no dates.")}
<ol class="road" aria-label="Roadmap at a glance">${MILESTONES.map((m) => `<li class="${m.state}"><span class="road-block" aria-hidden="true"></span><b>${m.ver}</b><span>${m.label || (m.state === "done" ? "Done" : m.state === "current" ? "Building" : "Planned")}</span></li>`).join("").replace('<li class="current"><span class="road-block" aria-hidden="true"></span>', `<li class="current"><span class="road-icon">${icon("construction", 18)}</span>`)}</ol>
<nav class="jump" aria-label="On this page"><a href="#current">In development</a><a href="#completed">Completed</a><a href="#planned">Planned</a></nav>

<section class="section" aria-labelledby="current">${head("01", "In development", "", "current")}
<section class="panel current-panel"><div class="panel-head"><h3 class="panel-title">${CURRENT_MS.ver}: ${esc(CURRENT_MS.name)}</h3><span class="tags">${badge("progress")}${badge("dev_reported")}</span></div><p>${esc(CURRENT_MS.summary)}</p>
${progress()}<h4 class="h-small">Checkpoints</h4>${checklist()}
<p class="next-ck">${esc(REMAINING)}</p>
<p class="muted">Latest reported validation: ${esc(CURRENT_MS.validation[0])}. Reported by the development agent.</p>
<div class="callout warn"><p>${esc(CURRENT_MS.note)}</p></div>
<a class="button" href="${u("development/")}">Full development notes</a></section></section>

<section class="section" aria-labelledby="completed">${head("02", "Completed", "These steps are done. The developer reported them from their own copy of Horizon.", "completed")}
<div class="grid two">${[...DONE].reverse().map((m) => card({ ic: m.icon, title: `${m.ver}: ${m.name}`, b: "done", body: esc(m.summary), extra: `<details class="more-items"><summary>What it added (${m.items.length})</summary>${ticks(m.items, "done")}</details>${commit(m.commit)}` })).join("")}</div>
<p class="more-link"><a href="${u("releases/")}">Validation results are on the Releases page</a></p></section>

<section class="section" aria-labelledby="planned">${head("03", "Planned", "These come after. None of this exists yet.", "planned")}
<div class="grid three">${PLANNED.map((m) => card({ ic: m.icon, title: m.ver === "Final" ? m.name : `${m.ver}: ${m.name}`, b: "planned", cls: "planned-card", body: esc(m.summary) })).join("")}</div>
<p class="muted">After final v0.4 hardening, feature development is planned to pause pending further direction.</p></section>
<p class="next-steps"><b>Next:</b> <a href="${u("development/")}">Development notes</a> · <a href="${u("releases/")}">Releases</a></p>
</div>`,
};

pages["development/"] = {
  title: "Development", description: "Where Horizon Nexus development stands: the v0.4b.2 checkpoints, internal progress, limits, security and technical notes.",
  body: `<div class="container page-main narrow">
<p class="kicker">Development</p><h1 class="display page-title">Development status</h1>
${lead("A plain look at what is being built right now, what is done inside it, and what is not ready.")}
${statusCard(`<p class="status-plain">${esc(PLAIN_PROGRESS)}</p>`)}
<section class="section" aria-labelledby="dev-current">${head("Now", `${CURRENT_MS.ver}: ${CURRENT_MS.name}`, "", "dev-current")}
<p>${esc(CURRENT_MS.summary)}</p>
${progress()}<h3 class="h-small">Checkpoints</h3>${checklist()}
<p class="next-ck">${esc(REMAINING)}</p></section>
<section class="section" aria-labelledby="dev-latest">${head("Latest", "Latest development", "", "dev-latest")}${latestDev(true)}</section>
<section class="section" aria-labelledby="dev-limits">${head("Be clear", "What does not work yet", "", "dev-limits")}
<ul class="plain-points">${["v0.4b.2 is not finished.", "Mod packages can be checked, unpacked into a private folder and audited, but they cannot be installed or run yet.", "The launcher is connected to the loader, but it cannot run .nmod packages. Its consent adapter always answers Unavailable.", "There is no consent dialog, saved trust, full installation, native compilation or runtime loading yet.", "There is no public Nexus binary, installer or .nmod download."].map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
<section class="section" aria-labelledby="dev-safety">${head("Safety", "How trust works", "", "dev-safety")}
<ul class="plain-points">${SECURITY_PLAIN.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
${devs(`<h3>Internal progress in v0.4b.2</h3>${ticks(CURRENT_MS.items, "done")}<h3>Latest reported validation</h3>${ticks(CURRENT_MS.validation)}<p class="muted">${esc(TESTS_NOTE)}</p><h3>Notes</h3>${ticks(DEV_NOTES)}`)}
<section class="section" aria-labelledby="dev-more">${head("More", "Everything else on this site", "", "dev-more")}
<ul class="link-grid">${[["docs/", "Docs", "How Nexus works, in plain words"], ["releases/", "Releases", "Finished milestones and test results"], ["faq/", "FAQ", "Short answers"], ["search/", "Search", "Find a word"], ["architecture/", "Architecture", "How the parts fit"], ["downloads/", "Downloads", "Download status"], ["contributing/", "Contributing", "Help with the site"]].map(([p, t, d]) => `<li><a href="${u(p)}"><b>${t}</b><span>${d}</span></a></li>`).join("")}</ul></section>
</div>`,
};

pages["releases/"] = {
  title: "Releases", description: "Completed Nexus development milestones, and public release availability.",
  body: `<div class="container page-main narrow">
<p class="kicker">Releases</p><h1 class="display page-title">Releases</h1>
${lead("This page lists every finished step of Nexus. None of them are downloads you can install.")}
${you("There is nothing to download yet. The cards below are steps the developer committed on their own computer, not files you can get.")}
<section class="panel window reveal" aria-labelledby="public"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title" id="public">Publicly downloadable releases</h2>${badge("none")}</div>
<p class="big-note">${NO_RELEASE}</p><p class="muted">There are no Nexus installers, packages, tags or GitHub Releases. See <a href="${u("downloads/")}">Downloads</a> for status.</p></section>
<section class="section" aria-labelledby="history"><div class="callout you"><p class="you-title">Latest completed</p><p><b>${esc(HIGHLIGHT.title)}.</b> ${esc(HIGHLIGHT.body)}</p></div>
${head("Local development history", "Locally committed development milestones", `${esc(USER_PROVIDED)} They are development milestones, not published releases. Most recent first.`, "history")}
<nav class="jump" aria-label="Jump to a milestone">${[...DONE].reverse().map((m) => `<a href="#${m.ver.replace(".", "")}">${m.ver}</a>`).join("")}</nav>
<div class="stack">${[...DONE].reverse().map((m, idx) => `<article class="panel release reveal" id="${m.ver.replace(".", "")}"><div class="panel-head"><h3 class="panel-title">${m.ver}: ${esc(m.name)}</h3><span class="tags">${badge("done")}${badge("dev_reported")}</span></div>
<p>${esc(m.summary)}</p>${m.title ? `<p class="micro">Commit title: <code>${esc(m.title)}</code>${m.date ? `, ${m.date}` : ""}</p>` : ""}${commit(m.commit)}
<details class="more-items"${idx === 0 ? " open" : ""}><summary>Changes and reported validation</summary><div class="release-cols"><div><h4 class="h-small">Changes</h4>${ticks(m.items, "done")}</div>${m.validation ? `<div><h4 class="h-small">Reported validation</h4>${ticks(m.validation)}</div>` : ""}</div></details>
${m.note ? `<div class="callout warn"><p>${esc(m.note)}</p></div>` : ""}</article>`).join("")}</div></section>
<p class="next-steps"><b>Next:</b> <a href="${u("roadmap/")}">See what is next</a> · <a href="${u("downloads/")}">Download status</a></p>
</div>`,
};

pages["architecture/"] = {
  title: "Architecture", description: "How the parts of Nexus fit together, explained simply.",
  body: `<div class="container page-main">
<p class="kicker">Architecture</p><h1 class="display page-title">How Nexus fits together</h1>
${lead("This page shows how the parts of Nexus connect, like a map of a machine. Each picture has a plain caption.")}
${you("Nexus sits inside the game and runs mods for it. Today it runs built-in systems only. Adding your own mods comes later.")}
<div class="plain-steps section"><div><b>1. The game</b><span>Horizon runs the world.</span></div><div><b>2. Nexus</b><span>Built into the game. It runs the systems.</span></div><div><b>3. Systems</b><span>Mini machines that each do one job, every tick.</span></div><div><b>4. Messages</b><span>Systems leave events for each other.</span></div></div>
<div class="stack section">${DIAGRAMS()}</div>
<section class="section"><div class="panel reveal"><div class="panel-head"><h2 class="panel-title">Trust comes first</h2>${icon("shield", 32)}</div>
<p>Nexus mods are real programs. They are not locked in a safe box. You must approve a mod before it is built, because building it can run code. Checks catch broken mods, not bad ones.</p></div></section>
${devs(`<div class="grid two">
<section class="panel reveal"><div class="panel-head"><h3 class="panel-title">Today</h3>${badge("now")}</div>${ticks(["The Nexus runtime is compiled into Horizon.", "Registered systems run on a deterministic schedule. This orders Nexus's own work; it does not make the whole game deterministic.", "Typed events are offered to enabled systems of the same stage, in a fixed order. There is no automatic type-based subscription.", "v0.4a validates and resolves .nmod packages. It does not compile or run them.", "v0.4b.1 adds NexusRegistrar, a registration interface with declarative capability metadata. Command-boundary enforcement and .nmod installation are planned."])}</section>
<section class="panel reveal"><div class="panel-head"><h3 class="panel-title">Two depths of modding</h3>${badge("goal")}</div><div class="layers"><div class="layer"><b>High-level APIs</b><span>everyday mods</span></div><div class="layer"><b>Engine hooks</b><span>deeper behaviour changes</span></div><div class="layer deep"><b>Trusted native source changes</b><span>when a mod must change the engine itself</span></div></div></section>
</div>
<p>Nexus mods are native Rust. They are not sandboxed, and compiling them can run code. Trust must be approved before compilation. Package validation catches broken or conflicting mods; it does not make untrusted code safe.</p>`)}
</div>`,
};

pages["downloads/"] = {
  title: "Downloads", description: "Nexus has no public standalone release yet.",
  body: `<div class="container page-main">
<p class="kicker">Downloads</p><h1 class="display page-title">Nothing to download yet</h1>
${lead(`${NO_RELEASE} There is no installer and no file to download.`)}
${you("You cannot try Nexus yet. It only exists inside the developer's own build of Horizon, which is not published here.")}
<div class="grid two section">
<section class="panel window reveal"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><h2 class="panel-title">Nexus</h2>${badge("none")}</div>
<p class="big-note">${NO_RELEASE}</p><p>${esc(AVAILABILITY)}</p><p class="muted">Latest completed milestone: ${LATEST.ver}. It is a development step, not a download.</p>
<ol class="rows"><li><span class="idx">01</span><span><span class="name">Installer</span><span class="detail">Does not exist yet</span></span><span class="badge">None</span></li><li><span class="idx">02</span><span><span class="name">.nmod installation</span><span class="detail">Package checks done (v0.4a). Safe extraction and integrity audits done within v0.4b.2 (developer-reported). Install not available yet.</span></span>${badge("planned")}</li><li><span class="idx">03</span><span><span class="name">Profiles and rollback</span><span class="detail">Planned (v0.4d)</span></span>${badge("planned")}</li></ol></section>
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">Horizon itself</h2><span class="badge">Upstream</span></div>
<p>These belong to the upstream Horizon project. Nexus is not part of them.</p>
<ul class="links"><li><a href="${HORIZON}">Horizon source</a></li><li><a href="${HORIZON}/releases">Horizon releases</a></li><li><a href="${HORIZON_SITE}">playhorizon.dev</a></li></ul></section>
</div><p class="next-steps"><b>Next:</b> <a href="${u("roadmap/")}">See what is next</a> · <a href="${u("faq/")}">Read the FAQ</a></p></div>`,
};

const FAQ = [
  ["What is Nexus?", `A toolkit for changing the game Horizon. It has two parts: a framework mod makers build with, and a mod loader that will install mods for you.`, DEFINITION],
  ["Can I install it?", `Not yet. ${NO_RELEASE}`, "The runtime is compiled into Horizon, and standalone <code>.nmod</code> installation is not implemented."],
  ["What works today?", `The core: systems (mini machines that run every tick), their order, and messages between them. Nexus can also read and check mod packages, but not install them.`, "v0.1 to v0.3: systems, scheduling, lifecycle, engine integration and typed events. v0.4a validates and resolves <code>.nmod</code> manifests; it does not build, install or run mods."],
  ["What is being built now?", `${CURRENT_MS.ver}: safe .nmod package loading. Archives are now checked, copied privately, safely extracted, audited and recorded in integrity manifests. The launcher is now connected to the loader (4.4c-b1), but it cannot install or run .nmod packages yet. Next is the end-to-end launcher flow: choosing a package, a consent dialog, installation and loading. It is not finished.`, "See the Development page for the checkpoint list."],
  ["What finished most recently?", `v0.4b.1: native Rust registration interfaces and mod capability metadata.`, "v0.4b.1 added NexusRegistrar and versioned capability metadata. Capability metadata is declarative; command-boundary enforcement is planned. External .nmod installation is not available yet."],
  ["How much of the game can mods change?", `The goal is a lot: blocks, items, creatures, worlds, rules, sound, controls and more. None of that works yet.`, "Blocks, items, entities, world generation, rules, physics, rendering, HUD, audio, input, networking and saved data are engineering targets, not current features."],
  ["Can mods change the engine itself?", `That is the plan, for mods you trust.`, "Beyond APIs and hooks, Nexus aims to support trusted native source-level extensions."],
  ["Are mods safe?", `Only as safe as the person who made them. Nexus mods are real programs and are not locked in a safe box. You will approve each mod before it is built.`, "Native Rust source mods are not sandboxed, and compiling them can run code. Trust must be approved before compilation."],
  ["Do I need special tools?", `To build Nexus mods, yes. You will need the free Rust programming tools.`, "Nexus mods are source-built Rust and need a Rust toolchain."],
  ["Does Nexus load Fabric or Forge mods?", `No. ${NO_JAVA}`, OUT_OF_SCOPE],
  ["What about .hnmod?", `That is Horizon's own mod format. Whether Nexus will work with it is still being thought about.`, `<code>.hnmod</code> is upstream Horizon's native source mod format (see <a href="${HORIZON_MODS}">horizon-mods</a>). Interoperability remains an architectural consideration.`],
  ["Is v0.4 the last version?", `It is the last planned feature step. After it comes testing and fixing, then a pause. No v0.5 or v1.0 features are planned.`, ""],
  ["Is Nexus official?", `No. It is an independent project, not an official Mojang or Microsoft product, and not an officially endorsed part of upstream Horizon.`, ""],
];
pages["faq/"] = {
  title: "FAQ", description: "Short answers about Horizon Nexus.",
  body: `<div class="container page-main narrow"><p class="kicker">FAQ</p><h1 class="display page-title">Questions</h1>
${lead("Short, plain answers to the questions people ask most. Tap \"For developers\" under an answer for the technical version.")}
<div class="faq-list section">${FAQ.map(([q, a, d]) => `<section class="panel reveal"><h2 class="panel-title">${esc(q)}</h2><p>${a}</p>${d ? `<details class="dev-detail"><summary>For developers</summary><p>${d}</p></details>` : ""}</section>`).join("")}</div>
<p class="next-steps"><b>Next:</b> <a href="${u("docs/glossary/")}">Look up a word</a> · <a href="${u("roadmap/")}">See the roadmap</a></p></div>`,
};

pages["contributing/"] = {
  title: "Contributing", description: "How to contribute to the Horizon Nexus website.",
  body: `<div class="container page-main"><p class="kicker">Contributing</p><h1 class="display page-title">Help with the site</h1>
${lead("This page explains how to help improve this website. You can report a mistake without writing any code.")}
${you(`Spotted something wrong or confusing? Open an issue on <a href="${REPO}/issues">the website repository</a> and describe it in plain words.`)}
<div class="grid two section">
<section class="panel reveal"><div class="panel-head"><h2 class="panel-title">This website</h2><span class="badge">This repo</span></div>
<p>Fixes to pages, design, accessibility and docs go to <a href="${REPO}">contactjayclatty/horizon-nexus-site</a>.</p>
<h3 class="h-small">For developers</h3>
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

const docNav = (slug) => `<nav class="docs-nav" aria-label="Documentation"><details class="docs-toc" data-docs-toc><summary><span class="micro">All docs (${DOCS.length})</span><b>${esc(DOCS.find((d) => d.slug === slug)?.title ?? "")}</b></summary><ul>${DOCS.map((d) => `<li><a href="${u(d.slug ? `docs/${d.slug}/` : "docs/")}"${d.slug === slug ? ' aria-current="page"' : ""}>${esc(d.title)}</a></li>`).join("")}</ul></details><a class="docs-search" href="${u("search/")}">Search the docs</a></nav>`;
pages["search/"] = {
  title: "Search", description: "Search the Horizon Nexus site: docs, glossary, roadmap, releases and FAQ.",
  body: `<div class="container page-main narrow">
<p class="kicker">Search</p><h1 class="display page-title">Find it fast</h1>
${lead("Type a word, like event, .nmod or install. Results come from this site only.")}
<div class="search-box"><label for="q" class="micro">Search the site</label><input id="q" type="search" autocomplete="off" spellcheck="false" placeholder="Try: typed events" data-search-input data-index="${u("search.json")}"></div>
<p class="muted" data-search-status aria-live="polite"><noscript>Search needs JavaScript. You can browse the <a href="${u("docs/")}">docs</a> instead.</noscript></p>
<ol class="search-results" data-search-results></ol>
<script type="module" src="${u("assets/search.js")}?v=${HASH["search.js"]}"></script>
</div>`,
};
const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
DOCS.forEach((d, i) => {
  const prev = DOCS[i - 1], next = DOCS[i + 1];
  const href = (x) => u(x.slug ? `docs/${x.slug}/` : "docs/");
  const toc = [];
  const body = d.body({ u, esc, flow, CURRENT, TARGETS }).replace(/<h2>([^]*?)<\/h2>/g, (m, t) => { if (t.includes("badge")) return m; const id = slugify(t); toc.push([id, t.replace(/<[^>]+>/g, "")]); return `<h2 id="${id}">${t}</h2>`; })
    .replace(/<section class="for-devs" aria-label="For developers"><h2>/, () => { toc.push(["for-developers", "For developers"]); return '<section class="for-devs" aria-label="For developers" id="for-developers"><h2>'; });
  const onPage = toc.length > 1 ? `<nav class="on-page" aria-label="On this page"><p class="micro">On this page</p><ul>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul></nav>` : "";
  pages[d.slug ? `docs/${d.slug}/` : "docs/"] = {
    title: d.title, description: d.description,
    body: `<div class="container page-main docs${onPage ? " has-toc" : ""}">${docNav(d.slug)}<article class="prose"><p class="kicker">Docs · ${i + 1} of ${DOCS.length}</p><h1 class="title">${esc(d.title)}</h1>${body}
<nav class="pager" aria-label="Previous and next">${prev ? `<a class="button pager-prev" href="${href(prev)}"><small>Previous</small><span><span aria-hidden="true">◀</span> ${esc(prev.title)}</span></a>` : "<span></span>"}${next ? `<a class="button pager-next" href="${href(next)}"><small>Next</small><span>${esc(next.title)} <span aria-hidden="true">▶</span></span></a>` : "<span></span>"}</nav></article>${onPage}</div>`,
  };
});

const notFound = layout({ path: "404", title: "Missing block", description: "This page does not exist.", body: `<div class="container missing">
<p class="kicker">Error 404</p><h1 class="display">Missing block</h1>
<div class="grid404" aria-hidden="true">${"iiiiiiigiiiiiii".split("").map((c) => `<i${c === "g" ? ' class="gone"' : ""}></i>`).join("")}</div>
<p class="lead-plain">This page was mined out, or never placed. Try one of these instead.</p>
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
await writeFile(join(out, "media/architecture-framework.svg"), diagramSvg(FRAMEWORK, "Planned framework (v0.4b to d)"));
await writeFile(join(out, "media/architecture-loader.svg"), diagramSvg(LOADER, "Loader pipeline (v0.4a done, rest planned)"));
// Small build-time minify for CSS (comments and extra whitespace only).
for (const f of ["tokens.css", "style.css"]) await writeFile(join(out, "assets", f), readFileSync(join(root, "src", f), "utf8").replace(/\/\*[^]*?\*\//g, "").replace(/\s*\n\s*/g, "\n").replace(/\n+/g, "\n").trim() + "\n");
for (const f of ["site.js", "search.js"]) await cp(join(root, "src", f), join(out, "assets", f));
for (const [path, p] of Object.entries(pages)) {
  await mkdir(join(out, path), { recursive: true });
  await writeFile(join(out, path, "index.html"), layout({ path, ...p }));
}
await writeFile(join(out, "404.html"), notFound);
// Search index: plain text of each page's main content, built here, searched in the browser.
const text = (h) => h.replace(/<script[^]*?<\/script>/g, " ").replace(/<nav[^]*?<\/nav>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
const index = Object.entries(pages).filter(([p]) => p !== "search/").map(([p, pg]) => ({ t: pg.title, u: u(p), d: pg.description, x: text(pg.body).slice(0, 6000) }));
await writeFile(join(out, "search.json"), JSON.stringify(index));
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
