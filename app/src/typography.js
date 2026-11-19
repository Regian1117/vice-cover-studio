// Original AAA GTA-inspired cover typography, neon brush script + swoosh,
// Collector Poster Footer Strip (palms + skyline + barcode), corner badge, gutter starburst & heat stars
// 100% original design using bundled SIL OFL fonts (Anton, Yellowtail, Bebas Neue)

import { getGradeById } from './grades.js';
import { findStarburstAnchor } from './layouts.js';

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

// Draw procedural palm tree silhouette for the Collector Footer Strip
function drawPalmSilhouette(ctx, baseX, baseY, heightPx, leanPx, scaleX) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scaleX, 1);

  const topX = leanPx;
  const topY = -heightPx;
  const trunkBaseW = Math.max(2.2, heightPx * 0.09);
  const trunkTopW = Math.max(1.2, heightPx * 0.036);

  // Curved tapered palm trunk
  ctx.fillStyle = '#09060E';
  ctx.beginPath();
  ctx.moveTo(-trunkBaseW, 0);
  ctx.quadraticCurveTo(leanPx * 0.35 - trunkTopW, -heightPx * 0.55, topX - trunkTopW, topY);
  ctx.lineTo(topX + trunkTopW, topY);
  ctx.quadraticCurveTo(leanPx * 0.35 + trunkTopW * 1.4, -heightPx * 0.55, trunkBaseW, 0);
  ctx.closePath();
  ctx.fill();

  // 6 sweeping curved fronds radiating from crown
  const fronds = [
    [-0.95, -0.25, 0.72],
    [-0.78, 0.25, 0.80],
    [-0.35, -0.58, 0.62],
    [0.42, -0.55, 0.64],
    [0.86, -0.18, 0.78],
    [0.74, 0.30, 0.74],
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

// Draw procedural coastal skyline + retro striped sun + palm trees + tagline + barcode inside footer strip
export function renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade) {
  if (!footerH || footerH <= 0) return;

  const fx = outerFrame;
  const fw = width - outerFrame * 2;
  const fy = height - outerFrame - footerH;
  const fh = footerH;
  const taglineText = (state.tagline || '').trim().toUpperCase();

  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  ctx.clip();

  // 1) Rich horizontal Vice City footer gradient
  const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
  fg.addColorStop(0, grade.footerGradient[0]);
  fg.addColorStop(0.5, grade.footerGradient[1]);
  fg.addColorStop(1, grade.footerGradient[2]);
  ctx.fillStyle = fg;
  ctx.fillRect(fx, fy, fw, fh);

  // Subtle dark atmospheric sheen top/bottom so text & silhouettes pop
  const vg = ctx.createLinearGradient(0, fy, 0, fy + fh);
  vg.addColorStop(0, 'rgba(8, 5, 14, 0.44)');
  vg.addColorStop(0.5, 'rgba(8, 5, 14, 0.14)');
  vg.addColorStop(1, 'rgba(8, 5, 14, 0.62)');
  ctx.fillStyle = vg;
  ctx.fillRect(fx, fy, fw, fh);

  // 2) Glowing retro striped sunset/neon sun disc centered behind tagline
  const sunX = fx + fw * 0.5;
  const sunY = fy + fh * 0.98;
  const sunR = fh * 0.88;

  ctx.save();
  const sunGlow = ctx.createRadialGradient(sunX, sunY - sunR * 0.2, sunR * 0.2, sunX, sunY, sunR * 1.8);
  sunGlow.addColorStop(0, grade.sunColors[1]);
  sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = sunGlow;
  ctx.fillRect(fx, fy, fw, fh);
  ctx.restore();

  // Sun disc clipped with evenodd horizontal scanline bands in lower half
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, Math.PI, 0);
  ctx.closePath();
  const stripeCount = 4;
  for (let s = 0; s < stripeCount; s++) {
    const sy = fy + fh * (0.56 + s * 0.11);
    const sh = Math.max(2, fh * (0.025 + s * 0.008));
    ctx.rect(sunX - sunR - 2, sy, sunR * 2 + 4, sh);
  }
  ctx.clip('evenodd');
  const sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY);
  sg.addColorStop(0, grade.sunColors[0]);
  sg.addColorStop(1, grade.sunColors[1]);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR);
  ctx.restore();

  // 3) Procedural coastal skyline silhouette along bottom edge
  const skyHeights = [0.22, 0.34, 0.18, 0.40, 0.25, 0.32, 0.16, 0.28, 0.42, 0.21, 0.35, 0.19, 0.30, 0.24];
  ctx.fillStyle = '#09060E';
  const bldgCount = Math.max(14, Math.round(fw / 48));
  const bldgW = fw / bldgCount;
  for (let i = 0; i < bldgCount; i++) {
    const bh = fh * (0.14 + skyHeights[i % skyHeights.length] * 0.48);
    const bx = fx + i * bldgW;
    const by = fy + fh - bh;
    ctx.fillRect(bx - 0.5, by, bldgW + 1, bh + 2);
    // Tiny warm lit skyline windows on taller towers
    if (i % 3 === 1 && bh > fh * 0.26) {
      ctx.fillStyle = grade.sunColors[0];
      ctx.fillRect(bx + bldgW * 0.28, by + fh * 0.05, Math.max(2, bldgW * 0.14), Math.max(2, fh * 0.04));
      ctx.fillRect(bx + bldgW * 0.56, by + fh * 0.09, Math.max(2, bldgW * 0.14), Math.max(2, fh * 0.04));
      ctx.fillStyle = '#09060E';
    }
  }

  // 4) Palm tree silhouettes framing left & right of center tagline (clear of barcode & micro-credit)
  drawPalmSilhouette(ctx, fx + fw * 0.22, fy + fh, fh * 0.86, -fh * 0.18, 1);
  drawPalmSilhouette(ctx, fx + fw * 0.26, fy + fh, fh * 0.62, fh * 0.14, 0.85);
  drawPalmSilhouette(ctx, fx + fw * 0.78, fy + fh, fh * 0.86, -fh * 0.18, -1);
  drawPalmSilhouette(ctx, fx + fw * 0.74, fy + fh, fh * 0.62, fh * 0.14, -0.85);

  // 5) Crisp black top divider + cream comic hairline separating panels from footer strip
  const dividerH = Math.max(4, Math.round(gutterPx * 0.48));
  ctx.fillStyle = '#08060D';
  ctx.fillRect(fx, fy, fw, dividerH);
  ctx.fillStyle = 'rgba(255, 248, 236, 0.78)';
  ctx.fillRect(fx, fy + dividerH, fw, Math.max(1.5, Math.round(fh * 0.018)));

  // 6) Centered bold tracked Tagline with flanking accent rules (auto-fitted clear of side badges)
  const padSide = Math.round(fw * 0.018);
  const midY = fy + dividerH + (fh - dividerH) * 0.54;
  const barH = Math.round((fh - dividerH) * 0.66);
  const barW = Math.round(barH * 2.05);
  const bx = fx + fw - padSide - barW;
  const showSideItems = fw >= 680;
  const tagX = fx + fw * 0.5;
  let tagLeftBound = tagX;

  if (taglineText) {
    let tagSize = Math.max(15, Math.round(fh * 0.40));
    let tagTracking = Math.round(tagSize * 0.16);
    const maxTagHalfW = showSideItems
      ? (bx - tagX) - Math.round(fw * 0.03)
      : fw * 0.44;
    ctx.font = `400 ${tagSize}px "Bebas Neue", sans-serif`;
    let tagW = measureTextTracked(ctx, taglineText, tagTracking);
    while (tagW * 0.5 > maxTagHalfW && tagSize > 12) {
      tagSize -= 1;
      tagTracking = Math.round(tagSize * 0.14);
      ctx.font = `400 ${tagSize}px "Bebas Neue", sans-serif`;
      tagW = measureTextTracked(ctx, taglineText, tagTracking);
    }

    const ruleGap = Math.round(tagSize * 0.42);
    const availRuleW = Math.max(0, maxTagHalfW - tagW * 0.5 - ruleGap);
    const ruleW = Math.min(Math.round(Math.min(fw * 0.045, fh * 0.58)), availRuleW);
    tagLeftBound = tagX - tagW * 0.5 - (ruleW > 8 ? ruleGap + ruleW : 0);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (ruleW > 8) {
      ctx.strokeStyle = grade.sunColors[0];
      ctx.lineWidth = Math.max(2, Math.round(fh * 0.03));
      ctx.beginPath();
      ctx.moveTo(tagX - tagW * 0.5 - ruleGap - ruleW, midY);
      ctx.lineTo(tagX - tagW * 0.5 - ruleGap, midY);
      ctx.moveTo(tagX + tagW * 0.5 + ruleGap, midY);
      ctx.lineTo(tagX + tagW * 0.5 + ruleGap + ruleW, midY);
      ctx.stroke();
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(5, Math.round(tagSize * 0.22));
    ctx.strokeStyle = '#08050E';
    drawTextTracked(ctx, taglineText, tagX, midY, tagTracking, 'stroke');

    ctx.fillStyle = '#FFFFFF';
    drawTextTracked(ctx, taglineText, tagX, midY, tagTracking, 'fill');
  }

  // 7) Original Left Micro-Credit & Right Graphic Retail Barcode (guaranteed zero collision!)
  if (showSideItems) {
    const creditSize = Math.max(11, Math.round(fh * 0.22));
    const creditTrack = Math.round(creditSize * 0.08);
    ctx.font = `400 ${creditSize}px "Bebas Neue", sans-serif`;
    const leftAvail = tagLeftBound - (fx + padSide) - Math.round(fw * 0.025);
    const candidates = [
      'VICE COVER STUDIO · ORIGINAL ART PRINT',
      'VICE COVER STUDIO · ART PRINT',
      'VCS · ORIGINAL ART',
      'ORIGINAL ART',
    ];
    const creditText = candidates.find((txt) => measureTextTracked(ctx, txt, creditTrack) <= leftAvail);
    if (creditText) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(3, Math.round(creditSize * 0.24));
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#08050E';
      drawTextTracked(ctx, creditText, fx + padSide, midY, creditTrack, 'stroke');
      ctx.fillStyle = '#FFF4E6';
      drawTextTracked(ctx, creditText, fx + padSide, midY, creditTrack, 'fill');
    }

    // Original mini graphic barcode badge on right
    const by = fy + dividerH + ((fh - dividerH) - barH) * 0.5;

    ctx.fillStyle = '#FFF8EC';
    ctx.strokeStyle = '#08060D';
    ctx.lineWidth = Math.max(2, Math.round(fh * 0.025));
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 3);
    ctx.fill();
    ctx.stroke();

    // Deterministic barcode stripe pattern
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
    ctx.fillText('06-2026-VCS', bx + barW * 0.5, by + barH - Math.max(2, barH * 0.05));
  }

  ctx.restore();
}

