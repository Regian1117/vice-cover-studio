// Vice Cover Studio — Interactive Multi-Panel GTA 6 Cover Art Editor Controller

import {
  EXPORT_SIZES,
  LAYOUT_PRESETS,
  getLayoutById,
  hitTestPanel,
  getSmartSinglePhotoTransform,
} from './layouts.js';
import { COLOR_GRADES, QUICK_PRESETS, getGradeById } from './grades.js';
import { renderCoverPoster, renderExportCanvas } from './cover-engine.js';
import { loadBuiltInSamples, loadImageElement } from './samples.js';

const canvas = document.getElementById('cover-canvas');
const presetBar = document.getElementById('preset-bar');
const sizeSwitcher = document.getElementById('size-switcher');
const photoTray = document.getElementById('photo-tray');
const photoCountEl = document.getElementById('photo-count');
const layoutGrid = document.getElementById('layout-grid');
const gradeGrid = document.getElementById('grade-grid');
const paintSlider = document.getElementById('paint-slider');
const paintVal = document.getElementById('paint-val');
const inkSlider = document.getElementById('ink-slider');
const inkVal = document.getElementById('ink-val');
const halftoneSlider = document.getElementById('halftone-slider');
const halftoneVal = document.getElementById('halftone-val');
const zoomSlider = document.getElementById('zoom-slider');
const zoomVal = document.getElementById('zoom-val');
const rotateSlider = document.getElementById('rotate-slider');
const rotateVal = document.getElementById('rotate-val');
const swapSelect = document.getElementById('swap-select');
const panelGradeSelect = document.getElementById('panel-grade-select');
const captionTitle = document.getElementById('caption-title');
const captionScript = document.getElementById('caption-script');
const captionTagline = document.getElementById('caption-tagline');
const badgeText = document.getElementById('badge-text');
const titleStyle = document.getElementById('title-style');
const titlePosition = document.getElementById('title-position');
const toggleStars = document.getElementById('toggle-stars');
const toggleFooter = document.getElementById('toggle-footer');
const toggleStarburst = document.getElementById('toggle-starburst');
const activePanelBadge = document.getElementById('active-panel-badge');
const statusLine = document.getElementById('status-line');
const exportPrimaryBtn = document.getElementById('export-primary');
const exportPrimaryLabel = document.getElementById('export-primary-label');
const exportAllBtn = document.getElementById('export-all-3');
const btnUndo = document.getElementById('btn-undo');
const btnRedo = document.getElementById('btn-redo');
const btnSurprise = document.getElementById('btn-surprise');
const dropOverlay = document.getElementById('drop-overlay');
const stageFrame = document.getElementById('stage-frame');

const photoMap = new Map();
let userPhotoSeq = 1;
let lastGeometries = [];
let renderScheduled = false;
let dragState = null;

// Undo / Redo snapshot stack
const MAX_HISTORY = 30;
const undoStack = [];
const redoStack = [];
let inputUndoTimer = null;

// Core application state
const state = {
  sizeId: 'landscape',
  layoutId: 'classic-box-5',
  gradeId: 'miami-sunset',
  presetId: 'sunset-chase',
  paintStrength: 0.72,
  inkStrength: 0.58,
  halftoneStrength: 0.32,
  title: 'VICE HORIZON',
  script: 'Miami Sunset',
  tagline: 'EVERY STREET HAS A PRICE',
  badge: 'VOL. 06',
  titleStyle: 'sunset-extrude',
  titlePosition: 'bottom-center',
  showHeatStars: true,
  heatStars: 5,
  showFooterStrip: true,
  showStarburst: true,
  starburstText: 'ORIGINAL EDITION',
  selectedPanel: 0,
  panels: Array.from({ length: 6 }, () => ({
    photoId: null,
    zoom: 1.05,
    panX: 0,
    panY: 0,
    rotation: 0,
    flipH: false,
    gradeOverride: '',
  })),
};

function cloneStateSnapshot() {
  return JSON.stringify(state);
}

function updateHistoryButtons() {
  if (btnUndo) btnUndo.disabled = undoStack.length <= 1;
  if (btnRedo) btnRedo.disabled = redoStack.length === 0;
}

