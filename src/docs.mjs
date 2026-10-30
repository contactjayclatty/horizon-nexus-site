// Documentation pages. They describe Nexus at the level the developer has shared.
// No public API reference exists, so no function signatures, stage names or install commands appear.
import { DEFINITION, NO_JAVA, OUT_OF_SCOPE, MILESTONES } from "./content.mjs";
const UP = `<div class="callout"><p><b>Source:</b> developer-reported, from an independent Horizon development branch. Not verified against public upstream. There is no public API reference yet, so these pages describe behaviour, not signatures.</p></div>`;
const PLAN = `<div class="callout warn"><p><b>Planned, not built.</b> v0.4b, v0.4c and v0.4d are planned. Details can change.</p></div>`;
const v4a = MILESTONES.find((m) => m.ver === "v0.4a");
const list = (xs) => `<ul class="ticks">${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;
export const DOCS = [
  { slug: "", title: "Framework overview", description: "What Horizon Nexus is: a Rust-native modding framework and mod loader for Horizon.", body: ({ u, flow }) => `${UP}
<p class="lede">${DEFINITION}</p>
<h2>Two parts</h2>
<table><thead><tr><th>Part</th><th>What it is</th><th>Today</th></tr></thead><tbody>
<tr><td>Nexus Framework</td><td>The runtime, systems, events and, later, the APIs, hooks and registries mods build on.</td><td>Working core, compiled into Horizon (v0.1 to v0.3).</td></tr>
<tr><td>Nexus Mod Loader</td><td>Finds, checks, orders, builds and registers <code>.nmod</code> packages.</td><td>Package library done (v0.4a). It validates and resolves, but cannot build, install or run mods yet.</td></tr></tbody></table>
<h2>Where things stand</h2>
${flow([["v0.1", "Systems Runtime", "done"], ["v0.2", "Engine Integration", "done"], ["v0.3", "Typed Inter-System Events", "done"], ["v0.4a", "Manifests and resolution", "done"], ["Audit", "Pre-v0.4b", "done"], ["v0.4b.1", "authorized", "planned"], ["v0.4b to d", "planned", "planned"]], "Milestones")}
<p>v0.4 is the final planned feature milestone. Then stabilization, then a pause. See the <a href="${u("roadmap/")}">roadmap</a>.</p>
<h2>What it is not</h2><ul><li>Not installable today. The runtime is compiled into Horizon and standalone <code>.nmod</code> installation is not implemented.</li><li>${NO_JAVA}</li><li>Not an official Mojang or Microsoft product, and not an officially endorsed part of upstream Horizon.</li></ul>` },
  { slug: "system-lifecycle", title: "System lifecycle", description: "How Nexus registers, starts, ticks and stops systems.", body: ({ flow }) => `${UP}
${flow([["Register", "runtime knows the system"], ["Initialize", ""], ["Tick", "on its schedule", "hot"], ["Shutdown", "cleanup"]], "Lifecycle")}
<p>Systems are Rust units that the runtime registers and owns (v0.1). Each one is initialised, ticked on its schedule and shut down. The runtime is only active when activation gating allows it.</p>
<p>v0.3 added session lifecycle cleanup, so ending a session tidies up systems and pending events.</p>
<div class="callout warn"><p>Hook names are not published, so none are shown.</p></div>` },
  { slug: "execution-stages", title: "Execution stages", description: "Deterministic schedules and stages.", body: () => `${UP}
<div class="stages" aria-label="Illustration: stages run in a fixed order"><div><b>Stage 1</b><span>placeholder</span></div><div><b>Stage 2</b><span>placeholder</span></div><div><b>Stage 3</b><span>placeholder</span></div><div><b>Stage N</b><span>placeholder</span></div></div>
<p>Systems run in stages, in a deterministic order (v0.1). v0.2 added more simulation stages tied to Horizon's gameplay lifecycle. Events are delivered within a stage in a fixed order (v0.3).</p>
<h2>What this does not guarantee</h2>
<p>A deterministic system schedule fixes the order of Nexus's own work. It does not guarantee full-game determinism: the engine, timing, input, networking and each system's code can still vary.</p>
<div class="callout warn"><p>Real stage names are not published. The labels above are placeholders.</p></div>` },
  { slug: "typed-events", title: "Typed events", description: "How v0.3 typed events are published and delivered.", body: ({ flow }) => `${UP}
