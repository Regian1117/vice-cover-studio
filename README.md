# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio v3** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel cover art — complete with 8 angled multi-panel layouts (3-panel up to 9-panel collector grids), a high-contrast Twilight Gold (`#0F0918` + crisp `#F5E6C8` dividers) default frame alongside Cream / White / Black gutters, client-side Painterly + Sobel ink contours + comic halftone grain with cross-panel sunset & night harmonization, 6 unified color grades, monumental -2.5° layered striped retro-chrome 3D titles with lens-gleam stars and neon brush script, a clean Top Press Header Bar, 2-word Character Role Tags, an optional Horizon Palm Band, tagline pill, large gold `ORIGINAL COVER ART` sunburst seal, palm-sunset-barcode footer, undo/redo, and 1-click or batch PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **8 Multi-Panel Comic Layouts + Twilight Gold Frame**: `6-Panel Hero Slant`, `6-Panel Vertical Poster`, `9-Panel Collector Grid`, `7-Panel Magazine`, `5-Panel Classic Box`, `5-Panel Action Slash`, `4-Panel Heist Quad`, and `3-Panel Hero Triptych` with selectable Twilight Gold, Cream (`#F6F1E7`), White, or Black angled dividers.
- **Unified Painterly + Sobel Ink + Halftone Pipeline**: Bilateral airbrush smoothing, unified filmic auto-levels, daylight-to-sunset & warm-to-neon cross-panel harmonization with skin-tone protection, 45° shadow halftone grain, 6 split-tone grades (`Sunset Gold`, `Midnight Neon`, `Golden Heatwave`, `Tropical Cyan`, `Synth Chrome`, `Crimson Dusk`), and crisp ink contour lines — running 100% offline in Canvas 2D ES modules.
- **Any Photo, Full Framing & Character Role Control**: Upload your own photos (or start with 8 bundled samples including casual user portraits like `pier-candid.jpg`) to auto-fill every panel; drag-to-pan directly on the canvas, scroll-to-zoom, adjust Zoom / Pos X / Pos Y / Rotate / Flip / Swap, customize 2-word Character Role Tags (plus optional Location Stamps off by default), and undo/redo every edit.
- **Layered Striped Retro-Chrome Typography**: Self-hosted SIL OFL `Anton`, `Yellowtail`, `Bebas Neue`, and `Barlow` fonts under `app/fonts/` with full-bleed overlay or Horizon Palm Band placement, top 5-star press quote header bar + corner pill (`VOL. 06` / `NOIR CUT`), 4-point gleam stars, tagline pill, gold sunburst seal, and full palm + retro-sun + billing-credits + barcode footer.
- **Fast Export in All 3 Post Sizes**: Instant `Export PNG` and `Export All 3 Sizes` (`1920×1080`, `1080×1350`, `1080×1080`).

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
