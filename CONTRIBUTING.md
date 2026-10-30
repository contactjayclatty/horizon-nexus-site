# Contributing

This repository is the **Horizon Nexus website** only. Nexus engine code is not here, and Horizon engine development happens upstream at [horizon-rust/horizon](https://github.com/horizon-rust/horizon) under its own rules. Please do not send engine changes here, and do not open website issues upstream.

## Working on the site

Requirements: Node 22 or newer. There are no packages to install.

```sh
node build.mjs                 # build dist/ with base /horizon-nexus-site/
node serve.mjs                 # http://localhost:4321/horizon-nexus-site/
node --test tests/*.test.mjs   # links, metadata, honesty, secrets, contrast
```

Optional, for art and browser QA (needs Playwright installed on your machine; it is not a site dependency):

```sh
node scripts/art.mjs     # pixel art into public/media (the build also does this)
node scripts/raster.mjs  # favicon PNGs and og.png (run after a build)
node scripts/qa.mjs      # screenshots at 390/768/1440/1920 into qa/screenshots, overflow and keyboard checks
```

## What a good change looks like

- Claims about Nexus match `src/content.mjs`, and new claims come from the maintainer.
- Visuals follow `docs/design/horizon-reference.md`: square panels, outline, bevel and lip, Pixelify Sans headings, Geist text.
- Accessible: keyboard works, focus is visible, contrast passes, reduced motion is respected.
- All checks pass.

Read `AGENTS.md` for roles and ownership. Open a pull request against `main`; merging deploys to GitHub Pages.
