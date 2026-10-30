# AGENTS.md

Conventions for anyone, human or AI agent, working on the Horizon Nexus website.

## The Nexus Development Collective

Seven instruction profiles live in `.github/agents/`. They are reusable instruction files, not running bots. When this site was first built, a single agent read them and carried out each role in turn, in the order below; no separate agents were spawned.

| Order | Profile | Owns |
|---|---|---|
| 1 | [Nexus Director](.github/agents/nexus-director.md) | Plan, coordination, final review |
| 2 | [Horizon Design Specialist](.github/agents/horizon-design-specialist.md) | `docs/design/`, `src/tokens.css` |
| 3 | [Minecraft UI Artist](.github/agents/minecraft-ui-artist.md) | `scripts/art.mjs`, `scripts/raster.mjs`, `public/media/`, icons |
| 4 | [Nexus Frontend Engineer](.github/agents/nexus-frontend-engineer.md) | `build.mjs`, `serve.mjs`, `src/style.css`, `src/site.js` |
| 5 | [Nexus Documentation Engineer](.github/agents/nexus-documentation-engineer.md) | `src/content.mjs`, `src/docs.mjs`, README, CONTRIBUTING |
| 6 | [Nexus QA & Security Engineer](.github/agents/nexus-qa-security-engineer.md) | `tests/`, `scripts/qa.mjs` |
| 7 | [Nexus DevOps Engineer](.github/agents/nexus-devops-engineer.md) | `.github/workflows/` |

To add an agent: copy an existing profile, keep every section (role, responsibilities, input and output contracts, standards, restrictions, acceptance criteria, handoff), add it to this table, and give it files to own that no other profile owns.

## Rules for everyone

- **Accuracy.** Every claim about Nexus lives in `src/content.mjs` or `src/docs.mjs` and must come from the maintainer. Label it developer-reported; show commit ids as plain text, never as upstream links. Do not invent APIs, stage names, install steps or downloads. v0.4a is completed and committed (fb43e5954, developer-reported) but is only a metadata, discovery and resolution library: it does not install or run mods. The pre-v0.4b audit is completed (8f809e822). v0.4b.1 is complete (9198d320e, developer-reported). v0.4b.2 is "In development" (current). Never call it complete, and never imply mod installation or native compilation works. v0.4c, v0.4d and Final hardening are planned (v0.4b.3 and v0.4b.4 were dropped as separate steps). Capability metadata is declarative only; .nmod installation is not available. Later steps stay "Planned" until the maintainer gives new evidence. No public release exists: use "No public standalone Nexus release is available yet." v0.4 is the last planned feature milestone: no v0.5, v1.0, dates or percentages. Fabric, Forge and NeoForge are out of scope; only the two fixed sentences in `src/content.mjs` (NO_JAVA, OUT_OF_SCOPE) may mention them. Future modules (Performance, Cinematics, World Tools, Quality of Life) are ideas, never deliverables.
- **Upstream is read-only.** Never modify, fork, push to or open issues or PRs on any horizon-rust repository.
- **Original art only.** No Minecraft textures or assets. Keep the Mojang non-affiliation notice in the footer.
- **Base path.** Build every internal URL with `u()` in `build.mjs`. The site is served under `/horizon-nexus-site/`.
- **No secrets.** Nothing in `.env`, no tokens in code or workflows.
- **No licence file** until the maintainer chooses a licence. Fonts keep their OFL notices in `public/fonts/`.
- **Copy:** plain and short. No em-dashes anywhere on the site (a test enforces it).
- **Home status card.** The home page has no banner or animation. It shows the calm static status card (`STATUS` and `AVAILABILITY` in `src/content.mjs`): latest completed, in development, internal tests, public availability. Never imply 115 tests means production-ready. Checkpoint detail (`CHECKPOINTS`, `NEXT_CHECKPOINT`) lives on Roadmap and Development only. Never mark 4.1b complete until the maintainer reports it passing. Older Horizon workspace ZIP dependencies are mentioned only in the Development page developer notes. No workstation paths or recovery details anywhere.
- **Navigation.** Top nav is Home, Features, Roadmap, Development. Docs, Releases, FAQ, Search, Architecture, Downloads and Contributing are linked from the footer, the phone menu and the Development page.
- **Cache busting.** CSS and JS links carry `?v=<content hash>` from `build.mjs`; keep it so phones get fresh styles.
- **Shared components (v4.0).** Docs use the folding `docs-toc` list (open on wide screens, folded on phones). Roadmap has jump links and folds long completed lists in `more-items`. The footer `foot-status` and the phone menu `menu-status` read the current milestone from `CURRENT_MS`; never hard-code a status there. Every page carries OG and Twitter meta.
- **v5 components.** Search is static: `build.mjs` writes `search.json`, `src/search.js` filters it in the browser; no services. Share images live in `public/og/` and are made by `node scripts/raster.mjs` from each page title and description; re-run it when those change. Releases keep only the newest milestone open. Tables get `data-label`s so they stack on phones. Keep the full source note on Start here only; other doc pages use the one-line `src-tag`. No light theme: the launcher look is dark by design.
- **Checks before a push:** `node build.mjs && node --test tests/*.test.mjs`, and `node scripts/qa.mjs` when layout changes.

## Updating the site for a Nexus release

1. Update `MILESTONES` in `src/content.mjs` (state, commit, items, validation).
2. Add the release to the changelog in `build.mjs` and update affected docs in `src/docs.mjs`.
3. Run the checks, open a pull request, merge to `main`. The Pages workflow deploys.
- **Plain language first.** Docs, Features and Architecture open with a short plain lead (`lead()`), a "What this means for you" box (`you()`), then keep full technical detail in a "For developers" section (`devs()`). New terms go in the glossary (`GLOSSARY` in `src/docs.mjs`). The readability test enforces short leads and sentences.
