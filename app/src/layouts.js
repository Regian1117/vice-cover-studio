// 9 Multi-panel GTA-style cover layouts with crisp angled comic dividers
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
    id: 'grand-coast-8',
    name: '8-Panel Grand Coast',
    shortName: '8P Coast',
    panelCount: 8,
    paletteFill: ['#FF6B4A', '#FFC845', '#FF2FA8', '#2EE8FF', '#9E5BFF', '#00D8C4', '#FF8E3C', '#FFD866'],
    description: '8-panel steep chevron diagonal grand coast montage with commanding center hero',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Center Hero', role: 'hero', points: [[0.315, 0.0], [0.685, 0.0], [0.630, 1.0], [0.370, 1.0]] },
          { id: 1, label: 'Top Left', role: 'portrait', points: [[0.0, 0.0], [0.315, 0.0], [0.342, 0.490], [0.0, 0.435]] },
          { id: 2, label: 'Bot Outer Left', role: 'action', points: [[0.0, 0.435], [0.185, 0.465], [0.145, 1.0], [0.0, 1.0]] },
          { id: 3, label: 'Bot Inner Left', role: 'detail', points: [[0.185, 0.465], [0.342, 0.490], [0.370, 1.0], [0.145, 1.0]] },
          { id: 4, label: 'Top Inner Right', role: 'closeup', points: [[0.685, 0.0], [0.875, 0.0], [0.835, 0.457], [0.659, 0.480]] },
          { id: 5, label: 'Top Far Right', role: 'wide', points: [[0.875, 0.0], [1.0, 0.0], [1.0, 0.435], [0.835, 0.457]] },
          { id: 6, label: 'Bot Inner Right', role: 'skyline', points: [[0.659, 0.480], [0.835, 0.457], [0.798, 1.0], [0.630, 1.0]] },
          { id: 7, label: 'Bot Far Right', role: 'wide', points: [[0.835, 0.457], [1.0, 0.435], [1.0, 1.0], [0.798, 1.0]] },
        ];
      }
      if (aspect < 0.90) {
        return buildAngledRowGrid([
          {
            bottom: 0.28,
            tiltBot: -0.022,
            cols: [
              { right: 0.34, label: 'Top Left', role: 'portrait' },
              { right: 0.67, label: 'Top Mid', role: 'action' },
              { right: 1.0, label: 'Top Right', role: 'closeup' },
            ],
          },
          {
            bottom: 0.69,
            tiltTop: -0.022,
            tiltBot: 0.022,
            cols: [
              { right: 0.60, label: 'Hero Left', role: 'hero' },
              { right: 1.0, label: 'Mid Right', role: 'detail' },
            ],
          },
          {
            bottom: 1.0,
            tiltTop: 0.022,
            cols: [
              { right: 0.33, label: 'Bot Left', role: 'wide' },
              { right: 0.67, label: 'Bot Mid', role: 'skyline' },
              { right: 1.0, label: 'Bot Right', role: 'wide' },
            ],
          },
        ], 0.028);
      }
      return buildAngledRowGrid([
        {
          bottom: 0.42,
          tiltBot: -0.020,
          cols: [
            { right: 0.56, label: 'Hero', role: 'hero' },
            { right: 1.0, label: 'Top Right', role: 'portrait' },
          ],
        },
        {
          bottom: 0.72,
          tiltTop: -0.020,
          tiltBot: 0.018,
          cols: [
            { right: 0.34, label: 'Mid Left', role: 'action' },
            { right: 0.67, label: 'Mid Center', role: 'detail' },
            { right: 1.0, label: 'Mid Right', role: 'closeup' },
          ],
        },
        {
          bottom: 1.0,
          tiltTop: 0.018,
          cols: [
            { right: 0.33, label: 'Bot Left', role: 'wide' },
            { right: 0.68, label: 'Bot Mid', role: 'skyline' },
            { right: 1.0, label: 'Bot Right', role: 'wide' },
          ],
        },
      ], 0.026);
    },
  },
  {
    id: 'center-hero-7',
    name: '7-Panel Center Hero',
    shortName: '7P Hero',
    panelCount: 7,
    paletteFill: ['#FF6B4A', '#FFC845', '#FF2FA8', '#2EE8FF', '#9E5BFF', '#FF8E3C', '#00D8C4'],
    description: 'Dominant centered portrait hero flanked by 6 balanced angled wing panels',
    getPanels(aspect) {
      if (aspect > 1.22) {
        return [
          { id: 0, label: 'Center Hero', role: 'hero', points: [[0.336, 0.0], [0.664, 0.0], [0.644, 1.0], [0.356, 1.0]] },
          { id: 1, label: 'Top Left', role: 'portrait', points: [[0.0, 0.0], [0.336, 0.0], [0.3445, 0.425], [0.0, 0.460]] },
          { id: 2, label: 'Bot Far Left', role: 'action', points: [[0.0, 0.460], [0.178, 0.442], [0.162, 1.0], [0.0, 1.0]] },
          { id: 3, label: 'Bot Mid Left', role: 'detail', points: [[0.178, 0.442], [0.3445, 0.425], [0.356, 1.0], [0.162, 1.0]] },
          { id: 4, label: 'Top Right', role: 'closeup', points: [[0.664, 0.0], [1.0, 0.0], [1.0, 0.460], [0.6555, 0.425]] },
          { id: 5, label: 'Bot Mid Right', role: 'skyline', points: [[0.6555, 0.425], [0.822, 0.442], [0.838, 1.0], [0.644, 1.0]] },
          { id: 6, label: 'Bot Far Right', role: 'wide', points: [[0.822, 0.442], [1.0, 0.460], [1.0, 1.0], [0.838, 1.0]] },
        ];
      }
      if (aspect < 0.90) {
        return [
          { id: 0, label: 'Center Hero', role: 'hero', points: [[0.23, 0.244], [0.78, 0.2305], [0.76, 0.744], [0.21, 0.730]] },
          { id: 1, label: 'Top Left', role: 'portrait', points: [[0.0, 0.0], [0.51, 0.0], [0.49, 0.238], [0.0, 0.250]] },
          { id: 2, label: 'Mid Left', role: 'action', points: [[0.0, 0.250], [0.23, 0.244], [0.21, 0.730], [0.0, 0.725]] },
          { id: 3, label: 'Bot Left', role: 'detail', points: [[0.0, 0.725], [0.49, 0.737], [0.47, 1.0], [0.0, 1.0]] },
          { id: 4, label: 'Top Right', role: 'closeup', points: [[0.51, 0.0], [1.0, 0.0], [1.0, 0.225], [0.49, 0.238]] },
          { id: 5, label: 'Mid Right', role: 'skyline', points: [[0.78, 0.2305], [1.0, 0.225], [1.0, 0.750], [0.76, 0.744]] },
          { id: 6, label: 'Bot Right', role: 'wide', points: [[0.49, 0.737], [1.0, 0.750], [1.0, 1.0], [0.47, 1.0]] },
        ];
      }
      return [
        { id: 0, label: 'Center Hero', role: 'hero', points: [[0.300, 0.0], [0.700, 0.0], [0.684, 1.0], [0.316, 1.0]] },
        { id: 1, label: 'Top Left', role: 'portrait', points: [[0.0, 0.0], [0.300, 0.0], [0.3051, 0.320], [0.0, 0.345]] },
        { id: 2, label: 'Mid Left', role: 'action', points: [[0.0, 0.345], [0.3051, 0.320], [0.3105, 0.655], [0.0, 0.675]] },
        { id: 3, label: 'Bot Left', role: 'detail', points: [[0.0, 0.675], [0.3105, 0.655], [0.316, 1.0], [0.0, 1.0]] },
        { id: 4, label: 'Top Right', role: 'closeup', points: [[0.700, 0.0], [1.0, 0.0], [1.0, 0.345], [0.6949, 0.320]] },
        { id: 5, label: 'Mid Right', role: 'skyline', points: [[0.6949, 0.320], [1.0, 0.345], [1.0, 0.675], [0.6895, 0.655]] },
        { id: 6, label: 'Bot Right', role: 'wide', points: [[0.6895, 0.655], [1.0, 0.675], [1.0, 1.0], [0.684, 1.0]] },
      ];
    },
  },
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
          { id: 1, label: 'Top Center', role: 'action', points: [[0.385, 0.0], [0.710, 0.0], [0.688, 0.405], [0.368, 0.430]] },
          { id: 2, label: 'Top Right', role: 'portrait', points: [[0.710, 0.0], [1.0, 0.0], [1.0, 0.385], [0.688, 0.405]] },
          { id: 3, label: 'Bot Left', role: 'detail', points: [[0.368, 0.430], [0.585, 0.415], [0.555, 1.0], [0.345, 1.0]] },
          { id: 4, label: 'Bot Mid', role: 'skyline', points: [[0.585, 0.415], [0.805, 0.398], [0.785, 1.0], [0.555, 1.0]] },
          { id: 5, label: 'Bot Right', role: 'closeup', points: [[0.805, 0.398], [1.0, 0.385], [1.0, 1.0], [0.785, 1.0]] },
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
        { id: 0, label: 'Hero', role: 'hero', points: [[0.0, 0.0], [0.47, 0.0], [0.43, 0.59], [0.0, 0.62]] },
        { id: 1, label: 'Top Right', role: 'action', points: [[0.47, 0.0], [1.0, 0.0], [1.0, 0.29], [0.45, 0.31]] },
        { id: 2, label: 'Mid Right', role: 'portrait', points: [[0.45, 0.31], [1.0, 0.29], [1.0, 0.58], [0.43, 0.59]] },
        { id: 3, label: 'Bot Left', role: 'detail', points: [[0.0, 0.62], [0.35, 0.60], [0.32, 1.0], [0.0, 1.0]] },
        { id: 4, label: 'Bot Mid', role: 'skyline', points: [[0.35, 0.60], [0.69, 0.585], [0.67, 1.0], [0.32, 1.0]] },
        { id: 5, label: 'Bot Right', role: 'closeup', points: [[0.69, 0.585], [1.0, 0.58], [1.0, 1.0], [0.67, 1.0]] },
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
        { id: 0, label: 'Top Left', role: 'action', points: [[0.0, 0.0], [0.45, 0.0], [0.42, 0.278], [0.0, 0.295]] },
        { id: 1, label: 'Top Right', role: 'skyline', points: [[0.45, 0.0], [1.0, 0.0], [1.0, 0.255], [0.42, 0.278]] },
        { id: 2, label: 'Hero Left', role: 'hero', points: [[0.0, 0.295], [0.59, 0.271], [0.55, 0.669], [0.0, 0.690]] },
        { id: 3, label: 'Mid Right', role: 'portrait', points: [[0.59, 0.271], [1.0, 0.255], [1.0, 0.465], [0.57, 0.470]] },
        { id: 4, label: 'Low Right', role: 'detail', points: [[0.57, 0.470], [1.0, 0.465], [1.0, 0.652], [0.55, 0.669]] },
        { id: 5, label: 'Bottom Wide', role: 'wide', points: [[0.0, 0.690], [1.0, 0.652], [1.0, 1.0], [0.0, 1.0]] },
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
          { id: 1, label: 'Top Mid', role: 'action', points: [[0.45, 0.0], [0.74, 0.0], [0.72, 0.462], [0.431, 0.480]] },
          { id: 2, label: 'Top Right', role: 'skyline', points: [[0.74, 0.0], [1.0, 0.0], [1.0, 0.445], [0.72, 0.462]] },
          { id: 3, label: 'Bot Mid', role: 'portrait', points: [[0.431, 0.480], [0.72, 0.462], [0.69, 1.0], [0.41, 1.0]] },
          { id: 4, label: 'Bot Right', role: 'closeup', points: [[0.72, 0.462], [1.0, 0.445], [1.0, 1.0], [0.69, 1.0]] },
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