// Draw iconic 5-star coastal "HEAT" indicator (clears top-banner or footer automatically)
export function renderHeatStars(ctx, width, height, outerFrame, count, grade, titlePosition, panelBottomY) {
  if (!count || count <= 0) return;
  const base = Math.min(width, height);
  const starR = Math.max(10, Math.round(base * 0.0155));
  const gap = starR * 2.55;
  const labelFontSize = Math.round(starR * 1.24);
  ctx.save();
  ctx.font = `700 ${labelFontSize}px "Bebas Neue", sans-serif`;
  const measuredHeatW = ctx.measureText('HEAT').width;
  const padLeft = starR * 1.15;
  const labelGap = starR * 1.25;
  const labelW = padLeft + measuredHeatW + labelGap;
  const totalW = labelW + gap * 5 + starR * 0.85;
  const padX = outerFrame + Math.round(base * 0.022);
  const padY = outerFrame + Math.round(base * 0.022);
  const pillH = Math.round(starR * 2.55);

  const isTopBanner = titlePosition === 'top-banner';
  const pillX = isTopBanner ? padX : width - padX - totalW;
  const pillY = isTopBanner
    ? panelBottomY - Math.round(base * 0.022) - pillH
    : padY;

  ctx.beginPath();
  ctx.moveTo(pillX + 10, pillY);
  ctx.lineTo(pillX + totalW, pillY);
  ctx.lineTo(pillX + totalW - 8, pillY + pillH);
  ctx.lineTo(pillX, pillY + pillH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10, 8, 18, 0.90)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, base * 0.0024);
  ctx.strokeStyle = '#08060D';
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEAT', pillX + padLeft, pillY + pillH * 0.54);

  const startX = pillX + labelW + starR * 0.45;
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
      ctx.shadowColor = grade.accentColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#09060E';
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Draw original editable corner edition stamp (e.g., "VOL. 06", "EST. 2026")
export function renderCornerBadge(ctx, width, height, outerFrame, badgeText, grade, titlePosition, panelBottomY) {
  const clean = (badgeText || '').trim().toUpperCase();
  if (!clean) return;
  const base = Math.min(width, height);
  const fontSize = Math.round(base * 0.029);
  ctx.save();
  ctx.font = `700 ${fontSize}px "Bebas Neue", sans-serif`;
  const textW = measureTextTracked(ctx, clean, fontSize * 0.08);
  const padX = Math.round(fontSize * 0.72);
  const padY = Math.round(fontSize * 0.34);
  const boxW = textW + padX * 2;
  const boxH = fontSize + padY * 2;

  const isTopBanner = titlePosition === 'top-banner';
  const bx = isTopBanner
    ? width - outerFrame - boxW - Math.round(base * 0.024)
    : outerFrame + Math.round(base * 0.024);
  const by = isTopBanner
    ? panelBottomY - Math.round(base * 0.022) - boxH
    : outerFrame + Math.round(base * 0.024);

  const skew = 8;
  ctx.beginPath();
  ctx.moveTo(bx + skew + 5, by + 5);
  ctx.lineTo(bx + boxW + 5, by + 5);
  ctx.lineTo(bx + boxW - skew + 5, by + boxH + 5);
  ctx.lineTo(bx + 5, by + boxH + 5);
  ctx.closePath();
  ctx.fillStyle = '#07050B';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(bx + skew, by);
  ctx.lineTo(bx + boxW, by);
  ctx.lineTo(bx + boxW - skew, by + boxH);
  ctx.lineTo(bx, by + boxH);
  ctx.closePath();
  ctx.fillStyle = grade.badgeBg;
  ctx.fill();
  ctx.lineWidth = Math.max(2.5, base * 0.003);
  ctx.strokeStyle = '#09060E';
  ctx.stroke();

  ctx.fillStyle = grade.badgeFg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawTextTracked(ctx, clean, bx + boxW * 0.5, by + boxH * 0.54, fontSize * 0.08, 'fill');
  ctx.restore();
}

