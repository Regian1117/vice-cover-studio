// Client-side Canvas 2D Graphic-Novel / Painterly GTA Illustration Pipeline
// Transforms any user photograph into illustrated Vice City cover art offline:
// 1) Edge-preserving bilateral painterly smoothing (flattens photo noise into airbrush planes)
// 2) Auto-levels (2nd-98th percentile contrast stretch) + dusk exposure pull for bright daylight photos
// 3) Soft multi-band cel/gouache tonal quantization (preserves flattering skin & detail)
// 4) Split-tone Vice City 3-way color grading with natural skin-hue protection
// 5) Sobel ink-contour edge accent + optional shadow halftone print dots
// 6) Specular warm highlight bloom + subtle collector-print micro-grain

import { getGradeById } from './grades.js';

const MAX_CACHE_ENTRIES = 28;
const stylizeCache = new Map();

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function makeOffscreen(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function clearArtCache() {
  stylizeCache.clear();
}

// Fast 2-pass edge-preserving bilateral approximation on RGB buffer.
// Preserves crisp edges (eyes, hair, car contours, palm fronds) while turning flat skin/sky/asphalt
// into smooth airbrushed brush planes characteristic of GTA cover illustrations.
export function applyPainterlySmoothing(src, width, height, radius, sigmaColor) {
  const len = width * height * 4;
  const tmp = new Uint8ClampedArray(len);
  const dst = new Uint8ClampedArray(len);
  const invSigma2 = 1 / (2 * sigmaColor * sigmaColor);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const rowOff = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOff + x * 4;
      const r0 = src[idx], g0 = src[idx + 1], b0 = src[idx + 2];
      let sr = r0, sg = g0, sb = b0, sw = 1.0;

      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0) continue;
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const nIdx = rowOff + nx * 4;
        const dr = src[nIdx] - r0;
        const dg = src[nIdx + 1] - g0;
        const db = src[nIdx + 2] - b0;
        const dist2 = dr * dr + dg * dg + db * db;
        const w = Math.exp(-dist2 * invSigma2);
        sr += src[nIdx] * w;
        sg += src[nIdx + 1] * w;
        sb += src[nIdx + 2] * w;
        sw += w;
      }
      tmp[idx] = sr / sw;
      tmp[idx + 1] = sg / sw;
      tmp[idx + 2] = sb / sw;
      tmp[idx + 3] = 255;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r0 = tmp[idx], g0 = tmp[idx + 1], b0 = tmp[idx + 2];
      let sr = r0, sg = g0, sb = b0, sw = 1.0;

      for (let dy = -radius; dy <= radius; dy++) {
        if (dy === 0) continue;
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const nIdx = (ny * width + x) * 4;
        const dr = tmp[nIdx] - r0;
        const dg = tmp[nIdx + 1] - g0;
        const db = tmp[nIdx + 2] - b0;
        const dist2 = dr * dr + dg * dg + db * db;
        const w = Math.exp(-dist2 * invSigma2);
        sr += tmp[nIdx] * w;
        sg += tmp[nIdx + 1] * w;
        sb += tmp[nIdx + 2] * w;
        sw += w;
      }
      dst[idx] = sr / sw;
      dst[idx + 1] = sg / sw;
      dst[idx + 2] = sb / sw;
      dst[idx + 3] = 255;
    }
  }
  return dst;
}

