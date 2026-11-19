// Vice Cover Studio v3 — Multi-Panel Cover Art Maker (Offline Canvas 2D + Painterly Sobel Ink Pipeline)
// Core features: 8 slanted multi-panel layouts, Twilight Gold / Cream / White / Black borders, per-panel crop/pan/zoom/rotate/flip/roles,
// 6 harmonized color grades + halftone grain, layered striped retro-chrome 3D typography, top press bar, gold sunburst seal & 3-size PNG export.

import { EXPORT_SIZES, MULTI_PANEL_LAYOUTS, getLayoutById, hitTestPanel, getSmartSinglePhotoTransform } from './layouts.js';
import { VICE_COLOR_GRADES, PANEL_BORDER_STYLES, QUICK_PRESETS, getGradeById } from './grades.js';
import { composeMultiPanelCover, renderExportCanvas } from './cover-engine.js';
import { loadBuiltInSamples, loadImageElement } from './samples.js';

const dom = {};
const photoMap = new Map();
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 32;
let userPhotoSeq = 1;
let lastGeometries = [];
let renderScheduled = false;
let dragState = null;
let inputUndoTimer = null;

export const studioState = {
  sizeId: 'landscape',
  layoutId: 'hero-slant-6',
  gradeId: 'vice-sunset',
  borderStyle: 'twilight-gold',
  presetId: 'sunset-gold',
  paintStrength: 0.72,
  inkStrength: 0.58,
  gradeStrength: 0.92,
  halftoneStrength: 0.34,
  title: 'PALM HORIZON',
  script: 'Sunset Syndicate',
  pressQuote: '★★★★★ "PURE GOLDEN-HOUR ADRENALINE" — COASTAL WEEKLY',
  subTagline: 'FIVE STRANGERS · ONE COAST · NO WAY BACK',
  tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA',
  badge: 'VOL. 06',
  editionPill: '',
  titleStyle: 'sunset-extrude',
  titlePosition: 'overlay-bottom',
  showRoleTags: true,
  showLocationStamps: false,
  showPressQuote: true,
  showHeatStars: false,
  heatStars: 5,
  showFooterStrip: true,
  showStarburst: true,
  starburstText: 'ORIGINAL COVER ART',
  selectedPanel: 0,
  panels: Array.from({ length: 9 }, () => ({
    photoId: null,
    zoom: 1.05,
    panX: 0,
    panY: 0,
    rotation: 0,
    flipH: false,
    gradeOverride: '',
    role: '',
    stamp: '',
  })),
};

export function exportCoverPng(sizeId = studioState.sizeId) {
  const spec = getSizeSpec(sizeId);
  setStatus(`Rendering ${spec.label} PNG...`);
  const off = renderExportCanvas(studioState, photoMap, spec.width, spec.height);
  const slug = makeExportSlug();
  const filename = `${slug}-${spec.width}x${spec.height}.png`;
  return triggerPngDownload(off, filename).then(() => {
    setStatus(`Exported ${filename}`);
    return filename;
  });
}

export async function exportAllThreePostSizes() {
  const slug = makeExportSlug();
  for (const spec of EXPORT_SIZES) {
    setStatus(`Exporting ${spec.label}...`);
    const off = renderExportCanvas(studioState, photoMap, spec.width, spec.height);
    const filename = `${slug}-${spec.width}x${spec.height}.png`;
    await triggerPngDownload(off, filename);
    await new Promise((r) => setTimeout(r, 140));
  }
  setStatus('Exported all 3 sizes (1920×1080, 1080×1350, 1080×1080)');
}

export async function uploadUserPhotos(files, mode = 'multi') {
  const uploadedIds = [];
  for (const file of files) {
    const entry = await readUserFileAsPhoto(file);
    uploadedIds.push(entry.id);
  }
  if (!uploadedIds.length) return uploadedIds;
  if (mode === 'panel') {
    updatePanelCropPanZoom(studioState.selectedPanel, {
      photoId: uploadedIds[0], zoom: 1.05, panX: 0, panY: 0, rotation: 0, flipH: false, role: '', stamp: '',
    });
    renderPhotoLibraryTray();
  } else if (mode === 'single' || uploadedIds.length === 1) {
    fillAllPanelsFromPhoto(uploadedIds[0]);
  } else {
    distributePhotosAcrossPanels(uploadedIds);
  }
  recordHistory();
  setStatus(`Loaded ${uploadedIds.length} photo${uploadedIds.length > 1 ? 's' : ''}`);
  return uploadedIds;
}

export function fillAllPanelsFromPhoto(photoId) {
  const layout = getLayoutById(studioState.layoutId);
  const spec = getSizeSpec();
  const defs = layout.getPanels(spec.width / spec.height);
  for (let i = 0; i < studioState.panels.length; i++) {
    const role = defs[i]?.role || 'detail';
    const smart = getSmartSinglePhotoTransform(i, role);
    studioState.panels[i] = {
      photoId,
      zoom: smart.zoom,
      panX: smart.panX,
      panY: smart.panY,
      rotation: smart.rotation,
      flipH: smart.flipH,
      gradeOverride: '',
      role: '',
      stamp: '',
    };
  }
  renderPhotoLibraryTray();
  renderLiveCoverCanvas();
}

export function updatePanelCropPanZoom(panelIndex, patch) {
  const p = studioState.panels[panelIndex];
  if (!p) return;
  Object.assign(p, patch);
  renderLiveCoverCanvas();
}

