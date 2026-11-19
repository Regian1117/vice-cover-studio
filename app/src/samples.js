// Built-in offline sample photo catalog (kit samples + original AI-generated Vice City scenes)
// Each entry defines a natural focal point (focalX, focalY in [0..1]) so portraits never crop faces.

export const SAMPLE_CATALOG = [
  { id: 'boulevard', label: 'Boulevard', src: './samples/boulevard.jpg', focalX: 0.52, focalY: 0.24 },
  { id: 'supercar', label: 'Art Deco GT', src: './samples/supercar.jpg', focalX: 0.50, focalY: 0.58 },
  { id: 'neon-strip', label: 'Neon Strip', src: './samples/neon-strip.jpg', focalX: 0.52, focalY: 0.56 },
  { id: 'pier', label: 'Pier Day', src: './samples/pier.jpg', focalX: 0.44, focalY: 0.24 },
  { id: 'bay-chopper', label: 'Bay Chopper', src: './samples/bay-chopper.jpg', focalX: 0.50, focalY: 0.42 },
];

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadBuiltInSamples() {
  const loaded = [];
  for (const item of SAMPLE_CATALOG) {
    try {
      const img = await loadImageElement(item.src);
      loaded.push({
        id: item.id,
        label: item.label,
        src: item.src,
        isSample: true,
        img,
        focalX: item.focalX,
        focalY: item.focalY,
      });
    } catch {
      // Skip optional sample if missing
    }
  }
  return loaded;
}