function recordHistory(forceImmediate = true) {
  const snap = cloneStateSnapshot();
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
  const prevSize = state.sizeId;
  Object.assign(state, parsed);
  if (state.sizeId !== prevSize) {
    updateCanvasDimensions(document.body.classList.contains('shot-cover-only'));
  }
  syncTypographyInputs();
  syncStaticActiveStates();
  populateSwapSelect();
  scheduleRender();
  updateHistoryButtons();
}

function undoAction() {
  if (undoStack.length <= 1) return;
  const current = undoStack.pop();
  redoStack.push(current);
  restoreSnapshot(undoStack[undoStack.length - 1]);
  setStatus('Undid last change');
}

function redoAction() {
  if (!redoStack.length) return;
  const next = redoStack.pop();
  undoStack.push(next);
  restoreSnapshot(next);
  setStatus('Redid change');
}

function setStatus(msg) {
  statusLine.textContent = msg;
}

function getSizeSpec(sizeId = state.sizeId) {
  return EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
}

function updateCanvasDimensions(isCoverOnlyShot = false) {
  const spec = getSizeSpec();
  if (isCoverOnlyShot) {
    canvas.width = spec.width;
    canvas.height = spec.height;
    return;
  }
  const previewScale = spec.width > spec.height ? 1280 / spec.width : 1080 / Math.max(spec.width, spec.height);
  canvas.width = Math.round(spec.width * previewScale);
  canvas.height = Math.round(spec.height * previewScale);
}

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    const isCoverShot = document.body.classList.contains('shot-cover-only');
    lastGeometries = renderCoverPoster(canvas, state, photoMap, {
      isExport: isCoverShot,
      showSelection: !isCoverShot,
    });
    syncPanelInspectorUI();
  });
}

