// Built-in offline Vice City sample photo catalog (100% original, sunset/dusk/neon coherent palette)
// Each entry defines natural focal points (focalX, focalY) and an episodic location/time stamp.

export const VICE_SAMPLE_PHOTOS = [
  { id: 'boulevard', label: 'Boulevard', src: './samples/boulevard.jpg', focalX: 0.52, focalY: 0.24, defaultStamp: 'OCEAN DRIVE · 6:42 PM' },
  { id: 'protagonist-dusk', label: 'Rooftop Dusk', src: './samples/protagonist-dusk.jpg', focalX: 0.50, focalY: 0.26, defaultStamp: 'SKYLINE TERRACE · 7:05 PM' },
  { id: 'supercar', label: 'Art Deco GT', src: './samples/supercar.jpg', focalX: 0.50, focalY: 0.58, defaultStamp: 'ART DECO BLVD · 6:55 PM' },
  { id: 'neon-motel-rider', label: 'Neon Motel', src: './samples/neon-motel-rider.jpg', focalX: 0.50, focalY: 0.54, defaultStamp: 'STARLIGHT MOTEL · 9:15 PM' },
  { id: 'neon-strip', label: 'Neon Strip', src: './samples/neon-strip.jpg', focalX: 0.52, focalY: 0.56, defaultStamp: 'STARLIGHT STRIP · 9:32 PM' },
  { id: 'coast-aerial', label: 'Coast Aerial', src: './samples/coast-aerial.jpg', focalX: 0.50, focalY: 0.48, defaultStamp: 'CORAL CAUSEWAY · 6:48 PM' },
  { id: 'yacht-chase', label: 'Yacht Chase', src: './samples/yacht-chase.jpg', focalX: 0.48, focalY: 0.54, defaultStamp: 'PALM KEYS · 7:10 PM' },
  { id: 'bay-chopper', label: 'Bay Chopper', src: './samples/bay-chopper.jpg', focalX: 0.50, focalY: 0.42, defaultStamp: 'BISCAYNE BAY · 6:38 PM' },
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
