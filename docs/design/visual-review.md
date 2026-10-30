# Visual review: Nexus vs Horizon

Screenshots were taken with headless Chrome (Playwright) by `scripts/qa.mjs` at 390, 768, 1440 and 1920 px and compared with playhorizon.dev captured the same way. Screenshots are kept out of git (`qa/screenshots/`).

| Area | Horizon reference | Nexus result | Verdict |
|---|---|---|---|
| Typography | Pixelify Sans 600/700 headings and buttons, Geist body, Geist Mono kicker and indices | Same fonts, weights and roles; ligatures off | Match |
| Buttons | 2 px outline, 2 px bevel, 4 px lip, 1 px press | Same construction; blue face | Match |
| Panels | Square, outline, bevel and lip, raised hover | Same; adds a darker title strip (panel-head) modelled on the launcher's sections | Match, small extension |
| Navigation | Sticky side-colour bar, pixel links, raised + 3 px underline on current, phone menu of panels | Same pattern; hamburger below 1180 px | Match |
| Pixel art | Code-drawn sunset scene with sliced sun, stone tile | Code-drawn night scene with sliced moon and block portal, stone tile in Nexus blue | Match in treatment, original content |
| Shadows and borders | No soft shadows; inset bevels only | Same; one 4 px hard shadow under the nav | Match |
| Spacing | 4 to 96 px scale, 64 px gutter on wide screens, 16 px on phones | Same scale, fluid gutter 16 to 64 px | Match |
| Launcher feel | Numbered rows, segmented control, version selector, Play button | Homepage state panel and Downloads page use all four | Match |

Fixes made during review:
- The hero headline wrapped into four lines at 1440 px; widened its measure from 13 to 17 characters.
- The brief's primary blue #287be4 gives white text 4.2:1; the button face uses #1f6ad0 (5.2:1). #287be4 is kept as a decorative accent (progress bars, portal).

Not reviewed: a light theme (Nexus is dark only by design) and real launcher screens beyond the Play-page screenshot.