export function selectMultiPanelLayout(layoutId) {
  const layout = getLayoutById(layoutId);
  studioState.layoutId = layout.id;
  if (studioState.selectedPanel >= layout.panelCount) studioState.selectedPanel = 0;
  syncStaticActiveStates();
  populateSwapSelect();
  renderLiveCoverCanvas();
  recordHistory();
  setStatus(`Layout: ${layout.name}`);
}

export function applyColorGradeAndBorder(gradeId, borderStyle) {
  if (gradeId) {
    studioState.gradeId = gradeId;
    studioState.presetId = '';
  }
  if (borderStyle) {
    studioState.borderStyle = borderStyle;
  }
  syncStaticActiveStates();
  renderLiveCoverCanvas();
  recordHistory();
}

export function undoCoverEdit() {
  if (undoStack.length <= 1) return;
  redoStack.push(undoStack.pop());
  restoreSnapshot(undoStack[undoStack.length - 1]);
  setStatus('Undid last change');
}

export function redoCoverEdit() {
  if (!redoStack.length) return;
  const next = redoStack.pop();
  undoStack.push(next);
  restoreSnapshot(next);
  setStatus('Redid change');
}

export function renderLiveCoverCanvas() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    const isCoverShot = document.body.classList.contains('shot-cover-only');
    lastGeometries = composeMultiPanelCover(dom.canvas, studioState, photoMap, {
      isExport: isCoverShot,
      showSelection: !isCoverShot,
    });
    syncPanelInspectorUI();
  });
}

function bindStudioDom() {
  const ids = {
    canvas: 'cover-preview-canvas',
    stageFrame: 'canvas-stage-frame',
    dropOverlay: 'canvas-drop-overlay',
    sizeSelector: 'post-size-selector',
    exportPngBtn: 'export-png-btn',
    exportPngLabel: 'export-png-label',
    exportAllBtn: 'export-all-3-sizes-btn',
    btnUndo: 'undo-history-btn',
    btnRedo: 'redo-history-btn',
    btnSurprise: 'surprise-cover-btn',
    photoTray: 'photo-library-tray',
    photoCount: 'photo-count-badge',
    presetBar: 'quick-preset-bar',
    layoutPicker: 'multi-panel-layout-picker',
    gradePicker: 'color-grade-swatch-picker',
    borderPicker: 'panel-border-style-picker',
    paintSlider: 'painterly-art-slider',
    paintVal: 'painterly-val',
    inkSlider: 'sobel-ink-slider',
    inkVal: 'sobel-ink-val',
    gradeSlider: 'grade-intensity-slider',
    gradeVal: 'grade-intensity-val',
    zoomSlider: 'panel-zoom-slider',
    zoomVal: 'panel-zoom-val',
    panXSlider: 'panel-pan-x-slider',
    panXVal: 'panel-pan-x-val',
    panYSlider: 'panel-pan-y-slider',
    panYVal: 'panel-pan-y-val',
    rotateSlider: 'panel-rotate-slider',
    rotateVal: 'panel-rotate-val',
    swapSelect: 'swap-panel-select',
    panelGradeSelect: 'panel-grade-select',
    panelRoleInput: 'panel-role-input',
    panelStampInput: 'panel-stamp-input',
    activePanelBadge: 'active-panel-badge',
    stagePanelChip: 'stage-panel-chip',
    captionTitle: 'caption-title-input',
    captionScript: 'caption-script-input',
    pressQuote: 'press-quote-input',
    subTagline: 'sub-tagline-input',
    cornerBadge: 'corner-badge-input',
    titleStyle: 'title-style-select',
    titlePos: 'title-position-select',
    toggleRoles: 'toggle-role-tags',
    toggleStamps: 'toggle-location-stamps',
    toggleSeal: 'toggle-original-seal',
    toggleQuote: 'toggle-press-quote',
    toggleStars: 'toggle-heat-stars',
    toggleFooter: 'toggle-footer-strip',
    statusLine: 'studio-status-line',
  };
  for (const [key, id] of Object.entries(ids)) {
    dom[key] = document.getElementById(id);
  }
}

function setStatus(msg) {
  if (dom.statusLine) dom.statusLine.textContent = msg;
}

function getSizeSpec(sizeId = studioState.sizeId) {
  return EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
}

function makeExportSlug() {
  return (studioState.title || 'vice-cover')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'vice-cover';
}

function updateCanvasDimensions(isCoverOnlyShot = false) {
  const spec = getSizeSpec();
  if (isCoverOnlyShot) {
    dom.canvas.width = spec.width;
    dom.canvas.height = spec.height;
    return;
  }
  const previewScale = spec.width > spec.height ? 1280 / spec.width : 1080 / Math.max(spec.width, spec.height);
  dom.canvas.width = Math.round(spec.width * previewScale);
  dom.canvas.height = Math.round(spec.height * previewScale);
}

function updateHistoryButtons() {
  if (dom.btnUndo) dom.btnUndo.disabled = undoStack.length <= 1;
  if (dom.btnRedo) dom.btnRedo.disabled = redoStack.length === 0;
}

function recordHistory(forceImmediate = true) {
  const snap = JSON.stringify(studioState);
  if (undoStack.length && undoStack[undoStack.length - 1] === snap) {
    updateHistoryButtons();
    return;
  }
  undoStack.push(snap);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  if (forceImmediate) updateHistoryButtons();
}

function scheduleDebouncedHistory() {
  clearTimeout(inputUndoTimer);
  inputUndoTimer = setTimeout(() => recordHistory(true), 320);
}

