// Original GTA-inspired cover typography, neon brush script, corner stamp badge & heat stars
// 100% original design using bundled SIL OFL fonts (Anton, Yellowtail, Bebas Neue)

import { getGradeById } from './grades.js';

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

// Draw iconic 5-star coastal "HEAT" indicator (moves to bottom-left when title is top-banner so zero overlap!)
export function renderHeatStars(ctx, width, height, outerFrame, count, grade, titlePosition) {
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
  const pillY = isTopBanner ? height - padY - pillH : padY;

  // Crisp angled dark backing badge for instant contrast over any photo
  ctx.beginPath();
  ctx.moveTo(pillX + 10, pillY);
  ctx.lineTo(pillX + totalW, pillY);
  ctx.lineTo(pillX + totalW - 8, pillY + pillH);
  ctx.lineTo(pillX, pillY + pillH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10, 8, 18, 0.88)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, base * 0.0024);
  ctx.strokeStyle = '#08060D';
  ctx.stroke();

  // "HEAT" label with measured spacing before first star
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
export function renderCornerBadge(ctx, width, height, outerFrame, badgeText, grade, titlePosition) {
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

  // Place top-left unless title is top-banner (then move to bottom-right so zero collision)
  const isTopBanner = titlePosition === 'top-banner';
  const bx = isTopBanner
    ? width - outerFrame - boxW - Math.round(base * 0.024)
    : outerFrame + Math.round(base * 0.024);
  const by = isTopBanner
    ? height - outerFrame - boxH - Math.round(base * 0.024)
    : outerFrame + Math.round(base * 0.024);

  const skew = 8;
  // Crisp comic offset shadow
  ctx.beginPath();
  ctx.moveTo(bx + skew + 5, by + 5);
  ctx.lineTo(bx + boxW + 5, by + 5);
  ctx.lineTo(bx + boxW - skew + 5, by + boxH + 5);
  ctx.lineTo(bx + 5, by + boxH + 5);
  ctx.closePath();
  ctx.fillStyle = '#07050B';
  ctx.fill();

  // Main angled badge body
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

  // Text
  ctx.fillStyle = grade.badgeFg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawTextTracked(ctx, clean, bx + boxW * 0.5, by + boxH * 0.54, fontSize * 0.08, 'fill');
  ctx.restore();
}