export const FEATURED_LAYOUT_IDS = ['grand-coast-8', 'hero-slant-6', 'vertical-poster-6', 'classic-box-5'];

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
export const SMART_SINGLE_PHOTO_SHOTS = [
  { zoom: 1.04, panX: 0.0, panY: 0.04, rotation: 0, flipH: false, cropFocalX: null, cropFocalY: null, label: 'FULL SHOT', preferredGrade: '' },
  { zoom: 2.05, panX: 0.0, panY: 0.0, rotation: -2.5, flipH: false, cropFocalX: 0.52, cropFocalY: 0.24, label: 'CLOSE-UP', preferredGrade: 'vice-sunset-gold' },
  { zoom: 1.82, panX: 0.0, panY: 0.0, rotation: 1.5, flipH: false, cropFocalX: 0.21, cropFocalY: 0.34, label: 'WIDE ANGLE', preferredGrade: 'tropical-cyan' },
  { zoom: 2.05, panX: 0.0, panY: 0.0, rotation: 2.5, flipH: false, cropFocalX: 0.14, cropFocalY: 0.72, label: 'DETAIL CROP', preferredGrade: 'golden-heatwave' },
  { zoom: 2.02, panX: 0.0, panY: 0.0, rotation: -2.0, flipH: false, cropFocalX: 0.84, cropFocalY: 0.24, label: 'PALM COAST', preferredGrade: 'vice-sunset' },
  { zoom: 1.32, panX: 0.08, panY: -0.04, rotation: -2, flipH: false, cropFocalX: 0.76, cropFocalY: 0.22, label: 'SKYLINE', preferredGrade: 'synth-chrome' },
  { zoom: 1.88, panX: -0.06, panY: 0.02, rotation: 2, flipH: true, cropFocalX: 0.42, cropFocalY: 0.46, label: 'ACTION CROP', preferredGrade: 'golden-heatwave' },
  { zoom: 1.42, panX: 0.04, panY: 0.06, rotation: -1.5, flipH: false, cropFocalX: 0.68, cropFocalY: 0.72, label: 'LOW ANGLE', preferredGrade: 'vice-sunset' },
  { zoom: 1.96, panX: 0.0, panY: -0.02, rotation: 1.5, flipH: true, cropFocalX: 0.50, cropFocalY: 0.26, label: 'TIGHT CROP', preferredGrade: 'tropical-cyan' },
];