// Compute Sobel gradient magnitude on luminance for crisp illustrated ink edge accents
export function computeSobelEdges(buf, width, height) {
  const lum = new Float32Array(width * height);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    lum[i] = buf[p] * 0.299 + buf[p + 1] * 0.587 + buf[p + 2] * 0.114;
  }
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width - 1; x++) {
      const i = row + x;
      const tl = lum[i - width - 1], t = lum[i - width], tr = lum[i - width + 1];
      const l = lum[i - 1], r = lum[i + 1];
      const bl = lum[i + width - 1], b = lum[i + width], br = lum[i + width + 1];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      edges[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

// 2nd–98th percentile luminance histogram stretch + gentle dusk pull for bright daylight shots
export function computeAutoLevelsParams(buf, width, height) {
  const hist = new Uint32Array(256);
  const total = width * height;
  for (let i = 0, p = 0; i < total; i++, p += 4) {
    const y = Math.round(buf[p] * 0.299 + buf[p + 1] * 0.587 + buf[p + 2] * 0.114);
    hist[y < 0 ? 0 : y > 255 ? 255 : y] += 1;
  }
  const loTarget = total * 0.02;
  const medTarget = total * 0.50;
  const hiTarget = total * 0.98;
  let acc = 0;
  let pLow = 0;
  let medianLum = 128;
  let pHigh = 255;
  let gotLo = false;
  let gotMed = false;
  for (let bin = 0; bin < 256; bin++) {
    acc += hist[bin];
    if (!gotLo && acc >= loTarget) { pLow = bin; gotLo = true; }
    if (!gotMed && acc >= medTarget) { medianLum = bin; gotMed = true; }
    if (acc >= hiTarget) { pHigh = bin; break; }
  }
  const low = pLow * 0.72;
  const high = 255 - (255 - pHigh) * 0.72;
  const invRange = 255 / Math.max(48, high - low);
  const duskGamma = medianLum > 128
    ? 1 + Math.min(0.42, ((medianLum - 124) / 131) * 0.65)
    : 1.0;
  return { low, invRange, duskGamma };
}

// Auto-levels + soft-knee posterization + split-tone Vice City grade + ink contour + shadow halftone
export function applyViceColorGradeAndInk(
  src,
  painted,
  edges,
  width,
  height,
  gradeId,
  paintStrength,
  inkStrength,
  halftoneStrength = 0.32,
  highRes = false,
) {
  const grade = getGradeById(gradeId);
  const out = new Uint8ClampedArray(width * height * 4);
  const [sr, sg, sb] = grade.shadowRgb;
  const [mr, mg, mb] = grade.midRgb;
  const [hr, hg, hb] = grade.highRgb;
  const contrast = grade.contrast;
  const sat = grade.saturation;
  const warm = grade.warmth;
  const expBias = grade.exposureBias || 0;

  const { low, invRange, duskGamma } = computeAutoLevelsParams(painted, width, height);
  const paintMix = Math.max(0, Math.min(1, paintStrength));
  const posterMix = paintMix * 0.34;
  const levels = 7.5;
  const inkAlphaMax = Math.max(0, Math.min(1, inkStrength)) * 0.78;
  const inkThresholdLow = 42;
  const inkThresholdHigh = 138;
  const htAmt = Math.max(0, Math.min(1, halftoneStrength));
  const htFreq = (Math.PI * 2) / (highRes ? 7.0 : 4.5);
  const cos45 = 0.70710678;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const p = i * 4;

      // 1) Mix painterly plane with micro-detail from original
      let r = src[p] * (1 - paintMix) + painted[p] * paintMix;
      let g = src[p + 1] * (1 - paintMix) + painted[p + 1] * paintMix;
      let b = src[p + 2] * (1 - paintMix) + painted[p + 2] * paintMix;

      // 2) Auto-levels stretch (2%-98%) + dusk gamma + grade exposure bias
      let nr = ((r - low) * invRange) / 255;
      let ng = ((g - low) * invRange) / 255;
      let nb = ((b - low) * invRange) / 255;
      nr = nr < 0 ? 0 : nr > 1 ? 1 : nr;
      ng = ng < 0 ? 0 : ng > 1 ? 1 : ng;
      nb = nb < 0 ? 0 : nb > 1 ? 1 : nb;
      if (duskGamma > 1.005) {
        nr = Math.pow(nr, duskGamma);
        ng = Math.pow(ng, duskGamma);
        nb = Math.pow(nb, duskGamma);
      }
      if (expBias !== 0) {
        nr = Math.max(0, Math.min(1, nr + expBias));
        ng = Math.max(0, Math.min(1, ng + expBias));
        nb = Math.max(0, Math.min(1, nb + expBias));
      }

      // 3) Soft tonal cel-shading / gouache quantization on luminance
      const lum0 = nr * 0.299 + ng * 0.587 + nb * 0.114;
      if (posterMix > 0.01 && lum0 > 0.004) {
        const q = Math.round(lum0 * levels) / levels;
        const blendedLum = lum0 * (1 - posterMix) + q * posterMix;
        const ratio = blendedLum / lum0;
        nr = Math.min(1, nr * ratio);
        ng = Math.min(1, ng * ratio);
        nb = Math.min(1, nb * ratio);
      }

      // 4) Punchy S-curve contrast
      nr = (nr - 0.5) * contrast + 0.5;
      ng = (ng - 0.5) * contrast + 0.5;
      nb = (nb - 0.5) * contrast + 0.5;
      nr = nr < 0 ? 0 : nr > 1 ? 1 : nr;
      ng = ng < 0 ? 0 : ng > 1 ? 1 : ng;
      nb = nb < 0 ? 0 : nb > 1 ? 1 : nb;

      // 5) Vibrance / Saturation + skin-hue guard
      const luma = nr * 0.299 + ng * 0.587 + nb * 0.114;
      const skinKeep =
        nr > ng && ng > nb && (nr - nb) > 0.08 && nr > 0.26 && luma > 0.22 && luma < 0.86
          ? 0.35
          : 0.0;

      const maxC = Math.max(nr, ng, nb);
      const minC = Math.min(nr, ng, nb);
      const curSat = maxC - minC;
      const adaptiveSat = 1 + (sat - 1) * (1 - curSat * 0.42);
      nr = luma + (nr - luma) * adaptiveSat + warm * 0.22;
      ng = luma + (ng - luma) * adaptiveSat + warm * 0.06;
      nb = luma + (nb - luma) * adaptiveSat - warm * 0.18;

      // 6) 3-way Split-Tone Vice City Color Grade (shadows, midtones, highlights)
      const lum = Math.max(0, Math.min(1, nr * 0.299 + ng * 0.587 + nb * 0.114));
      const skinGuard = 1 - skinKeep;
      const shadowW = Math.pow(1 - lum, 2.1) * grade.shadowMix * skinGuard;
      const highW = Math.pow(lum, 2.0) * grade.highMix * (1 - skinKeep * 0.5);
      const midW = Math.sin(lum * Math.PI) * grade.midMix * skinGuard;

      let fr = nr * 255;
      let fg = ng * 255;
      let fb = nb * 255;

      fr = fr * (1 - shadowW) + sr * shadowW;
      fg = fg * (1 - shadowW) + sg * shadowW;
      fb = fb * (1 - shadowW) + sb * shadowW;

      fr = fr * (1 - midW) + mr * midW;
      fg = fg * (1 - midW) + mg * midW;
      fb = fb * (1 - midW) + mb * midW;

      fr = fr * (1 - highW) + hr * highW;
      fg = fg * (1 - highW) + hg * highW;
      fb = fb * (1 - highW) + hb * highW;

      // 7) Subtle 45-degree Halftone Print dots strictly in deep shadows (never smudges skin)
      if (htAmt > 0.01 && lum < 0.45) {
        const u = (x - y) * cos45;
        const v = (x + y) * cos45;
        const wave = 0.5 * (Math.cos(u * htFreq) * Math.cos(v * htFreq) + 1);
        const shadowBand = Math.pow(1 - lum / 0.45, 1.6);
        const dotMask = wave * shadowBand * (1 - skinKeep * 0.8) * htAmt * 0.38;
        if (dotMask > 0.01) {
          fr = fr * (1 - dotMask) + 13 * dotMask;
          fg = fg * (1 - dotMask) + 7 * dotMask;
          fb = fb * (1 - dotMask) + 22 * dotMask;
        }
      }

      // 8) Crisp Ink Contour Edge Accent (dark indigo-obsidian linework)
      if (inkAlphaMax > 0.01) {
        const mag = edges[i];
        if (mag > inkThresholdLow) {
          const t = Math.min(1, (mag - inkThresholdLow) / (inkThresholdHigh - inkThresholdLow));
          const inkAmt = t * t * inkAlphaMax;
          fr = fr * (1 - inkAmt) + 14 * inkAmt;
          fg = fg * (1 - inkAmt) + 6 * inkAmt;
          fb = fb * (1 - inkAmt) + 22 * inkAmt;
        }
      }

      out[p] = clamp255(fr);
      out[p + 1] = clamp255(fg);
      out[p + 2] = clamp255(fb);
      out[p + 3] = 255;
    }
  }
  return out;
}

