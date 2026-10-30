// Documentation pages. They describe Nexus at the level the developer has shared.
// No public API reference exists yet, so no function signatures, stage names or install commands appear.
const UP = `<div class="callout"><p><b>Source:</b> the Nexus developer (user-provided), from an independent development branch. Not verified against a public upstream repository. There is no public API reference yet, so these pages describe behaviour, not signatures.</p></div>`;
const PLAN = `<div class="callout warn"><p><b>Planned, not built.</b> This describes v0.4 goals. v0.4a is in development; v0.4b to v0.4d are planned. Details can change.</p></div>`;
export const DOCS = [
  { slug: "", title: "Framework overview", description: "What Horizon Nexus is: a Rust-native modding framework and mod loader for the Horizon engine.", body: ({ u, flow }) => `${UP}
<p>Horizon Nexus is a Rust-native modding framework and mod loader for the <a href="https://github.com/horizon-rust/horizon">Horizon</a> engine. Horizon is an unofficial Rust rewrite of Minecraft: Java Edition.</p>
<p>The goal is for developers to add new gameplay, change existing behaviour, replace or override engine systems, extend rendering and world simulation, and ship their work as native <code>.nmod</code> packages.</p>
<h2>Two parts</h2>
<table><thead><tr><th>Part</th><th>What it is</th><th>Today</th></tr></thead><tbody>
<tr><td>Nexus Framework</td><td>The runtime, systems, events, and (planned) the APIs, hooks and registries mods build on.</td><td>Runtime, systems and typed events work (v0.1 to v0.3).</td></tr>
<tr><td>Nexus Loader</td><td>Finds, validates, orders, builds and registers <code>.nmod</code> packages.</td><td>v0.4a in development. Not usable yet.</td></tr></tbody></table>
<h2>Status</h2>
${flow([["v0.1", "Systems Runtime", "done"], ["v0.2", "Engine Integration", "done"], ["v0.3", "Inter-System Events", "done"], ["v0.4a", "in development", "dev"], ["v0.4b to d", "planned", "planned"]], "Milestones")}
<p>v0.4 is the last planned feature milestone. After it come stabilization and a pause. See the <a href="${u("roadmap/")}">roadmap</a>.</p>
<h2>What it is not</h2><ul><li>Not installable today. Nexus is compiled into the engine; standalone <code>.nmod</code> installation is not implemented.</li><li>Not a loader for Java mods. Nexus is a native Rust modding platform for Horizon and does not load Java Fabric or Forge mods.</li><li>Not an official or endorsed part of upstream Horizon.</li></ul>` },
  { slug: "system-lifecycle", title: "System lifecycle", description: "How the Nexus runtime starts, runs and stops systems.", body: ({ flow }) => `${UP}
${flow([["Register", "runtime knows the system"], ["Start", "brought up"], ["Run", "on its schedule", "hot"], ["Stop", "safe cleanup"]], "Lifecycle")}
<p>Systems are modular Rust units the runtime registers and owns. The runtime starts them, runs them at their scheduled points, and stops them. As of v0.3, lifecycle cleanup is safe: shutting down does not leave systems or event deliveries half-finished.</p>
<div class="callout warn"><p>The exact lifecycle hooks and their names are not published, so none are shown here.</p></div>` },
  { slug: "execution-stages", title: "Execution stages", description: "Deterministic schedules and stages in Nexus.", body: () => `${UP}
<div class="stages" aria-label="Illustration: stages run in a fixed order"><div><b>Stage 1</b><span>placeholder</span></div><div><b>Stage 2</b><span>placeholder</span></div><div><b>Stage 3</b><span>placeholder</span></div><div><b>Stage N</b><span>placeholder</span></div></div>
<p>Systems run in stages on a deterministic schedule: the same systems run in the same order each time. Events within a stage are dispatched in a deterministic order.</p>
<h2>What this does and does not guarantee</h2>
<p>A deterministic schedule fixes the order of Nexus's own work. It does not, by itself, make all gameplay deterministic: the engine, timing, input, networking and the systems' own code can still differ between runs.</p>
<div class="callout warn"><p>The real stage names and order are not published. The labels above are placeholders.</p></div>` },
  { slug: "typed-events", title: "Typed events", description: "How v0.3 typed events are produced and dispatched.", body: ({ flow }) => `${UP}
${flow([["Producer", "a system emits a typed event", "hot"], ["Dispatcher", "same stage, fixed order"], ["Enabled systems", "each inspects the event"], ["Handled", "by systems it is relevant to"]], "Event dispatch")}
<p>Systems produce typed events. In v0.3, the dispatcher offers each event to the <b>enabled systems in the same stage, in a deterministic order</b>. Each system inspects the events it is offered and handles the ones relevant to it. The event's type does not, on its own, pick which systems receive it.</p>
<h2>Dispatch rules (v0.3)</h2>
<table><thead><tr><th>Rule</th><th>Detail</th></tr></thead><tbody>
<tr><td>Same-stage, deterministic order</td><td>Events are offered to enabled systems in the stage in a fixed order.</td></tr>
<tr><td>Several handlers</td><td>More than one system can handle the same event. Validated in-game.</td></tr>
<tr><td>Bounded batches</td><td>Delivery happens in batches of at most 64 events.</td></tr>
<tr><td>Dedicated servers</td><td>Event dispatch on a dedicated server was validated.</td></tr>
<tr><td>Safe cleanup</td><td>Shutdown cleans up the lifecycle safely.</td></tr></tbody></table>` },
  { slug: "engine-integration", title: "Engine integration", description: "How Nexus connects to the Horizon engine today.", body: ({ flow }) => `${UP}
${flow([["Horizon", "the engine", "done"], ["Nexus Runtime", "compiled in", "hot"], ["Registered systems"], ["Typed event dispatcher"]], "Current runtime")}
<p>Nexus is compiled into the Horizon engine (v0.2, Engine Integration). Systems act on the engine through a controlled set of engine actions rather than arbitrary internals, and client and server work are kept separate.</p>
<h2>The dedicated-server <code>/say</code> case</h2>
<p>On a dedicated server, an owner-console <code>/say</code> action is deliberately dropped and logged. The adapter behind it needs an integrated-server owner, which a dedicated server does not have. This is intended.</p>` },
  { slug: "api-limitations", title: "Current API limitations", description: "What Nexus cannot do yet.", body: ({ u }) => `${UP}
<ul><li>No public API reference, SDK or source for Nexus yet.</li><li>Nexus is compiled into the engine. There is no standalone build or installer.</li><li>Standalone <code>.nmod</code> packages cannot be installed yet.</li><li>Most engine subsystems do not yet expose Nexus APIs. The target capabilities on the <a href="${u("docs/planned-extensibility/")}">Planned extensibility</a> page are goals, not features.</li><li>Engine actions are a controlled set; some, like dedicated-server owner-console <code>/say</code>, are refused by design.</li><li>Native code is not sandboxed.</li><li>Nexus is a native Rust modding platform for Horizon and does not load Java Fabric or Forge mods.</li></ul>` },
  { slug: "planned-extensibility", title: "Planned extensibility", description: "The framework APIs, hooks and registries planned for v0.4, and target capabilities.", body: ({ flow, TARGETS }) => `${PLAN}
${flow([["Horizon Engine", "", "done"], ["Nexus APIs / Hooks / Registries", "planned, v0.4b", "planned"], ["Mod systems", "your code", "planned"]], "Planned framework")}
<p>Nexus aims to support both ordinary high-level modding and deeper engine changes, through three layers:</p>
<ul><li><b>High-level APIs</b> for common tasks.</li><li><b>Deeper engine hooks</b> where an API is not enough.</li><li><b>Trusted native source-level modifications</b> where a mod must change the engine itself.</li></ul>
<h2>Target capabilities</h2><p>Areas the framework aims to let mods change. None of these is claimed to work today, and not every subsystem will necessarily get an API.</p>
<ul class="chips">${TARGETS.map((t) => `<li>${t}</li>`).join("")}</ul>` },
  { slug: "security-model", title: "Security model", description: "Nexus's trusted-native-code model.", body: () => `${UP}
<div class="callout warn"><p><b>Nexus mods are trusted native code.</b> They are Rust compiled into the game. They are not sandboxed and run with the player's permissions. Code can also run during Cargo compilation (build scripts, procedural macros), so a mod must be trusted <b>before</b> it is built, not after.</p></div>
<h2>Today</h2><ul><li>Systems use a controlled set of engine actions.</li><li>Client and server work are kept apart.</li></ul>
<h2>Planned (v0.4a)</h2><ul><li>Secure path checks during package discovery: no path traversal or symlink escapes.</li><li>Validation of IDs, versions, sides, stages, dependencies and conflicts before anything is compiled.</li><li>Reserved namespaces cannot be claimed by mods.</li></ul>
<p>Validation catches broken or conflicting packages. It does not make untrusted code safe.</p>` },
  { slug: "mod-packaging", title: "Mod packaging roadmap", description: "How .nmod packaging is planned across v0.4a to v0.4d.", body: ({ flow }) => `${PLAN}
${flow([[".nmod", "package", "planned"], ["Validation", "", "planned"], ["Dependencies", "", "planned"], ["Native Build", "", "planned"], ["Registration", "", "planned"], ["Horizon", "", "done"]], "Planned loader")}
<table><thead><tr><th>Step</th><th>Scope</th></tr></thead><tbody>
<tr><td>v0.4a: Package Foundation (in development)</td><td>Manifest parsing, package discovery, dependency resolution, version compatibility, validation.</td></tr>
<tr><td>v0.4b: Framework and Loader Integration (planned)</td><td>Native mod compilation, registration, engine APIs, gameplay hooks, extensibility.</td></tr>
<tr><td>v0.4c: Real Modding Workflow (planned)</td><td>Independent mods that add or alter gameplay, installed without editing engine source.</td></tr>
<tr><td>v0.4d: Framework Completion and Ecosystem Tools (planned)</td><td>SDK, docs, install management, profiles, diagnostics, rollback, example mods.</td></tr></tbody></table>
<h2>Compatibility metadata</h2><ol><li>The Nexus API version a mod needs.</li><li>The Horizon source/API compatibility it supports.</li><li>The exact Horizon revision a compiled install was built against.</li></ol>
<p>Horizon's existing <code>.hnmod</code> native source mod format remains an architectural consideration for interoperability.</p>` },
  { slug: "installation-architecture", title: "Installation architecture", description: "How installing a Nexus mod is planned to work.", body: () => `${PLAN}
<ol class="steps"><li><b>Discover</b> packages on disk, with path checks.</li><li><b>Validate</b> manifests and resolve dependencies in a deterministic order.</li><li><b>Approve trust</b> for each native mod before building.</li><li><b>Build</b> the mods with the Horizon source they target. This needs a Rust toolchain.</li><li><b>Register</b> mod systems in a deterministic order.</li><li><b>Run</b> in Horizon.</li></ol>
<h2>Toolchain</h2><p>Nexus mods are source-built Rust. Installing one will need a compiler toolchain; a source-built mod cannot be installed without it. Installation management, profiles and rollback are v0.4d goals.</p>` },
  { slug: "developer-setup", title: "Developer setup", description: "Building Horizon and working on this website.", body: () => `${UP}
<h2>Nexus</h2><p>The Nexus branch is not public, so there are no Nexus build instructions. Horizon documents its own build in its <a href="https://github.com/horizon-rust/horizon#readme">README</a>. Working on Nexus or its mods needs a Rust toolchain.</p>
<h2>This website</h2>
<pre><code>node build.mjs                 # dist/, base /horizon-nexus-site/
node serve.mjs                 # local preview
node --test tests/*.test.mjs   # checks</code></pre><p>Node 22 or newer. No packages to install.</p>` },
];