function restoreSnapshot(snapJson) {
  const parsed = JSON.parse(snapJson);
  const prevSize = studioState.sizeId;
  Object.assign(studioState, parsed);
  if (studioState.sizeId !== prevSize) {
    updateCanvasDimensions(document.body.classList.contains('shot-cover-only'));
  }
  syncTypographyInputs();
  syncPanelInspectorUI();
  syncStaticActiveStates();
  populateSwapSelect();
  renderLiveCoverCanvas();
  updateHistoryButtons();
}

function buildColoredLayoutSvg(layout) {
  const panels = layout.getPanels(1.45);
  const colors = layout.paletteFill || ['#FF6B4A', '#FFC845', '#FF2FA8', '#2EE8FF'];
  const polys = panels
    .map((p, idx) => {
      const pts = p.points.map(([x, y]) => `${(x * 44 + 2).toFixed(1)},${(y * 26 + 2).toFixed(1)}`).join(' ');
      const fill = colors[idx % colors.length];
      return `<polygon points="${pts}" fill="${fill}" fill-opacity="0.72" stroke="#F6F1E7" stroke-width="1.35"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 48 30" aria-hidden="true">${polys}</svg>`;
}

function renderStaticControls() {
  dom.presetBar.innerHTML = '';
  for (const preset of QUICK_PRESETS) {
    const grade = getGradeById(preset.gradeId);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-pill' + (studioState.presetId === preset.id ? ' active' : '');
    btn.dataset.preset = preset.id;
    btn.innerHTML = `<span class="preset-dot" style="background:linear-gradient(135deg,${grade.swatches[1]},${grade.swatches[2]})"></span>${preset.label}`;
    btn.addEventListener('click', () => {
      applyQuickPreset(preset.id);
      recordHistory();
    });
    dom.presetBar.appendChild(btn);
  }

  dom.layoutPicker.innerHTML = '';
  for (const layout of MULTI_PANEL_LAYOUTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-tile' + (studioState.layoutId === layout.id ? ' active' : '');
    btn.dataset.layout = layout.id;
    btn.title = layout.description;
    btn.innerHTML = `${buildColoredLayoutSvg(layout)}<span>${layout.shortName}</span>`;
    btn.addEventListener('click', () => selectMultiPanelLayout(layout.id));
    dom.layoutPicker.appendChild(btn);
  }

  dom.gradePicker.innerHTML = '';
  for (const grade of VICE_COLOR_GRADES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-card' + (studioState.gradeId === grade.id ? ' active' : '');
    btn.dataset.grade = grade.id;
    btn.style.background = grade.swatchGradient;
    btn.innerHTML = `<span>${grade.name}</span>`;
    btn.addEventListener('click', () => {
      applyColorGradeAndBorder(grade.id, null);
      setStatus(`Grade: ${grade.name}`);
    });
    dom.gradePicker.appendChild(btn);
  }

  dom.borderPicker.innerHTML = '';
  for (const b of PANEL_BORDER_STYLES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'border-pill' + (studioState.borderStyle === b.id ? ' active' : '');
    btn.dataset.border = b.id;
    btn.innerHTML = `<i style="background:${b.swatchBg || b.color}"></i><span>${b.label}</span>`;
    btn.addEventListener('click', () => {
      applyColorGradeAndBorder(null, b.id);
      setStatus(`Border: ${b.label}`);
    });
    dom.borderPicker.appendChild(btn);
  }

  dom.panelGradeSelect.innerHTML = '<option value="">Match Global</option>';
  for (const grade of VICE_COLOR_GRADES) {
    const opt = document.createElement('option');
    opt.value = grade.id;
    opt.textContent = grade.name;
    dom.panelGradeSelect.appendChild(opt);
  }

  populateSwapSelect();
  syncStaticActiveStates();
}

function populateSwapSelect() {
  const layout = getLayoutById(studioState.layoutId);
  const spec = getSizeSpec();
  const defs = layout.getPanels(spec.width / spec.height);
  dom.swapSelect.innerHTML = '<option value="">Swap with...</option>';
  defs.forEach((def, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `Panel ${idx + 1} (${def.label})`;
    dom.swapSelect.appendChild(opt);
  });
}

function syncStaticActiveStates() {
  dom.presetBar.querySelectorAll('.preset-pill').forEach((el) => {
    el.classList.toggle('active', el.dataset.preset === studioState.presetId);
  });
  dom.sizeSelector.querySelectorAll('.size-btn').forEach((el) => {
    el.classList.toggle('active', el.dataset.size === studioState.sizeId);
  });
  dom.layoutPicker.querySelectorAll('.layout-tile').forEach((el) => {
    el.classList.toggle('active', el.dataset.layout === studioState.layoutId);
  });
  dom.gradePicker.querySelectorAll('.grade-card').forEach((el) => {
    el.classList.toggle('active', el.dataset.grade === studioState.gradeId);
  });
  dom.borderPicker.querySelectorAll('.border-pill').forEach((el) => {
    el.classList.toggle('active', el.dataset.border === studioState.borderStyle);
  });
  const spec = getSizeSpec();
  dom.exportPngLabel.textContent = `Export PNG`;
  dom.exportPngBtn.title = `Export current cover at ${spec.label}`;
}

function renderPhotoLibraryTray() {
  const entries = [...photoMap.values()];
  dom.photoCount.textContent = `${entries.length} ready`;
  const activePhotoId = studioState.panels[studioState.selectedPanel]?.photoId;
  dom.photoTray.innerHTML = '';

  for (const entry of entries) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-thumb' + (entry.id === activePhotoId ? ' active' : '');
    btn.title = `Assign "${entry.label}" to Panel ${studioState.selectedPanel + 1}`;
    const img = document.createElement('img');
    img.src = entry.src;
    img.alt = entry.label;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      updatePanelCropPanZoom(studioState.selectedPanel, {
        photoId: entry.id, zoom: 1.05, panX: 0, panY: 0, rotation: 0, flipH: false, role: '', stamp: '',
      });
      renderPhotoLibraryTray();
      recordHistory();
      setStatus(`Assigned ${entry.label} to Panel ${studioState.selectedPanel + 1}`);
    });
    dom.photoTray.appendChild(btn);
  }
}