// Stylize a source image into a cached offscreen canvas ready for 60fps panel compositing
export function getStylizedImageCanvas(
  imageEntry,
  gradeId,
  paintStrength,
  inkStrength,
  halftoneStrength = 0.32,
  highRes = false,
) {
  const qPaint = Math.round(paintStrength * 20) / 20;
  const qInk = Math.round(inkStrength * 20) / 20;
  const qHt = Math.round((halftoneStrength ?? 0.32) * 20) / 20;
  const maxDim = highRes ? 1040 : 620;
  const cacheKey = `${imageEntry.id}|${gradeId}|${qPaint}|${qInk}|${qHt}|${maxDim}`;

  if (stylizeCache.has(cacheKey)) {
    const cached = stylizeCache.get(cacheKey);
    stylizeCache.delete(cacheKey);
    stylizeCache.set(cacheKey, cached);
    return cached;
  }

  const img = imageEntry.img;
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(natW, natH));
  const w = Math.max(64, Math.round(natW * scale));
  const h = Math.max(64, Math.round(natH * scale));

  const workCanvas = makeOffscreen(w, h);
  const wctx = workCanvas.getContext('2d', { willReadFrequently: true });
  wctx.drawImage(img, 0, 0, w, h);

  const imgData = wctx.getImageData(0, 0, w, h);
  const src = imgData.data;

  // Painterly bilateral pass (radius scales with resolution)
  const radius = highRes ? 4 : 3;
  const painted = qPaint > 0.02
    ? applyPainterlySmoothing(src, w, h, radius, 34)
    : src;

  // Sobel edge contours computed on the smooth painterly buffer so noise never turns into speckles!
  const edges = qInk > 0.02
    ? computeSobelEdges(painted, w, h)
    : new Float32Array(w * h);

  const graded = applyViceColorGradeAndInk(src, painted, edges, w, h, gradeId, qPaint, qInk, qHt, highRes);
  imgData.data.set(graded);
  wctx.putImageData(imgData, 0, 0);

  // Subtle specular highlight bloom (warm screen-blended soft glow)
  const grade = getGradeById(gradeId);
  const bloomCanvas = makeOffscreen(Math.max(32, Math.round(w * 0.25)), Math.max(32, Math.round(h * 0.25)));
  const bctx = bloomCanvas.getContext('2d');
  bctx.filter = 'brightness(1.25) contrast(1.8) blur(6px)';
  bctx.drawImage(workCanvas, 0, 0, bloomCanvas.width, bloomCanvas.height);

  wctx.save();
  wctx.globalCompositeOperation = 'screen';
  wctx.globalAlpha = 0.24;
  wctx.drawImage(bloomCanvas, 0, 0, w, h);
  wctx.fillStyle = grade.bloomColor;
  wctx.globalAlpha = 0.16;
  wctx.fillRect(0, 0, w, h);
  wctx.restore();

  if (stylizeCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = stylizeCache.keys().next().value;
    stylizeCache.delete(oldestKey);
  }
  stylizeCache.set(cacheKey, workCanvas);
  return workCanvas;
}

// Reusable deterministic fine print grain + halftone pattern for final poster polish
let cachedGrainPattern = null;
export function getPosterGrainCanvas() {
  if (cachedGrainPattern) return cachedGrainPattern;
  const size = 180;
  const c = makeOffscreen(size, size);
  const ctx = c.getContext('2d');
  const data = ctx.createImageData(size, size);
  let seed = 13374209;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = (seed >>> 24) & 255;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 28;
  }
  ctx.putImageData(data, 0, 0);
  cachedGrainPattern = c;
  return c;
}