function buildLayoutSvg(layout) {
  const panels = layout.getPanels(1.5);
  const polys = panels
    .map((p) => {
      const pts = p.points.map(([x, y]) => `${(x * 36 + 2).toFixed(1)},${(y * 24 + 2).toFixed(1)}`).join(' ');
      return `<polygon points="${pts}" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.4"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 40 28" aria-hidden="true">${polys}</svg>`;
}

function renderStaticControls() {
  presetBar.innerHTML = '';
  for (const preset of QUICK_PRESETS) {
    const grade = getGradeById(preset.gradeId);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-pill' + (state.presetId === preset.id ? ' active' : '');
    btn.dataset.preset = preset.id;
    btn.innerHTML = `<span class="preset-dot" style="background:linear-gradient(135deg,${grade.swatches[1]},${grade.swatches[2]})"></span>${preset.label}`;
    btn.addEventListener('click', () => {
      applyQuickPreset(preset.id);
      recordHistory();
    });
    presetBar.appendChild(btn);
  }

  sizeSwitcher.innerHTML = '';
  for (const spec of EXPORT_SIZES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'seg-btn' + (state.sizeId === spec.id ? ' active' : '');
    btn.dataset.size = spec.id;
    btn.textContent = spec.shortLabel;
    btn.title = `${spec.label} (${spec.desc})`;
    btn.addEventListener('click', () => {
      state.sizeId = spec.id;
      updateCanvasDimensions(false);
      syncStaticActiveStates();
      scheduleRender();
      recordHistory();
      setStatus(`Canvas ${spec.label}`);
    });
    sizeSwitcher.appendChild(btn);
  }

  layoutGrid.innerHTML = '';
  for (const layout of LAYOUT_PRESETS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-tile' + (state.layoutId === layout.id ? ' active' : '');
    btn.dataset.layout = layout.id;
    btn.title = layout.description;
    btn.innerHTML = `${buildLayoutSvg(layout)}<span>${layout.panelCount}P</span>`;
    btn.addEventListener('click', () => {
      state.layoutId = layout.id;
      const count = layout.panelCount;
      if (state.selectedPanel >= count) state.selectedPanel = 0;
      syncStaticActiveStates();
      populateSwapSelect();
      scheduleRender();
      recordHistory();
      setStatus(`Layout: ${layout.name} (${count} panels)`);
    });
    layoutGrid.appendChild(btn);
  }

  gradeGrid.innerHTML = '';
  for (const grade of COLOR_GRADES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-btn' + (state.gradeId === grade.id ? ' active' : '');
    btn.dataset.grade = grade.id;
    btn.innerHTML = `<span>${grade.name}</span><span class="grade-swatches">${grade.swatches.map((c) => `<i style="background:${c}"></i>`).join('')}</span>`;
    btn.addEventListener('click', () => {
      state.gradeId = grade.id;
      state.presetId = '';
      syncStaticActiveStates();
      scheduleRender();
      recordHistory();
      setStatus(`Grade: ${grade.name}`);
    });
    gradeGrid.appendChild(btn);
  }

  panelGradeSelect.innerHTML = '<option value="">Match Global</option>';
  for (const grade of COLOR_GRADES) {
    const opt = document.createElement('option');
    opt.value = grade.id;
    opt.textContent = grade.name;
    panelGradeSelect.appendChild(opt);
  }

  populateSwapSelect();
  syncStaticActiveStates();
}

function populateSwapSelect() {
  const layout = getLayoutById(state.layoutId);
  const spec = getSizeSpec();
  const defs = layout.getPanels(spec.width / spec.height);
  swapSelect.innerHTML = '<option value="">Swap with...</option>';
  defs.forEach((def, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `Panel ${idx + 1} (${def.label})`;
    swapSelect.appendChild(opt);
  });
}

function syncStaticActiveStates() {
  presetBar.querySelectorAll('.preset-pill').forEach((el) => {
    el.classList.toggle('active', el.dataset.preset === state.presetId);
  });
  sizeSwitcher.querySelectorAll('.seg-btn').forEach((el) => {
    el.classList.toggle('active', el.dataset.size === state.sizeId);
  });
  layoutGrid.querySelectorAll('.layout-tile').forEach((el) => {
    el.classList.toggle('active', el.dataset.layout === state.layoutId);
  });
  gradeGrid.querySelectorAll('.grade-btn').forEach((el) => {
    el.classList.toggle('active', el.dataset.grade === state.gradeId);
  });
  const spec = getSizeSpec();
  exportPrimaryLabel.textContent = `Export ${spec.label}`;
}

function renderPhotoTray() {
  const entries = [...photoMap.values()];
  photoCountEl.textContent = `${entries.length} ready`;
  const activePhotoId = state.panels[state.selectedPanel]?.photoId;
  photoTray.innerHTML = '';

  for (const entry of entries) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-thumb' + (entry.id === activePhotoId ? ' active' : '');
    btn.title = `Assign "${entry.label}" to Panel ${state.selectedPanel + 1}`;
    const img = document.createElement('img');
    img.src = entry.src;
    img.alt = entry.label;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      const p = state.panels[state.selectedPanel];
      p.photoId = entry.id;
      p.zoom = 1.05;
      p.panX = 0;
      p.panY = 0;
      p.rotation = 0;
      p.flipH = false;
      renderPhotoTray();
      scheduleRender();
      recordHistory();
      setStatus(`Assigned ${entry.label} to Panel ${state.selectedPanel + 1}`);
    });
    photoTray.appendChild(btn);
  }
}

function syncPanelInspectorUI() {
  const p = state.panels[state.selectedPanel];
  if (!p) return;
  const geom = lastGeometries[state.selectedPanel];
  activePanelBadge.textContent = `Panel ${state.selectedPanel + 1}${geom ? ' · ' + geom.label : ''}`;
  zoomSlider.value = String(Math.round((p.zoom || 1) * 100));
  zoomVal.textContent = `${(p.zoom || 1).toFixed(2)}×`;
  rotateSlider.value = String(Math.round(p.rotation || 0));
  rotateVal.textContent = `${Math.round(p.rotation || 0)}°`;
  panelGradeSelect.value = p.gradeOverride || '';
  renderPhotoTray();
}