function syncPanelInspectorUI() {
  const p = studioState.panels[studioState.selectedPanel];
  if (!p) return;
  const geom = lastGeometries[studioState.selectedPanel];
  const photoEntry = photoMap.get(p.photoId);
  const chipLabel = `Panel ${studioState.selectedPanel + 1}${geom ? ' · ' + geom.label : ''}`;
  dom.activePanelBadge.textContent = chipLabel;
  if (dom.stagePanelChip) dom.stagePanelChip.textContent = chipLabel;
  dom.zoomSlider.value = String(Math.round((p.zoom || 1) * 100));
  dom.zoomVal.textContent = `${(p.zoom || 1).toFixed(2)}×`;
  dom.panXSlider.value = String(Math.round((p.panX || 0) * 100));
  dom.panXVal.textContent = `${Math.round((p.panX || 0) * 100)}%`;
  dom.panYSlider.value = String(Math.round((p.panY || 0) * 100));
  dom.panYVal.textContent = `${Math.round((p.panY || 0) * 100)}%`;
  dom.rotateSlider.value = String(Math.round(p.rotation || 0));
  dom.rotateVal.textContent = `${Math.round(p.rotation || 0)}°`;
  dom.panelGradeSelect.value = p.gradeOverride || '';
  if (dom.panelRoleInput) {
    dom.panelRoleInput.value = p.role || '';
    dom.panelRoleInput.placeholder = photoEntry?.defaultRole || 'THE DRIVER';
  }
  dom.panelStampInput.value = p.stamp || '';
  dom.panelStampInput.placeholder = photoEntry?.defaultStamp || 'LOCATION · TIME';
  renderPhotoLibraryTray();
}

function syncTypographyInputs() {
  dom.captionTitle.value = studioState.title;
  dom.captionScript.value = studioState.script;
  dom.pressQuote.value = studioState.pressQuote;
  if (dom.subTagline) dom.subTagline.value = studioState.subTagline || '';
  dom.cornerBadge.value = studioState.badge;
  dom.titleStyle.value = studioState.titleStyle;
  dom.titlePos.value = studioState.titlePosition;
  if (dom.toggleRoles) dom.toggleRoles.checked = studioState.showRoleTags !== false;
  dom.toggleStamps.checked = studioState.showLocationStamps;
  dom.toggleSeal.checked = studioState.showStarburst;
  dom.toggleQuote.checked = studioState.showPressQuote;
  dom.toggleStars.checked = studioState.showHeatStars;
  dom.toggleFooter.checked = studioState.showFooterStrip;
  dom.paintSlider.value = String(Math.round(studioState.paintStrength * 100));
  dom.paintVal.textContent = `${Math.round(studioState.paintStrength * 100)}%`;
  dom.inkSlider.value = String(Math.round(studioState.inkStrength * 100));
  dom.inkVal.textContent = `${Math.round(studioState.inkStrength * 100)}%`;
  dom.gradeSlider.value = String(Math.round((studioState.gradeStrength ?? 0.92) * 100));
  dom.gradeVal.textContent = `${Math.round((studioState.gradeStrength ?? 0.92) * 100)}%`;
}

function distributePhotosAcrossPanels(photoIds, roles = []) {
  if (!photoIds.length) return;
  for (let i = 0; i < studioState.panels.length; i++) {
    const pid = photoIds[i % photoIds.length];
    const isRepeat = i >= photoIds.length || photoIds.indexOf(pid) !== i;
    studioState.panels[i] = {
      photoId: pid,
      zoom: isRepeat ? 1.82 : 1.05,
      panX: isRepeat ? 0.14 : 0,
      panY: isRepeat ? 0.08 : 0,
      rotation: 0,
      flipH: isRepeat,
      gradeOverride: '',
      role: roles[i] || '',
      stamp: isRepeat ? 'MIDNIGHT GARAGE · 10:15 PM' : '',
    };
  }
  renderPhotoLibraryTray();
  renderLiveCoverCanvas();
}

function applyQuickPreset(presetId) {
  const preset = QUICK_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  studioState.presetId = preset.id;
  studioState.gradeId = preset.gradeId;
  studioState.layoutId = preset.layoutId;
  studioState.borderStyle = preset.borderStyle || 'twilight-gold';
  studioState.paintStrength = preset.paintStrength;
  studioState.inkStrength = preset.inkStrength;
  studioState.gradeStrength = preset.gradeStrength ?? 0.92;
  studioState.halftoneStrength = preset.halftoneStrength ?? 0.34;
  studioState.title = preset.title;
  studioState.script = preset.script;
  studioState.pressQuote = preset.pressQuote || '';
  studioState.subTagline = preset.subTagline || '';
  studioState.tagline = preset.tagline;
  studioState.badge = preset.badge;
  studioState.editionPill = preset.editionPill || '';
  studioState.titleStyle = preset.titleStyle;
  studioState.titlePosition = preset.titlePosition;
  studioState.showHeatStars = preset.showHeatStars;
  studioState.heatStars = preset.heatStars;
  studioState.showFooterStrip = preset.showFooterStrip ?? true;
  studioState.showStarburst = preset.showStarburst ?? true;
  studioState.showPressQuote = preset.showPressQuote ?? true;
  studioState.showRoleTags = preset.showRoleTags ?? true;
  studioState.showLocationStamps = preset.showLocationStamps ?? false;
  studioState.starburstText = preset.starburstText || 'ORIGINAL COVER ART';

  const layout = getLayoutById(studioState.layoutId);
  if (studioState.selectedPanel >= layout.panelCount) studioState.selectedPanel = 0;

  syncTypographyInputs();
  syncPanelInspectorUI();
  syncStaticActiveStates();
  populateSwapSelect();
  renderLiveCoverCanvas();
  setStatus(`Preset: ${preset.label}`);
}

