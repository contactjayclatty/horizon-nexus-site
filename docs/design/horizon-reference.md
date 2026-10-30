# Horizon design reference audit

What was actually inspected on 2026-10-30 (AWST) before designing Nexus, and what was carried over. Nothing below is guessed from file names alone.

## Sources inspected

| Source | How | Revision |
|---|---|---|
| https://playhorizon.dev/ | Fetched the page text, and rendered it in headless Chrome (Playwright) at 390, 768, 1440 and 1920 px in the dark scheme, plus /docs/ at 1440 px | live on 2026-10-30 |
| github.com/horizon-rust/horizon-site | `git clone --depth 1`; read README.md, src/style.css (the "Blocks" section), src/index.html, scripts/art.mjs, scripts/shots.mjs, the public/fonts and public/media listings | 4c4e290 |
| github.com/horizon-rust/horizon | `git clone --depth 1`; read crates/horizon-theme/tokens.css, the BLOCKS_DARK and TILE_* constants in crates/horizon-theme/src/lib.rs, docs/design-system.md, the launcher/src listing, README.md | bf6c0b8 |
| github.com/horizon-rust/horizon-mods | `git clone --depth 1`; read README.md (for .hmod and .hnmod wording) | 678eb2d |
| Launcher look | Viewed horizon-site's public/media/launcher-800.webp (a launcher screenshot on the site). The launcher was not run. | 4c4e290 |

Not inspected: the launcher binary itself, its Versions, Mods and Settings screens live (only the one Play-page screenshot), and any Nexus source (none is public).

## What Horizon's design actually does

- **Two layers.** docs/design-system.md describes a restrained, type-led base (Geist, lists not cards, one accent, quiet motion). The website adds a "Blocks" layer on top (style.css, section "Blocks: the launcher's look on the page"): Pixelify Sans for headings and controls, square panels with a 2 px dark outline, a 2 px light bevel on top and a 4 px darker lip below, a violet "face" for the main action, sunk wells, a stone texture and a pixel landscape.
- **Tokens.** tokens.css is generated from crates/horizon-theme. Blocks dark palette: page #0f0d17, side #0b0a11, panel #1a1727, raised #221e34, button #2b2641, button-bevel #3d3560, well #0c0b12, bevel #342d52, lip #07060b, outline #05040a, face #5b3fd6 / bevel #8a74ff / lip #3a2694. Shape: --block-outline 2px, --block-bevel 2px, --block-lip 4px, radii forced to 0. Type scale, 4 to 96 px spacing scale and motion tokens (quick 150 ms, move 240 ms, enter 600 ms, stagger 40 ms, eased out) are in the same file.
- **Fonts.** Geist 400/500/600 and Geist Mono 400, Pixelify Sans 500/600/700, all bundled as woff2 under the SIL OFL (licence files in public/fonts). Common ligatures are turned off because Pixelify's "fi" renders wrongly.
- **Stone.** A 64-texel tile of the page colour in five close shades (lib.rs TILE_SHADES = [0, 2, -2, 5, -4]) with darker flecks, drawn by a seeded xorshift RNG, shown at 4 px per texel with image-rendering: pixelated, fixed behind the page.
- **Landscape.** A 240x72 texel scene drawn in code: banded sky with dithered band edges, a sun cut into horizontal slices, flat clouds, three ridges of hills and square trees. The hero lays a left-to-right veil of the page colour over it so the text keeps contrast.
- **Buttons.** Outline + bevel + lip as inset shadows; pressed state moves down 1 px and swaps to a lip-only shadow. Primary uses the face colours.
- **Navigation.** Sticky bar in the side colour with an outline below; links in Pixelify Sans; the current page gets the raised colour and a 3 px accent underline. Phones get a full-screen menu of stacked panels.
- **Lists.** Numbered rows (mono index "01", a large pixel name, a mono detail at the right) as stacked outlined panels. The launcher's Play page uses the same row pattern (Resources, Minecraft folder, Playing as), a Client/Server segmented control, a version selector and a Play button.
- **Badges.** Small square uppercase tags with an outline, tinted by state.
- **Footer.** Side colour, outline on top, a giant faint pixel wordmark.
- **Notice.** "Unofficial. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft."

## Carried into Nexus

| Horizon | Nexus |
|---|---|
| Token names and roles (page, side, panel, raised, button, well, bevel, lip, outline, face) | Same names in src/tokens.css, recoloured midnight blue (page #080f1d, panel #142840, raised #1c3552, well #0a1829, border #365f8e) |
| Violet face #5b3fd6 | Blue face #1f6ad0 (darkened from the brief's #287be4 so white text passes 4.5:1), bevel #4c9af0, lip #123f80 |
| 2/2/4 px outline, bevel, lip; zero radii | Unchanged |
| Pixelify Sans headings and controls, Geist text, Geist Mono indices | Unchanged; the same OFL font files |
| Stone tile algorithm | Re-implemented (scripts/art.mjs) with the Nexus page colour |
| Sunset landscape with sliced sun | Night landscape with a sliced moon, stars and a block portal with a banded blue core |
| Numbered launcher rows, segmented Client/Server, version selector, Play button | The homepage "development state" panel and the Downloads page |
| Sticky nav, accent underline, phone menu of panels | Unchanged pattern |
| Giant footer wordmark, non-affiliation notice | "NEXUS" wordmark; notice extended to say Nexus is not endorsed by upstream Horizon |
| Motion: 600 ms fade and 8 px rise, 40 ms stagger, reduced-motion off | Unchanged |

No Horizon images, screenshots or code were copied into this repository. The fonts are redistributed under their OFL licences.
