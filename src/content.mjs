// Every claim about Nexus on this site is in this file and src/docs.mjs, so it can be reviewed in one place.
// Milestone history, commits and test results are user-provided by the Nexus developer (an independent
// development branch) and are not verified against a public upstream repository.
export const REPO = "https://github.com/contactjayclatty/horizon-nexus-site";
export const HORIZON = "https://github.com/horizon-rust/horizon";
export const HORIZON_SITE = "https://playhorizon.dev/";
export const HORIZON_MODS = "https://github.com/horizon-rust/horizon-mods";

// state: done | dev | planned
export const MILESTONES = [
  { ver: "v0.1", name: "Systems Runtime", state: "done", commit: "0fcc557b1", icon: "runtime",
    summary: "The Nexus systems runtime.", items: [] },
  { ver: "v0.2", name: "Engine Integration", state: "done", commit: "52aedd384", icon: "engine",
    summary: "Nexus integrated with the Horizon engine.", items: [] },
  { ver: "v0.3", name: "Inter-System Events", state: "done", commit: "2a01521ee", icon: "events",
    summary: "Typed events between systems.",
    items: ["Typed event production", "Delivery to multiple systems, validated in-game", "Dedicated event dispatch, validated", "Deterministic same-stage dispatch order", "Bounded delivery batches of 64 events", "Safe lifecycle cleanup"],
    validation: ["18/18 tests passed", "Strict Clippy checks passed"] },
  { ver: "v0.4a", name: "Package Foundation", state: "dev", icon: "package",
    summary: "Manifest parsing, package discovery, dependency resolution, version compatibility and validation.",
    items: ["Manifest parsing", "Package discovery", "Dependency resolution", "Version compatibility", "Validation"] },
  { ver: "v0.4b", name: "Framework and Loader Integration", state: "planned", icon: "framework",
    summary: "Native mod compilation, registration, engine APIs, gameplay hooks and extensibility mechanisms.",
    items: ["Native mod compilation", "Registration", "Engine APIs", "Gameplay hooks", "Extensibility mechanisms"] },
  { ver: "v0.4c", name: "Real Modding Workflow", state: "planned", icon: "workflow",
    summary: "Independently developed Nexus mods that can meaningfully add or alter gameplay, packaged and installed without manually editing the engine source.",
    items: ["Independently developed mods", "Add or alter gameplay", "Package and install without editing engine source"] },
  { ver: "v0.4d", name: "Framework Completion and Ecosystem Tools", state: "planned", icon: "tools",
    summary: "SDK, developer documentation, mod installation management, profiles, compatibility diagnostics, rollback and representative example mods.",
    items: ["SDK", "Developer documentation", "Mod installation management", "Profiles", "Compatibility diagnostics", "Rollback", "Representative example mods"] },
];
export const STABILIZATION = ["Exhaustive architectural review", "Code quality improvements", "Bug fixing", "Security assessment", "Performance profiling", "Compatibility testing", "Client/server testing", "Mod conflict testing", "Documentation", "Release-readiness verification", "Final polish"];

// What exists today (by v0.3, user-provided).
export const IMPLEMENTED = [
  { name: "Modular Rust systems", icon: "runtime", body: "Engine-side behaviour is organised into systems that the Nexus runtime registers and runs." },
  { name: "Deterministic schedules", icon: "schedule", body: "Systems run in a fixed, repeatable order. That orders Nexus's own work; it does not by itself make all gameplay deterministic." },
  { name: "Typed events", icon: "events", body: "Systems produce typed events. The dispatcher offers each event to enabled systems in the same stage, and each system checks for and handles the events relevant to it." },
  { name: "Several systems per event", icon: "fanout", body: "More than one system can handle the same event, independently. Validated in-game in v0.3." },
  { name: "System lifecycle", icon: "lifecycle", body: "The runtime starts, runs and stops systems, with safe cleanup as of v0.3." },
  { name: "Client/server isolation", icon: "sides", body: "Client and server work stay separate. Dedicated-server event dispatch was validated in v0.3." },
  { name: "Controlled engine actions", icon: "engine", body: "Systems act on the engine through a controlled set of actions. Some are refused by design, such as owner-console /say on a dedicated server." },
];
export const PLANNED_FEATURES = [
  { name: ".nmod packages", ms: "v0.4a", body: "A manifest, package discovery, dependency resolution and version checks." },
  { name: "Validation before build", ms: "v0.4a", body: "Packages are checked before any native code is compiled." },
  { name: "Native mod compilation", ms: "v0.4b", body: "Mods are Rust source, built against Horizon. A compiler toolchain is needed." },
  { name: "Engine APIs and hooks", ms: "v0.4b", body: "High-level APIs, deeper engine hooks and registries for mods to build on." },
  { name: "Install without editing the engine", ms: "v0.4c", body: "Mods that add or alter gameplay, packaged and installed without hand-editing engine source." },
  { name: "SDK and tools", ms: "v0.4d", body: "SDK, docs, install management, profiles, diagnostics, rollback and example mods." },
];
// Target capabilities: what the framework aims to let mods change. Not implemented today.
export const TARGETS = ["Blocks and items", "Crafting and inventory", "Entities, mobs and AI", "World generation, chunks and dimensions", "Gameplay rules and physics", "Rendering, shaders and camera", "HUD, interfaces and input", "Audio", "Networking and multiplayer", "Configuration and saved data", "Custom commands and engine hooks"];

// Example future modules: ideas only, for after development pauses and only if it resumes.
export const MODULES = [
  { name: "Nexus Performance", icon: "performance", items: ["Frame-time profiling", "Targeted rendering optimisations", "Resource management", "Gameplay performance improvements"] },
  { name: "Nexus Cinematics", icon: "camera", items: ["Free camera", "Camera paths and keyframes", "Cinematic tools", "HUD controls", "Replay-oriented features"] },
  { name: "Nexus World Tools", icon: "world", items: ["Chunk pregeneration (Chunky-style)", "Area selection", "Generation progress", "Pause and resume", "Persistent jobs", "Performance budgets"],
    note: "Pregeneration generates and saves chunks ahead of time. It does not keep chunks loaded and ticking." },
  { name: "Nexus Quality of Life", icon: "qol", items: ["Inventory improvements", "Advanced HUD controls", "Waypoints", "Custom keybindings", "Accessibility features", "Convenience tools"] },
];

export const NOTICE = "Horizon Nexus is an independent project. It is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft. It is not an official or endorsed part of the upstream Horizon project (horizon-rust); it builds on Horizon's public work.";
export const USER_PROVIDED = "Nexus milestone, commit and test details on this site are user-provided by the Nexus developer from an independent development branch. Those commits may not exist in the public upstream Horizon repository and have not been independently verified here.";
