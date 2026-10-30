// Every claim about Nexus on this site lives here and in src/docs.mjs.
// Milestones, commits and test results are developer-reported: they come from the Nexus developer's
// independent Horizon branch and are not verified against any public upstream repository.
export const REPO = "https://github.com/contactjayclatty/horizon-nexus-site";
export const HORIZON = "https://github.com/horizon-rust/horizon";
export const HORIZON_SITE = "https://playhorizon.dev/";
export const HORIZON_MODS = "https://github.com/horizon-rust/horizon-mods";

export const DEFINITION = "Horizon Nexus is a Rust-native modding framework and mod loader for Horizon, designed to let developers add, modify, replace and extend engine functionality.";
export const NO_RELEASE = "No public standalone Nexus release is available yet.";
export const OUT_OF_SCOPE = "Fabric, Forge and NeoForge compatibility are out of scope.";
export const NO_JAVA = "Nexus is a native Rust modding platform for Horizon and does not load Java Fabric or Forge mods.";

// state: done | planned
export const MILESTONES = [
  { ver: "v0.1", name: "Systems Runtime", state: "done", commit: "0fcc557b1", icon: "runtime",
    summary: "The foundation: Rust systems that Nexus registers, schedules and runs inside Horizon.",
    items: ["Rust systems runtime", "System registration", "Deterministic execution scheduling", "Initialization, tick and shutdown", "Server/client separation", "Runtime activation gating"] },
  { ver: "v0.2", name: "Engine Integration", state: "done", commit: "52aedd384", icon: "engine",
    summary: "Nexus systems hooked into Horizon's gameplay and simulation.",
    items: ["Additional simulation stages", "World day/night events", "Controlled engine command requests", "Gameplay lifecycle integration", "Server-side execution"] },
  { ver: "v0.3", name: "Typed Inter-System Events", state: "done", commit: "2a01521ee", icon: "events",
    summary: "Systems can talk to each other through typed events.",
    items: ["Typed inter-system events", "Independent publishers and consumers", "Deterministic same-stage delivery", "Bounded 64-event dispatch batches", "Deferred reentrant events", "Session lifecycle cleanup", "Integrated and dedicated server validation"],
    validation: ["18/18 Nexus runtime tests passed"] },
  { ver: "v0.4a", name: ".nmod manifest validation, discovery and deterministic dependency resolution", state: "done", commit: "fb43e5954", icon: "package",
    summary: "A library that reads, checks and orders .nmod packages. It does not yet install or run mods.",
    items: ["horizon-nexus-loader crate", "Schema-1 .nmod manifest parser", "Strict TOML validation", "Mod discovery", "Dependency resolution", "Conflict detection", "Semantic version validation", "Nexus API compatibility checks", "Client/server stage validation", "Deterministic dependency ordering", "Filesystem path and symlink checks", "Explicit native-code trust assumptions"],
    validation: ["14 loader tests passing", "18 Nexus runtime tests passing", "32/32 total tests passing", "Strict Clippy clean", "Default and Nexus-feature client checks passed", "Locked workspace validation passed"],
    note: "Committed locally on the developer's branch: nine files, 1,336 insertions. v0.4a is a metadata, discovery and resolution library. It does not install or execute independently packaged mods." },
  { ver: "Audit", name: "Pre-v0.4b audit and hardening", state: "done", commit: "8f809e822", icon: "shield",
    summary: "A review and hardening pass over everything through v0.4a, before v0.4b work starts.",
    items: ["Fixed an event-queue resource issue", "Added regression coverage"],
    validation: ["33/33 tests passed"] },
  { ver: "v0.4b", name: "Framework and Loader Integration", state: "planned", icon: "framework",
    summary: "Connect packages to Horizon's build, and widen what mods can reach.",
    items: ["Connect package discovery to Horizon's launcher compilation pipeline", "Generated Nexus system registration", "Extend framework API and engine hook coverage", "A reliable path for native mods to modify gameplay"] },
  { ver: "v0.4c", name: "Real Native Mod Workflow", state: "planned", icon: "workflow",
    summary: "The first full loop: write a mod, install it, see the game change.",
    items: ["Independently authored .nmod packages", "Trusted native compilation", "Installation through Horizon Launcher", "Real gameplay changes through Nexus APIs and hooks", "End-to-end mod creation and execution validation"] },
  { ver: "v0.4d", name: "Framework Completion", state: "planned", icon: "tools",
    summary: "Tools and docs that make Nexus practical for other developers.",
    items: ["SDK and developer tooling", "Developer documentation", "Example gameplay mods", "Mod profiles", "Compatibility diagnostics", "Update and rollback mechanisms", "Final broad framework and loader feature completion"] },
];
export const LATEST = MILESTONES.filter((m) => m.state === "done").at(-1);
export const AUDIT = MILESTONES.find((m) => m.ver === "Audit");
export const UPDATED = "30 October 2026";
export const FOCUS = { ver: "v0.4b.1", name: "Native system registration", plain: "The part that will let mods plug their own systems into Nexus. Being built now, not finished yet.", status: "Architecture reviewed, implementation authorized and in progress",
  body: "The first step of v0.4b. It is the current, in-progress milestone. It is not completed.",
  items: ["Native Nexus system registration hooks", "Connecting external mod registration to the Nexus runtime", "Deterministic registration and lifecycle behavior", "Preparing the foundation for independently installable .nmod mods"] };
