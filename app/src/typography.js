// Original AAA GTA-style cover typography:
// - Dedicated Lower Title Stage Band (keeps 100% of multi-panel art unobstructed!)
// - -2.5° tilted 3D gradient bold main title with thick black outline + deep purple-black extrusion
// - Glowing neon brush script + swoosh directly beneath right side of title
// - Editable 5-star press review bar
// - Large high-contrast gold & black-ringed "ORIGINAL COVER ART" sunburst seal (legible at 768x480)
// - Top-left VOL. 06 + COLLECTOR'S EDITION pills & top-right HEAT 5★ meter
// - Full cinematic footer strip: retro striped sun, coastal skyline, 4 palm trees, tracked tagline, billing credits & barcode

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

// Cinematic Footer Strip: palm trees, striped retro sun, skyline, tagline, billing-block credits, and barcode
export function renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade, borderStyle) {
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

  // Horizontal twilight gradient
  const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
  fg.addColorStop(0, grade.footerGradient[0]);
  fg.addColorStop(0.5, grade.footerGradient[1]);
  fg.addColorStop(1, grade.footerGradient[2]);
  ctx.fillStyle = fg;
  ctx.fillRect(fx, fy, fw, fh);

  const vg = ctx.createLinearGradient(0, fy, 0, fy + fh);
  vg.addColorStop(0, 'rgba(8, 5, 16, 0.46)');
  vg.addColorStop(0.5, 'rgba(8, 5, 16, 0.16)');
  vg.addColorStop(1, 'rgba(8, 5, 16, 0.72)');
  ctx.fillStyle = vg;
  ctx.fillRect(fx, fy, fw, fh);

  // Retro striped sunset/neon sun disc centered behind tagline
  const sunX = fx + fw * 0.5;
  const sunY = fy + fh * 0.98;
  const sunR = fh * 0.90;

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

  // Coastal skyline silhouette
  const skyHeights = [0.22, 0.34, 0.18, 0.40, 0.25, 0.32, 0.16, 0.28, 0.42, 0.21, 0.35, 0.19, 0.30, 0.24];
  ctx.fillStyle = '#090510';
  const bldgCount = Math.max(14, Math.round(fw / 48));
  const bldgW = fw / bldgCount;
  for (let i = 0; i < bldgCount; i++) {
    const bh = fh * (0.14 + skyHeights[i % skyHeights.length] * 0.44);
    const bx = fx + i * bldgW;
    const by = fy + fh - bh;
    ctx.fillRect(bx - 0.5, by, bldgW + 1, bh + 2);
    if (i % 3 === 1 && bh > fh * 0.25) {
      ctx.fillStyle = grade.sunColors[0];
      ctx.fillRect(bx + bldgW * 0.28, by + fh * 0.05, Math.max(2, bldgW * 0.14), Math.max(2, fh * 0.04));
      ctx.fillRect(bx + bldgW * 0.56, by + fh * 0.09, Math.max(2, bldgW * 0.14), Math.max(2, fh * 0.04));
      ctx.fillStyle = '#090510';
    }
  }

  // Sweeping palm trees framing center
  drawPalmSilhouette(ctx, fx + fw * 0.20, fy + fh, fh * 0.88, -fh * 0.18, 1);
  drawPalmSilhouette(ctx, fx + fw * 0.24, fy + fh, fh * 0.64, fh * 0.14, 0.85);
  drawPalmSilhouette(ctx, fx + fw * 0.80, fy + fh, fh * 0.88, -fh * 0.18, -1);
  drawPalmSilhouette(ctx, fx + fw * 0.76, fy + fh, fh * 0.64, fh * 0.14, -0.85);

  // Crisp divider line at top of footer matching border theme
  const dividerH = Math.max(4, Math.round(gutterPx * 0.42));
  ctx.fillStyle = borderStyle.color;
  ctx.fillRect(fx, fy, fw, dividerH);
  ctx.fillStyle = '#080510';
  ctx.fillRect(fx, fy + dividerH, fw, Math.max(2, Math.round(fh * 0.022)));

  const padSide = Math.round(fw * 0.018);
  const contentTop = fy + dividerH + 2;
  const contentH = fh - dividerH - 2;
  const barH = Math.round(contentH * 0.72);
  const barW = Math.round(barH * 2.05);
  const bx = fx + fw - padSide - barW;
  const showSideItems = fw >= 640;
  const tagX = fx + fw * 0.5;
  const tagY = contentTop + contentH * 0.38;
  const creditBlockY = contentTop + contentH * 0.76;
  let tagLeftBound = tagX;

  // Bold spaced tagline
  if (taglineText) {
    let tagSize = Math.max(14, Math.round(fh * 0.34));
    let tagTracking = Math.round(tagSize * 0.18);
    const maxTagHalfW = showSideItems
      ? (bx - tagX) - Math.round(fw * 0.03)
      : fw * 0.44;
    ctx.font = `700 ${tagSize}px "Bebas Neue", sans-serif`;
    let tagW = measureTextTracked(ctx, taglineText, tagTracking);
    while (tagW * 0.5 > maxTagHalfW && tagSize > 11) {
      tagSize -= 1;
      tagTracking = Math.round(tagSize * 0.14);
      ctx.font = `700 ${tagSize}px "Bebas Neue", sans-serif`;
      tagW = measureTextTracked(ctx, taglineText, tagTracking);
    }

    const ruleGap = Math.round(tagSize * 0.42);
    const availRuleW = Math.max(0, maxTagHalfW - tagW * 0.5 - ruleGap);
    const ruleW = Math.min(Math.round(Math.min(fw * 0.045, fh * 0.52)), availRuleW);
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

  // Miniature movie-poster billing-block credits below tagline
  const billingSize = Math.max(8, Math.round(fh * 0.145));
  const billingTracking = Math.round(billingSize * 0.10);
  ctx.font = `600 ${billingSize}px "Barlow", sans-serif`;
  const maxBillW = showSideItems ? (bx - fx - padSide * 3) * 0.62 : fw * 0.88;
  const billingOptions = [
    'VICE COVER STUDIO PRESENTS · ORIGINAL MULTI-PANEL ARTWORK · PAINTERLY SOBEL INK · OFFLINE COLLECTOR PRINT',
    'VICE COVER STUDIO · ORIGINAL MULTI-PANEL ARTWORK · PAINTERLY INK ENGINE · COLLECTOR PRINT',
    'VICE COVER STUDIO · ORIGINAL COLLECTOR PRINT EDITION',
  ];
  const billingText = billingOptions.find((t) => measureTextTracked(ctx, t, billingTracking) <= maxBillW);
  if (billingText) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2.5, Math.round(billingSize * 0.28));
    ctx.strokeStyle = '#07040E';
    drawTextTracked(ctx, billingText, tagX, creditBlockY, billingTracking, 'stroke');
    ctx.fillStyle = 'rgba(246, 241, 231, 0.88)';
    drawTextTracked(ctx, billingText, tagX, creditBlockY, billingTracking, 'fill');
  }

  // Left micro-brand & Right crisp barcode
  if (showSideItems) {
    const creditSize = Math.max(10, Math.round(fh * 0.20));
    const creditTrack = Math.round(creditSize * 0.08);
    ctx.font = `700 ${creditSize}px "Bebas Neue", sans-serif`;
    const leftAvail = tagLeftBound - (fx + padSide) - Math.round(fw * 0.02);
    const leftLabel = ['VCS · ORIGINAL ART', 'VCS · PRINT'].find(
      (txt) => measureTextTracked(ctx, txt, creditTrack) <= leftAvail,
    );
    if (leftLabel) {
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
    ctx.fillText('06-2026-VCS', bx + barW * 0.5, by + barH - Math.max(2, barH * 0.04));
  }

  ctx.restore();
}

