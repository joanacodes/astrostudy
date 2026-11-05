// Draws every figure in figures/ and writes, into media/myths/silhouettes/:
//
//   <slug>.svg                     the silhouette in black on a transparent ground (recolour it at will)
//   <slug>--white-on-black.png     2000 × 2000, white figure on black
//   <slug>--black-on-white.png     2000 × 2000, black figure on white
//
//   node tools/myths/silhouettes/render.mjs                  all of them
//   node tools/myths/silhouettes/render.mjs aphrodite-…      only those
//   node tools/myths/silhouettes/render.mjs --sheet sheet.png  also a contact sheet of all, to check them at a glance

import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { toSvg } from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = fileURLToPath(new URL('.', import.meta.url));
const out = fileURLToPath(new URL('../../../media/myths/silhouettes/', import.meta.url));
const args = process.argv.slice(2);
const sheetAt = args.indexOf('--sheet');
const sheet = sheetAt >= 0 ? args[sheetAt + 1] : null;
const wanted = args.filter((a, i) => !a.startsWith('--') && (sheetAt < 0 || i !== sheetAt + 1));

const files = (await readdir(`${here}figures`)).filter((f) => f.endsWith('.mjs')).sort();
const figures = [];
for (const file of files) {
  const mod = await import(pathToFileURL(`${here}figures/${file}`).href);
  if (!wanted.length || wanted.includes(mod.slug)) figures.push(mod);
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
const shot = async (svg, path) => {
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.locator('svg').screenshot({ path });
};
for (const fig of figures) {
  const shapes = fig.draw();
  await writeFile(`${out}${fig.slug}.svg`, toSvg(shapes, { fg: '#000', bg: null }));
  await shot(toSvg(shapes, { fg: '#fff', bg: '#000' }), `${out}${fig.slug}--white-on-black.png`);
  await shot(toSvg(shapes, { fg: '#000', bg: '#fff' }), `${out}${fig.slug}--black-on-white.png`);
  console.log(`✓ ${fig.slug}`);
}

if (sheet) {
  const cells = figures.map((fig) => `<figure style="margin:0;text-align:center">${toSvg(fig.draw(), { size: 300, ids: `${fig.slug}-m` })}<figcaption style="font:13px sans-serif;color:#bbb;padding:6px 0 14px">${fig.slug}</figcaption></figure>`);
  const cols = Math.min(5, cells.length);
  await page.setViewportSize({ width: cols * 310 + 20, height: 1000 });
  await page.setContent(`<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},300px);gap:10px;padding:10px">${cells.join('')}</body></html>`);
  await page.screenshot({ path: sheet, fullPage: true });
  console.log(`sheet: ${sheet}`);
}
await browser.close();
