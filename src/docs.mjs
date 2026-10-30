// Documentation pages, written for players first. Each page opens with a plain lead,
// a "What this means for you" box, then a clearly labelled "For developers" section
// that keeps the full technical detail. No public API reference exists, so no
// function signatures, stage names or install commands appear.
import { DEFINITION, NO_JAVA, OUT_OF_SCOPE, MILESTONES } from "./content.mjs";
const UP = `<div class="callout"><p><b>Source:</b> developer-reported, from an independent Horizon development branch. Not verified against public upstream. There is no public API reference yet, so these pages describe behaviour, not signatures.</p></div>`;
const UPTAG = `<p class="src-tag"><span class="badge user">Developer-reported</span> Not checked against public upstream. Behaviour, not signatures. Details on Start here.</p>`;
const PLAN = `<div class="callout warn"><p><b>Planned, not built.</b> v0.4b.2 is in development. v0.4c, v0.4d and a final hardening stage are planned. Details can change.</p></div>`;
const v4a = MILESTONES.find((m) => m.ver === "v0.4a");
const list = (xs) => `<ul class="ticks">${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;
export const lead = (t) => `<p class="lead-plain">${t}</p>`;
export const you = (t) => `<div class="callout you"><p class="you-title">What this means for you</p><p>${t}</p></div>`;
export const term = (w, d) => `<p class="term"><b>${w}</b> ${d}</p>`;
export const devs = (inner) => `<section class="for-devs" aria-label="For developers"><h2><span class="badge user">For developers</span> The technical detail</h2>${inner}</section>`;
export const GLOSSARY = [
  ["Mod", "A change to the game made by someone other than the game's makers. It can add things or change how things work."],
  ["Horizon", "The game engine Nexus is built for. It is a Rust remake of a Minecraft-style block game."],
  ["Rust", "The programming language Horizon and Nexus are written in. Nexus mods are written in Rust too."],
  ["Framework", "A set of building blocks that mod makers use, so they do not start from nothing."],
  ["Mod loader", "The part that finds your mods, checks them and puts them into the game."],
  ["Runtime", "The part of Nexus that is running while you play. It keeps every system going."],
  ["Compiled in", "Built into the game itself. You cannot add or remove it like a separate download."],
  ["System", "A mini machine inside the game. It does one job, and it runs again on every game tick."],
  ["Tick", "One step of the game clock. The game updates the world many times a second, one tick at a time."],
  ["Stage", "A slot in each tick. Systems in earlier stages run before systems in later ones."],
  ["Event", "A message one system leaves for others, like a note saying \"it just turned night\"."],
  ["Deterministic", "Done in the same order every time. Nexus keeps its own work in a fixed order."],
  ["Hook", "A spot in the engine where a mod is allowed to plug in and change what happens."],
  ["API", "A set of ready-made commands a mod can use to ask the game to do things."],
  [".nmod", "The file package a Nexus mod will come in. It holds the mod and a label describing it."],
  ["Manifest", "The label inside a .nmod. It says the mod's name, version and what other mods it needs."],
  ["Dependency", "Another mod that a mod needs in order to work."],
  ["Registrar", "The front desk where a mod signs in its systems. In Nexus it is called NexusRegistrar. It lets mods sign in without handing them the keys to everything."],
  ["Capability metadata", "A label on each system saying what it says it needs. Today it is only a label: Nexus does not yet enforce it."],
  ["Staging", "Getting a mod package unpacked and checked in a safe place before it is used. Planned within v0.4b.2, after the package checks."],
  ["Native code", "Real program code that runs directly on your computer, with your permissions."],
  ["Sandbox", "A locked box that stops code from touching the rest of your computer. Nexus mods do not have one."],
  ["Compile", "Turn a mod's source code into a program the computer can run. This step can itself run code."],
  ["Integrated server", "The built-in server that runs when you play single player."],
  ["Dedicated server", "A separate server program that other players connect to."],
];
const G = (w) => GLOSSARY.find(([k]) => k === w)[1];
export const DOCS = [
  { slug: "", title: "Start here", description: "Horizon Nexus in plain words: what it is, what works today and what is coming.", body: ({ u, flow }) => `