export function getSmartSinglePhotoTransform(panelIndex, _role, subjectAnchor = null) {
  const base = SMART_SINGLE_PHOTO_SHOTS[panelIndex % SMART_SINGLE_PHOTO_SHOTS.length];
  const shot = { ...base };
  if (!subjectAnchor) {
    if (panelIndex % SMART_SINGLE_PHOTO_SHOTS.length === 0) {
      shot.cropFocalX = 0.5;
      shot.cropFocalY = 0.5;
    }
    return shot;
  }

  const fx = Math.max(0.18, Math.min(0.82, subjectAnchor.focalX ?? 0.52));
  const fy = Math.max(0.16, Math.min(0.70, subjectAnchor.focalY ?? 0.25));
  const idx = panelIndex % SMART_SINGLE_PHOTO_SHOTS.length;

  if (idx === 0) {
    // FULL SHOT: preserve complete portrait framing around subject anchor
    shot.cropFocalX = fx;
    shot.cropFocalY = Math.max(0.20, Math.min(0.42, fy + 0.02));
  } else if (idx === 1) {
    // CLOSE-UP: tight face/subject crop centered cleanly on detected anchor
    shot.cropFocalX = fx;
    shot.cropFocalY = Math.max(0.18, Math.min(0.40, fy));
  } else if (idx === 2) {
    // LIFEGUARD BAY / WIDE ANGLE: frame opposite coastal horizon next to subject
    shot.cropFocalX = fx >= 0.45 ? Math.max(0.21, fx - 0.35) : Math.min(0.79, fx + 0.35);
    shot.cropFocalY = 0.34;
  } else if (idx === 3) {
    // CAR DETAIL: anchor into lower foreground detail zone
    shot.cropFocalX = fx >= 0.45 ? 0.14 : 0.86;
    shot.cropFocalY = 0.72;
  } else if (idx === 4) {
    // PALM COAST: crisp palm skyline corner away from foreground subject
    shot.cropFocalX = fx <= 0.55 ? 0.84 : 0.16;
    shot.cropFocalY = 0.24;
    shot.flipH = false;
  } else if (idx === 5) {
    shot.cropFocalX = fx <= 0.55 ? Math.min(0.86, fx + 0.24) : Math.max(0.14, fx - 0.24);
    shot.cropFocalY = Math.max(0.16, fy - 0.04);
  } else if (idx === 6) {
    shot.cropFocalX = fx;
    shot.cropFocalY = Math.min(0.64, fy + 0.20);
  } else if (idx === 7) {
    shot.cropFocalX = Math.min(0.80, fx + 0.16);
    shot.cropFocalY = 0.72;
  } else if (idx === 8) {
    shot.cropFocalX = fx;
    shot.cropFocalY = Math.max(0.18, Math.min(0.40, fy));
  }

  return shot;
}