export const STABILIZATION = ["Review all code and architecture", "Fix defects", "Improve existing implementations", "Strengthen security", "Benchmark performance", "Test real mod workflows", "Test client/server behaviour", "Improve documentation", "Verify future maintainability"];

export const IMPLEMENTED = [
  { name: "Native Rust system framework", plain: "Mods are built from small machines, called systems, that run inside the game.", icon: "runtime", ms: "v0.1", body: "Game logic as Rust systems that Nexus runs inside Horizon." },
  { name: "Registration and lifecycle", plain: "Nexus switches each system on, keeps it running and switches it off cleanly.", icon: "lifecycle", ms: "v0.1", body: "Systems are registered, initialised, ticked and shut down by the runtime." },
  { name: "Deterministic scheduling", plain: "Systems always take their turns in the same order.", icon: "schedule", ms: "v0.1", body: "Systems run in a fixed order. This orders Nexus's own work; it does not make the whole game deterministic." },
  { name: "Typed event dispatch", plain: "Systems can leave messages for each other, like notes on a board.", icon: "events", ms: "v0.3", body: "Events are offered to enabled systems in the same stage, in a fixed order. Each system checks them and handles what is relevant." },
  { name: "Independent event consumers", plain: "Two mods can react to each other without being made for each other.", icon: "fanout", ms: "v0.3", body: "Publishers and consumers do not need to know about each other." },
  { name: "Server/client separation", plain: "Work for the server and work for your screen are kept apart.", icon: "sides", ms: "v0.1", body: "Server and client work are kept apart. Validated on integrated and dedicated servers." },
  { name: "Controlled engine actions", plain: "Mods ask the game to do things through a safe front door.", icon: "engine", ms: "v0.2", body: "Systems request engine commands through a controlled path instead of reaching into internals." },
  { name: ".nmod validation and resolution", plain: "Nexus can read and check mod packages. It cannot install them yet.", icon: "package", ms: "v0.4a", body: "A library that parses manifests, finds packages, resolves dependencies and checks versions. It does not install or build mods." },
];
export const TARGETS = ["Blocks and items", "Entities and AI", "World generation", "Chunks and dimensions", "Gameplay rules", "Engine behaviour overrides", "Physics hooks", "Camera and rendering hooks", "HUD and UI", "Audio", "Input", "Multiplayer and networking", "Data and persistence", "Registries and extensible APIs", "Trusted native source-level extensions"];
export const MODULES = [
  { name: "Nexus Performance", icon: "performance", body: "Targeted optimisations and performance tools." },
  { name: "Nexus Cinematics", icon: "camera", body: "Free camera, camera paths, keyframes and cinematic controls." },
  { name: "Nexus World Tools", icon: "world", body: "Chunky-style chunk pregeneration, generation progress and management.", note: "Pregeneration builds and saves chunks ahead of time. It does not keep them loaded and ticking." },
  { name: "Nexus Quality of Life", icon: "qol", body: "Inventory improvements, HUD customisation, keybindings, waypoints and accessibility." },
];

export const NOTICE = "Horizon Nexus is an independent project. It is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft. It is not an officially endorsed part of upstream Horizon.";
export const USER_PROVIDED = "Milestones, commit ids and test results are developer-reported, from an independent Horizon development branch. The commits may not exist in the public upstream repository.";