function syncTypographyInputs() {
  captionTitle.value = state.title;
  captionScript.value = state.script;
  captionTagline.value = state.tagline;
  badgeText.value = state.badge;
  titleStyle.value = state.titleStyle;
  titlePosition.value = state.titlePosition;
  toggleStars.checked = state.showHeatStars;
  toggleFooter.checked = state.showFooterStrip;
  toggleStarburst.checked = state.showStarburst;
  paintSlider.value = String(Math.round(state.paintStrength * 100));
  paintVal.textContent = `${Math.round(state.paintStrength * 100)}%`;
  inkSlider.value = String(Math.round(state.inkStrength * 100));
  inkVal.textContent = `${Math.round(state.inkStrength * 100)}%`;
  halftoneSlider.value = String(Math.round((state.halftoneStrength ?? 0.32) * 100));
  halftoneVal.textContent = `${Math.round((state.halftoneStrength ?? 0.32) * 100)}%`;
}

// Fill all panels smartly using ONE photo with distinct dynamic crops & framings
function applySinglePhotoAutoFill(photoId) {
  const layout = getLayoutById(state.layoutId);
  const spec = getSizeSpec();
  const defs = layout.getPanels(spec.width / spec.height);
  for (let i = 0; i < state.panels.length; i++) {
    const role = defs[i]?.role || 'detail';
    const smart = getSmartSinglePhotoTransform(i, role);
    state.panels[i] = {
      photoId,
      zoom: smart.zoom,
      panX: smart.panX,
      panY: smart.panY,
      rotation: smart.rotation,
      flipH: smart.flipH,
      gradeOverride: '',
    };
  }
  renderPhotoTray();
  scheduleRender();
}

// Distribute all available photos across the panel slots cleanly
function distributePhotosAcrossPanels(photoIds) {
  if (!photoIds.length) return;
  for (let i = 0; i < state.panels.length; i++) {
    const pid = photoIds[i % photoIds.length];
    const isRepeat = i >= photoIds.length;
    state.panels[i] = {
      photoId: pid,
      zoom: isRepeat ? 1.55 : 1.05,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: pid === 'bay-chopper' && i === 2,
      gradeOverride: '',
    };
  }
  renderPhotoTray();
  scheduleRender();
}

function applyQuickPreset(presetId) {
  const preset = QUICK_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  state.presetId = preset.id;
  state.gradeId = preset.gradeId;
  state.layoutId = preset.layoutId;
  state.paintStrength = preset.paintStrength;
  state.inkStrength = preset.inkStrength;
  state.halftoneStrength = preset.halftoneStrength ?? 0.32;
  state.title = preset.title;
  state.script = preset.script;
  state.tagline = preset.tagline;
  state.badge = preset.badge;
  state.titleStyle = preset.titleStyle;
  state.titlePosition = preset.titlePosition;
  state.showHeatStars = preset.showHeatStars;
  state.heatStars = preset.heatStars;
  state.showFooterStrip = preset.showFooterStrip ?? true;
  state.showStarburst = preset.showStarburst ?? true;
  state.starburstText = preset.starburstText || 'ORIGINAL EDITION';

  const layout = getLayoutById(state.layoutId);
  if (state.selectedPanel >= layout.panelCount) state.selectedPanel = 0;

  syncTypographyInputs();
  syncStaticActiveStates();
  populateSwapSelect();
  scheduleRender();
  setStatus(`Preset: ${preset.label}`);
}

const SURPRISE_TITLES = [
  { title: 'VICE HORIZON', script: 'Miami Sunset', tagline: 'EVERY STREET HAS A PRICE', badge: 'VOL. 06' },
  { title: 'NEON OVERDRIVE', script: 'Midnight Coast', tagline: 'NO BRAKES AFTER DARK', badge: 'NIGHT ED.' },
  { title: 'PALM SYNDICATE', script: 'Coastal Heat', tagline: 'SUN, CHROME & TROUBLE', badge: 'EST. 2026' },
  { title: 'OCEAN HIGHWAY', script: 'Golden Strip', tagline: 'FAST CARS & LATE NIGHTS', badge: 'DELUXE' },
  { title: 'SOLAR BAYOUT', script: 'Vice Shores', tagline: 'RULE THE WATERFRONT', badge: 'LIMITED' },
  { title: 'MIDNIGHT HEIST', script: 'After Hours', tagline: 'TRUST NO ONE ON THE STRIP', badge: 'NOIR CUT' },
];