// Draw jagged 18-point original starburst seal cleanly at an interior panel gutter intersection
export function renderGutterStarburst(ctx, anchor, base, starburstText, grade) {
  const outerR = Math.round(base * 0.047);
  const innerR = outerR * 0.76;
  const points = 18;
  const totalVerts = points * 2;
  const label = (starburstText || 'ORIGINAL EDITION').trim().toUpperCase();
  const words = label.split(/\s+/).filter(Boolean);
  const line1 = words.length > 1 ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : label;
  const line2 = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(' ') : 'COVER ART';

  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.rotate((-11 * Math.PI) / 180);

  // Offset comic drop shadow
  const traceBurst = (dx, dy) => {
    ctx.beginPath();
    for (let i = 0; i < totalVerts; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points;
      const px = dx + Math.cos(angle) * r;
      const py = dy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  traceBurst(5, 6);
  ctx.fillStyle = '#07050B';
  ctx.fill();

  traceBurst(0, 0);
  ctx.fillStyle = grade.starburstBg;
  ctx.fill();
  ctx.lineWidth = Math.max(2.6, base * 0.0032);
  ctx.strokeStyle = '#08060D';
  ctx.stroke();

  // Inner seal ring
  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.84, 0, Math.PI * 2);
  ctx.strokeStyle = grade.starburstFg;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  const fs = Math.max(11, Math.round(outerR * 0.34));
  ctx.font = `700 ${fs}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = grade.starburstFg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${line1} ★`, 0, -fs * 0.45);
  ctx.fillText(line2, 0, fs * 0.56);

  ctx.restore();
}

