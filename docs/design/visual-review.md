# Visual review: Nexus v2 vs Horizon

Screenshots: `node scripts/qa.mjs` (Playwright, headless Chrome) at 360, 390, 768, 1024, 1440 and 1920 px, compared with playhorizon.dev captured the same way. Kept out of git in `qa/screenshots/`.

| Area | Horizon reference | Nexus v2 | Verdict |
|---|---|---|---|
| Typography | Pixelify Sans headings and controls, Geist body, Geist Mono kickers | Same fonts and roles | Match |
| Buttons | 2 px outline, 2 px bevel, 4 px lip, sink on press | Same, plus a 1 px hover lift | Match |
| Panels | Square, outlined, bevel and lip | Same; launcher window bar on key panels | Match, extended |
| Navigation | Side-colour bar, pixel tabs, current tab highlighted | Tabs in a sunk well; current tab uses the blue face | Match in construction |
| Pixel art | Code-drawn landscape, stone tile | Code-drawn night scene with portal, stone tile, 16 pixel icons | Original, same technique |
| Launcher feel | Numbered rows, version selector, Play button, segmented control | Milestone track, window bars, version selector, disabled download | Match |
| Spacing | 4 to 96 px scale | Same tokens | Match |

Fixes made during review: GitHub nav button misaligned (class clash with a panel), wrapped diagram rows started with a stray connector, duplicated version labels on the roadmap, Framework pillar badge changed from "Completed" to "Core completed".

Not reviewed: a light theme (Nexus is dark only by design); real launcher screens beyond the one Play-page screenshot.
