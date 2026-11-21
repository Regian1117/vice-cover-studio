# vice-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Regian1117/vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio v5.0** is a 100% offline, zero-build static web app that turns any of your own photos into illustrated multi-panel cover art — featuring the `8-Panel Grand Coast` chevron montage (`grand-coast-8`), deep GTA cel-shaded gouache + Sobel ink poster shader with dark-corner sunset rim rescue, genuine offline Canvas 2D face-aware smart auto-crop (`FACE AUTO-CROP: ON`), 3D elevated hero card pop-out breaking into a deep horizon crest stage, sculpted 23-step metallic specular 3D titles with 4 lens sparkles, live `#2EE8FF` interactive canvas crop reticle, High-OCR Bright-Pill caption inputs, `ORIGINAL ARTWORK` gold sunburst seal, crisp 1-line coastal barcode footer, and 1-click / batch PNG export in `1920×1080`, `1080×1350`, and `1080×1080`.

### Highlights
- **True GTA Cel-Shaded Gouache & Dark-Corner Rim Rescue**: Deep 6-band cel/gouache quantization (`posterMix = paintMix * 0.60`), tightened Sobel ink contours (`26..90`), wide bilateral smoothing planes (`radius = 4`, `sigmaColor = 46`), and dark-scene auto-levels rim rescue (`medianLum < 98` gamma + `0.066` shadow lift) across `Sunset Gold`, `Miami Sunset`, `Midnight Neon`, `Golden Heatwave`, `Tropical Cyan`, `Synth Chrome`, and `Crimson Dusk`.
- **9 Multi-Panel Layouts + Hero Stage Break-Out**: New flagship `8-Panel Grand Coast` (`8P Coast`) chevron diagonal grid joins `7P Hero`, `6P Slant`, `6P Poster`, `9P Grid`, `5P Classic`, `5P Slash`, `4P Quad`, and `3P Triptych` — with a 3D elevated hero card pop-out (`popPx`) that breaks cleanly across the horizon stage seam below the 3D title.
- **Offline Face-Aware Auto-Crop + Live Crop Reticle**: Deterministic 64×64 Canvas 2D YCbCr skin-hue + edge-salience heatmap (`detectSubjectFocusAnchor`) anchors both multi-photo crew fills and bright cohesive `1 PHOTO → 5 PANELS` crops, paired with an interactive `#2EE8FF` corner-bracket + center crosshair + `ZOOM× CROP` reticle in the live editor preview.
- **High-OCR 2-Zone Studio Editor & 100% Offline Export**: High-contrast topbar (`1920×1080`, `1080×1350`, `1080×1080`, `EXPORT PNG`), live preview stage with `EXPORT ALL 3 SIZES`, bright `#F4F0FF` / `#080514` caption pills, and 4-card numbered workflow inspector (`1. ADD YOUR PHOTOS`, `2. CROP & POSITION`, `3. EDIT CAPTION`, `4. LAYOUTS & GRADES`) plus pop-over Full Studio Controls.

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
