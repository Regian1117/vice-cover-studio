# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio v4.2** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel cover art — featuring the fiery golden-hour `Sunset Gold` (`vice-sunset-gold`) grade, deep gouache cel + Sobel ink poster shader, genuine offline Canvas 2D face-aware smart auto-crop (`FACE AUTO-CROP: ON`), sculpted 23-step plum-to-obsidian metallic specular 3D titles with clean footer clearance, `7-Panel Center Hero` among 8 angled comic grids, 3D elevated hero card pop-out, `ORIGINAL ARTWORK` gold sunburst seal, crisp 1-line coastal barcode footer, and a High-OCR Bright-Pill 2-zone studio editor with 1-click and batch PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **Fiery Sunset-Punch Grade & Illustrated Poster Shader**: Upgraded `Sunset Gold` (`vice-sunset-gold`) grade plus `Midnight Neon`, `Golden Heatwave`, `Tropical Cyan`, `Synth Chrome`, and `Crimson Dusk` with 7.5-band gouache cel quantization, skin-protected Sobel ink contours, and 23-step metallic specular 3D titles with clean coastal footer clearance.
- **Offline Face-Aware Auto-Crop (`detectSubjectFocusAnchor`)**: Deterministic 64×64 Canvas 2D skin-hue + upper-third edge-salience heatmap automatically centers single-photo (`1 PHOTO → 5 PANELS`) and multi-photo (`MULTI-PHOTO CREW`) crops around faces while keeping full drag-pan, wheel-zoom, and `ZOOM` / `PAN X` / `PAN Y` control.
- **8 Multi-Panel Layouts + 3D Elevated Hero Card**: `7-Panel Center Hero`, `6-Panel Hero Slant`, `6-Panel Vertical Poster`, `9-Panel Collector Grid`, `5-Panel Classic Box`, `5-Panel Action Slash`, `4-Panel Heist Quad`, and `3-Panel Hero Triptych` with recessed cut-paper inner shadows and Twilight Gold dividers.
- **Ultra-Legible 2-Zone Studio Editor & 100% Offline Export**: High-contrast topbar (`1920 × 1080`, `1080 × 1350`, `1080 × 1080`, `EXPORT PNG`), live preview stage with `EXPORT ALL 3 SIZES`, and 4-card numbered workflow inspector (`1. ADD YOUR PHOTOS`, `2. CROP & POSITION`, `3. EDIT CAPTION`, `4. LAYOUTS & GRADES`) plus pop-over Advanced Studio controls.

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