const SURPRISE_TITLES = [
  { title: 'PALM HORIZON', script: 'Sunset Syndicate', subTagline: 'FIVE STRANGERS · ONE COAST · NO WAY BACK', tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA', badge: 'VOL. 06' },
  { title: 'NEON OVERDRIVE', script: 'Midnight Run', subTagline: 'NO SLEEP · ALL SPEED · AFTER MIDNIGHT', tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA', badge: 'VOL. 06' },
  { title: 'COASTAL HEAT', script: 'The Syndicate', subTagline: 'SIX PLAYERS · ONE SUMMER · HIGH STAKES', tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA', badge: 'VOL. 06' },
  { title: 'AFTER DARK', script: 'City of Lights', subTagline: 'FIVE NIGHTS · ONE CITY · ZERO MERCY', tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA', badge: 'NOIR CUT' },
  { title: 'SOLAR BAYOUT', script: 'Sunset Shores', subTagline: 'RULE THE WATERFRONT · COAST TO COAST', tagline: '100% ORIGINAL COVER ART · SHOT ON YOUR CAMERA', badge: 'LIMITED' },
];

function randomizeCoverDesign() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const layout = pick(MULTI_PANEL_LAYOUTS);
  const grade = pick(VICE_COLOR_GRADES);
  const copy = pick(SURPRISE_TITLES);
  const styles = ['sunset-extrude', 'neon-chrome', 'golden-heat', 'noir-gold'];

  studioState.presetId = '';
  studioState.layoutId = layout.id;
  studioState.gradeId = grade.id;
  studioState.borderStyle = pick(['twilight-gold', 'cream', 'white']);
  studioState.titleStyle = grade.id === 'midnight-neon' ? 'neon-chrome' : grade.id === 'golden-heatwave' ? 'golden-heat' : pick(styles);
  studioState.titlePosition = pick(['overlay-bottom', 'horizon-band']);
  studioState.title = copy.title;
  studioState.script = copy.script;
  studioState.subTagline = copy.subTagline;
  studioState.tagline = copy.tagline;
  studioState.badge = copy.badge;
  studioState.editionPill = '';
  studioState.showFooterStrip = true;
  studioState.showStarburst = true;
  studioState.showHeatStars = false;
  studioState.showPressQuote = true;
  studioState.showRoleTags = true;
  studioState.showLocationStamps = false;

  const ids = [...photoMap.keys()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  distributePhotosAcrossPanels(ids);
  if (studioState.selectedPanel >= layout.panelCount) studioState.selectedPanel = 0;

  syncTypographyInputs();
  syncPanelInspectorUI();
  syncStaticActiveStates();
  populateSwapSelect();
  renderLiveCoverCanvas();
  recordHistory();
  setStatus(`Surprise: ${layout.shortName} · ${grade.name}`);
}

async function readUserFileAsPhoto(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
  const img = await loadImageElement(dataUrl);
  const id = `user-${userPhotoSeq++}`;
  const label = file.name.replace(/\.[^.]+$/, '').slice(0, 18) || `Photo ${userPhotoSeq}`;
  const entry = {
    id,
    label,
    src: dataUrl,
    isSample: false,
    img,
    focalX: 0.5,
    focalY: 0.44,
    defaultStamp: `CUSTOM SHOT · ${String(userPhotoSeq - 1).padStart(2, '0')}`,
  };
  photoMap.set(id, entry);
  return entry;
}

function triggerPngDownload(exportCanvas, filename) {
  return new Promise((resolve) => {
    exportCanvas.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve(true);
    }, 'image/png');
  });
}

function clientToCanvasPoint(clientX, clientY) {
  const rect = dom.canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * dom.canvas.width,
    y: ((clientY - rect.top) / rect.height) * dom.canvas.height,
  };
}

function wireInteractions() {
  dom.btnUndo.addEventListener('click', undoCoverEdit);
  dom.btnRedo.addEventListener('click', redoCoverEdit);
  dom.btnSurprise.addEventListener('click', randomizeCoverDesign);
  dom.exportPngBtn.addEventListener('click', () => exportCoverPng(studioState.sizeId));
  dom.exportAllBtn.addEventListener('click', exportAllThreePostSizes);

  dom.sizeSelector.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const spec = getSizeSpec(btn.dataset.size);
      studioState.sizeId = spec.id;
      updateCanvasDimensions(false);
      syncStaticActiveStates();
      renderLiveCoverCanvas();
      recordHistory();
      setStatus(`Post Size: ${spec.label}`);
    });
  });

  document.getElementById('add-user-photos-input').addEventListener('change', async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    try {
      await uploadUserPhotos(files, files.length === 1 ? 'single' : 'multi');
    } catch {
      setStatus('Could not decode one of the selected images');
    }
    e.target.value = '';
  });

  document.getElementById('replace-panel-photo-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadUserPhotos([file], 'panel');
    } catch {
      setStatus('Could not decode that image file');
    }
    e.target.value = '';
  });

  document.getElementById('fill-all-panels-btn').addEventListener('click', () => {
    distributePhotosAcrossPanels([...photoMap.keys()]);
    recordHistory();
    setStatus('Filled all panels with library photos');
  });

  document.getElementById('autofill-one-photo-btn').addEventListener('click', () => {
    const activeId = studioState.panels[studioState.selectedPanel]?.photoId || [...photoMap.keys()][0];
    if (!activeId) return;
    fillAllPanelsFromPhoto(activeId);
    recordHistory();
    setStatus('Auto-framed 1 photo across all panels');
  });

  dom.paintSlider.addEventListener('input', () => {
    studioState.paintStrength = Number(dom.paintSlider.value) / 100;
    dom.paintVal.textContent = `${dom.paintSlider.value}%`;
    renderLiveCoverCanvas();
    scheduleDebouncedHistory();
  });

  dom.inkSlider.addEventListener('input', () => {
    studioState.inkStrength = Number(dom.inkSlider.value) / 100;
    dom.inkVal.textContent = `${dom.inkSlider.value}%`;
    renderLiveCoverCanvas();
    scheduleDebouncedHistory();
  });

  dom.gradeSlider.addEventListener('input', () => {
    studioState.gradeStrength = Number(dom.gradeSlider.value) / 100;
    dom.gradeVal.textContent = `${dom.gradeSlider.value}%`;
    renderLiveCoverCanvas();
    scheduleDebouncedHistory();
  });

  dom.zoomSlider.addEventListener('input', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { zoom: Number(dom.zoomSlider.value) / 100 });
    scheduleDebouncedHistory();
  });

  dom.panXSlider.addEventListener('input', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { panX: Number(dom.panXSlider.value) / 100 });
    scheduleDebouncedHistory();
  });

  dom.panYSlider.addEventListener('input', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { panY: Number(dom.panYSlider.value) / 100 });
    scheduleDebouncedHistory();
  });

  dom.rotateSlider.addEventListener('input', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { rotation: Number(dom.rotateSlider.value) });
    scheduleDebouncedHistory();
  });

  document.getElementById('flip-panel-btn').addEventListener('click', () => {
    const cur = studioState.panels[studioState.selectedPanel];
    updatePanelCropPanZoom(studioState.selectedPanel, { flipH: !cur.flipH });
    recordHistory();
  });

  document.getElementById('reset-panel-crop-btn').addEventListener('click', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, {
      zoom: 1.05, panX: 0, panY: 0, rotation: 0, flipH: false, gradeOverride: '', role: '', stamp: '',
    });
    recordHistory();
  });

  dom.swapSelect.addEventListener('change', () => {
    const targetIdx = Number(dom.swapSelect.value);
    if (!Number.isInteger(targetIdx) || targetIdx === studioState.selectedPanel) {
      dom.swapSelect.value = '';
      return;
    }
    const tmp = studioState.panels[studioState.selectedPanel];
    studioState.panels[studioState.selectedPanel] = studioState.panels[targetIdx];
    studioState.panels[targetIdx] = tmp;
    studioState.selectedPanel = targetIdx;
    dom.swapSelect.value = '';
    renderLiveCoverCanvas();
    recordHistory();
    setStatus(`Swapped with Panel ${targetIdx + 1}`);
  });

  dom.panelGradeSelect.addEventListener('change', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { gradeOverride: dom.panelGradeSelect.value });
    recordHistory();
  });

  if (dom.panelRoleInput) {
    dom.panelRoleInput.addEventListener('input', () => {
      updatePanelCropPanZoom(studioState.selectedPanel, { role: dom.panelRoleInput.value });
      scheduleDebouncedHistory();
    });
  }

  dom.panelStampInput.addEventListener('input', () => {
    updatePanelCropPanZoom(studioState.selectedPanel, { stamp: dom.panelStampInput.value });
    scheduleDebouncedHistory();
  });

  dom.captionTitle.addEventListener('input', () => { studioState.title = dom.captionTitle.value; renderLiveCoverCanvas(); scheduleDebouncedHistory(); });
  dom.captionScript.addEventListener('input', () => { studioState.script = dom.captionScript.value; renderLiveCoverCanvas(); scheduleDebouncedHistory(); });
  dom.pressQuote.addEventListener('input', () => { studioState.pressQuote = dom.pressQuote.value; renderLiveCoverCanvas(); scheduleDebouncedHistory(); });
  if (dom.subTagline) {
    dom.subTagline.addEventListener('input', () => { studioState.subTagline = dom.subTagline.value; renderLiveCoverCanvas(); scheduleDebouncedHistory(); });
  }
  dom.cornerBadge.addEventListener('input', () => { studioState.badge = dom.cornerBadge.value; renderLiveCoverCanvas(); scheduleDebouncedHistory(); });
  dom.titleStyle.addEventListener('change', () => { studioState.titleStyle = dom.titleStyle.value; renderLiveCoverCanvas(); recordHistory(); });
  dom.titlePos.addEventListener('change', () => { studioState.titlePosition = dom.titlePos.value; renderLiveCoverCanvas(); recordHistory(); });
  if (dom.toggleRoles) {
    dom.toggleRoles.addEventListener('change', () => { studioState.showRoleTags = dom.toggleRoles.checked; renderLiveCoverCanvas(); recordHistory(); });
  }
  dom.toggleStamps.addEventListener('change', () => { studioState.showLocationStamps = dom.toggleStamps.checked; renderLiveCoverCanvas(); recordHistory(); });
  dom.toggleSeal.addEventListener('change', () => { studioState.showStarburst = dom.toggleSeal.checked; renderLiveCoverCanvas(); recordHistory(); });
  dom.toggleQuote.addEventListener('change', () => { studioState.showPressQuote = dom.toggleQuote.checked; renderLiveCoverCanvas(); recordHistory(); });
  dom.toggleStars.addEventListener('change', () => { studioState.showHeatStars = dom.toggleStars.checked; renderLiveCoverCanvas(); recordHistory(); });
  dom.toggleFooter.addEventListener('change', () => { studioState.showFooterStrip = dom.toggleFooter.checked; renderLiveCoverCanvas(); recordHistory(); });

  dom.canvas.addEventListener('pointerdown', (e) => {
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    if (hitIdx >= 0) {
      studioState.selectedPanel = hitIdx;
      const p = studioState.panels[hitIdx];
      const geom = lastGeometries[hitIdx];
      dragState = {
        pointerId: e.pointerId,
        panelIdx: hitIdx,
        startX: pt.x,
        startY: pt.y,
        origPanX: p.panX || 0,
        origPanY: p.panY || 0,
        panelW: geom.bounds.w,
        panelH: geom.bounds.h,
      };
      dom.canvas.setPointerCapture(e.pointerId);
      dom.canvas.classList.add('dragging');
      renderLiveCoverCanvas();
    }
  });

  dom.canvas.addEventListener('pointermove', (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const dx = (pt.x - dragState.startX) / Math.max(120, dragState.panelW);
    const dy = (pt.y - dragState.startY) / Math.max(120, dragState.panelH);
    updatePanelCropPanZoom(dragState.panelIdx, {
      panX: Math.max(-0.65, Math.min(0.65, dragState.origPanX + dx)),
      panY: Math.max(-0.65, Math.min(0.65, dragState.origPanY + dy)),
    });
  });

  const endDrag = (e) => {
    if (dragState && e.pointerId === dragState.pointerId) {
      dragState = null;
      dom.canvas.classList.remove('dragging');
      recordHistory();
    }
  };
  dom.canvas.addEventListener('pointerup', endDrag);
  dom.canvas.addEventListener('pointercancel', endDrag);

  dom.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    if (hitIdx >= 0) studioState.selectedPanel = hitIdx;
    const p = studioState.panels[studioState.selectedPanel];
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    updatePanelCropPanZoom(studioState.selectedPanel, {
      zoom: Math.max(1.0, Math.min(2.8, (p.zoom || 1) + delta)),
    });
    scheduleDebouncedHistory();
  }, { passive: false });

  dom.stageFrame.addEventListener('dragover', (e) => { e.preventDefault(); dom.dropOverlay.hidden = false; });
  dom.stageFrame.addEventListener('dragleave', (e) => {
    if (!dom.stageFrame.contains(e.relatedTarget)) dom.dropOverlay.hidden = true;
  });
  dom.stageFrame.addEventListener('drop', async (e) => {
    e.preventDefault();
    dom.dropOverlay.hidden = true;
    const files = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    try {
      if (files.length === 1 && hitIdx >= 0) {
        studioState.selectedPanel = hitIdx;
        await uploadUserPhotos([files[0]], 'panel');
      } else {
        await uploadUserPhotos(files, files.length === 1 ? 'single' : 'multi');
      }
    } catch {
      setStatus('Could not decode dropped file');
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redoCoverEdit();
      else undoCoverEdit();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redoCoverEdit();
      return;
    }
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const layout = getLayoutById(studioState.layoutId);
    if (e.key >= '1' && e.key <= '9') {
      const idx = Number(e.key) - 1;
      if (idx < layout.panelCount) {
        studioState.selectedPanel = idx;
        renderLiveCoverCanvas();
      }
    } else if (e.key.toLowerCase() === 'f') {
      updatePanelCropPanZoom(studioState.selectedPanel, { flipH: !studioState.panels[studioState.selectedPanel].flipH });
      recordHistory();
    } else if (e.key.toLowerCase() === 'r') {
      updatePanelCropPanZoom(studioState.selectedPanel, { zoom: 1.05, panX: 0, panY: 0, rotation: 0, flipH: false });
      recordHistory();
    }
  });
}

