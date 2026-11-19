// Master GTA-style multi-panel poster compositor & high-res PNG exporter

import { computeLayoutGeometry } from './layouts.js';
import { getGradeById } from './grades.js';
import { getStylizedImageCanvas, getPosterGrainCanvas } from './art-pipeline.js';
import { renderCoverTypography } from './typography.js';

export function tracePolygon(ctx, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
    else ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

// Compute cover-fit image placement inside a panel's bounding box + focal anchor + user pan/zoom/rotate/flip
export function drawPanelPhoto(ctx, styledCanvas, panelBounds, panelState, photoEntry) {
  const { w, h, cx, cy } = panelBounds;
  const imgW = styledCanvas.width;
  const imgH = styledCanvas.height;

  // Base cover scale fills the panel completely with small extra margin when rotated
  const rotRad = ((panelState.rotation || 0) * Math.PI) / 180;
  const rotMargin = 1 + Math.abs(Math.sin(rotRad)) * 0.42;
  const coverScale = Math.max(w / imgW, h / imgH) * rotMargin;
  const zoom = Math.max(1, Math.min(3.2, panelState.zoom || 1));
  const finalScale = coverScale * zoom;

  const drawW = imgW * finalScale;
  const drawH = imgH * finalScale;

  // Smart focal point keeps faces and subjects centered in any panel aspect ratio,
  // clamped so the photo edges never pull away from the panel border!
  const focalX = photoEntry?.focalX ?? 0.5;
  const focalY = photoEntry?.focalY ?? 0.42;
  const maxShiftX = Math.max(0, (drawW - w) * 0.5);
  const maxShiftY = Math.max(0, (drawH - h) * 0.5);

  const flipSign = panelState.flipH ? -1 : 1;
  const autoOffsetX = Math.max(-maxShiftX, Math.min(maxShiftX, (0.5 - focalX) * drawW * flipSign));
  const autoOffsetY = Math.max(-maxShiftY, Math.min(maxShiftY, (0.5 - focalY) * drawH));

  // User pan values are normalized relative to panel dimensions
  const panPxX = autoOffsetX + (panelState.panX || 0) * w;
  const panPxY = autoOffsetY + (panelState.panY || 0) * h;

  ctx.save();
  ctx.translate(cx + panPxX, cy + panPxY);
  if (rotRad) ctx.rotate(rotRad);
  if (panelState.flipH) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(styledCanvas, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
  ctx.restore();
}

// Render subtle per-panel inner shadow + crisp comic ink border
function drawPanelFrameChrome(ctx, pts, gutterPx, isSelected, showSelection, accentColor) {
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutterPx;
  ctx.strokeStyle = '#08060D';
  ctx.stroke();

  if (showSelection && isSelected) {
    ctx.save();
    tracePolygon(ctx, pts);
    ctx.clip();
    ctx.lineWidth = Math.max(6, gutterPx * 0.72);
    ctx.strokeStyle = accentColor;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// Main render function used for both live preview canvas and full-resolution PNG export
export function renderCoverPoster(canvas, state, photoMap, options = {}) {
  const {
    isExport = false,
    showSelection = !isExport,
  } = options;

  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const base = Math.min(width, height);
  const outerFrame = Math.round(base * 0.022);
  const gutterPx = Math.max(10, Math.round(base * 0.0145));
  const grade = getGradeById(state.gradeId);

  // 1) Matte poster ink base
  ctx.save();
  ctx.fillStyle = '#08060D';
  ctx.fillRect(0, 0, width, height);

  // 2) Compute multi-panel polygon geometry
  const geometries = computeLayoutGeometry(state.layoutId, width, height, outerFrame);

  // 3) Render each stylized photo clipped cleanly to its dynamic angled polygon
  for (let i = 0; i < geometries.length; i++) {
    const geom = geometries[i];
    const pState = state.panels[i] || {
      photoId: null,
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      gradeOverride: '',
    };
    const photoEntry = photoMap.get(pState.photoId) || [...photoMap.values()][0];
    const effectiveGradeId = pState.gradeOverride || state.gradeId;

    ctx.save();
    tracePolygon(ctx, geom.pts);
    ctx.clip();

    if (photoEntry && photoEntry.img) {
      const styled = getStylizedImageCanvas(
        photoEntry,
        effectiveGradeId,
        state.paintStrength,
        state.inkStrength,
        isExport,
      );
      drawPanelPhoto(ctx, styled, geom.bounds, pState, photoEntry);
    } else {
      // Rich dark placeholder gradient if no photo loaded
      const pg = ctx.createLinearGradient(geom.bounds.x, geom.bounds.y, geom.bounds.x + geom.bounds.w, geom.bounds.y + geom.bounds.h);
      pg.addColorStop(0, '#1A1328');
      pg.addColorStop(1, '#2D1430');
      ctx.fillStyle = pg;
      ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h);
    }

    // Subtle per-panel depth vignette around edges so every panel pops like inked box art
    const vRad = Math.max(geom.bounds.w, geom.bounds.h) * 0.72;
    const vg = ctx.createRadialGradient(
      geom.bounds.cx, geom.bounds.cy, vRad * 0.42,
      geom.bounds.cx, geom.bounds.cy, vRad,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(6, 3, 14, 0.34)');
    ctx.fillStyle = vg;
    ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h);
    ctx.restore();
  }

  // 4) Draw crisp heavy matte-black comic gutters + outer frame border
  for (let i = 0; i < geometries.length; i++) {
    drawPanelFrameChrome(
      ctx,
      geometries[i].pts,
      gutterPx,
      i === state.selectedPanel,
      showSelection,
      grade.accentColor,
    );
  }

  // Crisp outer poster matte frame
  ctx.lineWidth = outerFrame * 2;
  ctx.strokeStyle = '#08060D';
  ctx.strokeRect(0, 0, width, height);

  // Subtle hair-thin colored accent inner trim inside the black border (editorial luxury touch)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = Math.max(1.5, base * 0.0016);
  ctx.strokeRect(outerFrame + 1, outerFrame + 1, width - outerFrame * 2 - 2, height - outerFrame * 2 - 2);
  ctx.restore();

  // 5) Unified atmospheric Vice City sunset/neon light-leak cohesion sweep across panels
  ctx.save();
  ctx.beginPath();
  ctx.rect(outerFrame, outerFrame, width - outerFrame * 2, height - outerFrame * 2);
  ctx.clip();

  const leak = ctx.createLinearGradient(0, 0, width, height);
  leak.addColorStop(0, grade.lightLeak[0]);
  leak.addColorStop(0.5, grade.lightLeak[1]);
  leak.addColorStop(1, grade.lightLeak[2]);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.38;
  ctx.fillStyle = leak;
  ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, height - outerFrame * 2);

  // Collector print micro-grain overlay
  const grainCanvas = getPosterGrainCanvas();
  const pattern = ctx.createPattern(grainCanvas, 'repeat');
  if (pattern) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = pattern;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, height - outerFrame * 2);
  }
  ctx.restore();

  // 6) Monumental original GTA-inspired typography, neon script, tagline & corner stamp
  renderCoverTypography(ctx, width, height, outerFrame, state);

  // 7) Preview-only subtle panel number pill on selected panel (placed at lower-left of panel to avoid corner badges!)
  if (showSelection && geometries[state.selectedPanel]) {
    const sel = geometries[state.selectedPanel];
    const pillText = `PANEL ${state.selectedPanel + 1} · ${sel.label.toUpperCase()}`;
    ctx.save();
    const fs = Math.max(12, Math.round(base * 0.016));
    ctx.font = `600 ${fs}px "Barlow", sans-serif`;
    const tw = ctx.measureText(pillText).width;
    const pw = tw + 18;
    const ph = fs + 11;
    const px = Math.min(width - outerFrame - pw - 10, Math.max(outerFrame + 12, sel.bounds.x + 12));
    const py = Math.min(height - outerFrame - ph - 12, Math.max(outerFrame + 12, sel.bounds.y + sel.bounds.h - ph - 12));
    ctx.fillStyle = 'rgba(10, 8, 18, 0.88)';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 5);
    ctx.fill();
    ctx.strokeStyle = grade.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, px + 9, py + ph * 0.52);
    ctx.restore();
  }

  ctx.restore();
  return geometries;
}

// Export full-resolution crisp PNG (1920x1080, 1080x1350, or 1080x1080)
export function renderExportCanvas(state, photoMap, targetW, targetH) {
  const off = document.createElement('canvas');
  off.width = targetW;
  off.height = targetH;
  renderCoverPoster(off, state, photoMap, { isExport: true, showSelection: false });
  return off;
}
