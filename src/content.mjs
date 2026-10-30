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

// state: done | current | planned
export const MILESTONES = [
  { ver: "v0.1", name: "Core runtime and lifecycle", state: "done", commit: "0fcc557b1", icon: "runtime",
    summary: "Core Nexus runtime, deterministic lifecycle and system registration.",
    items: ["Rust systems runtime", "System registration", "Deterministic execution scheduling", "Initialization, tick and shutdown", "Server/client separation", "Runtime activation gating"] },
  { ver: "v0.2", name: "World events and command integration", state: "done", commit: "52aedd384", icon: "engine",
    summary: "Additional lifecycle hooks, day/night integration and allowlisted command support.",
    items: ["Additional simulation stages", "World day/night events", "Controlled engine command requests", "Gameplay lifecycle integration", "Server-side execution"] },
  { ver: "v0.3", name: "Typed event bus and deterministic dispatch", state: "done", commit: "2a01521ee", icon: "events",
    summary: "Typed event bus, bounded dispatch and deterministic event handling.",
    items: ["Typed inter-system events", "Independent publishers and consumers", "Deterministic same-stage delivery", "Bounded 64-event dispatch batches", "Deferred reentrant events", "Session lifecycle cleanup", "Integrated and dedicated server validation"],
    validation: ["18/18 Nexus runtime tests passed"] },
  { ver: "v0.4a", name: "Manifest discovery and dependency resolution", state: "done", commit: "fb43e5954", icon: "package",
    summary: "Mod manifest discovery, dependencies, conflicts and deterministic load ordering. It does not install or run mods.",
    items: ["horizon-nexus-loader crate", "Schema-1 .nmod manifest parser", "Strict TOML validation", "Mod discovery", "Dependency resolution", "Conflict detection", "Semantic version validation", "Nexus API compatibility checks", "Client/server stage validation", "Deterministic dependency ordering", "Filesystem path and symlink checks", "Explicit native-code trust assumptions"],
    validation: ["14 loader tests passing", "18 Nexus runtime tests passing", "32/32 total tests passing", "Strict Clippy clean", "Default and Nexus-feature client checks passed", "Locked workspace validation passed"],
    note: "Committed locally on the developer's branch: nine files, 1,336 insertions. v0.4a is a metadata, discovery and resolution library. It does not install or execute independently packaged mods." },
  { ver: "Audit", name: "Pre-v0.4b audit: stabilization and resource-safety fixes", state: "done", commit: "8f809e822", icon: "shield",
    summary: "A review and hardening pass over everything through v0.4a, before v0.4b work starts.",
    items: ["Fixed an event-queue resource issue", "Added regression coverage"],
    validation: ["33/33 tests passed"] },
  { ver: "v0.4b.1", name: "Native mod registration foundations", state: "done", label: "Committed", commit: "9198d320e", icon: "framework",
    title: "feat(nexus): add native registration seam and capability metadata", date: "30 October 2026",
    summary: "Native mod registration foundation and capability metadata. It does not install .nmod packages.",
    items: ["Native Nexus registration interface for future external mods", "NexusRegistrar: registration without unrestricted runtime access", "Deterministic system registration", "Rejects duplicate identities and invalid side or stage", "Versioned capability metadata for registered systems", "Per-Game runtime ownership and lifecycle preserved", "Compatible with existing native hooks, without unnecessary API changes"],
    validation: ["35/35 distinct tests passing", "Strict Clippy clean", "Default and Nexus-enabled client checks passing"],
    note: "Registration infrastructure is implemented, but external .nmod package installation is not available yet. Capability metadata is declarative: command-boundary enforcement is still planned." },
  { ver: "v0.4b.2", name: "Secure package loading and installation foundations", state: "current", icon: "package",
    summary: "In development, not released. Secure .nmod package pipeline, launcher integration, consent, installation and first real native mod loading. The internal package foundations and the launcher connection are done; the end-to-end launcher flow is not.",
    items: ["ZIP 9.0.5 dependency migration", "ZIP structural integrity checks", "Unsafe filenames, unsupported compression, encryption and special-file checks", "Cross-entry filename collision and manifest validation", "Deterministic archive metadata report", "Archive entry count and declared decompressed-size limits", "Encoded archive input-size limit", "Nonzero-size directory entries rejected", "Security review", "Whole-archive SHA-256 identity, with PinnedPreflight binding identity, size and metadata, and archive mutation detection (4.1b)", "Declared CRC-32 and compressed-size metadata in preflight reports, with tests for Stored, Deflate and empty entries (4.2a)", "Private archive custody: exclusive creation of a private copy with restrictive Unix permissions, independent SHA-256, size and metadata re-verification, and cleanup of failed or incomplete copies (4.2b)", "Deterministic extraction plans with validated root-relative destination components, nested files, directories and implicit parents, and defensive checks against unsafe paths and file/directory conflicts (4.2c-a)", "Capability-based filesystem boundary with cap-std 4.0.3: exclusive snapshot-directory creation, directory-handle-relative operations, symlink-escape prevention and restrictive Unix permissions (4.2c-b)", "Bounded streaming decompression that independently verifies actual decompressed sizes and CRC-32, rejecting corrupted, truncated and inconsistent contents (4.2c-c)", "Real .nmod extraction into private snapshot directories with capability-based filesystem operations, size limits, CRC verification and safe file creation; failed extractions are rejected, with cleanup attempted (4.2c-d)", "Extracted-file auditing that detects missing, unexpected, modified and unsafe files, with deterministic SHA-256 file inventories (4.3a)", "Extracted-file SHA-256 compared independently with original archive content, plus a CRC-32 collision regression showing CRC alone is insufficient (4.3b)", "Unicode NFC-only filenames; ambiguous non-NFC paths rejected across validation, extraction and auditing (4.3c)", "Deterministic, versioned TOML integrity manifests recording archive identity, file hashes, paths, sizes and counts; .horizon/manifest.toml reserved for installer metadata (4.3d)", "Atomic, no-overwrite manifest publication using verified temporary files and hard links on supported filesystems, with crash-artifact recovery and incomplete-publication rejection, so partial manifest data never appears under the published filename (4.3e)", "Horizon Launcher has a compiled dependency on horizon-nexus-loader; launcher/src/nexus_trust.rs adds NexusConsentAdapter, implementing the loader's trust-consent contract and returning Unavailable unconditionally for safety (4.4c-b1)"],
    validation: ["174 passing Nexus and adapter tests: loader 151/151, runtime 21/21, new launcher Nexus adapter 2/2", "Plus 13/13 existing launcher native-mods regression tests", "Strict Clippy passed for affected components", "Formatting and git diff checks passed", "Latest completed internal work: 4.4c-b1"],
    note: "v0.4b.2 is not finished. Validation, private custody, safe extraction, integrity auditing and integrity manifests are implemented. The launcher is connected to the loader, but it cannot install or run .nmod packages yet. Consent UI, persistent trust, installation, native compilation and runtime loading are not done." },
  { ver: "v0.4c", name: "Expanded gameplay and engine modding APIs", state: "planned", icon: "engine",
    summary: "Planned. Targets blocks, items, entities, world generation, rendering and shaders, UI, audio and other engine integration where supported.", items: [] },
  { ver: "v0.4d", name: "Modding SDK, profiles and install management", state: "planned", label: "Final feature milestone", icon: "tools",
    summary: "Final planned feature milestone. Modding SDK, developer examples, profiles, version compatibility, install management, rollback and documentation.", items: [] },
  { ver: "Final", name: "Final audit", state: "planned", icon: "shield",
    summary: "Planned. End-to-end testing, security hardening, dependency review, performance and regression testing, then a development pause.", items: [] },
];
export const LATEST = MILESTONES.filter((m) => m.state === "done").at(-1);
export const AUDIT = MILESTONES.find((m) => m.ver === "Audit");
export const UPDATED = "30 October 2026";
export const CURRENT_MS = MILESTONES.find((m) => m.state === "current");
export const HIGHLIGHT = { title: "v0.4b.1 committed: native mod registration foundations", body: "Native mod registration foundation and capability metadata. Now in development, not released: v0.4b.2. Latest completed internal work is 4.4c-b1, the launcher to Nexus loader integration seam. 174 Nexus and adapter tests plus 13 existing native-mods regression tests reported passing by the development agent. The launcher cannot install or run .nmod packages yet." };
// v0.4b.2 checkpoint checklist (developer-reported). state: done | next | planned
export const CHECKPOINTS = [
  ["3.1", "ZIP dependency migration", "done"], ["3.2", "Archive consistency gate", "done"], ["3.3", "Entry metadata security validation", "done"],
  ["3.4a", "Collision and manifest checks", "done"], ["3.4b", "Resource limits and preflight report", "done"], ["4.0", "Security review", "done"],
  ["4.1a", "Archive-size cap and directory rules", "done"], ["4.1b", "SHA-256 archive identity", "done"],
  ["4.2a", "CRC-32 and compressed size", "done"], ["4.2b", "Private archive custody", "done"], ["4.2c-a", "Extraction path planning", "done"], ["4.2c-b", "Capability-based filesystem security", "done"],
  ["4.2c-c", "Streaming content verification", "done"], ["4.2c-d", "Secure mod extraction", "done"], ["4.3a", "Snapshot integrity audit", "done"], ["4.3b", "Cryptographic provenance", "done"], ["4.3c", "Unicode filename security", "done"], ["4.3d", "Versioned snapshot manifests", "done"], ["4.3e", "Atomic manifest publication", "done"],
  ["4.4c-b1", "Launcher to Nexus loader integration seam", "done"],
  ["", "Select a local .nmod, verify and stage it through the loader", "planned"], ["", "Separate Nexus consent dialog with verified package details and risks", "planned"], ["", "Explicit Approve, Deny and Cancel", "planned"], ["", "Securely persist exact approvals and revocations, reverified before use", "planned"], ["", "Native build, installation and first real native mod loading", "planned"],
];
export const REMAINING = "Checkpoints between 4.3e and 4.4c-b1 are not listed one by one here. Still to do in v0.4b.2: the end-to-end launcher flow, from choosing a .nmod to consent, installation and loading. None of it is finished.";
export const PLAIN_PROGRESS = "Horizon Nexus can validate native mod packages, preserve verified archives, safely extract their contents, independently audit extracted files, verify their cryptographic provenance, and publish versioned integrity manifests. Native mod installation, user trust approval and runtime activation remain in development.";
export const PROGRESS = {
  done: ["Archive security validation", "SHA-256 archive identity", "Private archive custody", "Safe extraction planning", "Capability-based filesystem boundary", "Actual bounded file extraction", "Snapshot integrity auditing", "Cryptographic archive provenance", "Unicode NFC filename validation", "Versioned snapshot manifests", "Atomic manifest publication", "Launcher to Nexus loader integration seam (4.4c-b1)"],
  next: ["Select a local .nmod package", "Verify and stage it through the Nexus loader", "Separate Nexus consent dialog", "Show verified package ID, version, snapshot, archive SHA-256, archive length, published manifest SHA-256 and capabilities", "Explain the risks of unsandboxed native code, Cargo build scripts and transitive dependencies", "Explicit Approve, Deny and Cancel", "Securely persist exact approvals and revocations", "Reverify package identity before relying on an approval"],
  later: ["v0.4c: Expanded gameplay and engine APIs", "v0.4d: Final planned feature milestone (SDK, examples, profiles, install management, rollback)", "Final audit, then a development pause"],
};
export const STATUS = [["Latest committed milestone", "v0.4b.1"], ["In development", "v0.4b.2 (not released)"], ["Latest completed work", "4.4c-b1: launcher to loader seam"], ["Final planned feature milestone", "v0.4d"], ["Internal tests", "174 passing, plus 13 regression tests (reported)"], ["Public availability", "Not yet released"]];
export const LATEST_DEV = { id: "4.4c-b1", title: "Launcher to Nexus loader integration seam", plain: ["Horizon Launcher is now connected to the Nexus loader.", "A dedicated consent adapter is in place, and for safety it always answers Unavailable. Nothing is approved automatically.", "The existing native-mods consent system is separate and unchanged. Nexus security checks and trust identities are not weakened."], caveat: "This does not mean Nexus mods can be installed or run through the launcher yet.", tech: "Horizon Launcher has a compiled dependency on horizon-nexus-loader. launcher/src/nexus_trust.rs provides NexusConsentAdapter, implementing the loader's trust-consent contract; it returns Unavailable unconditionally. The horizon-mixin.toml native-mods consent system is unchanged. The loader already provides archive validation, custody, staging, integrity auditing, cryptographic provenance, published manifests and in-memory trust decisions." };
export const AVAILABILITY = "Currently in active development. Public downloads will become available after installation support and security validation are complete.";
export const TESTS_NOTE = "Passing internal tests show the finished checkpoints work as reported. They do not mean Nexus is ready for public use. Results are reported by the development agent (OpenCode), not verified by this website.";
export const SECURITY_PLAIN = [".nmod packages are checked, copied privately, unpacked safely and audited before anything else happens.", "Package verification checks the file, not the author. It does not prove a mod's author can be trusted.", "Native Rust mods are real programs and are not sandboxed. Only use mods from people you trust.", "Unpacked mod files can still be changed by other programs with enough permissions on your computer.", "The launcher cannot run .nmod packages yet. A consent dialog, saved approvals, installation and native compilation are still in development."];
export const DEV_NOTES = ["The broader Horizon workspace still has older ZIP dependencies under security review."];
export const SCOPE = ["Blocks, items and entities", "World generation and AI", "Physics and gameplay systems", "Shaders, rendering and camera systems", "HUD and UI extensions", "Audio and input", "Networking and persistence", "Native registration hooks and advanced source-based extensions"];
export const STABILIZATION = ["Review all code and architecture", "Fix defects", "Improve existing implementations", "Strengthen security", "Benchmark performance", "Test real mod workflows", "Test client/server behaviour", "Improve documentation", "Verify future maintainability"];

