# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio v2** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel GTA 6 / Vice City cover art — complete with 8 angled multi-panel layouts (3-panel up to 9-panel collector grids), Cream / White / Black comic gutters, client-side Painterly + Sobel ink contours, 6 unified Vice City color grades, bold -2.5° 3D extruded titles with neon brush script, 5-star press review bar, large gold `ORIGINAL COVER ART` sunburst seal, per-panel location stamps, cinematic palm-skyline-barcode footer, undo/redo, and 1-click or batch PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **8 Multi-Panel Comic Layouts + Crisp Borders**: `6-Panel Hero Slant`, `6-Panel Vertical Poster`, `9-Panel Collector Grid`, `7-Panel Magazine`, `5-Panel Classic Box`, `5-Panel Action Slash`, `4-Panel Heist Quad`, and `3-Panel Hero Triptych` with selectable Cream (`#F6F1E7`), White, or Black diagonal gutters.
- **Unified Painterly + Sobel Ink Pipeline**: Bilateral airbrush smoothing, unified filmic auto-levels across all panels, natural skin-tone protection, 6 split-tone grades (`Vice Sunset`, `Midnight Neon`, `Golden Heatwave`, `Tropical Cyan`, `Synth Chrome`, `Vice Noir`), and crisp ink contour lines — running 100% offline in Canvas 2D ES modules.
- **Any Photo, Full Framing Control**: Upload multiple photos or drop 1 photo to smart auto-fill every panel; drag-to-pan directly on the canvas, scroll-to-zoom, adjust Zoom / Pos X / Pos Y / Rotate / Flip / Swap, customize per-panel location stamps, and undo/redo every edit.
- **Original SIL OFL Box-Art Typography**: Self-hosted `Anton`, `Yellowtail`, `Bebas Neue`, and `Barlow` fonts under `app/fonts/` with dedicated title stage band (zero panel obstruction), 5-star press quote pill, gold sunburst seal, `HEAT ★★★★★`, `VOL. 06`, `COLLECTOR'S EDITION`, and full palm + retro-sun + billing-credits + barcode footer.
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
