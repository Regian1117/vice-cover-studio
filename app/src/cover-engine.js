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

// High-contrast Twilight-Gold / Cream / White / Black comic border & keyline chrome around every panel
function drawPanelBorderChrome(ctx, pts, gutterPx, dividerPx, borderStyle, isSelected, showSelection, accentColor, base) {
  const keylinePx = Math.max(2, Math.min(3.4, base * 0.0024));

  // 1) Crisp inner keyline inside the clipped panel
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.clip();
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutterPx + keylinePx * 2;
  ctx.strokeStyle = borderStyle.innerKeyline;
  ctx.stroke();

  if (showSelection && isSelected) {
    ctx.lineWidth = gutterPx + keylinePx * 2 + Math.max(6, gutterPx * 0.65);
    ctx.strokeStyle = accentColor;
    ctx.stroke();
  }

  // Seal clipped edge cleanly in the chosen border color
  ctx.lineWidth = gutterPx;
  ctx.strokeStyle = borderStyle.color;
  ctx.stroke();
  ctx.restore();

  // 2) Full-width seam across the diagonal divider + razor-sharp gold hairline if Twilight Gold
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutterPx;
  ctx.strokeStyle = borderStyle.color;
  ctx.stroke();
  if (borderStyle.thinDivider && borderStyle.dividerColor) {
    ctx.lineWidth = dividerPx;
    ctx.strokeStyle = borderStyle.dividerColor;
    ctx.stroke();
  }
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

// Punchy 2-word Character Role Tag plaque inside each panel, never colliding with giant title or face
function drawPanelRoleTag(ctx, geom, roleText, mosaicTop, titleSafeTopY, base, gutterPx, accentColor, isHeroTall) {
  const clean = (roleText || '').trim().toUpperCase();
  if (!clean || geom.bounds.w < base * 0.13 || geom.bounds.h < base * 0.10) return;

  const fontSize = Math.max(15, Math.min(26, Math.round(base * 0.0215)));
  ctx.save();
  tracePolygon(ctx, geom.pts);
  ctx.clip();

  ctx.font = `700 ${fontSize}px "Bebas Neue", sans-serif`;
  const padX = Math.round(fontSize * 0.48);
  const barW = Math.max(4, Math.round(fontSize * 0.22));
  const textW = ctx.measureText(clean).width;
  const maxBoxW = geom.bounds.w - 24;
  const boxW = Math.min(maxBoxW, barW + textW + padX * 2.1);
  const boxH = Math.round(fontSize * 1.44);
  const edgePad = Math.round(gutterPx * 0.72 + base * 0.008);

  const [p0, p1, p2, p3] = geom.pts;
  const overlapsTitle = geom.bounds.y + geom.bounds.h > titleSafeTopY - edgePad * 0.5;
  const isLowerPanel = geom.bounds.y > mosaicTop + base * 0.14;
  const useTopCorner = overlapsTitle && isLowerPanel && !isHeroTall;

  let tx = p0[0] + edgePad;
  let ty;
  if (useTopCorner) {
    ty = p0[1] + edgePad;
  } else {
    const targetBot = overlapsTitle ? Math.max(geom.bounds.y + boxH + edgePad * 2, titleSafeTopY - edgePad) : p3[1] - edgePad;
    ty = targetBot - boxH;
  }

  for (let pass = 0; pass < 2; pass++) {
    if (useTopCorner) {
      const topSafe = Math.max(edgeYAtX(p0, p1, tx), edgeYAtX(p0, p1, tx + boxW));
      ty = topSafe + edgePad;
    } else {
      const botPolySafe = Math.min(edgeYAtX(p3, p2, tx), edgeYAtX(p3, p2, tx + boxW)) - edgePad;
      const clampedBot = overlapsTitle ? Math.min(botPolySafe, titleSafeTopY - edgePad) : botPolySafe;
      ty = clampedBot - boxH;
    }
    const leftSafe = Math.max(edgeXAtY(p0, p3, ty), edgeXAtY(p0, p3, ty + boxH));
    const rightSafe = Math.min(edgeXAtY(p1, p2, ty), edgeXAtY(p1, p2, ty + boxH));
    tx = Math.min(Math.max(leftSafe + edgePad, tx), rightSafe - boxW - edgePad);
  }

  // Crisp hard shadow + deep twilight backdrop + champagne-gold border
  ctx.fillStyle = 'rgba(5, 2, 12, 0.78)';
  ctx.fillRect(tx + 2.5, ty + 3, boxW, boxH);

  ctx.fillStyle = 'rgba(11, 7, 20, 0.92)';
  ctx.fillRect(tx, ty, boxW, boxH);
  ctx.lineWidth = Math.max(1.4, base * 0.0014);
  ctx.strokeStyle = 'rgba(245, 230, 200, 0.86)';
  ctx.strokeRect(tx, ty, boxW, boxH);

  ctx.fillStyle = accentColor;
  ctx.fillRect(tx + 1, ty + 1, barW, boxH - 2);

  ctx.fillStyle = '#FFFBF2';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, tx + barW + padX * 0.9, ty + boxH * 0.54, boxW - barW - padX * 1.4);
  ctx.restore();
}

