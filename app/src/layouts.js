// 8 Multi-panel GTA-style cover layouts with crisp angled comic dividers
// Coordinates are normalized [0..1] inside the panel mosaic zone (between top frame & lower title stage).

export const EXPORT_SIZES = [
  { id: 'landscape', label: '1920 × 1080', shortLabel: '16:9', width: 1920, height: 1080, desc: 'YouTube / Banner' },
  { id: 'portrait', label: '1080 × 1350', shortLabel: '4:5', width: 1080, height: 1350, desc: 'Instagram / Poster' },
  { id: 'square', label: '1080 × 1080', shortLabel: '1:1', width: 1080, height: 1080, desc: 'Feed / Album' },
];

function buildAngledRowGrid(rows, skew) {
  const panels = [];
  let id = 0;
  let yTop = 0;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const yBot = row.bottom;
    const cols = row.cols;
    let xLeftTop = 0;
    let xLeftBot = 0;
    for (let c = 0; c < cols.length; c++) {
      const isLastCol = c === cols.length - 1;
      const rightBase = cols[c].right;
      const colSkew = isLastCol ? 0 : (cols[c].skew ?? skew);
      const xRightTop = isLastCol ? 1.0 : rightBase + colSkew * 0.5;
      const xRightBot = isLastCol ? 1.0 : rightBase - colSkew * 0.5;
      const rowTiltTop = r === 0 ? 0 : (row.tiltTop ?? 0);
      const rowTiltBot = r === rows.length - 1 ? 0 : (row.tiltBot ?? 0);
      const yLT = yTop + rowTiltTop * (xLeftTop - 0.5);
      const yRT = yTop + rowTiltTop * (xRightTop - 0.5);
      const yRB = yBot + rowTiltBot * (xRightBot - 0.5);
      const yLB = yBot + rowTiltBot * (xLeftBot - 0.5);
      panels.push({
        id,
        label: cols[c].label,
        role: cols[c].role,
        points: [
          [xLeftTop, yLT],
          [xRightTop, yRT],
          [xRightBot, yRB],
          [xLeftBot, yLB],
        ],
      });
      id += 1;
      xLeftTop = xRightTop;
      xLeftBot = xRightBot;
    }
    yTop = yBot;
  }
  return panels;
}