${flow([["Publisher", "a system emits a typed event", "hot"], ["Dispatcher", "same stage, fixed order"], ["Enabled systems", "each checks the event"], ["Handled", "where relevant"]], "Event dispatch")}
<p>Systems publish typed events. The v0.3 dispatcher offers each event to the <b>enabled systems of the same stage, in a deterministic order</b>. Each system checks what it is offered and handles what is relevant.</p>
<p>There is no automatic, type-based subscription registry yet. An event's type does not by itself decide who receives it.</p>
<h2>Rules (v0.3)</h2>
<table><thead><tr><th>Rule</th><th>Detail</th></tr></thead><tbody>
<tr><td>Same-stage, fixed order</td><td>Events go to enabled systems of the stage in a deterministic order.</td></tr>
<tr><td>Independent consumers</td><td>Publishers and consumers do not need to know each other.</td></tr>
<tr><td>Bounded batches</td><td>At most 64 events per dispatch batch.</td></tr>
<tr><td>Deferred reentrant events</td><td>Events raised while handling events are deferred, not delivered mid-dispatch.</td></tr>
<tr><td>Cleanup</td><td>Session lifecycle cleanup clears state between sessions.</td></tr>
<tr><td>Servers</td><td>Validated on integrated and dedicated servers.</td></tr></tbody></table>` },
  { slug: "engine-integration", title: "Engine integration", description: "How Nexus connects to Horizon today.", body: ({ flow }) => `${UP}
${flow([["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered systems"], ["Typed event dispatcher"]], "Current runtime")}
<p>The Nexus runtime is compiled into Horizon. v0.2 connected it to the game: extra simulation stages, world day/night events, gameplay lifecycle integration, server-side execution and controlled engine command requests.</p>
<h2>Dedicated servers and <code>/say</code></h2>
<p>Dedicated servers do not have the integrated owner-console adapter that Nexus <code>/say</code> announcements need. Such requests are logged and dropped safely.</p>` },
  { slug: "api-limitations", title: "Current API limitations", description: "What Nexus cannot do yet.", body: ({ u }) => `${UP}
<ul class="ticks"><li>No public API reference, SDK or Nexus source yet.</li><li>The runtime is compiled into Horizon. There is no standalone build or installer.</li><li>v0.4a validates and resolves packages, but does not compile, install or run them.</li><li>No automatic type-based event subscription registry.</li><li>Most engine areas have no Nexus API or hook yet. See <a href="${u("docs/planned-extensibility/")}">Planned extensibility</a>.</li><li>Dedicated servers drop Nexus <code>/say</code> requests (logged), for lack of an owner-console adapter.</li><li>Native code is not sandboxed.</li><li>${NO_JAVA}</li></ul>` },
  { slug: "planned-extensibility", title: "Planned extensibility", description: "The APIs, hooks and registries planned for v0.4, and target capabilities.", body: ({ flow, TARGETS }) => `${PLAN}
${flow([["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned", "planned"], ["Mod systems", "your code", "planned"]], "Planned framework")}
<p>Nexus aims to support both everyday modding and deep engine changes:</p>
<ul class="ticks"><li><b>High-level APIs</b> for common tasks.</li><li><b>Engine hooks</b> where an API is not enough.</li><li><b>Trusted native source-level extensions</b> where a mod has to change the engine itself.</li></ul>
<h2>Target capabilities</h2><p>Engineering targets, not current features. Not every area will necessarily get an API.</p>
<ul class="chips">${TARGETS.map((t) => `<li>${t}</li>`).join("")}</ul>` },
  { slug: "security-model", title: "Security model", description: "Nexus's trusted-native-code model.", body: () => `${UP}