// Top-Right HEAT 5-Star Badge
export function renderHeatStars(ctx, width, outerFrame, count, grade, titlePosition, mosaicBottom) {
  if (!count || count <= 0) return;
  const base = Math.min(width, 1080);
  const starR = Math.max(10, Math.round(base * 0.0145));
  const gap = starR * 2.45;
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
  ctx.lineWidth = Math.max(2, base * 0.0024);
  ctx.strokeStyle = 'rgba(246, 241, 231, 0.85)';
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

// Top-Left VOL. 06 Corner Stamp + COLLECTOR'S EDITION Pill
export function renderCornerBadges(ctx, width, outerFrame, badgeText, editionPill, grade, titlePosition, mosaicBottom) {
  const clean = (badgeText || '').trim().toUpperCase();
  const edClean = (editionPill || '').trim().toUpperCase();
  if (!clean && !edClean) return;

  const base = Math.min(width, 1080);
  const fontSize = Math.round(base * 0.026);
  const padX = Math.round(fontSize * 0.65);
  const padY = Math.round(fontSize * 0.30);
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
    ctx.lineWidth = Math.max(2.5, base * 0.0028);
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
    ctx.lineWidth = Math.max(2, base * 0.0022);
    ctx.strokeStyle = grade.badgeBg;
    ctx.stroke();

    ctx.fillStyle = '#FFF6E8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTextTracked(ctx, edClean, cursorX + boxW * 0.5, by + boxH * 0.54, edTrack, 'fill');
  }
  ctx.restore();
}