export const MULTI_PANEL_LAYOUTS = [
  {
    id: 'hero-slant-6',
    name: '6-Panel Hero Slant',
    shortName: '6P Slant',
    panelCount: 6,
    paletteFill: ['#FF6B4A', '#FFC845', '#FF2FA8', '#2EE8FF', '#FF8E3C', '#9E5BFF'],
    description: 'Commanding slanted hero + 5 angled Vice City action panels',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.385, 0.0], [0.345, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Top Center', role: 'action', points: [[0.385, 0.0], [0.710, 0.0], [0.685, 0.505], [0.365, 0.535]] },
          { id: 2, label: 'Top Right', role: 'portrait', points: [[0.710, 0.0], [1.0, 0.0], [1.0, 0.475], [0.685, 0.505]] },
          { id: 3, label: 'Bot Left', role: 'detail', points: [[0.365, 0.535], [0.585, 0.515], [0.555, 1.0], [0.345, 1.0]] },
          { id: 4, label: 'Bot Mid', role: 'skyline', points: [[0.585, 0.515], [0.805, 0.495], [0.785, 1.0], [0.555, 1.0]] },
          { id: 5, label: 'Bot Right', role: 'closeup', points: [[0.805, 0.495], [1.0, 0.475], [1.0, 1.0], [0.785, 1.0]] },
        ];
      }
      if (aspect < 0.90) {
        return buildAngledRowGrid([
          { bottom: 0.31, tiltBot: -0.025, cols: [{ right: 0.47, label: 'Top Left', role: 'action' }, { right: 1.0, label: 'Top Right', role: 'skyline' }] },
          { bottom: 0.69, tiltTop: -0.025, tiltBot: 0.022, cols: [{ right: 0.58, label: 'Hero', role: 'hero' }, { right: 1.0, label: 'Mid Right', role: 'portrait' }] },
          { bottom: 1.0, tiltTop: 0.022, cols: [{ right: 0.48, label: 'Bot Left', role: 'detail' }, { right: 1.0, label: 'Bot Right', role: 'closeup' }] },
        ], 0.032);
      }
      return [
        { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.47, 0.0], [0.43, 0.63], [0.0, 0.66]] },
        { id: 1, label: 'Top Right', role: 'action', points: [[0.47, 0.0], [1.0, 0.0], [1.0, 0.32], [0.45, 0.34]] },
        { id: 2, label: 'Mid Right', role: 'portrait', points: [[0.45, 0.34], [1.0, 0.32], [1.0, 0.64], [0.43, 0.63]] },
        { id: 3, label: 'Bot Left', role: 'detail', points: [[0.0, 0.66], [0.35, 0.64], [0.32, 1.0], [0.0, 1.0]] },
        { id: 4, label: 'Bot Mid', role: 'skyline', points: [[0.35, 0.64], [0.69, 0.635], [0.67, 1.0], [0.32, 1.0]] },
        { id: 5, label: 'Bot Right', role: 'closeup', points: [[0.69, 0.635], [1.0, 0.64], [1.0, 1.0], [0.67, 1.0]] },
      ];
    },
  },
  {
    id: 'vertical-poster-6',
    name: '6-Panel Vertical Poster',
    shortName: '6P Poster',
    panelCount: 6,
    paletteFill: ['#2EE8FF', '#FF2FA8', '#FFC845', '#8C52FF', '#FF6B4A', '#00C9B7'],
    description: '3-tier angled vertical poster showcase (ideal for 4:5 Instagram)',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return buildAngledRowGrid([
          { bottom: 0.51, tiltBot: -0.03, cols: [{ right: 0.34, label: 'Top Left', role: 'hero' }, { right: 0.68, label: 'Top Mid', role: 'action' }, { right: 1.0, label: 'Top Right', role: 'portrait' }] },
          { bottom: 1.0, tiltTop: -0.03, cols: [{ right: 0.31, label: 'Bot Left', role: 'detail' }, { right: 0.65, label: 'Bot Mid', role: 'skyline' }, { right: 1.0, label: 'Bot Right', role: 'closeup' }] },
        ], 0.04);
      }
      return [
        { id: 0, label: 'Top Left', role: 'action', points: [[0.0, 0.0], [0.45, 0.0], [0.41, 0.295], [0.0, 0.315]] },
        { id: 1, label: 'Top Right', role: 'skyline', points: [[0.45, 0.0], [1.0, 0.0], [1.0, 0.275], [0.41, 0.295]] },
        { id: 2, label: 'Hero Left', role: 'hero', points: [[0.0, 0.315], [0.59, 0.29], [0.55, 0.705], [0.0, 0.725]] },
        { id: 3, label: 'Mid Right', role: 'portrait', points: [[0.59, 0.29], [1.0, 0.275], [1.0, 0.50], [0.57, 0.495]] },
        { id: 4, label: 'Low Right', role: 'detail', points: [[0.57, 0.495], [1.0, 0.50], [1.0, 0.69], [0.55, 0.705]] },
        { id: 5, label: 'Bottom Wide', role: 'wide', points: [[0.0, 0.725], [1.0, 0.69], [1.0, 1.0], [0.0, 1.0]] },
      ];
    },
  },
  {
    id: 'collector-grid-9',
    name: '9-Panel Collector Grid',
    shortName: '9P Grid',
    panelCount: 9,
    paletteFill: ['#FFC845', '#FF6B4A', '#2EE8FF', '#FF2FA8', '#FF9F2E', '#7A5CFF', '#00D8C4', '#FF4D79', '#FFD866'],
    description: '9-panel angled 3×3 collector edition box-art grid',
    getPanels(aspect) {
      const midTop = aspect > 1.22 ? 0.33 : 0.325;
      const midBot = aspect > 1.22 ? 0.67 : 0.675;
      return buildAngledRowGrid([
        {
          bottom: midTop,
          tiltBot: -0.018,
          cols: [
            { right: 0.34, label: 'Top Left', role: 'action', skew: 0.022 },
            { right: 0.67, label: 'Top Mid', role: 'skyline', skew: 0.022 },
            { right: 1.0, label: 'Top Right', role: 'portrait' },
          ],
        },
        {
          bottom: midBot,
          tiltTop: -0.018,
          tiltBot: 0.018,
          cols: [
            { right: 0.32, label: 'Mid Left', role: 'detail', skew: 0.024 },
            { right: 0.68, label: 'Center Hero', role: 'hero', skew: 0.024 },
            { right: 1.0, label: 'Mid Right', role: 'closeup' },
          ],
        },
        {
          bottom: 1.0,
          tiltTop: 0.018,
          cols: [
            { right: 0.35, label: 'Bot Left', role: 'wide', skew: 0.022 },
            { right: 0.66, label: 'Bot Mid', role: 'action', skew: 0.022 },
            { right: 1.0, label: 'Bot Right', role: 'skyline' },
          ],
        },
      ], 0.022);
    },
  },
  {
    id: 'magazine-7',
    name: '7-Panel Magazine',
    shortName: '7P Mag',
    panelCount: 7,
    paletteFill: ['#FF2FA8', '#FFC845', '#FF6B4A', '#2EE8FF', '#B87BFF', '#FF8E3C', '#00D8C4'],
    description: '7-panel editorial feature spread with panoramic center stripe',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Left Hero', role: 'hero', points: [[0.0, 0.0], [0.36, 0.0], [0.32, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Top Left', role: 'action', points: [[0.36, 0.0], [0.58, 0.0], [0.56, 0.37], [0.345, 0.39]] },
          { id: 2, label: 'Top Mid', role: 'skyline', points: [[0.58, 0.0], [0.79, 0.0], [0.77, 0.35], [0.56, 0.37]] },
          { id: 3, label: 'Top Right', role: 'portrait', points: [[0.79, 0.0], [1.0, 0.0], [1.0, 0.33], [0.77, 0.35]] },
          { id: 4, label: 'Mid Strip', role: 'wide', points: [[0.345, 0.39], [1.0, 0.33], [1.0, 0.65], [0.333, 0.69]] },
          { id: 5, label: 'Bot Mid', role: 'detail', points: [[0.333, 0.69], [0.67, 0.67], [0.65, 1.0], [0.32, 1.0]] },
          { id: 6, label: 'Bot Right', role: 'closeup', points: [[0.67, 0.67], [1.0, 0.65], [1.0, 1.0], [0.65, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Top Hero', role: 'hero', points: [[0.0, 0.0], [0.56, 0.0], [0.52, 0.40], [0.0, 0.42]] },
        { id: 1, label: 'Top Right', role: 'portrait', points: [[0.56, 0.0], [1.0, 0.0], [1.0, 0.38], [0.52, 0.40]] },
        { id: 2, label: 'Mid Strip', role: 'wide', points: [[0.0, 0.42], [1.0, 0.38], [1.0, 0.64], [0.0, 0.67]] },
        { id: 3, label: 'Low Left', role: 'action', points: [[0.0, 0.67], [0.52, 0.655], [0.49, 0.835], [0.0, 0.845]] },
        { id: 4, label: 'Low Right', role: 'detail', points: [[0.52, 0.655], [1.0, 0.64], [1.0, 0.82], [0.49, 0.835]] },
        { id: 5, label: 'Bot Left', role: 'skyline', points: [[0.0, 0.845], [0.50, 0.835], [0.48, 1.0], [0.0, 1.0]] },
        { id: 6, label: 'Bot Right', role: 'closeup', points: [[0.50, 0.835], [1.0, 0.82], [1.0, 1.0], [0.48, 1.0]] },
      ];
    },
  },
  {
    id: 'classic-box-5',
    name: '5-Panel Classic Box',
    shortName: '5P Classic',
    panelCount: 5,
    paletteFill: ['#FF6B4A', '#FFC845', '#2EE8FF', '#FF2FA8', '#7A5CFF'],
    description: 'Classic 5-panel slanted box cover',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.45, 0.0], [0.41, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Top Mid', role: 'action', points: [[0.45, 0.0], [0.74, 0.0], [0.72, 0.51], [0.43, 0.53]] },
          { id: 2, label: 'Top Right', role: 'skyline', points: [[0.74, 0.0], [1.0, 0.0], [1.0, 0.49], [0.72, 0.51]] },
          { id: 3, label: 'Bot Mid', role: 'portrait', points: [[0.43, 0.53], [0.71, 0.51], [0.69, 1.0], [0.41, 1.0]] },
          { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.71, 0.51], [1.0, 0.49], [1.0, 1.0], [0.69, 1.0]] },
        ];
      }
      if (aspect < 0.90) {
        return [
          { id: 0, label: 'Top Left', role: 'action', points: [[0.0, 0.0], [0.46, 0.0], [0.43, 0.30], [0.0, 0.32]] },
          { id: 1, label: 'Top Right', role: 'skyline', points: [[0.46, 0.0], [1.0, 0.0], [1.0, 0.28], [0.43, 0.30]] },
          { id: 2, label: 'Hero', role: 'hero', points: [[0.0, 0.32], [0.60, 0.295], [0.56, 1.0], [0.0, 1.0]] },
          { id: 3, label: 'Mid Right', role: 'portrait', points: [[0.60, 0.295], [1.0, 0.28], [1.0, 0.64], [0.58, 0.66]] },
          { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.58, 0.66], [1.0, 0.64], [1.0, 1.0], [0.56, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.53, 0.0], [0.49, 0.64], [0.0, 0.67]] },
        { id: 1, label: 'Top Right', role: 'action', points: [[0.53, 0.0], [1.0, 0.0], [1.0, 0.34], [0.51, 0.36]] },
        { id: 2, label: 'Mid Right', role: 'skyline', points: [[0.51, 0.36], [1.0, 0.34], [1.0, 0.66], [0.49, 0.64]] },
        { id: 3, label: 'Bot Left', role: 'portrait', points: [[0.0, 0.67], [0.52, 0.64], [0.48, 1.0], [0.0, 1.0]] },
        { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.52, 0.64], [1.0, 0.66], [1.0, 1.0], [0.48, 1.0]] },
      ];
    },
  },
  {
    id: 'action-slash-5',
    name: '5-Panel Action Slash',
    shortName: '5P Slash',
    panelCount: 5,
    paletteFill: ['#2EE8FF', '#FF6B4A', '#FFC845', '#FF2FA8', '#00D8C4'],
    description: 'Steep razor diagonal comic gutters for maximum kinetic motion',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Left Slash', role: 'action', points: [[0.0, 0.0], [0.33, 0.0], [0.24, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Center Hero', role: 'hero', points: [[0.33, 0.0], [0.69, 0.0], [0.61, 1.0], [0.24, 1.0]] },
          { id: 2, label: 'Top Right', role: 'skyline', points: [[0.69, 0.0], [1.0, 0.0], [1.0, 0.35], [0.662, 0.38]] },
          { id: 3, label: 'Mid Right', role: 'portrait', points: [[0.662, 0.38], [1.0, 0.35], [1.0, 0.68], [0.635, 0.71]] },
          { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.635, 0.71], [1.0, 0.68], [1.0, 1.0], [0.61, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Top Hero', role: 'hero', points: [[0.0, 0.0], [1.0, 0.0], [1.0, 0.46], [0.0, 0.54]] },
        { id: 1, label: 'Mid Left', role: 'action', points: [[0.0, 0.54], [0.54, 0.495], [0.46, 0.76], [0.0, 0.79]] },
        { id: 2, label: 'Mid Right', role: 'skyline', points: [[0.54, 0.495], [1.0, 0.46], [1.0, 0.73], [0.46, 0.76]] },
        { id: 3, label: 'Bot Left', role: 'portrait', points: [[0.0, 0.79], [0.48, 0.758], [0.42, 1.0], [0.0, 1.0]] },
        { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.48, 0.758], [1.0, 0.73], [1.0, 1.0], [0.42, 1.0]] },
      ];
    },
  },
  {
    id: 'heist-quad-4',
    name: '4-Panel Heist Quad',
    shortName: '4P Quad',
    panelCount: 4,
    paletteFill: ['#FFC845', '#FF2FA8', '#2EE8FF', '#FF6B4A'],
    description: '4-panel bold theatrical quad with hero spotlight',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.56, 0.0], [0.51, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Top Right', role: 'action', points: [[0.56, 0.0], [1.0, 0.0], [1.0, 0.46], [0.537, 0.49]] },
          { id: 2, label: 'Bot Mid', role: 'portrait', points: [[0.537, 0.49], [0.78, 0.474], [0.75, 1.0], [0.51, 1.0]] },
          { id: 3, label: 'Bot Right', role: 'closeup', points: [[0.78, 0.474], [1.0, 0.46], [1.0, 1.0], [0.75, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.58, 0.0], [0.53, 0.62], [0.0, 0.65]] },
        { id: 1, label: 'Side Tall', role: 'action', points: [[0.58, 0.0], [1.0, 0.0], [1.0, 0.60], [0.53, 0.62]] },
        { id: 2, label: 'Bot Left', role: 'portrait', points: [[0.0, 0.65], [0.47, 0.624], [0.43, 1.0], [0.0, 1.0]] },
        { id: 3, label: 'Bot Right', role: 'skyline', points: [[0.47, 0.624], [1.0, 0.60], [1.0, 1.0], [0.43, 1.0]] },
      ];
    },
  },
  {
    id: 'hero-triptych-3',
    name: '3-Panel Hero Triptych',
    shortName: '3P Triptych',
    panelCount: 3,
    paletteFill: ['#FF6B4A', '#2EE8FF', '#FFC845'],
    description: '3-panel feature portrait + 2 narrative insets',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.62, 0.0], [0.57, 1.0], [0.0, 1.0]] },
          { id: 1, label: 'Top Inset', role: 'action', points: [[0.62, 0.0], [1.0, 0.0], [1.0, 0.48], [0.596, 0.51]] },
          { id: 2, label: 'Bot Inset', role: 'portrait', points: [[0.596, 0.51], [1.0, 0.48], [1.0, 1.0], [0.57, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [1.0, 0.0], [1.0, 0.58], [0.0, 0.63]] },
        { id: 1, label: 'Bot Left', role: 'action', points: [[0.0, 0.63], [0.53, 0.603], [0.48, 1.0], [0.0, 1.0]] },
        { id: 2, label: 'Bot Right', role: 'portrait', points: [[0.53, 0.603], [1.0, 0.58], [1.0, 1.0], [0.48, 1.0]] },
      ];
    },
  },
];