${lead("Nexus is a toolkit for changing the game Horizon. It lets people build mods, and it will later install and manage them for you.")}
${you("You cannot install Nexus or Nexus mods yet. Today it lives inside a development build of Horizon. These pages explain how it works so you know what to expect.")}
<h2>The two halves</h2>
<p>Nexus has two parts. They work together.</p>
<div class="plain-steps"><div><b>1. The framework</b><span>The building blocks mod makers use. This part already works.</span></div><div><b>2. The mod loader</b><span>Finds, checks and adds mods to the game. Only the checking part is done.</span></div></div>
<h2>Words you will see</h2>
${term("System:", G("System"))}${term("Event:", G("Event"))}${term("Tick:", G("Tick"))}
<p>Every other term is in the <a href="${u("docs/glossary/")}">glossary</a>.</p>
<h2>Where things stand</h2>
<p>Each block below is one step of the project. Filled blocks are done, the hot block is being worked on, and outlined blocks are planned.</p>
${flow([["v0.1", "Core runtime", "done"], ["v0.2", "World events and commands", "done"], ["v0.3", "Typed event bus", "done"], ["v0.4a", "Manifests and resolution", "done"], ["Audit", "Pre-v0.4b", "done"], ["v0.4b.1", "Registration", "done"], ["v0.4b.2", "building", "hot"], ["v0.4c to Final", "planned", "planned"]], "Milestones")}
<p>v0.4 is the last planned feature step. After it comes a long round of testing and fixing, then a pause. See the <a href="${u("roadmap/")}">roadmap</a>.</p>
<h2>What it is not</h2><ul><li>Not something you can install today.</li><li>${NO_JAVA}</li><li>Not an official Mojang or Microsoft product, and not an officially endorsed part of upstream Horizon.</li></ul>
${devs(`<div id="source">${UP}</div><p>${DEFINITION}</p>
<table><thead><tr><th>Part</th><th>What it is</th><th>Today</th></tr></thead><tbody>
<tr><td>Nexus Framework</td><td>The runtime, systems, events and, later, the APIs, hooks and registries mods build on.</td><td>Working core, compiled into Horizon (v0.1 to v0.3).</td></tr>
<tr><td>Nexus Mod Loader</td><td>Finds, checks, orders, builds and registers <code>.nmod</code> packages.</td><td>Package library done (v0.4a). It validates and resolves, but cannot build, install or run mods yet.</td></tr></tbody></table>
<p>The runtime is compiled into Horizon and standalone <code>.nmod</code> installation is not implemented.</p>`)}` },
  { slug: "glossary", title: "Glossary", description: "Plain-English meanings of every Nexus term.", body: () => `
${lead("This page explains the words used across the Nexus site. Each one gets a short, everyday meaning.")}
${you("If a page uses a word you do not know, look it up here. You do not need to know how to code.")}
${(() => { const key = (w) => (/^[a-z]/i.test(w) ? w[0].toUpperCase() : "#"); const sorted = [...GLOSSARY].sort(([a], [b]) => a.replace(/^\./, "").localeCompare(b.replace(/^\./, ""))); const letters = [...new Set(sorted.map(([w]) => key(w.replace(/^\./, ""))))]; return `<nav class="jump az" aria-label="Jump to a letter">${letters.map((l) => `<a href="#g-${l}">${l}</a>`).join("")}</nav>${letters.map((l) => `<section class="g-group" id="g-${l}" aria-label="${l}"><p class="g-letter" aria-hidden="true">${l}</p><dl class="glossary">${sorted.filter(([w]) => key(w.replace(/^\./, "")) === l).map(([w, d]) => `<div><dt>${w}</dt><dd>${d}</dd></div>`).join("")}</dl></section>`).join("")}`; })()}` },
  { slug: "system-lifecycle", title: "System lifecycle", description: "How a Nexus system starts, runs and stops, in plain words.", body: ({ flow }) => `
${lead("A system is a mini machine inside the game that does one job. This page shows how one is switched on, kept running and switched off.")}
${you("Mods will be made of systems. Because Nexus starts and stops them in a tidy way, a mod should not leave a mess behind when you leave a world.")}
<h2>The four steps</h2>
${flow([["Register", "Nexus learns it exists"], ["Initialize", "it gets ready"], ["Tick", "it runs every tick", "hot"], ["Shutdown", "it cleans up"]], "Lifecycle")}
<p>Think of a machine in a factory. First it is added to the list. Then it warms up. Then it runs once every tick. When you quit, it is switched off.</p>
${devs(`${UPTAG}
<p>Systems are Rust units that the runtime registers and owns (v0.1). Each one is initialised, ticked on its schedule and shut down. The runtime is only active when activation gating allows it.</p>
<p>v0.3 added session lifecycle cleanup, so ending a session tidies up systems and pending events.</p>
<div class="callout warn"><p>Hook names are not published, so none are shown.</p></div>`)}` },
  { slug: "execution-stages", title: "Execution stages", description: "Why Nexus systems run in a set order, and what that does and does not promise.", body: () => `