export const IMPLEMENTED = [
  { name: "Native Rust system framework", plain: "Mods are built from small machines, called systems, that run inside the game.", icon: "runtime", ms: "v0.1", body: "Game logic as Rust systems that Nexus runs inside Horizon." },
  { name: "Registration and lifecycle", plain: "Nexus switches each system on, keeps it running and switches it off cleanly.", icon: "lifecycle", ms: "v0.1", body: "Systems are registered, initialised, ticked and shut down by the runtime." },
  { name: "Deterministic scheduling", plain: "Systems always take their turns in the same order.", icon: "schedule", ms: "v0.1", body: "Systems run in a fixed order. This orders Nexus's own work; it does not make the whole game deterministic." },
  { name: "Typed event dispatch", plain: "Systems can leave messages for each other, like notes on a board.", icon: "events", ms: "v0.3", body: "Events are offered to enabled systems in the same stage, in a fixed order. Each system checks them and handles what is relevant." },
  { name: "Independent event consumers", plain: "Two mods can react to each other without being made for each other.", icon: "fanout", ms: "v0.3", body: "Publishers and consumers do not need to know about each other." },
  { name: "Server/client separation", plain: "Work for the server and work for your screen are kept apart.", icon: "sides", ms: "v0.1", body: "Server and client work are kept apart. Validated on integrated and dedicated servers." },
  { name: "Controlled engine actions", plain: "Mods ask the game to do things through a safe front door.", icon: "engine", ms: "v0.2", body: "Systems request engine commands through a controlled path instead of reaching into internals." },
  { name: "Native registration interface", plain: "Mods have a proper front desk where they can sign in their systems.", icon: "framework", ms: "v0.4b.1", body: "NexusRegistrar exposes registration without unrestricted runtime access. Registration is deterministic, rejects duplicate identities and invalid side or stage, and records versioned capability metadata (declarative; command-boundary enforcement is planned)." },
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

// "Maybe someday" idea on the Features page. An idea, not a plan: never put it on the roadmap.
export const VISION = [["engine", "Game engines", "Mods, events, custom content"], ["sides", "Desktop software", "Plugins, themes, extensions"], ["runtime", "Servers", "Modules, automation, commands"], ["package", "Installers", "Verified packages and updates"], ["tools", "Developer tools", "Third-party integrations"], ["world", "Simulators", "Custom physics and plugins"]];