export const LAYOUT_PRESETS = MULTI_PANEL_LAYOUTS;

export function getLayoutById(layoutId) {
  return MULTI_PANEL_LAYOUTS.find((l) => l.id === layoutId) || MULTI_PANEL_LAYOUTS[0];
}

// Compute pixel-space polygon points and bounding box inside the poster mosaic zone
export function computeLayoutGeometry(layoutId, width, height, outerFramePx, topReservePx = 0, bottomReservePx = 0) {
  const layout = getLayoutById(layoutId);
  const aspect = width / height;
  const rawPanels = layout.getPanels(aspect);
  const innerX = outerFramePx;
  const innerY = outerFramePx + topReservePx;
  const innerW = width - outerFramePx * 2;
  const innerH = Math.max(120, height - outerFramePx * 2 - topReservePx - bottomReservePx);

  return rawPanels.map((panel) => {
    const pts = panel.points.map(([nx, ny]) => [
      innerX + nx * innerW,
      innerY + ny * innerH,
    ]);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of pts) {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    return {
      ...panel,
      pts,
      bounds: {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        cx: (minX + maxX) * 0.5,
        cy: (minY + maxY) * 0.5,
      },
    };
  });
}

// Point-in-polygon hit test in canvas pixel space
export function hitTestPanel(geometries, px, py) {
  for (let i = geometries.length - 1; i >= 0; i--) {
    const pts = geometries[i].pts;
    let inside = false;
    for (let j = 0, k = pts.length - 1; j < pts.length; k = j++) {
      const xi = pts[j][0], yi = pts[j][1];
      const xk = pts[k][0], yk = pts[k][1];
      const intersect = ((yi > py) !== (yk > py)) &&
        (px < ((xk - xi) * (py - yi)) / ((yk - yi) || 1e-6) + xi);
      if (intersect) inside = !inside;
    }
    if (inside) return i;
  }
  return -1;
}