// LARGE High-Contrast Gold & Black-Ringed "ORIGINAL COVER ART" Sunburst Seal (legible at 768x480!)
export function renderLargeGoldSunburstSeal(ctx, cx, cy, outerR, starburstText) {
  const innerR = outerR * 0.78;
  const points = 20;
  const totalVerts = points * 2;
  const label = (starburstText || 'ORIGINAL COVER ART').trim().toUpperCase();
  const words = label.split(/\s+/).filter(Boolean);
  const line1 = words.length > 1 ? words[0] : label;
  const line2 = words.length > 1 ? words.slice(1).join(' ') : 'COVER ART';

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

  // Heavy comic offset shadow
  traceBurst(outerR * 0.09, outerR * 0.11, 1);
  ctx.fillStyle = '#07040C';
  ctx.fill();

  // Metallic gold sunburst fill + thick obsidian stroke
  traceBurst(0, 0, 1);
  const goldGrad = ctx.createRadialGradient(-outerR * 0.25, -outerR * 0.25, outerR * 0.1, 0, 0, outerR);
  goldGrad.addColorStop(0, '#FFF6AA');
  goldGrad.addColorStop(0.55, '#FFD038');
  goldGrad.addColorStop(1, '#F29A16');
  ctx.fillStyle = goldGrad;
  ctx.fill();
  ctx.lineWidth = Math.max(3, outerR * 0.065);
  ctx.strokeStyle = '#0B0612';
  ctx.stroke();

  // Crisp black inner ring frame
  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = '#0B0612';
  ctx.lineWidth = Math.max(2.2, outerR * 0.042);
  ctx.stroke();

  const fs1 = Math.max(12, Math.round(outerR * 0.30));
  const fs2 = Math.max(11, Math.round(outerR * 0.26));
  ctx.fillStyle = '#0B0612';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 ${fs1}px "Bebas Neue", sans-serif`;
  ctx.fillText(`★ ${line1} ★`, 0, -fs1 * 0.42, innerR * 1.48);

  ctx.font = `700 ${fs2}px "Bebas Neue", sans-serif`;
  ctx.fillText(line2, 0, fs2 * 0.58, innerR * 1.48);

  ctx.restore();
}

// Editable 5-Star Press Review Bar
function renderPressQuotePill(ctx, cx, cy, maxW, quoteText, grade, base) {
  const clean = (quoteText || '').trim().toUpperCase();
  if (!clean) return;
  let fs = Math.max(12, Math.round(base * 0.022));
  ctx.save();
  ctx.font = `700 ${fs}px "Bebas Neue", sans-serif`;
  let tracking = Math.round(fs * 0.08);
  let tw = measureTextTracked(ctx, clean, tracking);
  while (tw + fs * 1.6 > maxW && fs > 10) {
    fs -= 1;
    tracking = Math.round(fs * 0.06);
    ctx.font = `700 ${fs}px "Bebas Neue", sans-serif`;
    tw = measureTextTracked(ctx, clean, tracking);
  }
  const padX = Math.round(fs * 0.82);
  const pillW = tw + padX * 2;
  const pillH = Math.round(fs * 1.68);
  const px = cx - pillW * 0.5;
  const py = cy - pillH * 0.5;

  // Offset drop shadow
  ctx.fillStyle = '#06030C';
  ctx.beginPath();
  ctx.roundRect(px + 3, py + 4, pillW, pillH, 999);
  ctx.fill();

  ctx.fillStyle = 'rgba(13, 8, 24, 0.96)';
  ctx.beginPath();
  ctx.roundRect(px, py, pillW, pillH, 999);
  ctx.fill();
  ctx.lineWidth = Math.max(2, base * 0.0024);
  ctx.strokeStyle = '#FFD447';
  ctx.stroke();

  // Draw leading stars in bright gold if present, then rest of quote in cream white
  const starMatch = clean.match(/^([★☆]+\s*)(.*)$/);
  ctx.textBaseline = 'middle';
  if (starMatch) {
    const stars = starMatch[1];
    const rest = starMatch[2];
    const starsW = measureTextTracked(ctx, stars, tracking);
    const totalMeasured = starsW + measureTextTracked(ctx, rest, tracking);
    let tx = cx - totalMeasured * 0.5;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFD447';
    drawTextTracked(ctx, stars, tx, cy + 1, tracking, 'fill');
    tx += starsW;
    ctx.fillStyle = '#FAF6EE';
    drawTextTracked(ctx, rest, tx, cy + 1, tracking, 'fill');
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.sunColors[0];
    drawTextTracked(ctx, clean, cx, cy + 1, tracking, 'fill');
  }
  ctx.restore();
}

// Render 3D bold tilted title + neon script + press quote + large sunburst + top badges + footer strip
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
  gutterPx = 12,
) {
  const grade = getGradeById(state.gradeId);
  const borderStyle = getBorderStyleById(state.borderStyle || 'cream');
  const titleText = (state.title || '').trim().toUpperCase();
  const scriptText = (state.script || '').trim();
  const taglineText = (state.tagline || '').trim().toUpperCase();
  const pos = state.titlePosition || 'docked-bottom';
  const style = state.titleStyle || 'sunset-extrude';
  const base = Math.min(width, height);
  const aspect = width / height;

  const mosaicTop = outerFrame + topReservePx;
  const mosaicBottom = height - outerFrame - footerH - dockedTitleH;
  const stageTop = mosaicBottom;
  const stageBottom = height - outerFrame - footerH;

  // 1) Render dramatic Lower Title Stage Band (when docked-bottom) or Top Title Stage Band (when top-banner)
  if (dockedTitleH > 0) {
    ctx.save();
    const bg = ctx.createLinearGradient(outerFrame, stageTop, width - outerFrame, stageBottom);
    bg.addColorStop(0, grade.titleStageGradient[0]);
    bg.addColorStop(0.52, grade.titleStageGradient[1]);
    bg.addColorStop(1, grade.titleStageGradient[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(outerFrame, stageTop, width - outerFrame * 2, dockedTitleH);

    // Horizon glow + diagonal filmic sheen streaks behind main title
    const aura = ctx.createRadialGradient(
      width * 0.45,
      stageTop + dockedTitleH * 0.45,
      base * 0.04,
      width * 0.45,
      stageTop + dockedTitleH * 0.45,
      width * 0.56,
    );
    aura.addColorStop(0, grade.bloomColor);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(outerFrame, stageTop, width - outerFrame * 2, dockedTitleH);

    // Subtle diagonal anamorphic light flares across lower title stage
    ctx.save();
    ctx.beginPath();
    ctx.rect(outerFrame, stageTop, width - outerFrame * 2, dockedTitleH);
    ctx.clip();
    ctx.fillStyle = grade.bloomColor;
    ctx.globalAlpha = 0.16;
    for (const [sx0, sw0] of [[0.06, 0.16], [0.28, 0.11], [0.64, 0.14]]) {
      ctx.beginPath();
      ctx.moveTo(width * sx0, stageTop);
      ctx.lineTo(width * (sx0 + sw0), stageTop);
      ctx.lineTo(width * (sx0 + sw0 - 0.06), stageBottom);
      ctx.lineTo(width * (sx0 - 0.06), stageBottom);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Crisp horizontal border beam separating mosaic from Title Stage Band
    const seamH = Math.max(6, Math.round(gutterPx * 0.65));
    ctx.fillStyle = borderStyle.color;
    ctx.fillRect(outerFrame, stageTop - seamH * 0.5, width - outerFrame * 2, seamH);
    ctx.fillStyle = '#090512';
    ctx.fillRect(outerFrame, stageTop + seamH * 0.5, width - outerFrame * 2, Math.max(2, Math.round(seamH * 0.25)));
    ctx.restore();
  } else if (topReservePx > 0) {
    ctx.save();
    const bg = ctx.createLinearGradient(outerFrame, outerFrame, width - outerFrame, outerFrame + topReservePx);
    bg.addColorStop(0, grade.titleStageGradient[0]);
    bg.addColorStop(0.52, grade.titleStageGradient[1]);
    bg.addColorStop(1, grade.titleStageGradient[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, topReservePx);
    const seamH = Math.max(6, Math.round(gutterPx * 0.65));
    ctx.fillStyle = borderStyle.color;
    ctx.fillRect(outerFrame, mosaicTop - seamH * 0.5, width - outerFrame * 2, seamH);
    ctx.restore();
  }

  // 2) Cinematic Footer Strip
  if (footerH > 0) {
    renderPosterFooterStrip(ctx, width, height, outerFrame, footerH, gutterPx, state, grade, borderStyle);
  }

  // 3) Top Corner Badges & 5-Star HEAT Badge
  renderCornerBadges(ctx, width, outerFrame, state.badge, state.editionPill, grade, pos, mosaicBottom);
  if (state.showHeatStars) {
    renderHeatStars(ctx, width, outerFrame, state.heatStars ?? 5, grade, pos, mosaicBottom);
  }

  // 4) Large High-Contrast Sunburst Seal position (collision-free from title, badges & footer!)
  const sealR = Math.round(base * (aspect > 1.25 ? 0.072 : 0.068));
  const sealX = width - outerFrame - sealR - Math.round(width * 0.032);
  const sealY = pos === 'docked-bottom'
    ? stageTop + Math.round(dockedTitleH * 0.10)
    : pos === 'top-banner'
      ? mosaicTop - Math.round(sealR * 0.08)
      : mosaicBottom - Math.round(base * 0.23);

  // 5) Main 3D Bold Title + Neon Script + Press Quote
  if (titleText || scriptText) {
    const reserveSealW = state.showStarburst ? sealR * 2.1 + width * 0.032 : 0;
    const availW = (width - outerFrame * 2) - reserveSealW - Math.round(width * 0.036);
    const maxTextW = Math.max(width * 0.50, Math.min((width - outerFrame * 2) * 0.88, availW * 0.94));

    let titleSize = Math.round(
      dockedTitleH > 0
        ? dockedTitleH * (aspect > 1.25 ? 0.78 : 0.66)
        : base * (aspect > 1.25 ? 0.21 : 0.165),
    );
    ctx.save();
    ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
    if (titleText) {
      let measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.025));
      while (measured > maxTextW && titleSize > 38) {
        titleSize -= 3;
        ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
        measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.025));
      }
    }
    const finalTracking = Math.round(titleSize * 0.025);
    const scriptSize = Math.round(titleSize * 0.44);

    // Center title inside remaining width left of the large gold seal when docked
    const centerLeftZone = state.showStarburst && pos !== 'center-emblem'
      ? outerFrame + (sealX - sealR - outerFrame) * 0.52
      : width * 0.5;

    let anchorX = centerLeftZone;
    let textAlign = 'center';
    let titleY = stageTop + Math.round(dockedTitleH * (aspect > 1.25 ? 0.72 : 0.68));

    if (pos === 'top-banner') {
      anchorX = centerLeftZone;
      titleY = outerFrame + Math.round(topReservePx * 0.68);
    } else if (pos === 'center-emblem') {
      anchorX = width * 0.5;
      titleY = mosaicTop + (mosaicBottom - mosaicTop) * 0.54;
    } else if (pos === 'overlay-bottom') {
      anchorX = centerLeftZone;
      titleY = mosaicBottom - Math.round(base * 0.075);
    } else if (pos === 'bottom-left') {
      anchorX = outerFrame + Math.round(base * 0.045);
      titleY = mosaicBottom - Math.round(base * 0.075);
      textAlign = 'left';
    }

    // Scrim only for overlay modes so panel art stays punchy
    if (pos === 'overlay-bottom' || pos === 'bottom-left') {
      const scrimH = Math.round(titleSize * 1.85);
      const sg = ctx.createLinearGradient(0, mosaicBottom - scrimH, 0, mosaicBottom);
      sg.addColorStop(0, 'rgba(9, 6, 16, 0)');
      sg.addColorStop(0.5, 'rgba(9, 6, 16, 0.52)');
      sg.addColorStop(1, 'rgba(9, 6, 16, 0.88)');
      ctx.fillStyle = sg;
      ctx.fillRect(outerFrame, mosaicBottom - scrimH, width - outerFrame * 2, scrimH);
    } else if (pos === 'center-emblem') {
      const rg = ctx.createRadialGradient(width * 0.5, titleY, base * 0.05, width * 0.5, titleY, base * 0.48);
      rg.addColorStop(0, 'rgba(10, 6, 20, 0.78)');
      rg.addColorStop(1, 'rgba(10, 6, 20, 0)');
      ctx.fillStyle = rg;
      ctx.fillRect(outerFrame, mosaicTop, width - outerFrame * 2, mosaicBottom - mosaicTop);
    }

    // 5-Star Press Review Bar tucked cleanly right above the Title Stage seam (clear of seal & title)
    if (state.showPressQuote && state.pressQuote) {
      const quoteCx = state.showStarburst ? Math.min(centerLeftZone, sealX - sealR - Math.round(width * 0.14)) : width * 0.5;
      const quoteCy = pos === 'docked-bottom'
        ? stageTop - Math.round(base * (aspect > 1.25 ? 0.024 : 0.015))
        : pos === 'top-banner'
          ? mosaicTop + Math.round(base * 0.018)
          : Math.max(mosaicTop + base * 0.04, titleY - titleSize * 1.05);
      const quoteMaxW = Math.max(width * 0.36, (sealX - sealR - outerFrame) * 0.86);
      renderPressQuotePill(ctx, quoteCx, quoteCy, quoteMaxW, state.pressQuote, grade, base);
    }

    // Tilt -2.5 degrees on main 3D title
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

      const strokeW = Math.max(10, Math.round(titleSize * 0.13));
      const extrudeSteps = style === 'clean-ink' ? 4 : 12;
      const extrudeX = titleSize * 0.012;
      const extrudeY = titleSize * 0.0145;

      // Deep solid 3D purple-black extrusion
      for (let s = extrudeSteps; s >= 1; s--) {
        const shade = s > 7 ? '#1C0933' : '#080410';
        ctx.fillStyle = shade;
        ctx.strokeStyle = shade;
        ctx.lineWidth = strokeW;
        drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'stroke');
        drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'fill');
      }

      if (style === 'neon-chrome') {
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = strokeW * 1.15;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 22;
        drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');
        ctx.shadowBlur = 0;
      }

      // Thick matte black comic outline
      ctx.strokeStyle = '#08050E';
      ctx.lineWidth = strokeW;
      drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');

      // Multi-stop gradient fill + inner bevel highlight (band enlarged for -2.5° tilted title edges!)
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
      } else if (style === 'golden-heat') {
        fillGrad.addColorStop(0, '#FFFDE8');
        fillGrad.addColorStop(0.42, '#FFE066');
        fillGrad.addColorStop(0.54, '#FF8C24');
        fillGrad.addColorStop(1, '#E63B2E');
      } else if (style === 'neon-chrome') {
        fillGrad.addColorStop(0, '#FFFFFF');
        fillGrad.addColorStop(0.44, '#A8FAFF');
        fillGrad.addColorStop(0.52, '#2FE2FF');
        fillGrad.addColorStop(1, '#FF49C1');
      } else {
        fillGrad.addColorStop(0, '#FFFCE6');
        fillGrad.addColorStop(0.44, '#FFC438');
        fillGrad.addColorStop(0.53, '#FF6B3D');
        fillGrad.addColorStop(1, '#FF267E');
      }

      lctx.fillStyle = fillGrad;
      drawTextTracked(lctx, titleText, anchorX, localY, finalTracking, 'fill');

      lctx.globalCompositeOperation = 'source-atop';
      const sheenGrad = lctx.createLinearGradient(0, localY - titleSize * 0.86, 0, localY - titleSize * 0.56);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      lctx.fillStyle = sheenGrad;
      lctx.fillRect(0, 0, width, bandH);

      lctx.lineWidth = Math.max(2, titleSize * 0.016);
      lctx.strokeStyle = 'rgba(255, 255, 255, 0.44)';
      drawTextTracked(lctx, titleText, anchorX - 1, localY + 1.5, finalTracking, 'stroke');

      ctx.drawImage(layer, 0, bandTop);
      ctx.restore();
    }

    // Glowing Neon Brush Script directly below right half of main title
    if (scriptText) {
      ctx.save();
      const titleW = titleText ? measureTextTracked(ctx, titleText, finalTracking) : 0;
      let sx = textAlign === 'center' ? anchorX + titleW * 0.22 : anchorX + titleW * 0.48;
      if (state.showStarburst && pos !== 'center-emblem') {
        sx = Math.min(sx, sealX - sealR - scriptSize * 1.4);
      }
      const rawSy = titleY + Math.round(titleSize * 0.14);
      const maxSy = (dockedTitleH > 0 ? stageBottom : mosaicBottom) - Math.round(scriptSize * 0.65);
      const sy = Math.min(rawSy, maxSy);

      ctx.translate(sx, sy);
      ctx.rotate((-4.5 * Math.PI) / 180);
      ctx.font = `400 ${scriptSize}px "Yellowtail", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';

      const scriptW = ctx.measureText(scriptText).width;
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
      drawSwoosh(Math.max(3.5, scriptSize * 0.07), grade.scriptColor, 16);
      drawSwoosh(Math.max(1.5, scriptSize * 0.026), 'rgba(255, 255, 255, 0.85)', 4);

      ctx.lineWidth = Math.max(8, Math.round(scriptSize * 0.20));
      ctx.strokeStyle = '#0B0612';
      ctx.strokeText(scriptText, 0, 0);

      ctx.shadowColor = grade.scriptGlow;
      ctx.shadowBlur = 22;
      ctx.fillStyle = grade.scriptColor;
      ctx.fillText(scriptText, 0, 0);

      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fillText(scriptText, 0, -1);
      ctx.restore();
    }
    ctx.restore();
  }

  // 6) Large High-Contrast Sunburst Seal rendered TOP-MOST on its clean flank notch
  if (state.showStarburst) {
    renderLargeGoldSunburstSeal(ctx, sealX, sealY, sealR, state.starburstText);
  }

  // 7) Fallback floating tagline ONLY if Footer Strip is toggled OFF
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