function applyQueryOverrides() {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get('preset');
  if (preset) applyQuickPreset(preset);

  const size = params.get('size');
  if (size && EXPORT_SIZES.some((s) => s.id === size)) studioState.sizeId = size;
  const layout = params.get('layout');
  if (layout && MULTI_PANEL_LAYOUTS.some((l) => l.id === layout)) studioState.layoutId = layout;
  const grade = params.get('grade');
  if (grade && VICE_COLOR_GRADES.some((g) => g.id === grade)) {
    studioState.gradeId = grade;
    if (!preset) studioState.presetId = '';
  }
  const border = params.get('border');
  if (border && PANEL_BORDER_STYLES.some((b) => b.id === border)) studioState.borderStyle = border;

  if (params.has('title')) studioState.title = params.get('title');
  if (params.has('script')) studioState.script = params.get('script');
  if (params.has('quote')) studioState.pressQuote = params.get('quote');
  if (params.has('subTagline')) studioState.subTagline = params.get('subTagline');
  if (params.has('tagline')) studioState.tagline = params.get('tagline');
  if (params.has('badge')) studioState.badge = params.get('badge');
  if (params.has('editionPill')) studioState.editionPill = params.get('editionPill');
  if (params.has('titleStyle')) studioState.titleStyle = params.get('titleStyle');
  if (params.has('titlePosition')) studioState.titlePosition = params.get('titlePosition');
  if (params.has('paint')) studioState.paintStrength = Number(params.get('paint'));
  if (params.has('ink')) studioState.inkStrength = Number(params.get('ink'));
  if (params.has('gradeStrength')) studioState.gradeStrength = Number(params.get('gradeStrength'));
  if (params.has('halftone')) studioState.halftoneStrength = Number(params.get('halftone'));
  if (params.has('footer')) studioState.showFooterStrip = params.get('footer') !== '0';
  if (params.has('starburst')) studioState.showStarburst = params.get('starburst') !== '0';
  if (params.has('starburstText')) studioState.starburstText = params.get('starburstText');
  if (params.has('showRoles')) studioState.showRoleTags = params.get('showRoles') !== '0';
  if (params.has('stamps')) studioState.showLocationStamps = params.get('stamps') !== '0';
  if (params.has('showQuote')) studioState.showPressQuote = params.get('showQuote') !== '0';
  if (params.has('heat')) studioState.showHeatStars = params.get('heat') !== '0';

  const rolesList = params.has('roles') ? params.get('roles').split(',').map((s) => s.trim()) : [];
  const photosParam = params.get('photos');
  if (photosParam) {
    const list = photosParam.split(',').filter((id) => photoMap.has(id));
    if (list.length === 1) fillAllPanelsFromPhoto(list[0]);
    else if (list.length > 1) distributePhotosAcrossPanels(list, rolesList);
  } else if (rolesList.length) {
    for (let i = 0; i < studioState.panels.length && i < rolesList.length; i++) {
      if (rolesList[i]) studioState.panels[i].role = rolesList[i];
    }
  }

  const shotMode = params.get('shot');
  if (shotMode === 'cover') {
    document.body.classList.add('shot-cover-only');
    updateCanvasDimensions(true);
  } else {
    updateCanvasDimensions(false);
  }
  syncTypographyInputs();
  syncPanelInspectorUI();
  syncStaticActiveStates();
  populateSwapSelect();
}

