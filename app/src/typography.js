// Original Poster Typography Engine (v3):
// - Top Cinematic Press Header Bar (5-star press quote left + VOL. 06 / NOIR CUT badge right)
// - Optional Horizon Palm & Sunset Band behind center/bottom title
// - Monumental Striped Retro-Chrome 3D Extruded Title (-2.5 deg) with specular bevel & lens-gleam stars
// - Glowing Neon Brush Script subtitle + swooshes beneath right of title
// - Crisp Tagline Pill & large gold "ORIGINAL COVER ART" sunburst seal
// - Sleek coastal palm silhouette footer bar with billing-block credits & barcode (zero trademark terms)

import { getGradeById, getBorderStyleById } from './grades.js';

function drawTextTracked(ctx, text, x, y, tracking, mode) {
  if (!tracking) {
    if (mode === 'stroke') ctx.strokeText(text, x, y);
    else ctx.fillText(text, x, y);
    return;
  }
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let cursorX = x;
  if (ctx.textAlign === 'center') cursorX = x - totalWidth / 2;
  else if (ctx.textAlign === 'right') cursorX = x - totalWidth;

  const savedAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (let i = 0; i < chars.length; i++) {
    if (mode === 'stroke') ctx.strokeText(chars[i], cursorX, y);
    else ctx.fillText(chars[i], cursorX, y);
    cursorX += widths[i] + tracking;
  }
  ctx.textAlign = savedAlign;
}

function measureTextTracked(ctx, text, tracking) {
  const chars = [...text];
  const base = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
  return base + tracking * Math.max(0, chars.length - 1);
}

