// The sky of the day, captured once at build time into data/sky.json, for the places the Worker
// doesn't reach: the GitHub Pages preview (no server at all) and the first paint everywhere (the
// preloader and the small wheels draw before /api/sky has answered). Every page carries this
// snapshot inline; the browser moves each planet on by its speed to the minute it is read.
// The key comes from the environment (the FREE_ASTRO_API repository secret) and goes nowhere else:
// the file holds positions and speeds only. Without a key, or if FreeAstroAPI doesn't answer, the
// build carries on without a sky, as before.
//
//   FREE_ASTRO_API=… node tools/sky-snapshot.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import { ask, DEFAULT_ENDPOINT } from '../worker/index.js';

const key = (process.env.FREE_ASTRO_API || process.env.FREE_ASTRO_API_KEY || '').trim();
if (!key) {
  console.log('::warning::No FREE_ASTRO_API secret: the pages go without the sky of the day.');
  process.exit(0);
}
try {
  const snapshot = await ask(process.env.FREE_ASTRO_API_URL || DEFAULT_ENDPOINT, key, Date.now());
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(new URL('../data/sky.json', import.meta.url), JSON.stringify(snapshot));
  console.log(`Sky captured at ${snapshot.at}: ${snapshot.bodies.map((b) => b.key).join(', ')}`);
} catch (err) {
  // the message names the status (401, 429…), never the key
  console.log(`::warning::The sky couldn't be read (${err.message}): the pages go without it.`);
}