// Optional non-colliding episodic Location & Time Stamp chip inside a slanted polygon panel
function drawPanelLocationStamp(ctx, geom, stampText, outerFrame, topReservePx, panelBottomY, width, base, gutterPx, accentColor, hasRoleTag) {
  const clean = (stampText || '').trim().toUpperCase();
  if (!clean || geom.bounds.w < base * 0.14 || geom.bounds.h < base * 0.11) return;

  const fontSize = Math.max(11, Math.min(18, Math.round(base * 0.0135)));
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
  const edgePad = Math.round(gutterPx * 0.72 + base * 0.009);

  const [p0, p1, p2, p3] = geom.pts;
  let sx = hasRoleTag ? p1[0] - boxW - edgePad : p0[0] + edgePad;
  let sy = p0[1] + edgePad;

  for (let pass = 0; pass < 2; pass++) {
    const topSafe = Math.max(edgeYAtX(p0, p1, sx), edgeYAtX(p0, p1, sx + boxW));
    sy = topSafe + edgePad;
    const leftSafe = Math.max(edgeXAtY(p0, p3, sy), edgeXAtY(p0, p3, sy + boxH));
    const rightSafe = Math.min(edgeXAtY(p1, p2, sy), edgeXAtY(p1, p2, sy + boxH));
    sx = Math.min(Math.max(leftSafe + edgePad, sx), rightSafe - boxW - edgePad);
  }

  ctx.fillStyle = 'rgba(10, 7, 18, 0.84)';
  ctx.beginPath();
  ctx.roundRect(sx, sy, boxW, boxH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 248, 236, 0.28)';
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

  const grade = getGradeById(state.gradeId);
  const borderStyle = getBorderStyleById(state.borderStyle || 'twilight-gold');
  const outerFrame = Math.round(base * (borderStyle.thinDivider ? 0.016 : 0.020));
  const gutterPx = borderStyle.thinDivider
    ? Math.max(9, Math.round(base * 0.011))
    : Math.max(12, Math.round(base * 0.0175));
  const dividerPx = borderStyle.thinDivider ? Math.max(3, Math.round(base * 0.0036)) : 0;
  const pos = state.titlePosition || 'overlay-bottom';

  const hasTopHeader = state.showPressQuote !== false && Boolean((state.pressQuote || '').trim());
  const topHeaderH = hasTopHeader
    ? Math.round(height * (aspect > 1.25 ? 0.048 : aspect < 0.9 ? 0.039 : 0.046))
    : 0;

  const showFooter = state.showFooterStrip !== false;
  const footerH = showFooter ? Math.round(height * (aspect > 1.25 ? 0.068 : aspect < 0.9 ? 0.056 : 0.064)) : 0;

  const horizonBandH = pos === 'horizon-band'
    ? Math.round(height * (aspect > 1.25 ? 0.25 : aspect < 0.9 ? 0.22 : 0.245))
    : 0;
  const dockedTitleH = pos === 'docked-bottom'
    ? Math.round(height * (aspect > 1.25 ? 0.215 : aspect < 0.9 ? 0.205 : 0.215))
    : 0;
  const topBannerH = pos === 'top-banner'
    ? Math.round(height * (aspect > 1.25 ? 0.19 : 0.17))
    : 0;
  const topReservePx = topHeaderH + topBannerH;
  const bottomReservePx = footerH + dockedTitleH + horizonBandH;

  // 1) Base background in chosen poster border tone (#0F0918 Twilight Gold by default)
  ctx.save();
  ctx.fillStyle = borderStyle.color;
  ctx.fillRect(0, 0, width, height);

  // Dark stage behind mosaic area
  const mosaicTop = outerFrame + topReservePx;
  const mosaicBottom = height - outerFrame - bottomReservePx;
  ctx.fillStyle = borderStyle.frameInner || '#090612';
  ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, Math.max(120, mosaicBottom - mosaicTop));

  // 2) Compute multi-panel polygon geometry
  const geometries = computeLayoutGeometry(state.layoutId, width, height, outerFrame, topReservePx, bottomReservePx);
  const titleSafeTopY = (pos === 'overlay-bottom' || pos === 'bottom-left')
    ? mosaicBottom - Math.round(base * (aspect > 1.25 ? 0.275 : aspect < 0.9 ? 0.22 : 0.24))
    : mosaicBottom;

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
      role: '',
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
        state.gradeStrength ?? 0.92,
        state.halftoneStrength ?? 0.34,
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

    // Deep atmospheric vignette + subtle warm/neon rim-tint glaze per panel
    const vRad = Math.max(geom.bounds.w, geom.bounds.h) * 0.72;
    const vg = ctx.createRadialGradient(
      geom.bounds.cx, geom.bounds.cy, vRad * 0.34,
      geom.bounds.cx, geom.bounds.cy, vRad,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, grade.vignetteRim || 'rgba(10, 5, 22, 0.46)');
    ctx.fillStyle = vg;
    ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h);

    if (grade.rimGlow) {
      const rg = ctx.createLinearGradient(0, geom.bounds.y, 0, geom.bounds.y + geom.bounds.h * 0.42);
      rg.addColorStop(0, grade.rimGlow);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = rg;
      ctx.fillRect(geom.bounds.x, geom.bounds.y, geom.bounds.w, geom.bounds.h * 0.42);
    }
    ctx.restore();

    // 2-word Character Role Tag plaque (ON by default)
    const showRoleTags = state.showRoleTags !== false;
    if (showRoleTags) {
      const roleText = pState.role !== undefined && pState.role !== ''
        ? pState.role
        : (photoEntry?.defaultRole || '');
      if (roleText) {
        const isHeroTall = geom.bounds.h > (mosaicBottom - mosaicTop) * 0.72;
        drawPanelRoleTag(
          ctx,
          geom,
          roleText,
          mosaicTop,
          titleSafeTopY,
          base,
          gutterPx,
          grade.accentColor,
          isHeroTall,
        );
      }
    }

    // Optional episodic location/time stamps (OFF by default)
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
          showRoleTags,
        );
      }
    }
  }

  // 4) Unified atmospheric light-leak glaze + comic print micro-grain across all panels
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
  ctx.globalAlpha = 0.24 * (state.gradeStrength ?? 0.92);
  ctx.fillStyle = leak;
  ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, panelAreaH);

  const grainCanvas = getPosterGrainCanvas();
  const pattern = ctx.createPattern(grainCanvas, 'repeat');
  if (pattern) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = pattern;
    ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, panelAreaH);
  }
  ctx.restore();

  // 5) Draw Twilight-Gold / Cream / White / Black panel dividers
  for (let i = 0; i < geometries.length; i++) {
    drawPanelBorderChrome(
      ctx,
      geometries[i].pts,
      gutterPx,
      dividerPx,
      borderStyle,
      i === state.selectedPanel,
      showSelection,
      grade.accentColor,
      base,
    );
  }

  // 6) Outer frame + razor-sharp champagne-gold / collector edge border
  ctx.save();
  ctx.lineWidth = outerFrame * 2;
  ctx.strokeStyle = borderStyle.color;
  ctx.strokeRect(0, 0, width, height);

  ctx.strokeStyle = borderStyle.outerKeyline;
  ctx.lineWidth = borderStyle.thinDivider ? dividerPx : Math.max(2, Math.round(base * 0.0024));
  ctx.strokeRect(outerFrame + 0.5, outerFrame + 0.5, width - outerFrame * 2 - 1, height - outerFrame * 2 - 1);
  ctx.restore();

  // 7) Top Press Header + Horizon Skyline Band + Striped Retro-Chrome 3D Title + Stars + Tagline Pill + Seal + Footer
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
    topHeaderH,
    horizonBandH,
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