function drawPalmSilhouette(ctx, baseX, baseY, heightPx, leanPx, scaleX) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scaleX, 1);

  const topX = leanPx;
  const topY = -heightPx;
  const trunkBaseW = Math.max(2.2, heightPx * 0.09);
  const trunkTopW = Math.max(1.2, heightPx * 0.036);

  ctx.fillStyle = '#090510';
  ctx.beginPath();
  ctx.moveTo(-trunkBaseW, 0);
  ctx.quadraticCurveTo(leanPx * 0.35 - trunkTopW, -heightPx * 0.55, topX - trunkTopW, topY);
  ctx.lineTo(topX + trunkTopW, topY);
  ctx.quadraticCurveTo(leanPx * 0.35 + trunkTopW * 1.4, -heightPx * 0.55, trunkBaseW, 0);
  ctx.closePath();
  ctx.fill();

  const fronds = [
    [-0.96, -0.22, 0.72],
    [-0.78, 0.24, 0.80],
    [-0.36, -0.56, 0.62],
    [0.42, -0.54, 0.64],
    [0.86, -0.18, 0.78],
    [0.74, 0.28, 0.74],
  ];
  for (const [dx, dy, lenFactor] of fronds) {
    const fLen = heightPx * lenFactor;
    const ex = topX + dx * fLen;
    const ey = topY + dy * fLen;
    const cx1 = topX + dx * fLen * 0.45;
    const cy1 = topY - fLen * 0.28 + dy * fLen * 0.2;
    const cy2 = topY - fLen * 0.08 + dy * fLen * 0.35;

    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx1, cy1, ex, ey);
    ctx.quadraticCurveTo(cx1, cy2, topX, topY + 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function traceSlantedPill(ctx, x, y, w, h, skew) {
  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - skew, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

// Top Cinematic Press Header Bar (clean edge-to-edge header clear of all photos)
export function renderTopPressHeaderBar(ctx, width, outerFrame, topHeaderH, state, grade, borderStyle) {
  if (!topHeaderH || topHeaderH <= 0) return;

  const hx = outerFrame;
  const hy = outerFrame;
  const hw = width - outerFrame * 2;
  const hh = topHeaderH;
  const divColor = borderStyle.thinDivider && borderStyle.dividerColor ? borderStyle.dividerColor : borderStyle.color;
  const divH = Math.max(2.5, Math.round(hh * 0.065));

  ctx.save();
  const bg = ctx.createLinearGradient(hx, hy, hx + hw, hy);
  bg.addColorStop(0, '#0D0817');
  bg.addColorStop(0.48, '#1B0F30');
  bg.addColorStop(1, '#0D0817');
  ctx.fillStyle = bg;
  ctx.fillRect(hx, hy, hw, hh);

  // Subtle top highlight glow + crisp bottom gold/cream divider line
  ctx.fillStyle = 'rgba(255, 240, 214, 0.08)';
  ctx.fillRect(hx, hy, hw, 1.5);
  ctx.fillStyle = divColor;
  ctx.fillRect(hx, hy + hh - divH, hw, divH);

  const contentH = hh - divH;
  const cy = hy + contentH * 0.5;
  const padSide = Math.round(hw * 0.016);
  let rightUsedW = padSide;

  // Optional right-side collector pill + edition pill inside the top header bar
  const badgeClean = (state.badge || '').trim().toUpperCase();
  const edClean = (state.editionPill || '').trim().toUpperCase();
  if (badgeClean || edClean) {
    const bfs = Math.max(12, Math.round(contentH * 0.50));
    const bh = Math.round(contentH * 0.68);
    const by = cy - bh * 0.5;
    const pillGap = Math.round(bfs * 0.48);
    let cursorRightX = hx + hw - padSide;

    if (badgeClean) {
      ctx.font = `700 ${bfs}px "Bebas Neue", sans-serif`;
      const bTrack = Math.round(bfs * 0.08);
      const bw = measureTextTracked(ctx, badgeClean, bTrack) + Math.round(bfs * 1.15);
      const bx = cursorRightX - bw;

      traceSlantedPill(ctx, bx, by, bw, bh, 6);
      ctx.fillStyle = grade.badgeBg;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = divColor;
      ctx.stroke();

      ctx.fillStyle = grade.badgeFg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawTextTracked(ctx, badgeClean, bx + bw * 0.5, by + bh * 0.54, bTrack, 'fill');

      cursorRightX = bx - pillGap;
      rightUsedW += bw + Math.round(bfs * 0.8);
    }

    if (edClean) {
      const efs = Math.max(11, Math.round(contentH * 0.44));
      ctx.font = `700 ${efs}px "Bebas Neue", sans-serif`;
      const eTrack = Math.round(efs * 0.08);
      const ew = measureTextTracked(ctx, edClean, eTrack) + Math.round(efs * 1.12);
      const ex = cursorRightX - ew;

      traceSlantedPill(ctx, ex, by, ew, bh, 5);
      ctx.fillStyle = 'rgba(12, 7, 24, 0.94)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = grade.badgeBg;
      ctx.stroke();

      ctx.fillStyle = '#FFF8EB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawTextTracked(ctx, edClean, ex + ew * 0.5, by + bh * 0.54, eTrack, 'fill');

      rightUsedW += ew + (badgeClean ? pillGap : Math.round(efs * 0.8));
    }
  } else if (state.showHeatStars && (state.heatStars ?? 0) > 0) {
    const hfs = Math.max(12, Math.round(contentH * 0.46));
    const heatTxt = `HEAT ${'★'.repeat(Math.min(5, state.heatStars))}`;
    ctx.font = `700 ${hfs}px "Bebas Neue", sans-serif`;
    const hwTxt = measureTextTracked(ctx, heatTxt, hfs * 0.07);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grade.accentColor;
    drawTextTracked(ctx, heatTxt, hx + hw - padSide, cy + 1, hfs * 0.07, 'fill');
    rightUsedW += hwTxt + Math.round(hfs * 0.9);
  }

  // Left-aligned 5-star press quote
  const quoteClean = (state.pressQuote || '').trim().toUpperCase();
  if (quoteClean) {
    const maxQuoteW = hw - padSide - rightUsedW - Math.round(hw * 0.02);
    let qfs = Math.max(12, Math.round(contentH * 0.50));
    let qTrack = Math.round(qfs * 0.08);
    ctx.font = `700 ${qfs}px "Bebas Neue", sans-serif`;
    while (measureTextTracked(ctx, quoteClean, qTrack) > maxQuoteW && qfs > 10) {
      qfs -= 1;
      qTrack = Math.round(qfs * 0.06);
      ctx.font = `700 ${qfs}px "Bebas Neue", sans-serif`;
    }

    const starMatch = quoteClean.match(/^([★☆]+\s*)(.*)$/);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let qx = hx + padSide;
    if (starMatch) {
      const stars = starMatch[1];
      const rest = starMatch[2];
      ctx.fillStyle = '#FFD447';
      drawTextTracked(ctx, stars, qx, cy + 1, qTrack, 'fill');
      qx += measureTextTracked(ctx, stars, qTrack);
      ctx.fillStyle = '#FAF6EE';
      drawTextTracked(ctx, rest, qx, cy + 1, qTrack, 'fill');
    } else {
      ctx.fillStyle = '#FAF6EE';
      drawTextTracked(ctx, quoteClean, qx, cy + 1, qTrack, 'fill');
    }
  }
  ctx.restore();
}

// Coastal Sunset & Palm Horizon Band behind title (used by 'horizon-band' placement)
export function renderHorizonSkylineBand(ctx, width, outerFrame, stageTop, bandH, gutterPx, grade, borderStyle) {
  if (!bandH || bandH <= 0) return;

  const bx = outerFrame;
  const bw = width - outerFrame * 2;
  const divColor = borderStyle.thinDivider && borderStyle.dividerColor ? borderStyle.dividerColor : borderStyle.color;
  const divH = Math.max(3, Math.round(gutterPx * 0.42));

  ctx.save();
  ctx.beginPath();
  ctx.rect(bx, stageTop, bw, bandH);
  ctx.clip();

  const skyG = ctx.createLinearGradient(0, stageTop, 0, stageTop + bandH);
  skyG.addColorStop(0, '#1B0A2E');
  skyG.addColorStop(0.45, grade.footerGradient[1] || '#8F1E4E');
  skyG.addColorStop(1, grade.footerGradient[2] || '#FF8A32');
  ctx.fillStyle = skyG;
  ctx.fillRect(bx, stageTop, bw, bandH);

  // Retro glowing striped sunset disc behind title
  const sunX = bx + bw * 0.5;
  const sunY = stageTop + bandH * 0.90;
  const sunR = bandH * 0.72;
  const halo = ctx.createRadialGradient(sunX, sunY - sunR * 0.25, sunR * 0.15, sunX, sunY, sunR * 1.9);
  halo.addColorStop(0, 'rgba(255, 226, 130, 0.55)');
  halo.addColorStop(0.5, 'rgba(255, 72, 128, 0.28)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(bx, stageTop, bw, bandH);

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, Math.PI, 0);
  ctx.closePath();
  for (let s = 0; s < 5; s++) {
    const sy = stageTop + bandH * (0.42 + s * 0.105);
    const sh = Math.max(3, bandH * (0.018 + s * 0.008));
    ctx.rect(sunX - sunR - 2, sy, sunR * 2 + 4, sh);
  }
  ctx.clip('evenodd');
  const sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY);
  sg.addColorStop(0, '#FFF8C6');
  sg.addColorStop(0.55, '#FFAE34');
  sg.addColorStop(1, '#FF326A');
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR);
  ctx.restore();

  // Skyline silhouette along bottom edge of horizon band
  const heights = [0.16, 0.28, 0.14, 0.34, 0.20, 0.26, 0.12, 0.22, 0.32, 0.18, 0.29, 0.15, 0.24, 0.19];
  const cols = Math.max(18, Math.round(bw / 46));
  const cw = bw / cols;
  ctx.fillStyle = '#0D0617';
  for (let i = 0; i < cols; i++) {
    const ch = bandH * (0.10 + heights[i % heights.length] * 0.36);
    ctx.fillRect(bx + i * cw - 0.5, stageTop + bandH - ch, cw + 1, ch + 2);
  }

  // Tall palms flanking the left and right horizon silhouettes
  drawPalmSilhouette(ctx, bx + bw * 0.09, stageTop + bandH, bandH * 0.88, bandH * 0.14, 1);
  drawPalmSilhouette(ctx, bx + bw * 0.15, stageTop + bandH, bandH * 0.64, -bandH * 0.10, 0.85);
  drawPalmSilhouette(ctx, bx + bw * 0.91, stageTop + bandH, bandH * 0.88, bandH * 0.14, -1);
  drawPalmSilhouette(ctx, bx + bw * 0.85, stageTop + bandH, bandH * 0.64, -bandH * 0.10, -0.85);

  // Subtle dark depth vignette near edges + top gold divider rule
  const sideVig = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  sideVig.addColorStop(0, 'rgba(9, 4, 18, 0.45)');
  sideVig.addColorStop(0.18, 'rgba(9, 4, 18, 0)');
  sideVig.addColorStop(0.82, 'rgba(9, 4, 18, 0)');
  sideVig.addColorStop(1, 'rgba(9, 4, 18, 0.45)');
  ctx.fillStyle = sideVig;
  ctx.fillRect(bx, stageTop, bw, bandH);

  ctx.fillStyle = divColor;
  ctx.fillRect(bx, stageTop, bw, divH);
  ctx.restore();
}

