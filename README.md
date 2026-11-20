# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio v4** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel cover art — featuring the new `7-Panel Center Hero` layout among 8 angled comic grids, 3D elevated hero card pop-out with cut-paper gutter depth and metallic champagne-gold / icy-cyan rim keylines, edge-clamped smart 1-photo multi-crop auto-fill (`FULL SHOT`, `CLOSE-UP`, `WIDE ANGLE`, `DETAIL CROP`, `PROFILE`), client-side Painterly + Sobel ink contours + comic halftone grain, 6 unified color grades, monumental -2.5° layered retro-chrome 3D titles with `COMING SOON` + `VOL. 06` press header pills, gold `ORIGINAL COVER ART` sunburst seal, crisp palm-sunset-barcode footer, undo/redo, and 1-click or batch PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **8 Multi-Panel Comic Layouts + 3D Elevated Hero Card**: `7-Panel Center Hero`, `6-Panel Hero Slant`, `6-Panel Vertical Poster`, `9-Panel Collector Grid`, `5-Panel Classic Box`, `5-Panel Action Slash`, `4-Panel Heist Quad`, and `3-Panel Hero Triptych` with recessed cut-paper inner shadows, deep hero card drop shadow, and Twilight Gold (`#0F0918` + `#F5E6C8`), Cream, White, or Black gutters.
- **Smart 1-Photo Multi-Panel Auto-Fill (`1 Photo → All`)**: Drop a single photo to automatically frame 5+ distinct edge-clamped crops with varied zoom, focal targets, tilt, optional horizontal mirror, per-panel contrasting grades, and crisp photographic role labels.
- **Unified Painterly + Sobel Ink + Halftone Pipeline**: Bilateral airbrush smoothing, unified filmic auto-levels, daylight-to-sunset & warm-to-neon cross-panel harmonization with skin-tone protection, 45° shadow halftone grain, 6 split-tone grades (`Sunset Gold`, `Midnight Neon`, `Golden Heatwave`, `Tropical Cyan`, `Synth Chrome`, `Crimson Dusk`), and crisp ink contour lines — running 100% offline in Canvas 2D ES modules.
- **High-Clarity 2-Zone Studio Workspace & Offline Export**: ~62% bright-contrast live preview stage on the left paired with a ~38% scrollable inspector sidebar (`+ Add Photos`, 4×2 photo tray, 8-tile SVG layout grid, 6 color-grade swatch cards, live Title & Neon Script inputs, panel Zoom slider, plus collapsible Advanced Framing & Art Engine drawers) and instant `Export PNG` + `Export All 3 Sizes` (`1920×1080`, `1080×1350`, `1080×1080`).

## Run it

```sh
node serve.ts
```

Open `http://localhost:8080` in desktop Chrome.

To package the deterministic submission dossier locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=5cmgsxgg&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