${lead("Every tick is split into stages, like rounds in a board game. Systems always take their turns in the same order.")}
${you("Mods run in a predictable order, so the same mods should behave the same way each time. It does not mean the whole game plays out identically every time.")}
<h2>What a fixed order does not promise</h2>
<p>Nexus keeps its own work in order. Other things can still change from run to run, such as timing, your inputs and the network.</p>
${devs(`${UPTAG}
<p>Systems run in stages, in a deterministic order (v0.1). v0.2 added more simulation stages tied to Horizon's gameplay lifecycle. Events are delivered within a stage in a fixed order (v0.3).</p>
<p>A deterministic system schedule fixes the order of Nexus's own work. It does not guarantee full-game determinism: the engine, timing, input, networking and each system's code can still vary.</p>
<div class="callout warn"><p>Real stage names are not published. The labels above are placeholders.</p></div>`)}` },
  { slug: "typed-events", title: "Typed events", description: "How Nexus systems pass messages to each other, in plain words.", body: ({ flow }) => `
${lead("An event is a message one system leaves for the others, like a note saying 'it just turned night'. Events let parts of a mod react to each other.")}
${you("Two mods can work together without being built for each other. One leaves a message, and the other can choose to act on it.")}
<h2>How a message travels</h2>
${flow([["Publisher", "a system emits a typed event", "hot"], ["Dispatcher", "same stage, fixed order"], ["Enabled systems", "each checks the event"], ["Handled", "where relevant"]], "Event dispatch")}
<p>The message is shown to each switched-on system in the same stage, one at a time, in a fixed order. Each system reads it and decides whether it cares.</p>
<p>A system does not sign up for certain kinds of message in advance. It is simply shown each one.</p>
${devs(`${UPTAG}
<p>Systems publish typed events. The v0.3 dispatcher offers each event to the <b>enabled systems of the same stage, in a deterministic order</b>. Each system checks what it is offered and handles what is relevant.</p>
<p>There is no automatic, type-based subscription registry yet. An event's type does not by itself decide who receives it.</p>
<table><thead><tr><th>Rule</th><th>Detail</th></tr></thead><tbody>
<tr><td>Same-stage, fixed order</td><td>Events go to enabled systems of the stage in a deterministic order.</td></tr>
<tr><td>Independent consumers</td><td>Publishers and consumers do not need to know each other.</td></tr>
<tr><td>Bounded batches</td><td>At most 64 events per dispatch batch.</td></tr>
<tr><td>Deferred reentrant events</td><td>Events raised while handling events are deferred, not delivered mid-dispatch.</td></tr>
<tr><td>Cleanup</td><td>Session lifecycle cleanup clears state between sessions.</td></tr>
<tr><td>Servers</td><td>Validated on integrated and dedicated servers.</td></tr></tbody></table>`)}` },
  { slug: "engine-integration", title: "Engine integration", description: "How Nexus is connected to Horizon today.", body: ({ flow }) => `
${lead("Nexus is built right into a development version of Horizon. It is part of the game, not an add-on you download.")}
${you("There is nothing to install yet. When a Horizon build includes Nexus, it is simply there.")}
${flow([["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered systems"], ["Typed event dispatcher"]], "Current runtime")}
<p class="caption">The game runs Nexus, Nexus runs the systems, and the systems pass messages.</p>
<p>Nexus already knows about things like day and night. It can ask the game to do certain things in a safe, controlled way.</p>
<p>Since v0.4b.1, mods have a front desk for signing in their systems. You still cannot install a .nmod.</p>
<h2>A note for server owners</h2>
<p>On a dedicated server, chat announcements from Nexus are written to the log and not shown in game.</p>
${devs(`${UPTAG}
<p>The Nexus runtime is compiled into Horizon. v0.2 connected it to the game: extra simulation stages, world day/night events, gameplay lifecycle integration, server-side execution and controlled engine command requests.</p>
<p>Dedicated servers do not have the integrated owner-console adapter that Nexus <code>/say</code> announcements need. Such requests are logged and dropped safely.</p>`)}` },
  { slug: "api-limitations", title: "What it cannot do yet", description: "The current limits of Nexus, in plain words.", body: ({ u }) => `
