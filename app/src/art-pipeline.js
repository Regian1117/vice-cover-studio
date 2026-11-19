// Client-side Canvas 2D Graphic-Novel / Painterly GTA Illustration Pipeline
// Runs 100% offline to unify tonal exposure across multi-panel covers and convert any photo into key art:
// 1) Edge-preserving bilateral painterly smoothing (flattens photo noise into airbrush planes)
// 2) Unified filmic auto-levels (smooth 2nd-98th percentile stretch + dusk/shadow harmony)
// 3) Soft multi-band cel/gouache tonal quantization
// 4) Smooth skin-hue-protected 3-way split-tone Vice City grading (scaled by gradeStrength)
// 5) Skin-aware Sobel ink contour outlines + optional shadow halftone print dots

import { getGradeById } from './grades.js';

const MAX_CACHE_ENTRIES = 36;
const stylizeCache = new Map();

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
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
export function applyPainterlySmoothing(src, width, height, radius, sigmaColor) {
  const len = width * height * 4;
  const tmp = new Uint8ClampedArray(len);
  const dst = new Uint8ClampedArray(len);
  const invSigma2 = 1 / (2 * sigmaColor * sigmaColor);

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

// Unified filmic auto-levels across panels: normalizes highlights & shadows so bright and night shots harmonize
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
  const low = pLow * 0.68;
  const high = 255 - (255 - pHigh) * 0.72;
  const invRange = 255 / Math.max(52, high - low);
  // Bring bright daytime photos toward golden-hour dusk and lift deep night shadows for panel cohesion
  let duskGamma = 1.0;
  if (medianLum > 122) {
    duskGamma = 1 + Math.min(0.48, ((medianLum - 120) / 135) * 0.72);
  } else if (medianLum < 88) {
    duskGamma = 1 - Math.min(0.18, ((88 - medianLum) / 88) * 0.24);
  }
  const shadowLift = medianLum < 78 ? 0.032 : 0.014;
  return { low, invRange, duskGamma, shadowLift };
}

// Smooth continuous skin-hue protection weight [0..0.72] to protect warm skin & natural undershirt/shirt tones
// while only shifting strong daytime sky/water blues
function computeSkinProtection(r, g, b, luma) {
  if (luma < 0.14 || luma > 0.92) return 0;
  const rg = r - g;
  const rb = r - b;
  if (rg <= 0.008 || rb <= 0.035) return 0;
  const warmthGate = clamp01((rb - 0.035) / 0.11);
  const balanceGate = clamp01((rg - 0.008) / 0.08) * clamp01(1 - Math.max(0, rg - 0.32) / 0.24);
  const lumaGate = clamp01((luma - 0.14) / 0.16) * clamp01((0.94 - luma) / 0.20);
  return 0.72 * warmthGate * balanceGate * lumaGate;
}

