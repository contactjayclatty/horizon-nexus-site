# Site improvement audit (v2)

Date: 2026-10-30 (AWST). Baseline: commit 504483d, live at https://contactjayclatty.github.io/horizon-nexus-site/.

## How the baseline was inspected

- Read every source file: `build.mjs`, `serve.mjs`, `src/*`, `scripts/*`, `tests/site.test.mjs`, `.github/workflows/pages.yml`, `AGENTS.md` and the seven profiles in `.github/agents/`.
- Opened every public page on the live site with Playwright (headless Chrome) at 360, 390, 768, 1024, 1440 and 1920 px (`QA_OUT=baseline QA_URL=... node scripts/qa.mjs`). Screenshots are in `qa/screenshots/baseline/` (not committed).
- Compared them with playhorizon.dev screenshots and Horizon's `tokens.css` and `style.css` (see `horizon-reference.md`).

## Findings

### Accuracy (highest priority)
| Finding | Fix |
|---|---|
| Nexus described as a "modular systems runtime", not a framework and mod loader | Rewrote the vision on every page: Rust-native framework **and** mod loader, with target capabilities shown as goals |
| v0.4 called "Standalone Nexus Loader" | Now "v0.4: Complete Nexus Framework and Mod Loader", split into v0.4a (in development) and v0.4b to v0.4d (planned) |
| Roadmap had no stabilization phase or pause | Added "After v0.4: Final stabilization" and "Development pauses"; stated there is no v0.5 or v1.0 |
| Fabric and Forge compatibility listed as future research, plus FAQ and overview mentions | Removed. One FAQ sentence remains: Nexus does not load Java Fabric or Forge mods (also in API limitations) |
| Roadmap progress bars (100% and 10% widths) implied percentages | Removed; replaced with state blocks: filled (completed), striped (in development), hollow (planned), always with a text label |
| Typed events text said the event type picks who receives it | Corrected: the v0.3 dispatcher offers same-stage events to enabled systems in a deterministic order; systems inspect and handle relevant events |
| Deterministic schedules could read as deterministic gameplay | Added an explicit note that schedule order alone does not make gameplay deterministic |
| No explanation of why a full framework matters | Added the four example modules, labelled "Idea, not scheduled", with the pregeneration vs. ticking distinction |
| Pillars (framework vs. loader) not distinguished | Added two pillars on the homepage and in the docs overview |

### Visual
| Finding | Fix |
|---|---|
| Logo small; hero relied on headline only | Large pixel wordmark in the hero, 36 px mark in the nav |
| Nav looked like a plain link row | Launcher-style tab well: sunk track, current tab in the raised blue face with bevel and lip |
| Hero status panel sat under the hero | Moved into the hero as a launcher-style window with the milestone track |
| Few illustrations that explain anything | 16 original pixel icons (inline SVG), three block diagrams (current runtime, planned framework, planned loader), "two depths of modding" layer diagram |
| Buttons had little feedback | Hover lifts 1 px and brightens; press sinks 2 px with a lip-only shadow |
| One-off inline styles and duplicated card markup | Shared `card`, `badge`, `track`, `flow`, `ticks`, `chips` helpers and CSS components |

### Technical
| Finding | Fix |
|---|---|
| Roadmap overflowed by 13 px at 360 px (long badge in a no-wrap header) | Panel headers wrap; titles break long words |
| QA only covered 4 widths | Now 360, 390, 768, 1024, 1440, 1920; full-page captures |
| External links had no `rel` | `rel="noopener"` added to every external link |
| Old docs URLs would 404 after the docs restructure | Redirect pages (noindex, canonical) for all seven old URLs, with a test |
| Social image used the old headline | Re-rendered `og.png` with the new headline |
| Tests did not guard scope | New tests: no em-dashes, no Fabric/Forge plans, no invented versions or percentages, v0.4 never called complete, modules labelled as ideas, redirects resolve |

## Kept as is
The dependency-free build, the Pages workflow, the base-path helper `u()` and the no-installer Downloads page.

## v3 audit (simplification and v0.4a correction)

| Problem in v2 | Fix in v3 |
|---|---|
| Home had too many sections and engineering detail (test counts, commit ids) | Five parts: hero, two pillars, Why Nexus, status strip, footer |
| Nav had 9 links | Primary: Home, Features, Roadmap, Docs, Releases, GitHub. Architecture, Downloads, FAQ, Contributing moved to a More menu, the mobile menu and the footer |
| v0.4a shown as in development | Completed and committed (fb43e5954, developer-reported); only a metadata, discovery and resolution library |
| v0.1 to v0.3 lists were approximate | Replaced with the developer's implemented lists |
| No pre-v0.4b audit shown | Shown as Requested, not done |
| Changelog mixed milestones and releases | New Releases page separates public releases (none) from milestone history; changelog/ redirects there |
| Commit ids could read as upstream links | Plain text labelled "developer-reported, not an upstream link" |
| Missing accuracy notes | Added: runtime compiled in, events offered in fixed order to same-stage systems, scheduling is not full-game determinism, not sandboxed (trust before compile), dedicated-server /say logged and dropped, NeoForge out of scope |