${lead("Nexus is still being built. This page lists what it cannot do today, so nobody is surprised.")}
${you("You cannot download or install Nexus mods yet. Most parts of the game cannot be changed by Nexus mods yet either.")}
<ul class="ticks"><li>There is no installer and no download.</li><li>The mod loader can check mods, but cannot add them to the game yet.</li><li>Most areas of the game have no Nexus plug-in point yet.</li><li>Mods are not locked in a safe box. Only use mods you trust.</li><li>${NO_JAVA}</li></ul>
${devs(`${UPTAG}
<ul class="ticks"><li>No public API reference, SDK or Nexus source yet.</li><li>The runtime is compiled into Horizon. There is no standalone build or installer.</li><li>v0.4a validates and resolves packages, but does not compile, install or run them.</li><li>No automatic type-based event subscription registry.</li><li>Most engine areas have no Nexus API or hook yet. See <a href="${u("docs/planned-extensibility/")}">Planned extensibility</a>.</li><li>Dedicated servers drop Nexus <code>/say</code> requests (logged), for lack of an owner-console adapter.</li><li>Native code is not sandboxed.</li></ul>`)}` },
  { slug: "planned-extensibility", title: "Planned extensibility", description: "The kinds of changes Nexus is meant to allow later.", body: ({ flow, TARGETS }) => `
${lead("This page is about the future. It shows the kinds of changes Nexus aims to let mods make.")}
${you("None of this works yet. It is the goal, and some areas may never get support.")}
${PLAN}
<h2>Three depths of change</h2>
<div class="plain-steps"><div><b>Easy</b><span>Ready-made commands for common jobs (APIs).</span></div><div><b>Deeper</b><span>Plug-in points inside the engine (hooks).</span></div><div><b>Deepest</b><span>Trusted mods that change the engine's own code.</span></div></div>
${flow([["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned", "planned"], ["Mod systems", "your code", "planned"]], "Planned framework")}
${devs(`<ul class="ticks"><li><b>High-level APIs</b> for common tasks.</li><li><b>Engine hooks</b> where an API is not enough.</li><li><b>Trusted native source-level extensions</b> where a mod has to change the engine itself.</li></ul>
<h3>Target capabilities</h3><p>Engineering targets, not current features. Not every area will necessarily get an API.</p>
<ul class="chips">${TARGETS.map((t) => `<li>${t}</li>`).join("")}</ul>`)}` },
  { slug: "security-model", title: "Safety and trust", description: "Why Nexus mods must come from people you trust.", body: () => `
${lead("Nexus mods are real programs, not just settings. They can do anything a program on your computer can do.")}
${you("Only use mods from people you trust. Nexus will ask you to approve a mod before it is built, because even building it can run code.")}
<div class="callout warn"><p><b>Mods are not locked in a safe box.</b> They run with your permissions. Approve trust before anything is compiled.</p></div>
<h2>What Nexus already checks</h2>
<p>Nexus checks that a mod package is well formed and does not clash with other mods. That stops broken mods. It does not make a bad mod safe.</p>
${devs(`${UPTAG}
<p><b>Nexus mods are trusted native code.</b> Native Rust source mods are not sandboxed and run with the player's permissions. Compiling them can execute code (build scripts, procedural macros), so trust approval must come <b>before</b> compilation.</p>
<h3>In place</h3><ul class="ticks"><li>Controlled engine command requests (v0.2).</li><li>Server/client separation (v0.1).</li><li>v0.4a: filesystem path and symlink checks during discovery, strict TOML validation, conflict detection, and explicit native-code trust assumptions.</li></ul>
<p>Validation rejects broken or conflicting packages. It does not make untrusted code safe.</p>
<h3>Completed: pre-v0.4b audit</h3><p>The audit (8f809e822, developer-reported) fixed an event-queue resource issue, added regression coverage and verified 33/33 tests.</p><h3>Completed: v0.4b.1</h3><p>NexusRegistrar exposes registration without unrestricted runtime access (9198d320e, developer-reported). Capability metadata is declarative; command-boundary enforcement is still planned.</p><h3>In development: v0.4b.2</h3><p>A secure ZIP preflight now inspects packages: structure, unsafe filenames, compression, encryption, special files, collisions, manifests and size limits (developer-reported). Next is SHA-256 archive identity (4.1b). Extraction, staging, trust approval and installation are still planned. Not finished.</p>`)}` },
  { slug: "mod-packaging", title: "Mod packages", description: "What a .nmod package is and how Nexus will handle it.", body: ({ flow }) => `