function randomizeCoverDesign() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const layout = pick(LAYOUT_PRESETS);
  const grade = pick(COLOR_GRADES);
  const copy = pick(SURPRISE_TITLES);
  const styles = ['sunset-extrude', 'neon-chrome', 'noir-gold', 'clean-ink'];
  const positions = ['bottom-center', 'top-banner', 'bottom-left'];

  state.presetId = '';
  state.layoutId = layout.id;
  state.gradeId = grade.id;
  state.titleStyle = grade.id === 'neon-vice' ? 'neon-chrome' : grade.id === 'vice-noir' ? 'noir-gold' : pick(styles);
  state.titlePosition = pick(positions);
  state.title = copy.title;
  state.script = copy.script;
  state.tagline = copy.tagline;
  state.badge = copy.badge;
  state.showFooterStrip = true;
  state.showStarburst = true;
  state.showHeatStars = true;
  state.halftoneStrength = 0.28 + Math.round(Math.random() * 14) / 100;

  const ids = [...photoMap.keys()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  distributePhotosAcrossPanels(ids);
  if (state.selectedPanel >= layout.panelCount) state.selectedPanel = 0;

  syncTypographyInputs();
  syncStaticActiveStates();
  populateSwapSelect();
  scheduleRender();
  recordHistory();
  setStatus(`Surprise: ${layout.name} · ${grade.name}`);
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
  const entry = { id, label, src: dataUrl, isSample: false, img, focalX: 0.5, focalY: 0.42 };
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

function makeExportSlug() {
  return (state.title || 'vice-cover')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'vice-cover';
}

async function exportPngBySize(sizeId) {
  const spec = getSizeSpec(sizeId);
  setStatus(`Rendering ${spec.label} PNG...`);
  const exportCanvas = renderExportCanvas(state, photoMap, spec.width, spec.height);
  const filename = `${makeExportSlug()}-${spec.width}x${spec.height}.png`;
  await triggerPngDownload(exportCanvas, filename);
  setStatus(`Exported ${filename}`);
}

async function exportAllThreeSizes() {
  const slug = makeExportSlug();
  for (const spec of EXPORT_SIZES) {
    setStatus(`Exporting ${spec.label}...`);
    const exportCanvas = renderExportCanvas(state, photoMap, spec.width, spec.height);
    const filename = `${slug}-${spec.width}x${spec.height}.png`;
    await triggerPngDownload(exportCanvas, filename);
    await new Promise((r) => setTimeout(r, 140));
  }
  setStatus('Exported all 3 PNG sizes');
}

function clientToCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

function wireInteractions() {
  btnUndo.addEventListener('click', undoAction);
  btnRedo.addEventListener('click', redoAction);
  btnSurprise.addEventListener('click', randomizeCoverDesign);
  exportAllBtn.addEventListener('click', exportAllThreeSizes);

  document.getElementById('upload-single').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const entry = await readUserFileAsPhoto(file);
      applySinglePhotoAutoFill(entry.id);
      recordHistory();
      setStatus(`Auto-filled all panels with ${entry.label}`);
    } catch {
      setStatus('Could not decode that image file');
    }
    e.target.value = '';
  });

  document.getElementById('upload-multi').addEventListener('change', async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    try {
      const uploadedIds = [];
      for (const file of files) {
        const entry = await readUserFileAsPhoto(file);
        uploadedIds.push(entry.id);
      }
      if (uploadedIds.length === 1) {
        applySinglePhotoAutoFill(uploadedIds[0]);
      } else {
        distributePhotosAcrossPanels(uploadedIds);
      }
      recordHistory();
      setStatus(`Loaded ${uploadedIds.length} photo${uploadedIds.length > 1 ? 's' : ''}`);
    } catch {
      setStatus('Could not decode one of the selected images');
    }
    e.target.value = '';
  });

  document.getElementById('upload-panel').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const entry = await readUserFileAsPhoto(file);
      const p = state.panels[state.selectedPanel];
      p.photoId = entry.id;
      p.zoom = 1.05;
      p.panX = 0;
      p.panY = 0;
      p.rotation = 0;
      p.flipH = false;
      renderPhotoTray();
      scheduleRender();
      recordHistory();
      setStatus(`Replaced Panel ${state.selectedPanel + 1} with ${entry.label}`);
    } catch {
      setStatus('Could not decode that image file');
    }
    e.target.value = '';
  });

  document.getElementById('btn-autofill-one').addEventListener('click', () => {
    const activeId = state.panels[state.selectedPanel]?.photoId || [...photoMap.keys()][0];
    if (!activeId) return;
    applySinglePhotoAutoFill(activeId);
    recordHistory();
    setStatus('Auto-framed 1 photo across all panels');
  });

  document.getElementById('btn-distribute-all').addEventListener('click', () => {
    distributePhotosAcrossPanels([...photoMap.keys()]);
    recordHistory();
    setStatus('Distributed all photos across panels');
  });

  paintSlider.addEventListener('input', () => {
    state.paintStrength = Number(paintSlider.value) / 100;
    paintVal.textContent = `${paintSlider.value}%`;
    scheduleRender();
    scheduleDebouncedHistory();
  });

  inkSlider.addEventListener('input', () => {
    state.inkStrength = Number(inkSlider.value) / 100;
    inkVal.textContent = `${inkSlider.value}%`;
    scheduleRender();
    scheduleDebouncedHistory();
  });

  halftoneSlider.addEventListener('input', () => {
    state.halftoneStrength = Number(halftoneSlider.value) / 100;
    halftoneVal.textContent = `${halftoneSlider.value}%`;
    scheduleRender();
    scheduleDebouncedHistory();
  });

  zoomSlider.addEventListener('input', () => {
    const p = state.panels[state.selectedPanel];
    p.zoom = Number(zoomSlider.value) / 100;
    zoomVal.textContent = `${p.zoom.toFixed(2)}×`;
    scheduleRender();
    scheduleDebouncedHistory();
  });

  rotateSlider.addEventListener('input', () => {
    const p = state.panels[state.selectedPanel];
    p.rotation = Number(rotateSlider.value);
    rotateVal.textContent = `${p.rotation}°`;
    scheduleRender();
    scheduleDebouncedHistory();
  });

  document.getElementById('btn-flip').addEventListener('click', () => {
    const p = state.panels[state.selectedPanel];
    p.flipH = !p.flipH;
    scheduleRender();
    recordHistory();
    setStatus(`Flipped Panel ${state.selectedPanel + 1}`);
  });

  document.getElementById('btn-reset-crop').addEventListener('click', () => {
    const p = state.panels[state.selectedPanel];
    p.zoom = 1.05;
    p.panX = 0;
    p.panY = 0;
    p.rotation = 0;
    p.flipH = false;
    p.gradeOverride = '';
    scheduleRender();
    recordHistory();
    setStatus(`Reset Panel ${state.selectedPanel + 1} crop`);
  });

  swapSelect.addEventListener('change', () => {
    const targetIdx = Number(swapSelect.value);
    if (!Number.isInteger(targetIdx) || targetIdx === state.selectedPanel) {
      swapSelect.value = '';
      return;
    }
    const tmp = state.panels[state.selectedPanel];
    state.panels[state.selectedPanel] = state.panels[targetIdx];
    state.panels[targetIdx] = tmp;
    state.selectedPanel = targetIdx;
    swapSelect.value = '';
    scheduleRender();
    recordHistory();
    setStatus(`Swapped with Panel ${targetIdx + 1}`);
  });

  panelGradeSelect.addEventListener('change', () => {
    state.panels[state.selectedPanel].gradeOverride = panelGradeSelect.value;
    scheduleRender();
    recordHistory();
  });

  // Live Typography & Collector Chrome Inputs
  captionTitle.addEventListener('input', () => { state.title = captionTitle.value; scheduleRender(); scheduleDebouncedHistory(); });
  captionScript.addEventListener('input', () => { state.script = captionScript.value; scheduleRender(); scheduleDebouncedHistory(); });
  captionTagline.addEventListener('input', () => { state.tagline = captionTagline.value; scheduleRender(); scheduleDebouncedHistory(); });
  badgeText.addEventListener('input', () => { state.badge = badgeText.value; scheduleRender(); scheduleDebouncedHistory(); });
  titleStyle.addEventListener('change', () => { state.titleStyle = titleStyle.value; scheduleRender(); recordHistory(); });
  titlePosition.addEventListener('change', () => { state.titlePosition = titlePosition.value; scheduleRender(); recordHistory(); });
  toggleStars.addEventListener('change', () => { state.showHeatStars = toggleStars.checked; scheduleRender(); recordHistory(); });
  toggleFooter.addEventListener('change', () => { state.showFooterStrip = toggleFooter.checked; scheduleRender(); recordHistory(); });
  toggleStarburst.addEventListener('change', () => { state.showStarburst = toggleStarburst.checked; scheduleRender(); recordHistory(); });

  // Export Buttons
  exportPrimaryBtn.addEventListener('click', () => exportPngBySize(state.sizeId));
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => exportPngBySize(btn.dataset.export));
  });

  // Direct Canvas Pointer Interactions: click to select, drag to pan, wheel to zoom
  canvas.addEventListener('pointerdown', (e) => {
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    if (hitIdx >= 0) {
      state.selectedPanel = hitIdx;
      const p = state.panels[hitIdx];
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
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add('dragging');
      scheduleRender();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const dx = (pt.x - dragState.startX) / Math.max(120, dragState.panelW);
    const dy = (pt.y - dragState.startY) / Math.max(120, dragState.panelH);
    const p = state.panels[dragState.panelIdx];
    p.panX = Math.max(-0.65, Math.min(0.65, dragState.origPanX + dx));
    p.panY = Math.max(-0.65, Math.min(0.65, dragState.origPanY + dy));
    scheduleRender();
  });

  const endDrag = (e) => {
    if (dragState && e.pointerId === dragState.pointerId) {
      dragState = null;
      canvas.classList.remove('dragging');
      recordHistory();
    }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    if (hitIdx >= 0) state.selectedPanel = hitIdx;
    const p = state.panels[state.selectedPanel];
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    p.zoom = Math.max(1.0, Math.min(2.8, (p.zoom || 1) + delta));
    scheduleRender();
    scheduleDebouncedHistory();
  }, { passive: false });

  // Drag & Drop image files directly onto any panel on the canvas
  stageFrame.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropOverlay.hidden = false;
  });
  stageFrame.addEventListener('dragleave', (e) => {
    if (!stageFrame.contains(e.relatedTarget)) dropOverlay.hidden = true;
  });
  stageFrame.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropOverlay.hidden = true;
    const files = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const pt = clientToCanvasPoint(e.clientX, e.clientY);
    const hitIdx = hitTestPanel(lastGeometries, pt.x, pt.y);
    try {
      if (files.length === 1 && hitIdx >= 0) {
        const entry = await readUserFileAsPhoto(files[0]);
        state.selectedPanel = hitIdx;
        state.panels[hitIdx] = { photoId: entry.id, zoom: 1.05, panX: 0, panY: 0, rotation: 0, flipH: false, gradeOverride: '' };
        renderPhotoTray();
        scheduleRender();
        recordHistory();
        setStatus(`Dropped ${entry.label} into Panel ${hitIdx + 1}`);
      } else {
        const ids = [];
        for (const f of files) ids.push((await readUserFileAsPhoto(f)).id);
        if (ids.length === 1) applySinglePhotoAutoFill(ids[0]);
        else distributePhotosAcrossPanels(ids);
        recordHistory();
        setStatus(`Dropped ${ids.length} photo${ids.length > 1 ? 's' : ''}`);
      }
    } catch {
      setStatus('Could not decode dropped file');
    }
  });

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y Undo/Redo + quick panel tools)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redoAction();
      else undoAction();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redoAction();
      return;
    }
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const layout = getLayoutById(state.layoutId);
    if (e.key >= '1' && e.key <= '6') {
      const idx = Number(e.key) - 1;
      if (idx < layout.panelCount) {
        state.selectedPanel = idx;
        scheduleRender();
      }
    } else if (e.key.toLowerCase() === 'f') {
      state.panels[state.selectedPanel].flipH = !state.panels[state.selectedPanel].flipH;
      scheduleRender();
      recordHistory();
    } else if (e.key.toLowerCase() === 'r') {
      const p = state.panels[state.selectedPanel];
      p.zoom = 1.05; p.panX = 0; p.panY = 0; p.rotation = 0; p.flipH = false;
      scheduleRender();
      recordHistory();
    }
  });
}