export function renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade, borderStyle) {
  if (!footerH || footerH <= 0) return;

  const fx = outerFrame;
  const fw = width - outerFrame * 2;
  const fy = height - outerFrame - footerH;
  const fh = footerH;
  const taglineText = (state.tagline || '').trim().toUpperCase();
  const divColor = borderStyle.thinDivider && borderStyle.dividerColor ? borderStyle.dividerColor : borderStyle.color;

  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  ctx.clip();

  const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
  fg.addColorStop(0, grade.footerGradient[0]);
  fg.addColorStop(0.5, grade.footerGradient[1]);
  fg.addColorStop(1, grade.footerGradient[2]);
  ctx.fillStyle = fg;
  ctx.fillRect(fx, fy, fw, fh);

  const vg = ctx.createLinearGradient(0, fy, 0, fy + fh);
  vg.addColorStop(0, 'rgba(8, 5, 16, 0.48)');
  vg.addColorStop(0.5, 'rgba(8, 5, 16, 0.18)');
  vg.addColorStop(1, 'rgba(8, 5, 16, 0.78)');
  ctx.fillStyle = vg;
  ctx.fillRect(fx, fy, fw, fh);

  const sunX = fx + fw * 0.5;
  const sunY = fy + fh * 0.98;
  const sunR = fh * 0.92;

  ctx.save();
  const sunGlow = ctx.createRadialGradient(sunX, sunY - sunR * 0.2, sunR * 0.2, sunX, sunY, sunR * 1.9);
  sunGlow.addColorStop(0, grade.sunColors[1]);
  sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = 0.44;
  ctx.fillStyle = sunGlow;
  ctx.fillRect(fx, fy, fw, fh);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, Math.PI, 0);
  ctx.closePath();
  for (let s = 0; s < 4; s++) {
    const sy = fy + fh * (0.56 + s * 0.11);
    const sh = Math.max(2, fh * (0.025 + s * 0.008));
    ctx.rect(sunX - sunR - 2, sy, sunR * 2 + 4, sh);
  }
  ctx.clip('evenodd');
  const sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY);
  sg.addColorStop(0, grade.sunColors[0]);
  sg.addColorStop(1, grade.sunColors[1]);
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR);
  ctx.restore();

  const skyHeights = [0.22, 0.34, 0.18, 0.40, 0.25, 0.32, 0.16, 0.28, 0.42, 0.21, 0.35, 0.19, 0.30, 0.24];
  ctx.fillStyle = '#090510';
  const bldgCount = Math.max(14, Math.round(fw / 48));
  const bldgW = fw / bldgCount;
  for (let i = 0; i < bldgCount; i++) {
    const bh = fh * (0.14 + skyHeights[i % skyHeights.length] * 0.44);
    const bx = fx + i * bldgW;
    const by = fy + fh - bh;
    ctx.fillRect(bx - 0.5, by, bldgW + 1, bh + 2);
  }

  drawPalmSilhouette(ctx, fx + fw * 0.17, fy + fh, fh * 0.90, -fh * 0.18, 1);
  drawPalmSilhouette(ctx, fx + fw * 0.21, fy + fh, fh * 0.66, fh * 0.14, 0.85);
  drawPalmSilhouette(ctx, fx + fw * 0.83, fy + fh, fh * 0.90, -fh * 0.18, -1);
  drawPalmSilhouette(ctx, fx + fw * 0.79, fy + fh, fh * 0.66, fh * 0.14, -0.85);

  const dividerH = Math.max(3, Math.round(fh * 0.048));
  ctx.fillStyle = divColor;
  ctx.fillRect(fx, fy, fw, dividerH);
  ctx.fillStyle = '#080510';
  ctx.fillRect(fx, fy + dividerH, fw, Math.max(2, Math.round(fh * 0.022)));

  const padSide = Math.round(fw * 0.018);
  const contentTop = fy + dividerH + 2;
  const contentH = fh - dividerH - 2;
  const barH = Math.round(contentH * 0.74);
  const barW = Math.round(barH * 2.05);
  const bx = fx + fw - padSide - barW;
  const showSideItems = fw >= 640;
  const tagX = fx + fw * 0.5;
  const tagY = contentTop + contentH * 0.52;
  let tagLeftBound = tagX;

  if (taglineText) {
    let tagSize = Math.max(14, Math.round(fh * 0.40));
    let tagTracking = Math.round(tagSize * 0.12);
    const maxTagHalfW = showSideItems
      ? Math.min(bx - tagX - Math.round(fw * 0.022), tagX - (fx + padSide) - Math.round(fw * 0.175))
      : fw * 0.44;
    const minRuleReserve = showSideItems ? Math.round(fw * 0.026) : Math.round(fw * 0.020);
    ctx.font = `700 ${tagSize}px "Bebas Neue", sans-serif`;
    let tagW = measureTextTracked(ctx, taglineText, tagTracking);
    while (tagW * 0.5 + minRuleReserve > maxTagHalfW && tagSize > 11) {
      tagSize -= 1;
      tagTracking = Math.round(tagSize * 0.10);
      ctx.font = `700 ${tagSize}px "Bebas Neue", sans-serif`;
      tagW = measureTextTracked(ctx, taglineText, tagTracking);
    }

    const ruleGap = Math.round(tagSize * 0.38);
    const availRuleW = Math.max(0, maxTagHalfW - tagW * 0.5 - ruleGap);
    const ruleW = Math.min(Math.round(Math.min(fw * 0.04, fh * 0.48)), availRuleW);
    tagLeftBound = tagX - tagW * 0.5 - (ruleW > 8 ? ruleGap + ruleW : 0);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (ruleW > 8) {
      ctx.strokeStyle = grade.sunColors[0];
      ctx.lineWidth = Math.max(2, Math.round(fh * 0.026));
      ctx.beginPath();
      ctx.moveTo(tagX - tagW * 0.5 - ruleGap - ruleW, tagY);
      ctx.lineTo(tagX - tagW * 0.5 - ruleGap, tagY);
      ctx.moveTo(tagX + tagW * 0.5 + ruleGap, tagY);
      ctx.lineTo(tagX + tagW * 0.5 + ruleGap + ruleW, tagY);
      ctx.stroke();
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4.5, Math.round(tagSize * 0.24));
    ctx.strokeStyle = '#080510';
    drawTextTracked(ctx, taglineText, tagX, tagY, tagTracking, 'stroke');
    ctx.fillStyle = '#FFFFFF';
    drawTextTracked(ctx, taglineText, tagX, tagY, tagTracking, 'fill');
  }

  if (showSideItems) {
    let creditSize = Math.max(12, Math.round(fh * 0.27));
    let creditTrack = Math.round(creditSize * 0.08);
    const leftAvail = tagLeftBound - (fx + padSide) - Math.round(fw * 0.018);
    const leftLabel = 'ORIGINAL ART PRINT';
    ctx.font = `700 ${creditSize}px "Bebas Neue", sans-serif`;
    while (measureTextTracked(ctx, leftLabel, creditTrack) > leftAvail && creditSize > 9) {
      creditSize -= 1;
      creditTrack = Math.round(creditSize * 0.06);
      ctx.font = `700 ${creditSize}px "Bebas Neue", sans-serif`;
    }
    if (measureTextTracked(ctx, leftLabel, creditTrack) <= leftAvail + 4) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(3, Math.round(creditSize * 0.25));
      ctx.strokeStyle = '#080510';
      drawTextTracked(ctx, leftLabel, fx + padSide, tagY, creditTrack, 'stroke');
      ctx.fillStyle = '#FFF4E6';
      drawTextTracked(ctx, leftLabel, fx + padSide, tagY, creditTrack, 'fill');
    }

    const by = contentTop + (contentH - barH) * 0.5;
    ctx.fillStyle = '#FFF8EC';
    ctx.strokeStyle = '#08060D';
    ctx.lineWidth = Math.max(2, Math.round(fh * 0.025));
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 3);
    ctx.fill();
    ctx.stroke();

    const patternWidths = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3];
    const barPadX = Math.max(4, Math.round(barW * 0.08));
    const barPadTop = Math.max(3, Math.round(barH * 0.12));
    const codeTextH = Math.max(7, Math.round(barH * 0.24));
    const stripesH = Math.max(8, barH - barPadTop * 2 - codeTextH);
    const totalUnits = patternWidths.reduce((a, b) => a + b, 0) + (patternWidths.length - 1);
    const unitW = (barW - barPadX * 2) / totalUnits;

    ctx.fillStyle = '#0A0710';
    let curX = bx + barPadX;
    for (let i = 0; i < patternWidths.length; i++) {
      const wBar = patternWidths[i] * unitW;
      ctx.fillRect(curX, by + barPadTop, Math.max(1, wBar), stripesH);
      curX += wBar + unitW;
    }

    ctx.font = `700 ${Math.max(7, Math.round(codeTextH * 0.92))}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#0A0710';
    ctx.fillText('06-2026-ART', bx + barW * 0.5, by + barH - Math.max(2, barH * 0.04));
  }

  ctx.restore();
}

// Fallback floating HEAT 5-Star badge (only rendered when Top Press Header Bar is off)
export function renderHeatStars(ctx, width, outerFrame, count, grade, titlePosition, mosaicBottom) {
  if (!count || count <= 0) return;
  const base = Math.min(width, 1080);
  const starR = Math.max(10, Math.round(base * 0.014));
  const gap = starR * 2.4;
  const labelFontSize = Math.round(starR * 1.24);
  ctx.save();
  ctx.font = `700 ${labelFontSize}px "Bebas Neue", sans-serif`;
  const measuredHeatW = ctx.measureText('HEAT').width;
  const padLeft = starR * 1.1;
  const labelGap = starR * 1.1;
  const labelW = padLeft + measuredHeatW + labelGap;
  const totalW = labelW + gap * 5 + starR * 0.75;
  const padX = outerFrame + Math.round(base * 0.018);
  const padY = outerFrame + Math.round(base * 0.018);
  const pillH = Math.round(starR * 2.5);

  const isTopBanner = titlePosition === 'top-banner';
  const pillX = width - padX - totalW;
  const pillY = isTopBanner ? mosaicBottom - padY - pillH : padY;

  ctx.beginPath();
  ctx.moveTo(pillX + 10, pillY);
  ctx.lineTo(pillX + totalW, pillY);
  ctx.lineTo(pillX + totalW - 8, pillY + pillH);
  ctx.lineTo(pillX, pillY + pillH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10, 7, 20, 0.92)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, base * 0.0022);
  ctx.strokeStyle = 'rgba(245, 230, 200, 0.88)';
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEAT', pillX + padLeft, pillY + pillH * 0.54);

  const startX = pillX + labelW + starR * 0.4;
  const cy = pillY + pillH * 0.5;
  for (let i = 0; i < 5; i++) {
    const cx = startX + i * gap;
    const filled = i < count;
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const r = p % 2 === 0 ? starR : starR * 0.44;
      const angle = (p * Math.PI) / 5 - Math.PI / 2;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      if (p === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    if (filled) {
      ctx.fillStyle = grade.accentColor;
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#09060E';
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderCornerBadges(ctx, width, outerFrame, badgeText, editionPill, grade, titlePosition, mosaicBottom) {
  const clean = (badgeText || '').trim().toUpperCase();
  const edClean = (editionPill || '').trim().toUpperCase();
  if (!clean && !edClean) return;

  const base = Math.min(width, 1080);
  const fontSize = Math.round(base * 0.024);
  const padX = Math.round(fontSize * 0.65);
  const padY = Math.round(fontSize * 0.28);
  const isTopBanner = titlePosition === 'top-banner';
  const startX = outerFrame + Math.round(base * 0.018);
  const by = isTopBanner ? mosaicBottom - Math.round(base * 0.018) - (fontSize + padY * 2) : outerFrame + Math.round(base * 0.018);
  let cursorX = startX;

  ctx.save();
  if (clean) {
    ctx.font = `700 ${fontSize}px "Bebas Neue", sans-serif`;
    const textW = measureTextTracked(ctx, clean, fontSize * 0.08);
    const boxW = textW + padX * 2;
    const boxH = fontSize + padY * 2;
    const skew = 8;

    ctx.beginPath();
    ctx.moveTo(cursorX + skew + 4, by + 4);
    ctx.lineTo(cursorX + boxW + 4, by + 4);
    ctx.lineTo(cursorX + boxW - skew + 4, by + boxH + 4);
    ctx.lineTo(cursorX + 4, by + boxH + 4);
    ctx.closePath();
    ctx.fillStyle = '#07050B';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cursorX + skew, by);
    ctx.lineTo(cursorX + boxW, by);
    ctx.lineTo(cursorX + boxW - skew, by + boxH);
    ctx.lineTo(cursorX, by + boxH);
    ctx.closePath();
    ctx.fillStyle = grade.badgeBg;
    ctx.fill();
    ctx.lineWidth = Math.max(2.2, base * 0.0024);
    ctx.strokeStyle = '#09060E';
    ctx.stroke();

    ctx.fillStyle = grade.badgeFg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTextTracked(ctx, clean, cursorX + boxW * 0.5, by + boxH * 0.54, fontSize * 0.08, 'fill');
    cursorX += boxW + Math.round(base * 0.010);
  }

  if (edClean) {
    const edSize = Math.round(fontSize * 0.72);
    ctx.font = `700 ${edSize}px "Bebas Neue", sans-serif`;
    const edTrack = edSize * 0.09;
    const edW = measureTextTracked(ctx, edClean, edTrack);
    const boxW = edW + Math.round(edSize * 1.15);
    const boxH = fontSize + padY * 2;
    const skew = 7;

    ctx.beginPath();
    ctx.moveTo(cursorX + skew, by);
    ctx.lineTo(cursorX + boxW, by);
    ctx.lineTo(cursorX + boxW - skew, by + boxH);
    ctx.lineTo(cursorX, by + boxH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(12, 8, 22, 0.90)';
    ctx.fill();
    ctx.lineWidth = Math.max(2, base * 0.0020);
    ctx.strokeStyle = grade.badgeBg;
    ctx.stroke();

    ctx.fillStyle = '#FFF6E8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTextTracked(ctx, edClean, cursorX + boxW * 0.5, by + boxH * 0.54, edTrack, 'fill');
  }
  ctx.restore();
}

// Large High-Contrast Gold & Black-Ringed "ORIGINAL ARTWORK" Sunburst Seal
export function renderLargeGoldSunburstSeal(ctx, cx, cy, outerR, starburstText) {
  const innerR = outerR * 0.78;
  const points = 20;
  const totalVerts = points * 2;
  const label = (starburstText || 'ORIGINAL ARTWORK').trim().toUpperCase();
  const words = label.split(/\s+/).filter(Boolean);
  const line1 = words.length > 1 ? words[0] : label;
  const line2 = words.length > 1 ? words.slice(1).join(' ') : 'ARTWORK';

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-9 * Math.PI) / 180);

  const traceBurst = (dx, dy, scale = 1) => {
    ctx.beginPath();
    for (let i = 0; i < totalVerts; i++) {
      const r = (i % 2 === 0 ? outerR : innerR) * scale;
      const angle = (i * Math.PI) / points;
      const px = dx + Math.cos(angle) * r;
      const py = dy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  traceBurst(outerR * 0.09, outerR * 0.11, 1);
  ctx.fillStyle = '#07040C';
  ctx.fill();

  traceBurst(0, 0, 1);
  const goldGrad = ctx.createRadialGradient(-outerR * 0.25, -outerR * 0.25, outerR * 0.1, 0, 0, outerR);
  goldGrad.addColorStop(0, '#FFF8BA');
  goldGrad.addColorStop(0.55, '#FFD038');
  goldGrad.addColorStop(1, '#F29412');
  ctx.fillStyle = goldGrad;
  ctx.fill();
  ctx.lineWidth = Math.max(3, outerR * 0.065);
  ctx.strokeStyle = '#0B0612';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = '#0B0612';
  ctx.lineWidth = Math.max(2.2, outerR * 0.042);
  ctx.stroke();

  const fs1 = Math.max(13, Math.round(outerR * 0.34));
  const fs2 = Math.max(12, Math.round(outerR * 0.30));
  ctx.fillStyle = '#0B0612';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 ${fs1}px "Bebas Neue", sans-serif`;
  ctx.fillText(line1, 0, -fs1 * 0.38, innerR * 1.48);

  ctx.font = `700 ${fs2}px "Bebas Neue", sans-serif`;
  ctx.fillText(line2, 0, fs2 * 0.56, innerR * 1.48);

  ctx.restore();
}

