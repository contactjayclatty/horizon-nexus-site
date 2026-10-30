// Documentation pages. These describe Nexus at the level the developer has published.
// No public API reference exists yet, so no function signatures or install commands are given.
const UP = `<div class="callout"><p>Source of these facts: the Nexus developer (user-provided), from an independent development branch. Not verified against a public upstream repository. There is no public API reference yet, so this page describes behaviour, not function signatures.</p></div>`;
export const DOCS = [
  { slug: "", title: "Introduction", description: "Introduction to Horizon Nexus.", body: ({ u }) => `${UP}
<p>Horizon Nexus is a modular systems runtime for the <a href="https://github.com/horizon-rust/horizon">Horizon</a> engine, Horizon being an unofficial Rust rewrite of Minecraft: Java Edition. Nexus organises engine-side behaviour into Rust systems that run on deterministic schedules and communicate through typed events.</p>
<h2>Status</h2><table><thead><tr><th>Milestone</th><th>State</th></tr></thead><tbody><tr><td>v0.1 Systems Runtime</td><td>Completed (0fcc557b1)</td></tr><tr><td>v0.2 Engine Integration</td><td>Completed (52aedd384)</td></tr><tr><td>v0.3 Inter-System Events</td><td>Completed (2a01521ee)</td></tr><tr><td>v0.4 Standalone Nexus Loader</td><td>Proposed / in development</td></tr></tbody></table>
<h2>What it is not</h2><ul><li>Not a standalone mod loader yet. <code>.nmod</code> installation is not implemented.</li><li>Not a Fabric or Forge loader. Java mods are not executable through Nexus.</li><li>Not an official or endorsed part of upstream Horizon.</li></ul>
<p>Start with <a href="${u("docs/architecture/")}">Architecture</a>.</p>` },
  { slug: "architecture", title: "Architecture", description: "How Nexus sits inside Horizon.", body: ({ u, flow, CURRENT }) => `${UP}
${flow(CURRENT, "Current architecture")}
<p>The Horizon engine hosts the Nexus runtime, which is compiled into the engine. The runtime owns a set of systems, runs them on deterministic schedules, and routes typed events from producers to subscribers.</p>
<h2>Layers</h2><table><thead><tr><th>Layer</th><th>Role</th></tr></thead><tbody><tr><td>Horizon Engine</td><td>The host game. Exposes a controlled set of engine actions to Nexus.</td></tr><tr><td>Nexus Runtime</td><td>Schedules systems, manages lifecycle, dispatches events.</td></tr><tr><td>Systems</td><td>Modular Rust units of behaviour, each on a declared side.</td></tr><tr><td>Typed Events</td><td>Messages of a known type, delivered in bounded batches.</td></tr><tr><td>Subscribers</td><td>Independent receivers of an event type.</td></tr></tbody></table>
<p>For the planned loader, see <a href="${u("docs/mod-loading/")}">Future mod-loading architecture</a>.</p>` },
  { slug: "runtime-lifecycle", title: "Runtime lifecycle", description: "How Nexus starts, runs and stops systems.", body: ({ flow }) => `${UP}
${flow([["Start", "runtime brings systems up"], ["Run", "scheduled each tick", "hot"], ["Stop", "safe cleanup"]], "Lifecycle")}
<p>The runtime starts systems, runs them at their scheduled points, and stops them. As of v0.3, lifecycle cleanup is safe: shutting down does not leave systems or event deliveries half-finished.</p>
<div class="callout warn"><p>The exact lifecycle hooks and their names are not published. This page will document them when the Nexus source is public.</p></div>` },
  { slug: "nexus-system", title: "NexusSystem overview", description: "What a Nexus system is.", body: () => `${UP}
<p>A Nexus system is a modular unit of Rust behaviour that the runtime owns. Conceptually, each system:</p>
<ul><li>has a lifecycle managed by the runtime;</li><li>runs at a defined point in a deterministic schedule (an execution stage);</li><li>is declared for a side, so client and server systems stay isolated;</li><li>acts on the engine only through controlled engine actions;</li><li>may produce typed events and subscribe to event types.</li></ul>
<div class="callout warn"><p>"NexusSystem" names the concept here. Its Rust trait, methods and registration API are not published, so none are shown. Do not write code against this page.</p></div>` },
  { slug: "execution-stages", title: "Execution stages", description: "Deterministic schedules and stages.", body: () => `${UP}
<div class="stages" aria-label="Illustration of stages in a fixed order"><div><b>Stage 1</b><span>illustrative</span></div><div><b>Stage 2</b><span>illustrative</span></div><div><b>Stage 3</b><span>illustrative</span></div><div><b>Stage N</b><span>illustrative</span></div></div>
<p>Nexus runs systems in stages on a deterministic schedule: the same set of systems runs in the same order every time. Events dispatched within the same stage are dispatched in a deterministic order.</p>
<p>The v0.4 proposal adds validation of stage and side combinations in mod manifests, rejecting invalid pairs before compilation.</p>
<div class="callout warn"><p>The real stage names and their order are not published. The labels above are placeholders.</p></div>` },
  { slug: "typed-events", title: "Typed events", description: "Typed events between systems.", body: ({ flow }) => `${UP}
${flow([["Producer", "a system", "hot"], ["Event of type T"], ["Subscriber 1"], ["Subscriber 2"]], "Typed event delivery")}
<p>Systems communicate through typed events. A producer emits an event of a known type, and every subscriber to that type receives it. Subscribers are independent: they do not know about each other, and adding one does not change what another receives.</p>
<p>Validated in v0.3 (user-provided): typed event production, and delivery to multiple subscribers, in-game.</p>` },
  { slug: "event-dispatch", title: "Event dispatch rules", description: "How Nexus delivers events.", body: () => `${UP}
<table><thead><tr><th>Rule</th><th>Detail</th></tr></thead><tbody>
<tr><td>Deterministic same-stage dispatch</td><td>Events within one stage dispatch in a deterministic order.</td></tr>
<tr><td>Bounded batches</td><td>Events are delivered in batches of at most 64.</td></tr>
<tr><td>Dedicated dispatch</td><td>Event dispatch on a dedicated server has been validated.</td></tr>
<tr><td>Multiple subscribers</td><td>Each subscriber to a type receives the event.</td></tr>
<tr><td>Safe cleanup</td><td>Shutdown cleans up the lifecycle safely.</td></tr>
</tbody></table>
<h2>The dedicated-server <code>/say</code> case</h2>
<p>On a dedicated server, an owner-console <code>/say</code> action is deliberately dropped and logged. The adapter behind it requires an integrated-server owner, which a dedicated server does not have. This is intended behaviour, not a bug.</p>` },
  { slug: "security", title: "Security boundaries", description: "What Nexus does and does not protect.", body: () => `${UP}
<ul><li><b>Controlled engine actions.</b> Systems act on the engine through a controlled set of actions, not arbitrary internals. Some actions are refused in some contexts (see the <code>/say</code> case).</li><li><b>Client/server isolation.</b> Systems declared for one side do not run on the other.</li><li><b>No sandbox for native code.</b> Nexus systems are native Rust compiled into the engine. They are not sandboxed and run with the player's permissions.</li></ul>
<h2>For the planned loader</h2>
<div class="callout warn"><p>Native <code>.nmod</code> code will be unsandboxed and may execute during Cargo compilation, for example in build scripts or procedural macros. Trust approval must happen before compilation, not after.</p></div>
<p>The v0.4 proposal also requires secure path validation during package discovery: rejecting path traversal and symlink escapes.</p>` },
  { slug: "limitations", title: "Known limitations", description: "What Nexus cannot do yet.", body: () => `${UP}
<ul><li>Nexus is compiled into the engine. There is no standalone build or installer.</li><li>Standalone <code>.nmod</code> installation is not implemented.</li><li>Fabric and Forge Java mods are not executable through Nexus. Bridges are speculative.</li><li>A dedicated-server owner-console <code>/say</code> is dropped and logged by design.</li><li>No public API reference or source for Nexus exists yet.</li><li>Native code is not sandboxed.</li></ul>` },
  { slug: "developer-setup", title: "Developer setup", description: "Building Horizon and working on this website.", body: () => `${UP}
<h2>Nexus engine</h2>
<p>The Nexus development branch is not public, so there are no Nexus build instructions to give. Horizon itself documents how to build it in its <a href="https://github.com/horizon-rust/horizon#readme">README</a>; follow that, not this page.</p>
<p>Toolchain note: Nexus and its planned native mods are Rust, so working on them needs a Rust toolchain. A source-built mod cannot be installed without a compiler.</p>
<h2>This website</h2>
<pre><code>node build.mjs        # dist/, base /horizon-nexus-site/
node serve.mjs        # local preview
node --test tests/*.test.mjs    # checks</code></pre>
<p>Node 22 or newer. No packages to install.</p>` },
  { slug: "mod-loading", title: "Future mod-loading architecture", description: "The proposed v0.4 .nmod loader.", body: ({ flow, PLANNED }) => `<div class="callout warn"><p>Proposal only. v0.4 is in development and none of this is released. Details may change.</p></div>
${flow(PLANNED, "Planned architecture")}
<h2>v0.4a scope (proposed)</h2><ul><li>A versioned manifest for each <code>.nmod</code> package.</li><li>Validation of unique mod IDs, semantic versions, sides, stages, dependencies and conflicts.</li><li>Rejection of duplicate IDs, missing dependencies, incompatible versions, reserved namespaces and invalid stage/side combinations, with clear diagnostics.</li><li>Deterministic dependency ordering with cycle detection.</li><li>Deterministic registration ordering across independent mods.</li><li>Secure path validation: no path traversal or symlink escapes.</li></ul>
<h2>Compatibility metadata</h2><ol><li>The Nexus API version a mod requires.</li><li>The Horizon source/API compatibility it supports.</li><li>The exact Horizon revision used for a compiled installation.</li></ol>
<p>No single Horizon revision is hardcoded as the universal target.</p>
<h2>Later (v0.4b and on)</h2><ul><li>Launcher integration.</li><li>Native compilation support.</li><li>The first installable Nexus mod.</li><li>Version compatibility and rollback.</li></ul>
<h2>Out of scope</h2><p>Dynamic loading, JVM compatibility and Fabric/Forge support are not part of v0.4. Fabric and Forge compatibility, and <code>.hnmod</code> interoperability, are future research.</p>` },
];