<div class="callout warn"><p><b>Nexus mods are trusted native code.</b> Native Rust source mods are not sandboxed and run with the player's permissions. Compiling them can execute code (build scripts, procedural macros), so trust approval must come <b>before</b> compilation.</p></div>
<h2>In place</h2><ul class="ticks"><li>Controlled engine command requests (v0.2).</li><li>Server/client separation (v0.1).</li><li>v0.4a: filesystem path and symlink checks during discovery, strict TOML validation, conflict detection, and explicit native-code trust assumptions.</li></ul>
<p>Validation rejects broken or conflicting packages. It does not make untrusted code safe.</p>
<h2>Completed: pre-v0.4b audit</h2><p>The audit (8f809e822, developer-reported) fixed an event-queue resource issue, added regression coverage and verified 33/33 tests.</p><h2>Next: v0.4b.1</h2><p>Native system registration hooks and connecting external mod registration to the runtime. Architecture reviewed and implementation authorized; not completed.</p>` },
  { slug: "mod-packaging", title: "Mod packaging roadmap", description: ".nmod packaging from v0.4a to v0.4d.", body: ({ flow }) => `${UP}
${flow([[".nmod", "package", "done"], ["Validation", "v0.4a", "done"], ["Dependencies", "v0.4a", "done"], ["Native Build", "v0.4b/c", "planned"], ["Registration", "v0.4b", "planned"], ["Horizon", "", "done"]], "Loader pipeline")}
<h2>Done: v0.4a .nmod manifest validation, discovery and resolution</h2>${list(v4a.items)}
<p class="muted">${v4a.note}</p>
<h2>Planned</h2>
<table><thead><tr><th>Milestone</th><th>Goals</th></tr></thead><tbody>
${MILESTONES.filter((m) => m.state === "planned").map((m) => `<tr><td>${m.ver}: ${m.name}</td><td>${m.items.join("; ")}.</td></tr>`).join("")}</tbody></table>
<h2>Compatibility metadata</h2><p>Three things are kept apart: the Nexus API version a mod needs, the Horizon source/API range it supports, and the exact Horizon revision a compiled install used. v0.4a checks Nexus API compatibility.</p>
<p>Horizon's existing <code>.hnmod</code> format remains an architectural consideration.</p>` },
  { slug: "installation-architecture", title: "Installation architecture", description: "How installing a Nexus mod is planned to work.", body: () => `${PLAN}
<ol class="steps"><li><b>Discover</b> packages, with path and symlink checks. <span class="badge done">Done in v0.4a</span></li><li><b>Validate and resolve</b> manifests, versions and dependencies in a fixed order. <span class="badge done">Done in v0.4a</span></li><li><b>Approve trust</b> for each native mod. <span class="badge planned">Planned</span></li><li><b>Compile</b> through Horizon Launcher's pipeline. Needs a Rust toolchain. <span class="badge planned">Planned</span></li><li><b>Register</b> generated Nexus systems. <span class="badge planned">Planned</span></li><li><b>Run</b> in Horizon. <span class="badge planned">Planned</span></li></ol>
<p>Profiles, diagnostics, updates and rollback are v0.4d goals.</p>` },
  { slug: "developer-setup", title: "Developer setup", description: "Building Horizon and working on this website.", body: () => `${UP}
<h2>Nexus</h2><p>The Nexus branch is not public, so there are no Nexus build steps. Horizon documents its build in its <a href="https://github.com/horizon-rust/horizon#readme">README</a>. Nexus and its mods need a Rust toolchain.</p>
<h2>This website</h2>
<pre><code>node build.mjs                 # dist/, base /horizon-nexus-site/
node serve.mjs                 # local preview
node --test tests/*.test.mjs   # checks</code></pre><p>Node 22 or newer. No packages to install.</p>
<p class="muted">${OUT_OF_SCOPE}</p>` },
];
