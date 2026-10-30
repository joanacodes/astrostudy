// Draws every figure of a set (see figure-sets.mjs) in each black-and-white design chosen for the social feed, white on
// black and black on white, into media/<set>/feed/<design>/:
//
//   <slug>--white-on-black.png   2000 × 2000, greyscale
//   <slug>--black-on-white.png   the same picture inverted
//
//   node tools/myths/styles/feed.mjs                                every design, every myth
//   node tools/myths/styles/feed.mjs --set symbols                  the symbols of the signs and celestial bodies
//   node tools/myths/styles/feed.mjs [design…] [--figures a,b]      only some of them
//   node tools/myths/styles/feed.mjs … --sheets <dir>               also a contact sheet of each design, to check it

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { FEED } from './index.mjs';
import { FIGURE_SETS } from './figure-sets.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const option = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : null);
const set = FIGURE_SETS[option('--set') ?? 'myths'];
if (!set) throw new Error(`no such set of figures: ${option('--set')}`);
const out = fileURLToPath(new URL(`../../../media/${set.out}`, import.meta.url));
const sheets = option('--sheets');
const only = option('--figures')?.split(',');
const words = args.filter((a, i) => !a.startsWith('--') && !['--sheets', '--figures', '--set'].includes(args[i - 1]));
const designs = words.length ? words.filter((w) => FEED.includes(w)) : FEED;

const figures = (await set.load()).filter((fig) => !only || only.includes(fig.slug));
const kit = await readFile(`${here}canvas-kit.js`, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
// the black-on-white version is the same picture inverted, pixel for pixel
const invert = (b64) => page.evaluate(async (data) => {
  const img = new Image();
  img.src = `data:image/png;base64,${data}`;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.filter = 'invert(1)';
  g.drawImage(img, 0, 0);
  return c.toDataURL('image/png');
}, b64);
const bytes = (url) => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

const written = [];
for (const design of designs) {
  const style = await import(pathToFileURL(`${here}mono/${design}.mjs`).href);
  await mkdir(`${out}${design}`, { recursive: true });
  const started = Date.now();
  const cells = [];
  for (const fig of figures) {
    let white;
    if (style.svg) {
      await page.setContent(`<html><body style="margin:0">${style.svg(fig)}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      white = await page.locator('svg').first().screenshot({ type: 'png' });
    } else {
      await page.setContent('<html><body style="margin:0"></body></html>');
      await page.addScriptTag({ content: kit });
      white = bytes(await page.evaluate(style.paint, style.args(fig)));
    }
    const black = bytes(await invert(white.toString('base64')));
    const base = `${out}${design}/${fig.slug}`;
    await writeFile(`${base}--white-on-black.png`, white);
    await writeFile(`${base}--black-on-white.png`, black);
    written.push(`${base}--white-on-black.png`, `${base}--black-on-white.png`);
    if (sheets) cells.push(`<figure style="margin:0"><img src="data:image/png;base64,${white.toString('base64')}" style="width:300px;height:300px;display:block"><figcaption style="font:13px sans-serif;color:#bbb;padding:5px 0 10px">${fig.slug}</figcaption></figure>`);
  }
  console.log(`✓ ${design}: ${figures.length} figures (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  if (sheets) {
    await mkdir(sheets, { recursive: true });
    const sheetPage = await browser.newPage({ viewport: { width: 5 * 310 + 10, height: 800 } });
    await sheetPage.setContent(`<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(5,300px);gap:10px;padding:10px">${cells.join('')}</body></html>`);
    await sheetPage.screenshot({ path: `${sheets}/${design}.png`, fullPage: true });
    await sheetPage.close();
  }
}
await browser.close();
// the browser writes RGBA; one grey channel holds these in a third of the space
execFileSync('python3', ['-I', `${here}grey.py`, ...written]);
console.log(`${written.length} pictures in media/${set.out}`);