// Render monumental AAA GTA-inspired cover title + overlapping neon script + swoosh + footer strip + badges
export function renderCoverTypography(ctx, width, height, outerFrame, state, geometries = [], footerH = 0, gutterPx = 12) {
  const grade = getGradeById(state.gradeId);
  const titleText = (state.title || '').trim().toUpperCase();
  const scriptText = (state.script || '').trim();
  const taglineText = (state.tagline || '').trim().toUpperCase();
  const pos = state.titlePosition || 'bottom-center';
  const style = state.titleStyle || 'sunset-extrude';
  const base = Math.min(width, height);
  const aspect = width / height;
  const bottomReservePx = footerH > 0 ? footerH + Math.round(gutterPx * 0.45) : 0;
  const panelBottomY = height - outerFrame - bottomReservePx;

  // 1) Collector Footer Strip at bottom
  if (footerH > 0) {
    renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade);
  }

  // 2) Gutter Starburst Seal (drawn before title so monumental title always stays top-most)
  if (state.showStarburst && geometries.length > 0) {
    const anchor = findStarburstAnchor(geometries, width, height, pos, outerFrame, bottomReservePx);
    renderGutterStarburst(ctx, anchor, base, state.starburstText, grade);
  }

  // 3) Corner Edition Badge & 5-Star Heat Meter
  renderCornerBadge(ctx, width, height, outerFrame, state.badge, grade, pos, panelBottomY);
  if (state.showHeatStars) {
    renderHeatStars(ctx, width, height, outerFrame, state.heatStars ?? 5, grade, pos, panelBottomY);
  }

  if (!titleText && !scriptText && !taglineText) return;

  const maxTextW = (width - outerFrame * 2) * (pos === 'bottom-left' ? 0.68 : aspect > 1.25 ? 0.78 : 0.86);

  // Monumental Anton display sizing (72-80% poster width on 16:9)
  let titleSize = Math.round(base * (aspect > 1.25 ? 0.24 : 0.175));
  ctx.save();
  ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
  if (titleText) {
    let measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.03));
    while (measured > maxTextW && titleSize > 44) {
      titleSize -= 4;
      ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
      measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.03));
    }
  }
  const finalTracking = Math.round(titleSize * 0.03);
  const scriptSize = Math.round(titleSize * 0.42);
  const taglineSize = Math.max(18, Math.round(base * 0.029));

  // Anchor calculation
  let anchorX = width * 0.5;
  let titleY = panelBottomY - Math.round(base * (footerH > 0 ? 0.068 : 0.115));
  let textAlign = 'center';

  if (pos === 'top-banner') {
    anchorX = width * 0.5;
    titleY = outerFrame + Math.round(titleSize * 0.96) + Math.round(base * 0.028);
    textAlign = 'center';
  } else if (pos === 'center-emblem') {
    anchorX = width * 0.5;
    titleY = outerFrame + (panelBottomY - outerFrame) * 0.54;
    textAlign = 'center';
  } else if (pos === 'bottom-left') {
    anchorX = outerFrame + Math.round(base * 0.042);
    titleY = panelBottomY - Math.round(base * (footerH > 0 ? 0.068 : 0.115));
    textAlign = 'left';
  }

  // Atmospheric dark scrim behind lettering so headline & script have razor-sharp contrast
  ctx.save();
  if (pos === 'top-banner') {
    const scrimH = Math.round(titleSize * 1.9 + outerFrame);
    const sg = ctx.createLinearGradient(0, outerFrame, 0, outerFrame + scrimH);
    sg.addColorStop(0, 'rgba(9, 6, 16, 0.84)');
    sg.addColorStop(0.6, 'rgba(9, 6, 16, 0.44)');
    sg.addColorStop(1, 'rgba(9, 6, 16, 0)');
    ctx.fillStyle = sg;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, scrimH);
  } else if (pos === 'center-emblem') {
    const rg = ctx.createRadialGradient(width * 0.5, titleY, base * 0.05, width * 0.5, titleY, base * 0.52);
    rg.addColorStop(0, 'rgba(10, 6, 20, 0.76)');
    rg.addColorStop(0.65, 'rgba(10, 6, 20, 0.34)');
    rg.addColorStop(1, 'rgba(10, 6, 20, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, panelBottomY - outerFrame);
  } else {
    const scrimH = Math.round(titleSize * 1.85 + base * 0.06);
    const sg = ctx.createLinearGradient(0, panelBottomY - scrimH, 0, panelBottomY);
    sg.addColorStop(0, 'rgba(9, 6, 16, 0)');
    sg.addColorStop(0.45, 'rgba(9, 6, 16, 0.50)');
    sg.addColorStop(1, 'rgba(9, 6, 16, 0.88)');
    ctx.fillStyle = sg;
    ctx.fillRect(outerFrame, panelBottomY - scrimH, width - outerFrame * 2, scrimH);
  }
  ctx.restore();

  const tiltRad = (style === 'sunset-extrude' || style === 'neon-chrome')
    ? (-2.5 * Math.PI) / 180
    : 0;
  const pivotX = anchorX;
  const pivotY = titleY - titleSize * 0.36;

  // MAIN MONUMENTAL DISPLAY HEADLINE (with -2.5° dynamic tilt, 11-step 3D extrude, thick outline & inner bevel highlight)
  if (titleText) {
    ctx.save();
    if (tiltRad) {
      ctx.translate(pivotX, pivotY);
      ctx.rotate(tiltRad);
      ctx.translate(-pivotX, -pivotY);
    }

    ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const strokeW = Math.max(10, Math.round(titleSize * 0.125));
    const extrudeSteps = style === 'clean-ink' ? 4 : 11;
    const extrudeX = titleSize * 0.0115;
    const extrudeY = titleSize * 0.0135;

    // 1) Deep solid 3D offset extrusion shadow
    ctx.fillStyle = '#07040C';
    ctx.strokeStyle = '#07040C';
    ctx.lineWidth = strokeW;
    for (let s = extrudeSteps; s >= 1; s--) {
      drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'stroke');
      drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'fill');
    }

    // 2) Secondary luminous outer rim on neon-chrome
    if (style === 'neon-chrome') {
      ctx.strokeStyle = grade.accentColor;
      ctx.lineWidth = strokeW * 1.14;
      ctx.shadowColor = grade.accentColor;
      ctx.shadowBlur = 24;
      drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');
      ctx.shadowBlur = 0;
    }

    // 3) Heavy matte-black comic outline
    ctx.strokeStyle = '#08050E';
    ctx.lineWidth = strokeW;
    drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');

    // 4) Multi-stop horizon/chrome fill + crisp top bevel sheen via isolated offscreen layer
    const bandTop = Math.max(0, Math.floor(titleY - titleSize * 1.05));
    const bandBot = Math.min(height, Math.ceil(titleY + titleSize * 0.25));
    const bandH = Math.max(16, bandBot - bandTop);
    const localY = titleY - bandTop;

    const layer = document.createElement('canvas');
    layer.width = width;
    layer.height = bandH;
    const lctx = layer.getContext('2d');
    lctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
    lctx.textAlign = textAlign;
    lctx.textBaseline = 'alphabetic';

    const fillGrad = lctx.createLinearGradient(0, localY - titleSize * 0.84, 0, localY + titleSize * 0.05);
    if (style === 'clean-ink') {
      fillGrad.addColorStop(0, '#FFFFFF');
      fillGrad.addColorStop(0.55, '#F2ECFF');
      fillGrad.addColorStop(1, '#D3CBE6');
    } else if (style === 'noir-gold') {
      fillGrad.addColorStop(0, '#FFF9DE');
      fillGrad.addColorStop(0.46, '#F6B940');
      fillGrad.addColorStop(0.52, '#D9383A');
      fillGrad.addColorStop(1, '#A31232');
    } else if (style === 'neon-chrome') {
      fillGrad.addColorStop(0, '#FFFFFF');
      fillGrad.addColorStop(0.44, '#70F3FF');
      fillGrad.addColorStop(0.50, '#2B1F68');
      fillGrad.addColorStop(0.55, '#FF3DC2');
      fillGrad.addColorStop(1, '#FFA0E8');
    } else {
      // sunset-extrude horizon chrome gradient
      fillGrad.addColorStop(0, '#FFFCE6');
      fillGrad.addColorStop(0.45, '#FFC130');
      fillGrad.addColorStop(0.51, '#FF6E3A');
      fillGrad.addColorStop(0.55, '#FF4E6A');
      fillGrad.addColorStop(1, '#FF267E');
    }

    lctx.fillStyle = fillGrad;
    drawTextTracked(lctx, titleText, anchorX, localY, finalTracking, 'fill');

    // Crisp inner top bevel highlight clipped cleanly inside glyphs
    lctx.globalCompositeOperation = 'source-atop';
    const sheenGrad = lctx.createLinearGradient(0, localY - titleSize * 0.86, 0, localY - titleSize * 0.56);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    lctx.fillStyle = sheenGrad;
    lctx.fillRect(0, 0, width, bandH);

    // Subtle crisp bright bevel rim along top inner edge
    lctx.lineWidth = Math.max(2, titleSize * 0.016);
    lctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    drawTextTracked(lctx, titleText, anchorX - 1, localY + 1.5, finalTracking, 'stroke');

    ctx.drawImage(layer, 0, bandTop);
    ctx.restore();
  }

  // OVERLAPPING GLOWING NEON BRUSH SCRIPT + NEON SWOOSH UNDERLINE
  if (scriptText) {
    ctx.save();
    const titleW = titleText ? measureTextTracked(ctx, titleText, finalTracking) : 0;
    let sx = anchorX;
    if (textAlign === 'center') sx = anchorX + titleW * 0.21;
    else if (textAlign === 'left') sx = anchorX + titleW * 0.46;
    const rawSy = titleY + Math.round(titleSize * 0.06);
    const sy = pos === 'top-banner'
      ? rawSy
      : Math.min(rawSy, panelBottomY - Math.round(scriptSize * 0.72));

    ctx.translate(sx, sy);
    ctx.rotate((-5.5 * Math.PI) / 180);
    ctx.font = `400 ${scriptSize}px "Yellowtail", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const scriptW = ctx.measureText(scriptText).width;
    const swX0 = -scriptW * 0.44;
    const swX1 = scriptW * 0.46;
    const swY0 = scriptSize * 0.43;
    const swY1 = scriptSize * 0.33;

    // 1) Neon brush swoosh underline behind/beneath script
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
    drawSwoosh(Math.max(3.5, scriptSize * 0.07), grade.scriptColor, 16);
    drawSwoosh(Math.max(1.5, scriptSize * 0.025), 'rgba(255, 255, 255, 0.8)', 4);

    // 2) Thick dark ink backing stroke so neon script pops cleanly
    ctx.lineWidth = Math.max(8, Math.round(scriptSize * 0.20));
    ctx.strokeStyle = '#0B0612';
    ctx.strokeText(scriptText, 0, 0);

    // 3) Outer neon bloom glow
    ctx.shadowColor = grade.scriptGlow;
    ctx.shadowBlur = 22;
    ctx.fillStyle = grade.scriptColor;
    ctx.fillText(scriptText, 0, 0);

    // 4) Bright hot filament core inside neon tube
    ctx.shadowBlur = 7;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(scriptText, 0, -1);
    ctx.restore();
  }

  // Fallback floating tagline ONLY when Collector Footer Strip is toggled OFF
  if (taglineText && footerH <= 0) {
    ctx.save();
    ctx.font = `400 ${taglineSize}px "Bebas Neue", sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    const tagTracking = Math.round(taglineSize * 0.22);
    const tagY = pos === 'top-banner'
      ? outerFrame + Math.round(base * 0.032)
      : height - outerFrame - Math.round(base * 0.038);

    const tagW = measureTextTracked(ctx, taglineText, tagTracking);
    if (textAlign === 'center') {
      const ruleW = Math.round(base * 0.045);
      const ruleGap = Math.round(base * 0.018);
      ctx.strokeStyle = grade.accentColor;
      ctx.lineWidth = Math.max(2, Math.round(base * 0.0028));
      ctx.beginPath();
      ctx.moveTo(anchorX - tagW * 0.5 - ruleGap - ruleW, tagY);
      ctx.lineTo(anchorX - tagW * 0.5 - ruleGap, tagY);
      ctx.moveTo(anchorX + tagW * 0.5 + ruleGap, tagY);
      ctx.lineTo(anchorX + tagW * 0.5 + ruleGap + ruleW, tagY);
      ctx.stroke();
    }

    ctx.lineWidth = Math.max(4, Math.round(taglineSize * 0.16));
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#09060E';
    drawTextTracked(ctx, taglineText, anchorX, tagY, tagTracking, 'stroke');

    ctx.fillStyle = '#F8F4FF';
    drawTextTracked(ctx, taglineText, anchorX, tagY, tagTracking, 'fill');
    ctx.restore();
  }
  ctx.restore();
}