// Auto-levels + cel tonal quantization + smooth skin-guarded 3-way grade + Sobel ink + subtle halftone
export function applyViceColorGradeAndInk(
  src,
  painted,
  edges,
  width,
  height,
  gradeId,
  paintStrength,
  inkStrength,
  gradeStrength = 0.86,
  halftoneStrength = 0.24,
  highRes = false,
) {
  const grade = getGradeById(gradeId);
  const out = new Uint8ClampedArray(width * height * 4);
  const [sr, sg, sb] = grade.shadowRgb;
  const [mr, mg, mb] = grade.midRgb;
  const [hr, hg, hb] = grade.highRgb;

  const gradeMix = clamp01(gradeStrength);
  const contrast = 1 + (grade.contrast - 1) * (0.45 + 0.55 * gradeMix);
  const sat = 1 + (grade.saturation - 1) * (0.35 + 0.65 * gradeMix);
  const warm = grade.warmth * gradeMix;
  const expBias = (grade.exposureBias || 0) * gradeMix;

  const { low, invRange, duskGamma, shadowLift } = computeAutoLevelsParams(painted, width, height);
  const paintMix = clamp01(paintStrength);
  const levels = 11.0;
  const posterMix = paintMix * 0.20;
  const inkAlphaMax = clamp01(inkStrength) * 0.74;
  const inkThresholdLow = 44;
  const inkThresholdHigh = 142;
  const htAmt = clamp01(halftoneStrength);
  const htFreq = (Math.PI * 2) / (highRes ? 7.0 : 4.5);
  const cos45 = 0.70710678;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const p = i * 4;

      let r = src[p] * (1 - paintMix) + painted[p] * paintMix;
      let g = src[p + 1] * (1 - paintMix) + painted[p + 1] * paintMix;
      let b = src[p + 2] * (1 - paintMix) + painted[p + 2] * paintMix;

      let nr = clamp01(((r - low) * invRange) / 255);
      let ng = clamp01(((g - low) * invRange) / 255);
      let nb = clamp01(((b - low) * invRange) / 255);

      if (Math.abs(duskGamma - 1.0) > 0.008) {
        nr = Math.pow(nr, duskGamma);
        ng = Math.pow(ng, duskGamma);
        nb = Math.pow(nb, duskGamma);
      }

      nr = clamp01(nr * (1 - shadowLift) + shadowLift + expBias);
      ng = clamp01(ng * (1 - shadowLift) + shadowLift + expBias);
      nb = clamp01(nb * (1 - shadowLift) + shadowLift + expBias);

      // Soft cel/gouache luminance quantization
      const lum0 = nr * 0.299 + ng * 0.587 + nb * 0.114;
      if (posterMix > 0.01 && lum0 > 0.004) {
        const q = Math.round(lum0 * levels) / levels;
        const blendedLum = lum0 * (1 - posterMix) + q * posterMix;
        const ratio = blendedLum / lum0;
        nr = Math.min(1, nr * ratio);
        ng = Math.min(1, ng * ratio);
        nb = Math.min(1, nb * ratio);
      }

      // Punchy filmic S-curve contrast
      nr = clamp01((nr - 0.5) * contrast + 0.5);
      ng = clamp01((ng - 0.5) * contrast + 0.5);
      nb = clamp01((nb - 0.5) * contrast + 0.5);

      // Smooth skin protection + adaptive vibrance
      const luma = nr * 0.299 + ng * 0.587 + nb * 0.114;
      const skinKeep = computeSkinProtection(nr, ng, nb, luma);

      const curSat = Math.max(nr, ng, nb) - Math.min(nr, ng, nb);
      const adaptiveSat = 1 + (sat - 1) * (1 - curSat * 0.42) * (1 - skinKeep * 0.48);
      nr = luma + (nr - luma) * adaptiveSat + warm * 0.22;
      ng = luma + (ng - luma) * adaptiveSat + warm * 0.06;
      nb = luma + (nb - luma) * adaptiveSat - warm * 0.18;

      // Daylight-to-Sunset Harmonizer: converts cool bright midday sky/water blues smoothly into golden-magenta sunset
      // while leaving warm facial skin & neutral whites cleanly guarded
      const blueExcess = clamp01((nb - nr - 0.06) / 0.20);
      const brightGate = clamp01((luma - 0.32) / 0.26);
      const skyShift = blueExcess * brightGate * (1 - skinKeep) * gradeMix * 0.68;
      if (skyShift > 0.005) {
        const targetR = clamp01((mr * 0.52 + hr * 0.48) / 255) * 0.92;
        const targetG = clamp01((mg * 0.52 + hg * 0.48) / 255) * 0.92;
        const targetB = clamp01((mb * 0.52 + hb * 0.48) / 255) * 0.92;
        nr = nr * (1 - skyShift) + targetR * skyShift;
        ng = ng * (1 - skyShift) + targetG * skyShift;
        nb = nb * (1 - skyShift) + targetB * skyShift;
      }

      // 3-way split-tone sunset/neon grade scaled by gradeMix
      const lum = clamp01(nr * 0.299 + ng * 0.587 + nb * 0.114);
      const skinGuard = 1 - skinKeep;
      const shadowW = Math.pow(1 - lum, 2.05) * grade.shadowMix * gradeMix * skinGuard;
      const highW = Math.pow(lum, 1.95) * grade.highMix * gradeMix * (1 - skinKeep * 0.45);
      const midW = Math.sin(lum * Math.PI) * grade.midMix * gradeMix * skinGuard;

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

      // Subtle 45-degree halftone dots strictly in shadows
      if (htAmt > 0.01 && lum < 0.42) {
        const u = (x - y) * cos45;
        const v = (x + y) * cos45;
        const wave = 0.5 * (Math.cos(u * htFreq) * Math.cos(v * htFreq) + 1);
        const shadowBand = Math.pow(1 - lum / 0.42, 1.65);
        const dotMask = wave * shadowBand * (1 - skinKeep * 0.9) * htAmt * 0.34;
        if (dotMask > 0.01) {
          fr = fr * (1 - dotMask) + 14 * dotMask;
          fg = fg * (1 - dotMask) + 8 * dotMask;
          fb = fb * (1 - dotMask) + 24 * dotMask;
        }
      }

      // Skin-aware Sobel ink contour accent
      if (inkAlphaMax > 0.01) {
        const mag = edges[i];
        if (mag > inkThresholdLow) {
          const t = Math.min(1, (mag - inkThresholdLow) / (inkThresholdHigh - inkThresholdLow));
          const inkAmt = t * t * inkAlphaMax * (1 - skinKeep * 0.52);
          fr = fr * (1 - inkAmt) + 14 * inkAmt;
          fg = fg * (1 - inkAmt) + 7 * inkAmt;
          fb = fb * (1 - inkAmt) + 24 * inkAmt;
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

// Run complete Painterly + Sobel Ink + Vice Grade pipeline into an LRU cached offscreen canvas
export function runPainterlySobelInkPipeline(
  imageEntry,
  gradeId,
  paintStrength,
  inkStrength,
  gradeStrength = 0.86,
  halftoneStrength = 0.24,
  highRes = false,
) {
  const qPaint = Math.round(paintStrength * 20) / 20;
  const qInk = Math.round(inkStrength * 20) / 20;
  const qGrade = Math.round((gradeStrength ?? 0.86) * 20) / 20;
  const qHt = Math.round((halftoneStrength ?? 0.24) * 20) / 20;
  const maxDim = highRes ? 1080 : 620;
  const cacheKey = `${imageEntry.id}|${gradeId}|${qPaint}|${qInk}|${qGrade}|${qHt}|${maxDim}`;

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

  const radius = highRes ? 4 : 3;
  const painted = qPaint > 0.02
    ? applyPainterlySmoothing(src, w, h, radius, 34)
    : src;

  const edges = qInk > 0.02
    ? computeSobelEdges(painted, w, h)
    : new Float32Array(w * h);

  const graded = applyViceColorGradeAndInk(
    src,
    painted,
    edges,
    w,
    h,
    gradeId,
    qPaint,
    qInk,
    qGrade,
    qHt,
    highRes,
  );
  imgData.data.set(graded);
  wctx.putImageData(imgData, 0, 0);

  const grade = getGradeById(gradeId);
  const bloomCanvas = makeOffscreen(Math.max(32, Math.round(w * 0.25)), Math.max(32, Math.round(h * 0.25)));
  const bctx = bloomCanvas.getContext('2d');
  bctx.filter = 'brightness(1.22) contrast(1.72) blur(6px)';
  bctx.drawImage(workCanvas, 0, 0, bloomCanvas.width, bloomCanvas.height);

  wctx.save();
  wctx.globalCompositeOperation = 'screen';
  wctx.globalAlpha = 0.22 * (0.4 + 0.6 * qGrade);
  wctx.drawImage(bloomCanvas, 0, 0, w, h);
  wctx.fillStyle = grade.bloomColor;
  wctx.globalAlpha = 0.16 * qGrade;
  wctx.fillRect(0, 0, w, h);
  wctx.restore();

  if (stylizeCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = stylizeCache.keys().next().value;
    stylizeCache.delete(oldestKey);
  }
  stylizeCache.set(cacheKey, workCanvas);
  return workCanvas;
}

export const getStylizedImageCanvas = runPainterlySobelInkPipeline;

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
    data.data[i + 3] = 24;
  }
  ctx.putImageData(data, 0, 0);
  cachedGrainPattern = c;
  return c;
}