// Varied dramatic crop presets when filling all panels with ONE user photo
export function getSmartSinglePhotoTransform(panelIndex, role) {
  const presets = {
    hero: { zoom: 1.06, panX: 0.0, panY: -0.04, rotation: 0, flipH: false },
    action: { zoom: 1.48, panX: -0.14, panY: -0.18, rotation: -3, flipH: true },
    skyline: { zoom: 1.25, panX: 0.18, panY: -0.22, rotation: 2, flipH: false },
    portrait: { zoom: 1.72, panX: 0.04, panY: -0.24, rotation: 0, flipH: false },
    detail: { zoom: 1.62, panX: -0.18, panY: 0.16, rotation: 3, flipH: false },
    closeup: { zoom: 2.05, panX: 0.08, panY: -0.26, rotation: -2, flipH: true },
    wide: { zoom: 1.18, panX: 0.0, panY: 0.14, rotation: 0, flipH: false },
  };
  if (presets[role]) return { ...presets[role] };
  const fallbacks = [
    { zoom: 1.06, panX: 0, panY: -0.04, rotation: 0, flipH: false },
    { zoom: 1.65, panX: 0.06, panY: -0.22, rotation: -2, flipH: true },
    { zoom: 1.38, panX: -0.16, panY: 0.12, rotation: 2, flipH: false },
    { zoom: 1.85, panX: -0.05, panY: -0.24, rotation: 0, flipH: false },
    { zoom: 1.45, panX: 0.16, panY: 0.14, rotation: 3, flipH: true },
    { zoom: 2.0, panX: 0.02, panY: -0.20, rotation: -3, flipH: false },
    { zoom: 1.52, panX: -0.12, panY: 0.05, rotation: 1, flipH: true },
    { zoom: 1.32, panX: 0.10, panY: -0.12, rotation: -1, flipH: false },
    { zoom: 1.78, panX: -0.04, panY: -0.18, rotation: 2, flipH: false },
  ];
  return { ...fallbacks[panelIndex % fallbacks.length] };
}
