// Vice Cover Studio — gta6-cover-art-01 offline static cover art maker entrypoint (Node 22, stdlib only).
// Packages app/ and screenshots/ into MAKEFUN_OUTPUT_DIR (or /output) and emits deterministic dossier.json.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appSrc = join(here, 'app');
const shotsSrc = join(here, 'screenshots');

if (!existsSync(join(appSrc, 'index.html'))) {
  throw new Error('Missing app/index.html in Vice Cover Studio package');
}

// Start from clean target directories so repeated runs produce byte-identical output
mkdirSync(out, { recursive: true });
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });

cpSync(appSrc, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsSrc)) {
  const shotFiles = readdirSync(shotsSrc)
    .filter((name) => !name.startsWith('.'))
    .sort();
  for (const name of shotFiles) {
    cpSync(join(shotsSrc, name), join(out, 'screenshots', name));
  }
}

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const dossierBytes = buildDossier(out, DOSSIER_LIMITS);
writeFileSync(join(out, 'dossier.json'), dossierBytes);