${lead("A Nexus mod will come as one package file, called a .nmod. Inside is the mod plus a label saying what it is and what it needs.")}
${you("Later, you will get mods as .nmod files and Nexus will sort out the rest. Today Nexus can read and check these files, but not install them.")}
${flow([[".nmod", "package", "done"], ["Validation", "v0.4a", "done"], ["Dependencies", "v0.4a", "done"], ["Preflight", "v0.4b.2 building", "hot"], ["Staging", "planned", "planned"], ["Native Build", "planned", "planned"], ["Registration", "seam v0.4b.1", "done"], ["Horizon", "", "done"]], "Loader pipeline")}
<p class="caption">Filled blocks work today. Outlined blocks are planned.</p>
<p>Nexus reads the label, checks it, and works out which other mods are needed. It then puts them in a sensible order. Building and adding them to the game comes later.</p>
${devs(`${UPTAG}
<h3>Done: v0.4a .nmod manifest validation, discovery and resolution</h3>${list(v4a.items)}
<p class="muted">${v4a.note}</p>
<h3>Planned</h3>
${list(MILESTONES.filter((m) => m.state === "planned").map((m) => `<b>${m.ver}:</b> ${m.name}`))}
<h3>Compatibility metadata</h3><p>Three things are kept apart: the Nexus API version a mod needs, the Horizon source/API range it supports, and the exact Horizon revision a compiled install used. v0.4a checks Nexus API compatibility.</p>
<p>Horizon's existing <code>.hnmod</code> format remains an architectural consideration.</p>`)}` },
  { slug: "installation-architecture", title: "How installing will work", description: "The planned steps for installing a Nexus mod.", body: () => `
${lead("This page shows the steps a mod will go through on its way into your game. The first two work today, and the rest are planned.")}
${you("There is no way to install a Nexus mod yet. When there is, you will approve each mod before it is built.")}
${PLAN}
<ol class="steps"><li><b>Find</b> the mod packages. <span class="badge done">Done in v0.4a</span></li><li><b>Check</b> each label and work out what is needed, in a fixed order. <span class="badge done">Done in v0.4a</span></li><li><b>You approve</b> each mod you trust. <span class="badge planned">Planned</span></li><li><b>Build</b> the mod into a program. <span class="badge planned">Planned</span></li><li><b>Add</b> its systems to Nexus. <span class="badge planned">Planned</span> <span class="micro">The sign-in desk exists (v0.4b.1).</span></li><li><b>Play</b> with it in Horizon. <span class="badge planned">Planned</span></li></ol>
${devs(`<ol><li>Discover packages, with path and symlink checks (v0.4a).</li><li>Validate and resolve manifests, versions and dependencies deterministically (v0.4a).</li><li>Approve trust for each native mod.</li><li>Compile through Horizon Launcher's pipeline. Needs a Rust toolchain.</li><li>Register generated Nexus systems.</li><li>Run in Horizon.</li></ol>
<p>v0.4b.1 added the registration seam (NexusRegistrar). v0.4b.2 covers package preflight now, then bounded extraction, snapshot validation, trust approval and installation integration. Mod profiles, versioning and rollback are part of v0.4d.</p>`)}` },
  { slug: "developer-setup", title: "Developer setup", description: "Building Horizon and working on this website.", body: () => `
${lead("This page is for people who write code. If you only want to play, you can skip it.")}
${you("Nothing here is needed to play Horizon. There are no Nexus install steps because there is nothing to install yet.")}
${devs(`${UPTAG}
<h3>Nexus</h3><p>The Nexus branch is not public, so there are no Nexus build steps. Horizon documents its build in its <a href="https://github.com/horizon-rust/horizon#readme">README</a>. Nexus and its mods need a Rust toolchain.</p>
<h3>This website</h3>
<pre><code>node build.mjs                 # dist/, base /horizon-nexus-site/
node serve.mjs                 # local preview
node --test tests/*.test.mjs   # checks</code></pre><p>Node 22 or newer. No packages to install.</p>
<p class="muted">${OUT_OF_SCOPE}</p>`)}` },
];
