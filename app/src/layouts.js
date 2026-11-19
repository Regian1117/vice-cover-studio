// Multi-panel GTA-style cover layout definitions with dynamic angled gutters
// Coordinates are normalized [0..1] within the inner poster safe area.

export const EXPORT_SIZES = [
  { id: 'landscape', label: '1920 × 1080', shortLabel: '16:9', width: 1920, height: 1080, desc: 'YouTube / Banner' },
  { id: 'portrait', label: '1080 × 1350', shortLabel: '4:5', width: 1080, height: 1350, desc: 'Instagram / Poster' },
  { id: 'square', label: '1080 × 1080', shortLabel: '1:1', width: 1080, height: 1080, desc: 'Feed / Album' },
];

export const LAYOUT_PRESETS = [
  {
    id: 'vice-mosaic-6',
    name: 'Vice Mosaic',
    panelCount: 6,
    description: '6-panel iconic hero + angled comic mosaic',
    // Returns array of { id, label, points: [[x,y],...], role, defaultFocus }
    getPanels(aspect) {
      if (aspect > 1.25) {
        // 16:9 Landscape: Commanding left hero + 5 dynamic slanted mosaic panels on right
        return [
          {
            id: 0, label: 'Hero', role: 'hero',
            points: [[0.0, 0.0], [0.435, 0.0], [0.405, 1.0], [0.0, 1.0]],
          },
          {
            id: 1, label: 'Top Mid', role: 'action',
            points: [[0.435, 0.0], [0.735, 0.0], [0.715, 0.48], [0.420, 0.51]],
          },
          {
            id: 2, label: 'Top Right', role: 'skyline',
            points: [[0.735, 0.0], [1.0, 0.0], [1.0, 0.45], [0.715, 0.48]],
          },
          {
            id: 3, label: 'Low Mid', role: 'detail',
            points: [[0.420, 0.51], [0.635, 0.49], [0.610, 1.0], [0.405, 1.0]],
          },
          {
            id: 4, label: 'Low Center', role: 'portrait',
            points: [[0.635, 0.49], [0.835, 0.468], [0.820, 1.0], [0.610, 1.0]],
          },
          {
            id: 5, label: 'Low Right', role: 'closeup',
            points: [[0.835, 0.468], [1.0, 0.45], [1.0, 1.0], [0.820, 1.0]],
          },
        ];
      }
      if (aspect < 0.9) {
        // 4:5 Portrait: Classic vertical GTA cover art 6-panel grid
        return [
          {
            id: 0, label: 'Top Left', role: 'action',
            points: [[0.0, 0.0], [0.44, 0.0], [0.41, 0.28], [0.0, 0.30]],
          },
          {
            id: 1, label: 'Top Right', role: 'skyline',
            points: [[0.44, 0.0], [1.0, 0.0], [1.0, 0.26], [0.41, 0.28]],
          },
          {
            id: 2, label: 'Hero', role: 'hero',
            points: [[0.0, 0.30], [0.58, 0.275], [0.54, 0.72], [0.0, 0.74]],
          },
          {
            id: 3, label: 'Mid Right', role: 'portrait',
            points: [[0.58, 0.275], [1.0, 0.26], [1.0, 0.51], [0.558, 0.50]],
          },
          {
            id: 4, label: 'Low Right', role: 'detail',
            points: [[0.558, 0.50], [1.0, 0.51], [1.0, 0.73], [0.54, 0.72]],
          },
          {
            id: 5, label: 'Bottom Strip', role: 'wide',
            points: [[0.0, 0.74], [1.0, 0.73], [1.0, 1.0], [0.0, 1.0]],
          },
        ];
      }
      // 1:1 Square: Balanced 6-panel asymmetric box art
      return [
        {
          id: 0, label: 'Hero', role: 'hero',
          points: [[0.0, 0.0], [0.50, 0.0], [0.46, 0.64], [0.0, 0.67]],
        },
        {
          id: 1, label: 'Top Right', role: 'action',
          points: [[0.50, 0.0], [1.0, 0.0], [1.0, 0.33], [0.48, 0.35]],
        },
        {
          id: 2, label: 'Mid Right', role: 'skyline',
          points: [[0.48, 0.35], [1.0, 0.33], [1.0, 0.65], [0.46, 0.64]],
        },
        {
          id: 3, label: 'Bot Left', role: 'detail',
          points: [[0.0, 0.67], [0.35, 0.655], [0.33, 1.0], [0.0, 1.0]],
        },
        {
          id: 4, label: 'Bot Mid', role: 'portrait',
          points: [[0.35, 0.655], [0.69, 0.645], [0.67, 1.0], [0.33, 1.0]],
        },
        {
          id: 5, label: 'Bot Right', role: 'closeup',
          points: [[0.69, 0.645], [1.0, 0.65], [1.0, 1.0], [0.67, 1.0]],
        },
      ];
    },
  },
  {
    id: 'classic-box-5',
    name: 'Classic Box',
    panelCount: 5,
    description: '5-panel iconic box cover with angled center split',
    getPanels(aspect) {
      if (aspect > 1.25) {
        return [
          {
            id: 0, label: 'Hero', role: 'hero',
            points: [[0.0, 0.0], [0.46, 0.0], [0.42, 1.0], [0.0, 1.0]],
          },
          {
            id: 1, label: 'Top Mid', role: 'action',
            points: [[0.46, 0.0], [0.75, 0.0], [0.73, 0.51], [0.44, 0.53]],
          },
          {
            id: 2, label: 'Top Right', role: 'skyline',
            points: [[0.75, 0.0], [1.0, 0.0], [1.0, 0.49], [0.73, 0.51]],
          },
          {
            id: 3, label: 'Bot Mid', role: 'portrait',
            points: [[0.44, 0.53], [0.72, 0.51], [0.70, 1.0], [0.42, 1.0]],
          },
          {
            id: 4, label: 'Bot Right', role: 'closeup',
            points: [[0.72, 0.51], [1.0, 0.49], [1.0, 1.0], [0.70, 1.0]],
          },
        ];
      }
      if (aspect < 0.9) {
        return [
          {
            id: 0, label: 'Top Left', role: 'action',
            points: [[0.0, 0.0], [0.46, 0.0], [0.43, 0.30], [0.0, 0.32]],
          },
          {
            id: 1, label: 'Top Right', role: 'skyline',
            points: [[0.46, 0.0], [1.0, 0.0], [1.0, 0.28], [0.43, 0.30]],
          },
          {
            id: 2, label: 'Hero', role: 'hero',
            points: [[0.0, 0.32], [0.60, 0.295], [0.56, 1.0], [0.0, 1.0]],
          },
          {
            id: 3, label: 'Mid Right', role: 'portrait',
            points: [[0.60, 0.295], [1.0, 0.28], [1.0, 0.64], [0.58, 0.66]],
          },
          {
            id: 4, label: 'Bot Right', role: 'closeup',
            points: [[0.58, 0.66], [1.0, 0.64], [1.0, 1.0], [0.56, 1.0]],
          },
        ];
      }
      return [
        {
          id: 0, label: 'Hero', role: 'hero',
          points: [[0.0, 0.0], [0.53, 0.0], [0.49, 0.64], [0.0, 0.67]],
        },
        {
          id: 1, label: 'Top Right', role: 'action',
          points: [[0.53, 0.0], [1.0, 0.0], [1.0, 0.34], [0.51, 0.36]],
        },
        {
          id: 2, label: 'Mid Right', role: 'skyline',
          points: [[0.51, 0.36], [1.0, 0.34], [1.0, 0.66], [0.49, 0.64]],
        },
        {
          id: 3, label: 'Bot Left', role: 'portrait',
          points: [[0.0, 0.67], [0.52, 0.64], [0.48, 1.0], [0.0, 1.0]],
        },
        {
          id: 4, label: 'Bot Right', role: 'closeup',
          points: [[0.52, 0.64], [1.0, 0.66], [1.0, 1.0], [0.48, 1.0]],
        },
      ];
    },
  },
  {
    id: 'action-slash-5',
    name: 'Action Slash',
    panelCount: 5,
    description: '5-panel razor-slanted diagonal comic dividers',
    getPanels(aspect) {
      if (aspect > 1.25) {
        return [
          {
            id: 0, label: 'Left Slash', role: 'action',
            points: [[0.0, 0.0], [0.33, 0.0], [0.24, 1.0], [0.0, 1.0]],
          },
          {
            id: 1, label: 'Center Hero', role: 'hero',
            points: [[0.33, 0.0], [0.69, 0.0], [0.61, 1.0], [0.24, 1.0]],
          },
          {
            id: 2, label: 'Top Right', role: 'skyline',
            points: [[0.69, 0.0], [1.0, 0.0], [1.0, 0.35], [0.662, 0.38]],
          },
          {
            id: 3, label: 'Mid Right', role: 'portrait',
            points: [[0.662, 0.38], [1.0, 0.35], [1.0, 0.68], [0.635, 0.71]],
          },
          {
            id: 4, label: 'Bot Right', role: 'closeup',
            points: [[0.635, 0.71], [1.0, 0.68], [1.0, 1.0], [0.61, 1.0]],
          },
        ];
      }
      return [
        {
          id: 0, label: 'Top Hero', role: 'hero',
          points: [[0.0, 0.0], [1.0, 0.0], [1.0, 0.46], [0.0, 0.54]],
        },
        {
          id: 1, label: 'Mid Left', role: 'action',
          points: [[0.0, 0.54], [0.54, 0.495], [0.46, 0.76], [0.0, 0.79]],
        },
        {
          id: 2, label: 'Mid Right', role: 'skyline',
          points: [[0.54, 0.495], [1.0, 0.46], [1.0, 0.73], [0.46, 0.76]],
        },
        {
          id: 3, label: 'Bot Left', role: 'portrait',
          points: [[0.0, 0.79], [0.48, 0.758], [0.42, 1.0], [0.0, 1.0]],
        },
        {
          id: 4, label: 'Bot Right', role: 'closeup',
          points: [[0.48, 0.758], [1.0, 0.73], [1.0, 1.0], [0.42, 1.0]],
        },
      ];
    },
  },
  {
    id: 'widescreen-heist-4',
    name: 'Heist Quad',
    panelCount: 4,
    description: '4-panel bold theatrical quad with hero spotlight',
    getPanels(aspect) {
      if (aspect > 1.25) {
        return [
          {
            id: 0, label: 'Hero', role: 'hero',
            points: [[0.0, 0.0], [0.56, 0.0], [0.51, 1.0], [0.0, 1.0]],
          },
          {
            id: 1, label: 'Top Right', role: 'action',
            points: [[0.56, 0.0], [1.0, 0.0], [1.0, 0.46], [0.537, 0.49]],
          },
          {
            id: 2, label: 'Bot Mid', role: 'portrait',
            points: [[0.537, 0.49], [0.78, 0.474], [0.75, 1.0], [0.51, 1.0]],
          },
          {
            id: 3, label: 'Bot Right', role: 'closeup',
            points: [[0.78, 0.474], [1.0, 0.46], [1.0, 1.0], [0.75, 1.0]],
          },
        ];
      }
      return [
        {
          id: 0, label: 'Hero', role: 'hero',
          points: [[0.0, 0.0], [0.58, 0.0], [0.53, 0.62], [0.0, 0.65]],
        },
        {
          id: 1, label: 'Side Tall', role: 'action',
          points: [[0.58, 0.0], [1.0, 0.0], [1.0, 0.60], [0.53, 0.62]],
        },
        {
          id: 2, label: 'Bot Left', role: 'portrait',
          points: [[0.0, 0.65], [0.47, 0.624], [0.43, 1.0], [0.0, 1.0]],
        },
        {
          id: 3, label: 'Bot Right', role: 'skyline',
          points: [[0.47, 0.624], [1.0, 0.60], [1.0, 1.0], [0.43, 1.0]],
        },
      ];
    },
  },
  {
    id: 'hero-triptych-3',
    name: 'Hero Triptych',
    panelCount: 3,
    description: '3-panel bold feature portrait + 2 narrative insets',
    getPanels(aspect) {
      if (aspect > 1.25) {
        return [
          {
            id: 0, label: 'Hero', role: 'hero',
            points: [[0.0, 0.0], [0.62, 0.0], [0.57, 1.0], [0.0, 1.0]],
          },
          {
            id: 1, label: 'Top Inset', role: 'action',
            points: [[0.62, 0.0], [1.0, 0.0], [1.0, 0.48], [0.596, 0.51]],
          },
          {
            id: 2, label: 'Bot Inset', role: 'portrait',
            points: [[0.596, 0.51], [1.0, 0.48], [1.0, 1.0], [0.57, 1.0]],
          },
        ];
      }
      return [
        {
          id: 0, label: 'Hero', role: 'hero',
          points: [[0.0, 0.0], [1.0, 0.0], [1.0, 0.58], [0.0, 0.63]],
        },
        {
          id: 1, label: 'Bot Left', role: 'action',
          points: [[0.0, 0.63], [0.53, 0.603], [0.48, 1.0], [0.0, 1.0]],
        },
        {
          id: 2, label: 'Bot Right', role: 'portrait',
          points: [[0.53, 0.603], [1.0, 0.58], [1.0, 1.0], [0.48, 1.0]],
        },
      ];
    },
  },
];