// 4-Point Lens-Gleam Sparkle Star at peak glyph corners
function drawLensGleamStar(ctx, cx, cy, rayLen, tintColor) {
  ctx.save();
  ctx.translate(cx, cy);

  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, rayLen * 0.65);
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
  halo.addColorStop(0.35, tintColor);
  halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, rayLen * 0.65, 0, Math.PI * 2);
  ctx.fill();

  const traceDiamond = (len, waist) => {
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(waist, -waist);
    ctx.lineTo(len, 0);
    ctx.lineTo(waist, waist);
    ctx.lineTo(0, len);
    ctx.lineTo(-waist, waist);
    ctx.lineTo(-len, 0);
    ctx.lineTo(-waist, -waist);
    ctx.closePath();
  };

  traceDiamond(rayLen, rayLen * 0.13);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = tintColor;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.rotate(Math.PI / 4);
  traceDiamond(rayLen * 0.38, rayLen * 0.08);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, rayLen * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

// High-Contrast Tagline Pill ("FIVE STRANGERS · ONE COAST · NO WAY BACK")
function renderSubTaglinePill(ctx, cx, cy, maxW, subText, grade, base) {
  const clean = (subText || '').trim().toUpperCase();
  if (!clean) return;

  let fs = Math.max(13, Math.round(base * 0.021));
  let tracking = Math.round(fs * 0.13);
  ctx.save();
  ctx.font = `700 ${fs}px "Bebas Neue", sans-serif`;
  let tw = measureTextTracked(ctx, clean, tracking);
  while (tw + fs * 1.6 > maxW && fs > 11) {
    fs -= 1;
    tracking = Math.round(fs * 0.10);
    ctx.font = `700 ${fs}px "Bebas Neue", sans-serif`;
    tw = measureTextTracked(ctx, clean, tracking);
  }
  const padX = Math.round(fs * 0.85);
  const pillW = tw + padX * 2;
  const pillH = Math.round(fs * 1.56);
  const px = cx - pillW * 0.5;
  const py = cy - pillH * 0.5;

  ctx.fillStyle = 'rgba(5, 2, 12, 0.88)';
  ctx.beginPath();
  ctx.roundRect(px + 2.5, py + 3, pillW, pillH, 999);
  ctx.fill();

  ctx.fillStyle = 'rgba(13, 8, 24, 0.94)';
  ctx.beginPath();
  ctx.roundRect(px, py, pillW, pillH, 999);
  ctx.fill();
  ctx.lineWidth = Math.max(1.8, base * 0.0018);
  ctx.strokeStyle = '#F5E6C8';
  ctx.stroke();

  ctx.textBaseline = 'middle';
  const parts = clean.split('·');
  const dotSep = ' · ';
  if (parts.length > 1) {
    const trimmed = parts.map((p) => p.trim());
    const dotW = measureTextTracked(ctx, dotSep, tracking);
    const totalW = trimmed.reduce((s, p) => s + measureTextTracked(ctx, p, tracking), 0) + dotW * (trimmed.length - 1);
    let tx = cx - totalW * 0.5;
    ctx.textAlign = 'left';
    for (let i = 0; i < trimmed.length; i++) {
      ctx.fillStyle = '#FAF6EE';
      drawTextTracked(ctx, trimmed[i], tx, cy + 1, tracking, 'fill');
      tx += measureTextTracked(ctx, trimmed[i], tracking);
      if (i < trimmed.length - 1) {
        ctx.fillStyle = grade.accentColor;
        drawTextTracked(ctx, dotSep, tx, cy + 1, tracking, 'fill');
        tx += dotW;
      }
    }
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FAF6EE';
    drawTextTracked(ctx, clean, cx, cy + 1, tracking, 'fill');
  }
  ctx.restore();
}