// Render monumental GTA-inspired cover title + overlapping glowing neon script + tagline bar
export function renderCoverTypography(ctx, width, height, outerFrame, state) {
  const grade = getGradeById(state.gradeId);
  const titleText = (state.title || '').trim().toUpperCase();
  const scriptText = (state.script || '').trim();
  const taglineText = (state.tagline || '').trim().toUpperCase();
  const pos = state.titlePosition || 'bottom-center';
  const style = state.titleStyle || 'sunset-extrude';

  // Render badges first
  renderCornerBadge(ctx, width, height, outerFrame, state.badge, grade, pos);
  if (state.showHeatStars) {
    renderHeatStars(ctx, width, height, outerFrame, state.heatStars ?? 5, grade, pos);
  }

  if (!titleText && !scriptText && !taglineText) return;

  const base = Math.min(width, height);
  const aspect = width / height;
  const maxTextW = (width - outerFrame * 2) * (pos === 'bottom-left' ? 0.64 : 0.84);

  // Dynamically size Anton display headline to fit boldly without wrapping or clipping
  let titleSize = Math.round(base * (aspect > 1.25 ? 0.145 : 0.125));
  const tracking = Math.round(titleSize * 0.035);
  ctx.save();
  ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
  if (titleText) {
    let measured = measureTextTracked(ctx, titleText, tracking);
    while (measured > maxTextW && titleSize > 38) {
      titleSize -= 4;
      ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
      measured = measureTextTracked(ctx, titleText, Math.round(titleSize * 0.035));
    }
  }
  const finalTracking = Math.round(titleSize * 0.035);
  const scriptSize = Math.round(titleSize * 0.48);
  const taglineSize = Math.max(18, Math.round(base * 0.029));

  // Anchor calculation based on selected position
  let anchorX = width * 0.5;
  let titleY = height - outerFrame - Math.round(base * 0.115);
  let textAlign = 'center';

  if (pos === 'top-banner') {
    anchorX = width * 0.5;
    titleY = outerFrame + Math.round(titleSize * 1.12) + Math.round(base * 0.032);
    textAlign = 'center';
  } else if (pos === 'center-emblem') {
    anchorX = width * 0.5;
    titleY = height * 0.52;
    textAlign = 'center';
  } else if (pos === 'bottom-left') {
    anchorX = outerFrame + Math.round(base * 0.042);
    titleY = height - outerFrame - Math.round(base * 0.115);
    textAlign = 'left';
  }

  // Atmospheric dark scrim behind lettering so text ALWAYS has razor-sharp contrast
  ctx.save();
  if (pos === 'top-banner') {
    const scrimH = Math.round(titleSize * 2.15 + outerFrame);
    const sg = ctx.createLinearGradient(0, outerFrame, 0, outerFrame + scrimH);
    sg.addColorStop(0, 'rgba(9, 6, 16, 0.84)');
    sg.addColorStop(0.55, 'rgba(9, 6, 16, 0.45)');
    sg.addColorStop(1, 'rgba(9, 6, 16, 0)');
    ctx.fillStyle = sg;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, scrimH);
  } else if (pos === 'center-emblem') {
    const rg = ctx.createRadialGradient(width * 0.5, titleY, base * 0.05, width * 0.5, titleY, base * 0.48);
    rg.addColorStop(0, 'rgba(10, 6, 20, 0.72)');
    rg.addColorStop(0.65, 'rgba(10, 6, 20, 0.32)');
    rg.addColorStop(1, 'rgba(10, 6, 20, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(outerFrame, outerFrame, width - outerFrame * 2, height - outerFrame * 2);
  } else {
    const scrimH = Math.round(titleSize * 2.35 + base * 0.08);
    const sg = ctx.createLinearGradient(0, height - outerFrame - scrimH, 0, height - outerFrame);
    sg.addColorStop(0, 'rgba(9, 6, 16, 0)');
    sg.addColorStop(0.45, 'rgba(9, 6, 16, 0.52)');
    sg.addColorStop(1, 'rgba(9, 6, 16, 0.90)');
    ctx.fillStyle = sg;
    ctx.fillRect(outerFrame, height - outerFrame - scrimH, width - outerFrame * 2, scrimH);
  }
  ctx.restore();

  // MAIN DISPLAY HEADLINE
  if (titleText) {
    ctx.save();
    ctx.font = `400 ${titleSize}px "Anton", Impact, sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const strokeW = Math.max(8, Math.round(titleSize * 0.115));
    const extrudeSteps = style === 'clean-ink' ? 3 : 8;
    const extrudeX = Math.round(titleSize * 0.014);
    const extrudeY = Math.round(titleSize * 0.016);

    // 1) Deep solid 3D offset extrusion shadow
    ctx.fillStyle = '#07040C';
    ctx.strokeStyle = '#07040C';
    ctx.lineWidth = strokeW;
    for (let s = extrudeSteps; s >= 1; s--) {
      drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'stroke');
      drawTextTracked(ctx, titleText, anchorX + s * extrudeX, titleY + s * extrudeY, finalTracking, 'fill');
    }

    // 2) Secondary accent rim shadow for neon-chrome or sunset-extrude
    if (style === 'neon-chrome') {
      ctx.strokeStyle = grade.accentColor;
      ctx.lineWidth = strokeW * 1.15;
      ctx.shadowColor = grade.accentColor;
      ctx.shadowBlur = 22;
      drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');
      ctx.shadowBlur = 0;
    }

    // 3) Crisp heavy matte-black comic outline
    ctx.strokeStyle = '#08050E';
    ctx.lineWidth = strokeW;
    drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'stroke');

    // 4) Gradient fill
    const fillGrad = ctx.createLinearGradient(0, titleY - titleSize * 0.86, 0, titleY + titleSize * 0.06);
    if (style === 'clean-ink') {
      fillGrad.addColorStop(0, '#FFFFFF');
      fillGrad.addColorStop(0.65, '#F5F0FF');
      fillGrad.addColorStop(1, '#DDD6EE');
    } else if (style === 'noir-gold') {
      fillGrad.addColorStop(0, '#FFF8DC');
      fillGrad.addColorStop(0.45, '#F5B841');
      fillGrad.addColorStop(1, '#D62848');
    } else if (style === 'neon-chrome') {
      fillGrad.addColorStop(0, '#FFFFFF');
      fillGrad.addColorStop(0.48, grade.titleGradient[1]);
      fillGrad.addColorStop(1, grade.titleGradient[2]);
    } else {
      // sunset-extrude default
      fillGrad.addColorStop(0, grade.titleGradient[0]);
      fillGrad.addColorStop(0.52, grade.titleGradient[1]);
      fillGrad.addColorStop(1, grade.titleGradient[2]);
    }

    ctx.fillStyle = fillGrad;
    drawTextTracked(ctx, titleText, anchorX, titleY, finalTracking, 'fill');

    // 5) Crisp inner white top sheen highlight
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.restore();
    ctx.restore();
  }

  // OVERLAPPING VICE CITY NEON BRUSH SCRIPT
  if (scriptText) {
    ctx.save();
    const titleW = titleText ? measureTextTracked(ctx, titleText, finalTracking) : 0;
    let sx = anchorX;
    if (textAlign === 'center') sx = anchorX + titleW * 0.20;
    else if (textAlign === 'left') sx = anchorX + titleW * 0.45;
    const sy = titleY + Math.round(titleSize * 0.14);

    ctx.translate(sx, sy);
    ctx.rotate((-5.5 * Math.PI) / 180);
    ctx.font = `400 ${scriptSize}px "Yellowtail", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    // Thick dark ink backing stroke so neon script pops cleanly across busy photos
    ctx.lineWidth = Math.max(7, Math.round(scriptSize * 0.18));
    ctx.strokeStyle = '#0B0612';
    ctx.strokeText(scriptText, 0, 0);

    // Outer neon bloom glow
    ctx.shadowColor = grade.scriptGlow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = grade.scriptColor;
    ctx.fillText(scriptText, 0, 0);

    // Bright hot core inside neon tube
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText(scriptText, 0, -1);
    ctx.restore();
  }

  // BOTTOM / SUB TAGLINE CINEMA STRIP
  if (taglineText) {
    ctx.save();
    ctx.font = `400 ${taglineSize}px "Bebas Neue", sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    const tagTracking = Math.round(taglineSize * 0.22);
    const tagY = pos === 'top-banner'
      ? outerFrame + Math.round(base * 0.032)
      : height - outerFrame - Math.round(base * 0.038);

    // Subtle accent rule flanking tagline on centered lockups
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
