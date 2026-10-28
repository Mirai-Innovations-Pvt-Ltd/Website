// Bundles the 3D station (station.js + vendored three.js r170) into one classic script that sets window.LayerStation,
// so the hero needs no module loading at all (module imports are what break on some hosts).
// Output: site/assets/station/station.bundle.js. Run from this folder: npm install && npm run build
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
await build({
  configFile: false,
  logLevel: 'warn',
  root: here,
  build: {
    outDir: resolve(here, '../../site/assets/station'),
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    lib: { entry: resolve(here, 'station.js'), formats: ['iife'], name: 'LayerStation', fileName: () => 'station.bundle.js' },
  },
});
console.log('built site/assets/station/station.bundle.js');
