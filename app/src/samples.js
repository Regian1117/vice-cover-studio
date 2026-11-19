// Built-in offline coastal cover sample library (100% original, casual portraits + sunset/neon scenes)
// Includes casual user portraits and golden-hour / night scenes for instant multi-panel demos.

export const VICE_SAMPLE_PHOTOS = [
  { id: 'boulevard', label: 'Boulevard', src: './samples/boulevard.jpg', focalX: 0.52, focalY: 0.24, defaultStamp: 'OCEAN DRIVE · 6:42 PM' },
  { id: 'pier-candid', label: 'Pier Candid', src: './samples/pier-candid.jpg', focalX: 0.46, focalY: 0.26, defaultStamp: 'MARINA PIER · 6:18 PM' },
  { id: 'protagonist-dusk', label: 'Rooftop Dusk', src: './samples/protagonist-dusk.jpg', focalX: 0.50, focalY: 0.25, defaultStamp: 'SKYLINE TERRACE · 7:05 PM' },
  { id: 'supercar', label: 'Art Deco GT', src: './samples/supercar.jpg', focalX: 0.50, focalY: 0.58, defaultStamp: 'ART DECO BLVD · 6:55 PM' },
  { id: 'neon-motel-rider', label: 'Neon Motel', src: './samples/neon-motel-rider.jpg', focalX: 0.50, focalY: 0.54, defaultStamp: 'STARLIGHT MOTEL · 9:15 PM' },
  { id: 'coast-aerial', label: 'Coast Aerial', src: './samples/coast-aerial.jpg', focalX: 0.50, focalY: 0.48, defaultStamp: 'CORAL CAUSEWAY · 6:48 PM' },
  { id: 'neon-strip', label: 'Neon Strip', src: './samples/neon-strip.jpg', focalX: 0.52, focalY: 0.56, defaultStamp: 'STARLIGHT STRIP · 9:32 PM' },
  { id: 'yacht-chase', label: 'Yacht Chase', src: './samples/yacht-chase.jpg', focalX: 0.48, focalY: 0.54, defaultStamp: 'PALM KEYS · 7:10 PM' },
];

export const SAMPLE_CATALOG = VICE_SAMPLE_PHOTOS;

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
  for (const item of VICE_SAMPLE_PHOTOS) {
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
        defaultStamp: item.defaultStamp,
      });
    } catch {
      // Skip optional sample if missing
    }
  }
  return loaded;
}