export function getLayoutById(layoutId) {
  return LAYOUT_PRESETS.find((l) => l.id === layoutId) || LAYOUT_PRESETS[0];
}

// Compute pixel-space polygon points and bounding box for every panel inside the poster frame
export function computeLayoutGeometry(layoutId, width, height, outerFramePx, bottomReservePx = 0) {
  const layout = getLayoutById(layoutId);
  const aspect = width / height;
  const rawPanels = layout.getPanels(aspect);
  const innerX = outerFramePx;
  const innerY = outerFramePx;
  const innerW = width - outerFramePx * 2;
  const innerH = Math.max(120, height - outerFramePx * 2 - bottomReservePx);

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

// Find an interior gutter intersection point furthest from title lockup & corner badges for the starburst stamp
export function findStarburstAnchor(geometries, width, height, titlePosition, outerFramePx = 0, bottomReservePx = 0) {
  const panelAreaBottom = height - outerFramePx - bottomReservePx;
  const marginX = Math.max(60, width * 0.14);
  const minY = outerFramePx + Math.max(50, (panelAreaBottom - outerFramePx) * 0.14);
  const maxY = panelAreaBottom - Math.max(50, (panelAreaBottom - outerFramePx) * 0.14);

  // Deduplicate interior vertices and count how many panels touch each vertex
  const candidates = [];
  for (const geom of geometries) {
    for (const [vx, vy] of geom.pts) {
      if (vx <= outerFramePx + marginX * 0.5 || vx >= width - outerFramePx - marginX * 0.5) continue;
      if (vy <= minY || vy >= maxY) continue;
      const existing = candidates.find((c) => Math.hypot(c.x - vx, c.y - vy) < 16);
      if (existing) {
        existing.count += 1;
      } else {
        candidates.push({ x: vx, y: vy, count: 1 });
      }
    }
  }

  if (!candidates.length) {
    return { x: width * 0.44, y: (outerFramePx + panelAreaBottom) * 0.48 };
  }

  const nyTarget = titlePosition === 'top-banner' ? 0.68 : titlePosition === 'center-emblem' ? 0.28 : 0.46;
  const targetY = outerFramePx + (panelAreaBottom - outerFramePx) * nyTarget;

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const nx = c.x / width;
    // Prefer shared T/cross intersections near hero seam & vertical target zone away from headline
    let score = c.count * 2.2 - Math.abs(c.y - targetY) / (height * 0.25);
    if (nx >= 0.35 && nx <= 0.62) score += 2.0;
    if (titlePosition === 'top-banner' && c.y < outerFramePx + (panelAreaBottom - outerFramePx) * 0.36) score -= 6.0;
    if (titlePosition !== 'top-banner' && c.y > panelAreaBottom - height * 0.28) score -= 6.0;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return { x: best.x, y: best.y };
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

// Smart framing presets when filling all panels with a SINGLE user photo:
// produces varied dramatic crops, zooms, tilts, and mirrors so 1 photo looks like a comic story!
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
  ];
  return { ...fallbacks[panelIndex % fallbacks.length] };
}