async function bootStudio() {
  bindStudioDom();
  renderStaticControls();
  wireInteractions();

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const samples = await loadBuiltInSamples();
  for (const s of samples) photoMap.set(s.id, s);

  const heroOrder = [
    'boulevard',
    'pier-candid',
    'protagonist-dusk',
    'supercar',
    'neon-motel-rider',
    'coast-aerial',
    'neon-strip',
    'yacht-chase',
  ].filter((id) => photoMap.has(id));
  distributePhotosAcrossPanels(heroOrder.length ? heroOrder : [...photoMap.keys()]);

  applyQueryOverrides();
  if (studioState.layoutId === 'hero-slant-6' && studioState.sizeId === 'landscape') {
    if (studioState.panels[3]?.photoId === 'supercar') {
      studioState.panels[3].panY = -0.16;
      studioState.panels[3].zoom = 1.08;
    }
    if (studioState.panels[4]?.photoId === 'neon-motel-rider') {
      studioState.panels[4].panY = -0.14;
      studioState.panels[4].zoom = 1.06;
    }
    if (studioState.panels[5]?.photoId === 'coast-aerial') {
      studioState.panels[5].panY = -0.10;
      studioState.panels[5].zoom = 1.05;
    }
  } else if (studioState.layoutId === 'classic-box-5' && studioState.sizeId === 'landscape') {
    if (studioState.panels[3]?.photoId === 'neon-motel-rider') {
      studioState.panels[3].panY = -0.16;
      studioState.panels[3].zoom = 1.06;
    }
    if (studioState.panels[4]?.photoId === 'supercar') {
      studioState.panels[4].panY = -0.16;
      studioState.panels[4].zoom = 1.06;
    }
  } else if (studioState.layoutId === 'vertical-poster-6' && studioState.sizeId === 'portrait') {
    if (studioState.panels[5]?.photoId === 'yacht-chase') {
      studioState.panels[5].panY = -0.06;
      studioState.panels[5].zoom = 1.02;
    }
  } else if (studioState.layoutId === 'hero-slant-6' && studioState.sizeId === 'square') {
    if (studioState.panels[0]?.photoId === 'pier-candid') {
      studioState.panels[0].panY = -0.02;
      studioState.panels[0].zoom = 1.04;
    }
    if (studioState.panels[1]?.photoId === 'protagonist-dusk') {
      studioState.panels[1].panY = -0.24;
      studioState.panels[1].zoom = 1.02;
    }
    if (studioState.panels[2]?.photoId === 'boulevard') {
      studioState.panels[2].panY = -0.08;
      studioState.panels[2].zoom = 1.04;
    }
    if (studioState.panels[3]?.photoId === 'supercar') {
      studioState.panels[3].panY = -0.06;
      studioState.panels[3].zoom = 1.06;
    }
    if (studioState.panels[4]?.photoId === 'coast-aerial') {
      studioState.panels[4].panY = -0.04;
      studioState.panels[4].zoom = 1.04;
    }
    if (studioState.panels[5]?.photoId === 'neon-strip') {
      studioState.panels[5].panY = -0.04;
      studioState.panels[5].zoom = 1.04;
    }
  }
  recordHistory(true);
  renderLiveCoverCanvas();

  window.__viceCoverStudio = {
    exportDataUrl(sizeId) {
      const spec = getSizeSpec(sizeId || studioState.sizeId);
      const off = renderExportCanvas(studioState, photoMap, spec.width, spec.height);
      return off.toDataURL('image/png');
    },
    getState: () => ({ ...studioState }),
  };

  setStatus('Offline · 100% local');
}

bootStudio();