// Optional query-string setup for deterministic preview/export verification
function applyQueryOverrides() {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get('preset');
  if (preset) applyQuickPreset(preset);

  const size = params.get('size');
  if (size && EXPORT_SIZES.some((s) => s.id === size)) state.sizeId = size;
  const layout = params.get('layout');
  if (layout && LAYOUT_PRESETS.some((l) => l.id === layout)) state.layoutId = layout;
  const grade = params.get('grade');
  if (grade && COLOR_GRADES.some((g) => g.id === grade)) {
    state.gradeId = grade;
    state.presetId = '';
  }
  if (params.has('title')) state.title = params.get('title');
  if (params.has('script')) state.script = params.get('script');
  if (params.has('tagline')) state.tagline = params.get('tagline');
  if (params.has('badge')) state.badge = params.get('badge');
  if (params.has('titleStyle')) state.titleStyle = params.get('titleStyle');
  if (params.has('titlePosition')) state.titlePosition = params.get('titlePosition');
  if (params.has('paint')) state.paintStrength = Number(params.get('paint'));
  if (params.has('ink')) state.inkStrength = Number(params.get('ink'));
  if (params.has('halftone')) state.halftoneStrength = Number(params.get('halftone'));
  if (params.has('footer')) state.showFooterStrip = params.get('footer') !== '0';
  if (params.has('starburst')) state.showStarburst = params.get('starburst') !== '0';
  if (params.has('starburstText')) state.starburstText = params.get('starburstText');

  const photosParam = params.get('photos');
  if (photosParam) {
    const list = photosParam.split(',').filter((id) => photoMap.has(id));
    if (list.length === 1) applySinglePhotoAutoFill(list[0]);
    else if (list.length > 1) distributePhotosAcrossPanels(list);
  }

  const shotMode = params.get('shot');
  if (shotMode === 'cover') {
    document.body.classList.add('shot-cover-only');
    updateCanvasDimensions(true);
  } else {
    updateCanvasDimensions(false);
  }
  syncTypographyInputs();
  syncStaticActiveStates();
  populateSwapSelect();
}