// Render Top Header + Horizon Band + Striped Retro-Chrome 3D Display Typography + Stars + Neon Script + Seal + Footer
export function renderCoverTypographyAndBadges(
  ctx,
  width,
  height,
  outerFrame,
  state,
  geometries = [],
  footerH = 0,
  dockedTitleH = 0,
  topReservePx = 0,
  gutterPx = 10,
  topHeaderH = 0,
  horizonBandH = 0,
) {
  const grade = getGradeById(state.gradeId);
  const borderStyle = getBorderStyleById(state.borderStyle || 'twilight-gold');
  const titleText = (state.title || '').trim().toUpperCase();
  const scriptText = (state.script || '').trim();
  const subTaglineText = (state.subTagline || '').trim().toUpperCase();
  const taglineText = (state.tagline || '').trim().toUpperCase();
  const pos = state.titlePosition || 'overlay-bottom';
  const style = state.titleStyle || 'sunset-extrude';
  const base = Math.min(width, height);
  const aspect = width / height;

  const mosaicTop = outerFrame + topReservePx;
  const mosaicBottom = height - outerFrame - footerH - dockedTitleH - horizonBandH;
  const stageTop = mosaicBottom;
  const stageBottom = height - outerFrame - footerH;

  // 1) Top Press Header Bar (replaces mid-canvas floating quote pill)
  if (topHeaderH > 0) {
    renderTopPressHeaderBar(ctx, width, outerFrame, topHeaderH, state, grade, borderStyle);
  } else {
    renderCornerBadges(ctx, width, outerFrame, state.badge, state.editionPill, grade, pos, mosaicBottom);
    if (state.showHeatStars) {
      renderHeatStars(ctx, width, outerFrame, state.heatStars ?? 5, grade, pos, mosaicBottom);
    }
  }

  // 2) Horizon Skyline Band or optional docked title band
  if (horizonBandH > 0) {
    renderHorizonSkylineBand(ctx, width, outerFrame, stageTop, horizonBandH, gutterPx, grade, borderStyle);
  } else if (dockedTitleH > 0) {
    ctx.save();
    const bg = ctx.createLinearGradient(outerFrame, stageTop, width - outerFrame, stageBottom);
    bg.addColorStop(0, grade.titleStageGradient[0]);
    bg.addColorStop(0.52, grade.titleStageGradient[1]);
    bg.addColorStop(1, grade.titleStageGradient[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(outerFrame, stageTop, width - outerFrame * 2, dockedTitleH);
    const seamH = Math.max(4, Math.round(gutterPx * 0.45));
    ctx.fillStyle = borderStyle.thinDivider ? borderStyle.dividerColor : borderStyle.color;
    ctx.fillRect(outerFrame, stageTop, width - outerFrame * 2, seamH);
    ctx.restore();
  } else if (pos === 'top-banner' && topReservePx > topHeaderH) {
    const topBannerH = topReservePx - topHeaderH;
    const bannerY = outerFrame + topHeaderH;
    ctx.save();
    const bg = ctx.createLinearGradient(outerFrame, bannerY, width - outerFrame, bannerY + topBannerH);
    bg.addColorStop(0, grade.titleStageGradient[0]);
    bg.addColorStop(0.52, grade.titleStageGradient[1]);
    bg.addColorStop(1, grade.titleStageGradient[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(outerFrame, bannerY, width - outerFrame * 2, topBannerH);
    const seamH = Math.max(4, Math.round(gutterPx * 0.45));
    ctx.fillStyle = borderStyle.thinDivider ? borderStyle.dividerColor : borderStyle.color;
    ctx.fillRect(outerFrame, mosaicTop - seamH * 0.5, width - outerFrame * 2, seamH);
    ctx.restore();
  }

  // 3) Compact Cinematic Footer Strip
  if (footerH > 0) {
    renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade, borderStyle);
  }

  // 4) Giant Striped Retro-Chrome 3D Display Typography + Lens Stars + Neon Script + Tagline Pill + Gold Seal
  const sealR = Math.round(base * (horizonBandH > 0 ? (aspect > 1.25 ? 0.060 : 0.056) : (aspect > 1.25 ? 0.060 : 0.062)));
  let sealX = width - outerFrame - sealR - Math.round(width * 0.016);
  let sealY = mosaicBottom - Math.round(base * 0.25);

  if (titleText || scriptText) {
    const isFullBleedOverlay = pos === 'overlay-bottom' || pos === 'bottom-left';
    const isHorizonOrDocked = horizonBandH > 0 || dockedTitleH > 0;
    const hasSubPill = Boolean(subTaglineText);

    const innerW = width - outerFrame * 2;
    const maxTextW = aspect < 0.90
      ? Math.min(innerW - 16, width * 0.88)
      : innerW * (aspect > 1.25 ? 0.875 : 0.83);

    let titleSize = Math.round(
      horizonBandH > 0
        ? Math.min(horizonBandH * 0.72, base * 0.205)
        : dockedTitleH > 0
          ? dockedTitleH * (aspect > 1.25 ? 0.74 : 0.64)
          : base * (aspect > 1.25 ? 0.230 : aspect < 0.9 ? 0.215 : 0.205),
    );

    ctx.save();
    ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
    if (titleText) {
      let measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.024));
      while (measured > maxTextW && titleSize > 48) {
        titleSize -= 2;
        ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
        measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.024));
      }
    }
    const finalTracking = Math.round(titleSize * 0.024);
    const titleW = titleText ? measureTextTracked(ctx, titleText, finalTracking) : 0;
    let scriptSize = Math.round(titleSize * (horizonBandH > 0 ? 0.34 : 0.35));

    let anchorX = width * 0.5;
    let textAlign = 'center';
    const subReserve = hasSubPill ? Math.round(base * 0.056) : Math.round(base * 0.020);
    let titleY = mosaicBottom - subReserve - Math.round(titleSize * 0.30);

    if (horizonBandH > 0) {
      anchorX = width * 0.5;
      titleY = stageTop + Math.round(horizonBandH * 0.61);
    } else if (dockedTitleH > 0) {
      anchorX = width * 0.5;
      titleY = stageTop + Math.round(dockedTitleH * 0.68);
    } else if (pos === 'top-banner') {
      anchorX = width * 0.5;
      titleY = outerFrame + topHeaderH + Math.round((topReservePx - topHeaderH) * 0.72);
    } else if (pos === 'center-emblem') {
      anchorX = width * 0.5;
      titleY = mosaicTop + (mosaicBottom - mosaicTop) * 0.54;
    } else if (pos === 'bottom-left') {
      anchorX = outerFrame + Math.round(base * 0.045);
      textAlign = 'left';
    }

    // Subtle localized lower scrim behind giant overlay typography (keeps upper 65%+ crisp and bright)
    if (isFullBleedOverlay) {
      const scrimH = Math.round(titleSize * 1.44 + base * 0.075);
      const sg = ctx.createLinearGradient(0, mosaicBottom - scrimH, 0, mosaicBottom);
      sg.addColorStop(0, 'rgba(9, 5, 18, 0)');
      sg.addColorStop(0.45, 'rgba(9, 5, 18, 0.42)');
      sg.addColorStop(1, 'rgba(9, 5, 18, 0.84)');
      ctx.fillStyle = sg;
      ctx.fillRect(outerFrame, mosaicBottom - scrimH, width - outerFrame * 2, scrimH);
    } else if (pos === 'center-emblem') {
      const rg = ctx.createRadialGradient(width * 0.5, titleY, base * 0.05, width * 0.5, titleY, base * 0.48);
      rg.addColorStop(0, 'rgba(10, 6, 20, 0.78)');
      rg.addColorStop(1, 'rgba(10, 6, 20, 0)');
      ctx.fillStyle = rg;
      ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, mosaicBottom - mosaicTop);
    }

    // Position large Gold Sunburst Seal cleanly above tilted right edge without overlapping any glyph
    const rightTiltLift = titleW * (textAlign === 'center' ? 0.024 : 0.044);
    const sealClearTop = titleY - titleSize * 0.84 - rightTiltLift - sealR * 0.72;
    if (horizonBandH > 0) {
      sealY = Math.min(stageTop - Math.round(sealR * 1.18), sealClearTop);
    } else if (dockedTitleH > 0) {
      sealY = stageTop + Math.round(dockedTitleH * 0.14);
    } else if (pos === 'top-banner') {
      sealY = mosaicTop - Math.round(sealR * 0.08);
    } else {
      sealY = Math.max(mosaicTop + sealR * 1.15, sealClearTop);
    }

    // Layered Striped Retro-Chrome 3D Display Title (-2.5 deg tilt)
    const tiltRad = (-2.5 * Math.PI) / 180;
    const pivotX = anchorX;
    const pivotY = titleY - titleSize * 0.36;

    if (titleText) {
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(tiltRad);
      ctx.translate(-pivotX, -pivotY);

      ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'alphabetic';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      const strokeW = Math.max(11, Math.round(titleSize * 0.136));
      const extrudeSteps = style === 'clean-ink' ? 6 : 23;
      const extrudeX = titleSize * 0.0102;
      const extrudeY = titleSize * 0.0112;

      // A) Deep 23-step plum-to-obsidian 3D extrusion
      for (let s = extrudeSteps; s >= 1; s--) {
        const shade = s > 19 ? '#421166' : s > 12 ? '#24083D' : s > 5 ? '#11041E' : '#06010C';
        ctx.fillStyle = shade;
        ctx.strokeStyle = shade;
        ctx.lineWidth = strokeW;
        drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'stroke');
        drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'fill');
      }

      if (style === 'neon-chrome') {
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = strokeW * 1.16;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 22;
        drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');
        ctx.shadowBlur = 0;
      }

      // B) Crisp champagne bevel rim contour + heavy matte black comic keyline
      ctx.strokeStyle = '#FFFCEE';
      ctx.lineWidth = strokeW * 1.18;
      drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');

      ctx.strokeStyle = '#07040D';
      ctx.lineWidth = strokeW;
      drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');

      // C) Offscreen metallic gradient + horizontal retro horizon stripes + specular chrome bevel
      const bandTop = Math.max(0, Math.floor(titleY - titleSize * 1.32));
      const bandBot = Math.min(height, Math.ceil(titleY + titleSize * 0.45));
      const bandH = Math.max(24, bandBot - bandTop);
      const localY = titleY - bandTop;

      const layer = document.createElement('canvas');
      layer.width = width;
      layer.height = bandH;
      const lctx = layer.getContext('2d');
      lctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
      lctx.textAlign = textAlign;
      lctx.textBaseline = 'alphabetic';

      const gTop = localY - titleSize * 0.84;
      const gBot = localY + titleSize * 0.04;
      const fillGrad = lctx.createLinearGradient(0, gTop, 0, gBot);
      if (style === 'clean-ink') {
        fillGrad.addColorStop(0.00, '#FFFFFF');
        fillGrad.addColorStop(0.46, '#EAE4FA');
        fillGrad.addColorStop(0.50, '#786BA6');
        fillGrad.addColorStop(0.54, '#FFFFFF');
        fillGrad.addColorStop(1.00, '#C7BDDF');
      } else if (style === 'noir-gold') {
        fillGrad.addColorStop(0.00, '#FFFFFF');
        fillGrad.addColorStop(0.32, '#FFF1B2');
        fillGrad.addColorStop(0.48, '#FFD048');
        fillGrad.addColorStop(0.505, '#2A071E');
        fillGrad.addColorStop(0.54, '#FF5C3E');
        fillGrad.addColorStop(0.78, '#D61D46');
        fillGrad.addColorStop(1.00, '#8C0B2C');
      } else if (style === 'golden-heat') {
        fillGrad.addColorStop(0.00, '#FFFFFF');
        fillGrad.addColorStop(0.34, '#FFF7BA');
        fillGrad.addColorStop(0.48, '#FFDA4D');
        fillGrad.addColorStop(0.505, '#3E1216');
        fillGrad.addColorStop(0.54, '#FF9E2B');
        fillGrad.addColorStop(0.78, '#FF5722');
        fillGrad.addColorStop(1.00, '#C81E38');
      } else if (style === 'neon-chrome') {
        fillGrad.addColorStop(0.00, '#FFFFFF');
        fillGrad.addColorStop(0.34, '#D6FEFF');
        fillGrad.addColorStop(0.48, '#5CEEFF');
        fillGrad.addColorStop(0.505, '#12124D');
        fillGrad.addColorStop(0.54, '#2DE2FF');
        fillGrad.addColorStop(0.76, '#FF47C4');
        fillGrad.addColorStop(1.00, '#B01AE8');
      } else {
        const tg = Array.isArray(grade.titleGradient) && grade.titleGradient.length >= 4
          ? grade.titleGradient
          : ['#FFFDF0', '#FFE46B', '#FF8F3F', '#E6385C'];
        fillGrad.addColorStop(0.00, tg[0]);
        fillGrad.addColorStop(0.32, tg[1]);
        fillGrad.addColorStop(0.48, '#FFC938');
        fillGrad.addColorStop(0.505, '#2E0A38');
        fillGrad.addColorStop(0.54, tg[2]);
        fillGrad.addColorStop(0.78, tg[3]);
        fillGrad.addColorStop(1.00, '#9E1442');
      }

      lctx.fillStyle = fillGrad;
      drawTextTracked(lctx, titleText, anchorX, localY, finalTracking, 'fill');

      lctx.globalCompositeOperation = 'source-atop';

      // Horizontal retro horizon bevel ridge + 3 lower horizon stripes
      const ridgeY = localY - titleSize * 0.42;
      lctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
      lctx.fillRect(0, ridgeY - 1.5, width, Math.max(2.2, titleSize * 0.018));

      const stripes = [
        [0.32, 0.022],
        [0.21, 0.026],
        [0.10, 0.030],
      ];
      for (const [yFrac, hFrac] of stripes) {
        const syLine = localY - titleSize * yFrac;
        const shLine = Math.max(2, titleSize * hFrac);
        lctx.fillStyle = 'rgba(18, 4, 34, 0.34)';
        lctx.fillRect(0, syLine, width, shLine);
        lctx.fillStyle = 'rgba(255, 248, 224, 0.44)';
        lctx.fillRect(0, syLine + shLine, width, Math.max(1.2, titleSize * 0.010));
      }

      // Upper chrome specular sheen + diagonal metallic specular sweep + crisp top-left bevel rim highlight
      const sheenGrad = lctx.createLinearGradient(0, localY - titleSize * 0.88, 0, localY - titleSize * 0.44);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
      sheenGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.20)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      lctx.fillStyle = sheenGrad;
      lctx.fillRect(0, 0, width, bandH);

      const chromeSweep = lctx.createLinearGradient(
        width * 0.14, localY - titleSize * 0.92,
        width * 0.72, localY - titleSize * 0.10,
      );
      chromeSweep.addColorStop(0.00, 'rgba(255, 255, 255, 0)');
      chromeSweep.addColorStop(0.42, 'rgba(255, 255, 255, 0.42)');
      chromeSweep.addColorStop(0.50, 'rgba(255, 255, 255, 0.68)');
      chromeSweep.addColorStop(0.58, 'rgba(255, 255, 255, 0.26)');
      chromeSweep.addColorStop(1.00, 'rgba(255, 255, 255, 0)');
      lctx.fillStyle = chromeSweep;
      lctx.fillRect(0, 0, width, bandH);

      lctx.lineWidth = Math.max(2.8, titleSize * 0.020);
      lctx.strokeStyle = 'rgba(255, 254, 240, 0.84)';
      drawTextTracked(lctx, titleText, anchorX - 1.5, localY + 2, finalTracking, 'stroke');

      ctx.drawImage(layer, 0, bandTop);

      // D) 2 Elegant 4-Point Lens-Gleam Sparkle Stars on peak glyph corners
      const leftBound = textAlign === 'center' ? anchorX - titleW * 0.5 : anchorX;
      const rightBound = leftBound + titleW;
      const starTint = style === 'neon-chrome' ? 'rgba(92, 238, 255, 0.88)' : 'rgba(255, 226, 128, 0.88)';
      drawLensGleamStar(ctx, leftBound + titleSize * 0.055, titleY - titleSize * 0.74, Math.round(titleSize * 0.175), starTint);
      drawLensGleamStar(ctx, rightBound - titleSize * 0.075, titleY - titleSize * 0.68, Math.round(titleSize * 0.135), starTint);

      ctx.restore();
    }

    // 5) Glowing Neon Brush Script directly under right half of giant 3D title
    if (scriptText) {
      ctx.save();
      const maxScriptW = innerW * 0.58;
      ctx.font = `400 ${scriptSize}px "Yellowtail", cursive`;
      let scriptW = ctx.measureText(scriptText).width;
      while (scriptW > maxScriptW && scriptSize > 18) {
        scriptSize -= 2;
        ctx.font = `400 ${scriptSize}px "Yellowtail", cursive`;
        scriptW = ctx.measureText(scriptText).width;
      }

      const scriptPad = Math.round(base * 0.025);
      let sx = textAlign === 'center' ? anchorX + titleW * 0.24 : anchorX + titleW * 0.48;
      sx = Math.max(
        outerFrame + scriptW * 0.52 + scriptPad,
        Math.min(sx, width - outerFrame - scriptW * 0.52 - scriptPad),
      );
      const rawSy = titleY + Math.round(titleSize * 0.06);
      const zoneBottom = isHorizonOrDocked ? stageBottom : mosaicBottom;
      const maxSy = zoneBottom - Math.round(scriptSize * 0.68);
      const sy = Math.min(rawSy, maxSy);

      ctx.translate(sx, sy);
      ctx.rotate((-4.2 * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';

      const swX0 = -scriptW * 0.44;
      const swX1 = scriptW * 0.46;
      const swY0 = scriptSize * 0.44;
      const swY1 = scriptSize * 0.34;

      const drawSwoosh = (lineW, strokeColor, blur) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(swX0, swY0);
        ctx.quadraticCurveTo(0, swY0 - scriptSize * 0.14, swX1, swY1);
        ctx.lineCap = 'round';
        ctx.lineWidth = lineW;
        ctx.strokeStyle = strokeColor;
        if (blur) {
          ctx.shadowColor = grade.scriptGlow;
          ctx.shadowBlur = blur;
        }
        ctx.stroke();
        ctx.restore();
      };
      drawSwoosh(Math.max(7, scriptSize * 0.14), '#0B0612', 0);
      drawSwoosh(Math.max(3.5, scriptSize * 0.082), grade.scriptColor, 24);
      drawSwoosh(Math.max(1.5, scriptSize * 0.026), 'rgba(255, 255, 255, 0.88)', 4);

      ctx.lineWidth = Math.max(8, Math.round(scriptSize * 0.21));
      ctx.strokeStyle = '#0B0612';
      ctx.strokeText(scriptText, 0, 0);

      ctx.shadowColor = grade.scriptGlow;
      ctx.shadowBlur = 28;
      ctx.fillStyle = grade.scriptColor;
      ctx.fillText(scriptText, 0, 0);

      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
      ctx.fillText(scriptText, 0, -1);
      ctx.restore();
    }

    // Tagline Pill drawn in foreground clearly below 3D title extrude & neon script
    if (hasSubPill) {
      const zoneBottom = isHorizonOrDocked ? stageBottom : mosaicBottom;
      const pillCy = zoneBottom - Math.round(base * 0.020);
      const hasRightScript = Boolean(scriptText);
      const pillCx = (aspect > 1.22 && hasRightScript && textAlign === 'center')
        ? Math.max(outerFrame + width * 0.28, anchorX - titleW * 0.18)
        : width * 0.5;
      const pillMaxW = (aspect > 1.22 && hasRightScript) ? width * 0.48 : (width - outerFrame * 2) * 0.82;
      renderSubTaglinePill(ctx, pillCx, pillCy, pillMaxW, subTaglineText, grade, base);
    }
    ctx.restore();
  }

  // 6) Large High-Contrast Gold Sunburst Seal
  if (state.showStarburst) {
    renderLargeGoldSunburstSeal(ctx, sealX, sealY, sealR, state.starburstText);
  }

  // Fallback floating tagline ONLY if Footer Strip is disabled
  if (taglineText && footerH <= 0) {
    const taglineSize = Math.max(16, Math.round(base * 0.027));
    ctx.save();
    ctx.font = `700 ${taglineSize}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tagTracking = Math.round(taglineSize * 0.20);
    const tagY = height - outerFrame - Math.round(base * 0.032);
    ctx.lineWidth = Math.max(4, Math.round(taglineSize * 0.18));
    ctx.strokeStyle = '#09060E';
    drawTextTracked(ctx, taglineText, width * 0.5, tagY, tagTracking, 'stroke');
    ctx.fillStyle = '#F8F4FF';
    drawTextTracked(ctx, taglineText, width * 0.5, tagY, tagTracking, 'fill');
    ctx.restore();
  }
}

export const renderCoverTypography = renderCoverTypographyAndBadges;
