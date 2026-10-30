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

- **Accuracy.** Every claim about Nexus lives in `src/content.mjs` or `src/docs.mjs` and must come from the maintainer. Label it user-provided. Do not invent APIs, stage names, install steps or downloads. v0.4 stays "Proposed / In development" until the maintainer says otherwise.
- **Upstream is read-only.** Never modify, fork, push to or open issues or PRs on any horizon-rust repository.
- **Original art only.** No Minecraft textures or assets. Keep the Mojang non-affiliation notice in the footer.
- **Base path.** Build every internal URL with `u()` in `build.mjs`. The site is served under `/horizon-nexus-site/`.
- **No secrets.** Nothing in `.env`, no tokens in code or workflows.
- **No licence file** until the maintainer chooses a licence. Fonts keep their OFL notices in `public/fonts/`.
- **Checks before a push:** `node build.mjs && node --test tests/*.test.mjs`, and `node scripts/qa.mjs` when layout changes.

## Updating the site for a Nexus release

1. Update `MILESTONES` in `src/content.mjs` (state, commit, items, validation).
2. Add the release to the changelog in `build.mjs` and update affected docs in `src/docs.mjs`.
3. Run the checks, open a pull request, merge to `main`. The Pages workflow deploys.
