// Every claim about Nexus on this site is in this file, so it can be reviewed in one place.
// "User-provided" means supplied by the Nexus developer and not verified against a public upstream repository.
export const REPO = "https://github.com/contactjayclatty/horizon-nexus-site";
export const HORIZON = "https://github.com/horizon-rust/horizon";
export const HORIZON_SITE = "https://playhorizon.dev/";
export const HORIZON_MODS = "https://github.com/horizon-rust/horizon-mods";

export const MILESTONES = [
  { ver: "v0.1", name: "Systems Runtime", state: "done", commit: "0fcc557b1", pct: 100,
    summary: "Systems Runtime. A detailed per-milestone scope has not been published.",
    items: [] },
  { ver: "v0.2", name: "Engine Integration", state: "done", commit: "52aedd384", pct: 100,
    summary: "Engine Integration. A detailed per-milestone scope has not been published.",
    items: [] },
  { ver: "v0.3", name: "Inter-System Events", state: "done", commit: "2a01521ee", pct: 100,
    summary: "Typed events between systems, delivered to multiple independent subscribers.",
    items: ["Typed event production", "Multiple independent subscribers", "Deterministic same-stage dispatch", "64-event bounded delivery batches", "Dedicated event dispatch", "Safe lifecycle cleanup"],
    validation: ["18/18 tests passed", "Strict Clippy checks passed", "Typed event production and multiple-subscription delivery validated in-game", "Dedicated event dispatch validated"] },
  { ver: "v0.4", name: "Standalone Nexus Loader", state: "dev", commit: null, pct: 10,
    summary: "Proposed / in development. Architecture for loading standalone .nmod packages. Not complete.",
    items: [".nmod manifest validation", "Dependency resolution", "Launcher integration", "Native compilation support", "First installable Nexus mod", "Version compatibility and rollback"] },
];
export const FUTURE = [".hnmod interoperability", "Expanded modding APIs", "Fabric and Forge compatibility research"];

export const FEATURES = [
  { name: "Modular Rust systems", ms: "by v0.3", body: "Engine-side behaviour is split into independent systems, each a self-contained unit the runtime owns and runs.", mini: "a a a gap b b" },
  { name: "Deterministic schedules", ms: "by v0.3", body: "Systems run in a fixed, repeatable order every tick, so the same inputs give the same order of work.", mini: "a gap a gap a gap a" },
  { name: "Typed events", ms: "by v0.3", body: "Systems communicate through typed events rather than shared state. A producer emits an event of a known type; the type decides who can receive it.", mini: "a b b b" },
  { name: "Multiple independent subscribers", ms: "by v0.3", body: "One event can be delivered to several subscribers that do not know about each other. Multiple-subscription delivery was validated in-game (user-provided).", mini: "a gap b b b" },
  { name: "System lifecycle", ms: "by v0.3", body: "Systems are started, run and stopped by the runtime. Lifecycle cleanup is safe as of v0.3 (user-provided).", mini: "b a a a b" },
  { name: "Client/server isolation", ms: "by v0.3", body: "Client-side and server-side systems are kept apart, so a system declared for one side does not run on the other.", mini: "a a gap gap b b" },
  { name: "Controlled engine actions", ms: "by v0.3", body: "Systems act on the engine through a controlled set of actions rather than reaching into engine internals. Some actions are deliberately refused in some contexts (see the dedicated-server /say note).", mini: "a gap b" },
];

export const NOTICE = "Horizon Nexus is an independent project. It is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft. It is also not an official or endorsed part of the upstream Horizon project (horizon-rust); it builds on Horizon's public work.";
export const USER_PROVIDED = "Nexus milestone, commit and test information on this site is provided by the Nexus developer from an independent development branch. Those commits may not exist in the public upstream Horizon repository and have not been independently verified by this site.";