async function boot() {
  renderStaticControls();
  wireInteractions();

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const samples = await loadBuiltInSamples();
  for (const s of samples) photoMap.set(s.id, s);

  // 5 100% unique photos arranged so NO face or primary silhouette ever hides behind headline or badges!
  const defaultOrder = ['boulevard', 'supercar', 'pier', 'bay-chopper', 'neon-strip']
    .filter((id) => photoMap.has(id));
  distributePhotosAcrossPanels(defaultOrder);

  applyQueryOverrides();
  if (state.layoutId === 'classic-box-5' && state.sizeId === 'landscape') {
    if (state.panels[2]?.photoId === 'pier') {
      state.panels[2].panX = 0.05;
      state.panels[2].panY = 0.15;
      state.panels[2].zoom = 1.05;
    }
    if (state.panels[3]?.photoId === 'bay-chopper') {
      state.panels[3].flipH = true;
      state.panels[3].panY = -0.10;
      state.panels[3].zoom = 1.05;
    }
    if (state.panels[4]?.photoId === 'neon-strip') {
      state.panels[4].panY = -0.10;
      state.panels[4].zoom = 1.06;
    }
  }
  recordHistory(true);
  scheduleRender();

  window.__viceCoverStudio = {
    exportDataUrl(sizeId) {
      const spec = getSizeSpec(sizeId || state.sizeId);
      const off = renderExportCanvas(state, photoMap, spec.width, spec.height);
      return off.toDataURL('image/png');
    },
    getState: () => ({ ...state }),
  };

  setStatus('Ready offline · 100% local');
}

boot();
