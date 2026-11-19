// Master GTA-style multi-panel poster compositor & full-res PNG exporter
// Draws high-contrast Cream / White / Black comic gutters, unified atmospheric glaze,
// optional per-panel episodic location/time stamps, and delegates AAA cover typography & footer.

import { computeLayoutGeometry } from './layouts.js';
import { getGradeById, getBorderStyleById } from './grades.js';
import { runPainterlySobelInkPipeline, getPosterGrainCanvas } from './art-pipeline.js';
import { renderCoverTypographyAndBadges } from './typography.js';

export function tracePolygon(ctx, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
    else ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

export function drawPanelPhoto(ctx, styledCanvas, panelBounds, panelState, photoEntry) {
  const { w, h, cx, cy } = panelBounds;
  const imgW = styledCanvas.width;
  const imgH = styledCanvas.height;

  const rotRad = ((panelState.rotation || 0) * Math.PI) / 180;
  const rotMargin = 1 + Math.abs(Math.sin(rotRad)) * 0.42;
  const coverScale = Math.max(w / imgW, h / imgH) * rotMargin;
  const zoom = Math.max(1, Math.min(3.2, panelState.zoom || 1));
  const finalScale = coverScale * zoom;

  const drawW = imgW * finalScale;
  const drawH = imgH * finalScale;

  const focalX = photoEntry?.focalX ?? 0.5;
  const focalY = photoEntry?.focalY ?? 0.44;
  const maxShiftX = Math.max(0, (drawW - w) * 0.5);
  const maxShiftY = Math.max(0, (drawH - h) * 0.5);

  const flipSign = panelState.flipH ? -1 : 1;
  const autoOffsetX = Math.max(-maxShiftX, Math.min(maxShiftX, (0.5 - focalX) * drawW * flipSign));
  const autoOffsetY = Math.max(-maxShiftY, Math.min(maxShiftY, (0.5 - focalY) * drawH));

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

// High-contrast Cream / White / Black comic border & keyline chrome around every panel
function drawPanelBorderChrome(ctx, pts, gutterPx, borderStyle, isSelected, showSelection, accentColor, base) {
  const keylinePx = Math.max(2, Math.min(3.6, base * 0.0024));

  // 1) Crisp inner keyline inside the clipped panel so bright sunset skies never wash out white/cream borders
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.clip();
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutterPx + keylinePx * 2;
  ctx.strokeStyle = borderStyle.innerKeyline;
  ctx.stroke();

  if (showSelection && isSelected) {
    ctx.lineWidth = gutterPx + keylinePx * 2 + Math.max(6, gutterPx * 0.52);
    ctx.strokeStyle = accentColor;
    ctx.stroke();
  }

  // Seal clipped edge cleanly in the chosen border color
  ctx.lineWidth = gutterPx;
  ctx.strokeStyle = borderStyle.color;
  ctx.stroke();
  ctx.restore();

  // 2) Full-width bold comic gutter across the diagonal seam
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutterPx;
  ctx.strokeStyle = borderStyle.color;
  ctx.stroke();
  ctx.restore();
}

function edgeXAtY(pA, pB, y) {
  const dy = pB[1] - pA[1];
  if (Math.abs(dy) < 1e-4) return Math.max(pA[0], pB[0]);
  const t = Math.max(0, Math.min(1, (y - pA[1]) / dy));
  return pA[0] + (pB[0] - pA[0]) * t;
}

function edgeYAtX(pA, pB, x) {
  const dx = pB[0] - pA[0];
  if (Math.abs(dx) < 1e-4) return pA[1];
  const t = Math.max(0, Math.min(1, (x - pA[0]) / dx));
  return pA[1] + (pB[1] - pA[1]) * t;
}

// Optional non-colliding episodic Location & Time Stamp chip inside a slanted polygon panel
function drawPanelLocationStamp(ctx, geom, stampText, outerFrame, topReservePx, panelBottomY, width, base, gutterPx, accentColor, isTopBanner) {
  const clean = (stampText || '').trim().toUpperCase();
  if (!clean || geom.bounds.w < base * 0.14 || geom.bounds.h < base * 0.11) return;

  const fontSize = Math.max(11, Math.min(20, Math.round(base * 0.0145)));
  ctx.save();
  tracePolygon(ctx, geom.pts);
  ctx.clip();

  ctx.font = `700 ${fontSize}px "Bebas Neue", sans-serif`;
  const textW = ctx.measureText(clean).width;
  const barW = Math.max(3, Math.round(fontSize * 0.24));
  const padX = Math.round(fontSize * 0.52);
  const padY = Math.round(fontSize * 0.28);
  const boxW = Math.min(geom.bounds.w - 32, barW + textW + padX * 2.2);
  const boxH = fontSize + padY * 1.9;
  const edgePad = Math.round(gutterPx * 0.65 + base * 0.011);

  const [p0, p1, p2, p3] = geom.pts;
  const nearTopLeft = geom.bounds.x < outerFrame + base * 0.22 && geom.bounds.y < outerFrame + topReservePx + base * 0.14;
  const nearTopRight = geom.bounds.x + geom.bounds.w > width - outerFrame - base * 0.28 && geom.bounds.y < outerFrame + topReservePx + base * 0.14;
  const nearBottomSeam = geom.bounds.y + geom.bounds.h > panelBottomY - base * 0.05;

  const useTopCorner = nearBottomSeam && !nearTopLeft && !nearTopRight;
  let sx = p0[0] + edgePad;
  let sy = useTopCorner ? p0[1] + edgePad : p3[1] - boxH - edgePad;

  // Two-pass exact slanted-polygon edge clearance solver
  for (let pass = 0; pass < 2; pass++) {
    if (useTopCorner) {
      const topSafe = Math.max(edgeYAtX(p0, p1, sx), edgeYAtX(p0, p1, sx + boxW));
      sy = topSafe + edgePad;
    } else {
      const botSafe = Math.min(edgeYAtX(p3, p2, sx), edgeYAtX(p3, p2, sx + boxW));
      sy = botSafe - boxH - edgePad;
    }
    const leftSafe = Math.max(edgeXAtY(p0, p3, sy), edgeXAtY(p0, p3, sy + boxH));
    const rightSafe = Math.min(edgeXAtY(p1, p2, sy), edgeXAtY(p1, p2, sy + boxH));
    sx = Math.min(Math.max(leftSafe + edgePad, sx), rightSafe - boxW - edgePad);
  }

  // Slight angled tag silhouette
  ctx.fillStyle = 'rgba(10, 7, 18, 0.84)';
  ctx.beginPath();
  ctx.roundRect(sx, sy, boxW, boxH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 248, 236, 0.26)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.fillRect(sx + 1, sy + 1, barW, boxH - 2);

  ctx.fillStyle = '#FAF5FF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, sx + barW + padX * 0.9, sy + boxH * 0.54, boxW - barW - padX * 1.4);
  ctx.restore();
}

export function composeMultiPanelCover(canvas, state, photoMap, options = {}) {
  const {
    isExport = false,
    showSelection = !isExport,
  } = options;

  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const base = Math.min(width, height);
  const aspect = width / height;

  const outerFrame = Math.round(base * 0.020);
  const gutterPx = Math.max(12, Math.round(base * 0.0175));
  const grade = getGradeById(state.gradeId);
  const borderStyle = getBorderStyleById(state.borderStyle || 'cream');
  const pos = state.titlePosition || 'overlay-bottom';

  const showFooter = state.showFooterStrip !== false;
  const footerH = showFooter ? Math.round(height * (aspect > 1.25 ? 0.072 : aspect < 0.9 ? 0.062 : 0.068)) : 0;

  // In full-bleed 'overlay-bottom' default, panels span 100% down to the thin palm footer (no blank band!).
  const dockedTitleH = pos === 'docked-bottom'
    ? Math.round(height * (aspect > 1.25 ? 0.215 : aspect < 0.9 ? 0.205 : 0.215))
    : 0;
  const topReservePx = pos === 'top-banner'
    ? Math.round(height * (aspect > 1.25 ? 0.19 : 0.17))
    : 0;
  const bottomReservePx = footerH + dockedTitleH;

  // 1) Base background in chosen poster border tone
  ctx.save();
  ctx.fillStyle = borderStyle.color;
  ctx.fillRect(0, 0, width, height);

  // Dark stage behind mosaic area
  const mosaicTop = outerFrame + topReservePx;
  const mosaicBottom = height - outerFrame - bottomReservePx;
  ctx.fillStyle = '#090612';
  ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, Math.max(120, mosaicBottom - mosaicTop));

  // 2) Compute multi-panel polygon geometry
  const geometries = computeLayoutGeometry(state.layoutId, width, height, outerFrame, topReservePx, bottomReservePx);

  // 3) Render each stylized photo clipped cleanly to its angled panel polygon
  for (let i = 0; i < geometries.length; i++) {
    const geom = geometries[i];
    const pState = state.panels[i] || {
      photoId: null,
      zoom: 1.05,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      gradeOverride: '',
      stamp: '',
    };
    const photoEntry = photoMap.get(pState.photoId) || [...photoMap.values()][0];
    const effectiveGradeId = pState.gradeOverride || state.gradeId;

    ctx.save();
    tracePolygon(ctx, geom.pts);
    ctx.clip();

    if (photoEntry && photoEntry.img) {
      const styled = runPainterlySobelInkPipeline(
        photoEntry,
        effectiveGradeId,
        state.paintStrength ?? 0.72,
        state.inkStrength ?? 0.58,
        state.gradeStrength ?? 0.86,
        state.halftoneStrength ?? 0.24,
        isExport,
      );
      drawPanelPhoto(ctx, styled, geom.bounds, pState, photoEntry);
    } else {
      const pg = ctx.createLinearGradient(
        geom.bounds.x, geom.bounds.y,
        geom.bounds.x + geom.bounds.w, geom.bounds.y + geom.bounds.h,
      );
      pg.addColorStop(0, '#1B1136');
      pg.addColorStop(1, '#36133B');
      ctx.fillStyle = pg;
      ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h);
    }

    // Gentle edge vignette inside each panel for graphic-novel ink depth
    const vRad = Math.max(geom.bounds.w, geom.bounds.h) * 0.76;
    const vg = ctx.createRadialGradient(
      geom.bounds.cx, geom.bounds.cy, vRad * 0.45,
      geom.bounds.cx, geom.bounds.cy, vRad,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8, 4, 18, 0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h);
    ctx.restore();

    // Optional episodic location/time stamps (clipped cleanly inside panel)
    if (state.showLocationStamps) {
      const stampText = pState.stamp !== undefined && pState.stamp !== ''
        ? pState.stamp
        : (photoEntry?.defaultStamp || '');
      if (stampText) {
        drawPanelLocationStamp(
          ctx,
          geom,
          stampText,
          outerFrame,
          topReservePx,
          mosaicBottom,
          width,
          base,
          gutterPx,
          grade.accentColor,
          pos === 'top-banner',
        );
      }
    }
  }

  // 4) Unified atmospheric Vice City light-leak glaze + print micro-grain across all panels
  const panelAreaH = mosaicBottom - mosaicTop;
  ctx.save();
  ctx.beginPath();
  ctx.rect(outerFrame, mosaicTop, width - outerFrame * 2, panelAreaH);
  ctx.clip();

  const leak = ctx.createLinearGradient(0, mosaicTop, width, mosaicBottom);
  leak.addColorStop(0, grade.lightLeak[0]);
  leak.addColorStop(0.5, grade.lightLeak[1]);
  leak.addColorStop(1, grade.lightLeak[2]);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.28 * (state.gradeStrength ?? 0.86);
  ctx.fillStyle = leak;
  ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, panelAreaH);

  const grainCanvas = getPosterGrainCanvas();
  const pattern = ctx.createPattern(grainCanvas, 'repeat');
  if (pattern) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = pattern;
    ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, panelAreaH);
  }
  ctx.restore();

  // 5) Draw high-contrast Cream/White/Black panel borders & keylines
  for (let i = 0; i < geometries.length; i++) {
    drawPanelBorderChrome(
      ctx,
      geometries[i].pts,
      gutterPx,
      borderStyle,
      i === state.selectedPanel,
      showSelection,
      grade.accentColor,
      base,
    );
  }

  // 6) Crisp outer border frame + thin dark collector edge line
  ctx.save();
  ctx.lineWidth = outerFrame * 2;
  ctx.strokeStyle = borderStyle.color;
  ctx.strokeRect(0, 0, width, height);

  ctx.strokeStyle = borderStyle.outerKeyline;
  ctx.lineWidth = Math.max(2, Math.round(base * 0.0024));
  ctx.strokeRect(outerFrame + 0.5, outerFrame + 0.5, width - outerFrame * 2 - 1, height - outerFrame * 2 - 1);
  ctx.restore();

  // 7) Giant 3D Typography + Neon Script + Press Quote + Large Gold Sunburst + Clean Badge + Footer
  renderCoverTypographyAndBadges(
    ctx,
    width,
    height,
    outerFrame,
    state,
    geometries,
    footerH,
    dockedTitleH,
    topReservePx,
    gutterPx,
  );

  ctx.restore();
  return geometries;
}

export const renderCoverPoster = composeMultiPanelCover;

export function renderExportCanvas(state, photoMap, targetW, targetH) {
  const off = document.createElement('canvas');
  off.width = targetW;
  off.height = targetH;
  composeMultiPanelCover(off, state, photoMap, { isExport: true, showSelection: false });
  return off;
}
