# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel GTA 6 / Vice City cover art — complete with client-side Canvas 2D painterly shading, crisp Sobel ink contours, 5 Vice City color grades, 5 slanted comic-panel layouts (3-panel to 6-panel), bold 3D extruded display lettering with overlapping neon brush script, editable corner stamp badges, and 1-click lossless PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **Client-side Graphic-Novel Art Pipeline**: Edge-preserving bilateral painterly smoothing, soft cel-tonal quantization, 3-way split-tone Vice City grading (`Miami Sunset`, `Neon Vice Night`, `Tropical Heat`, `Ocean Chrome`, `Vice Noir`), Sobel ink contour outlines, warm specular bloom, and print micro-grain — running 100% offline in pure Canvas 2D ES modules.
- **Any Photo, Instant Framing**: Upload 1 photo to smart auto-fill every panel with distinct crops, or upload multiple photos / drag-and-drop directly onto individual panels. Click to select, drag to pan, scroll to zoom, rotate, flip horizontally, swap panels, override per-panel grades, or reset crops.
- **Original Bundled SIL OFL Lettering**: Self-hosted `Anton`, `Yellowtail`, `Bebas Neue`, and `Barlow` fonts under `app/fonts/` with live editable title, neon script overlay, tagline, corner badge, title placement, and 5-star Heat meter. Zero Rockstar logos, artwork, or commercial fonts.
- **Fast 1-Click PNG Export**: Instant live preview, 4 one-click studio presets, and lossless PNG export at `1920×1080` (16:9), `1080×1350` (4:5), and `1080×1080` (1:1).

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
