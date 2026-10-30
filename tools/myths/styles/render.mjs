// Draws one myth figure in each drawing style of a set, to choose a look before drawing them all, into
// media/myths/<set's folder>/:
//
//   <style>--<slug>.jpg or .png   2000 × 2000 (the colour set in JPEG, as most of it is textured and textures
//                                 compress badly as PNG; the black-and-white set in PNG)
//
//   node tools/myths/styles/render.mjs                          the centaur archer in every colour style
//   node tools/myths/styles/render.mjs --set mono               … in every black-and-white design
//   node tools/myths/styles/render.mjs <slug> [style…]          another figure, or only some of the styles
//   node tools/myths/styles/render.mjs … --sheet sheet.png      also a contact sheet of what was drawn
//
// A style module exports name, title and about, and either svg(fig), the whole picture as an SVG document on a
// 1000 × 1000 canvas, or args(fig) and paint(args), a function run in the page (with canvas-kit.js loaded) that
// returns the picture as a data URL in the set's format.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { SETS, stylesOf } from './index.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const option = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : null);
const sheet = option('--sheet');
const set = SETS[option('--set') || 'colour'];
const STYLES = stylesOf(set);
const out = fileURLToPath(new URL(`../../../media/myths/${set.out}/`, import.meta.url));
const ext = set.type === 'jpeg' ? 'jpg' : 'png';
const words = args.filter((a, i) => !a.startsWith('--') && !['--sheet', '--set'].includes(args[i - 1]));
const slug = words.find((w) => !STYLES.includes(w)) || 'the-centaur-archer';
const wanted = words.filter((w) => STYLES.includes(w));
const fig = await import(pathToFileURL(fileURLToPath(new URL(`../silhouettes/figures/${slug}.mjs`, import.meta.url))).href);
const kit = await readFile(`${here}canvas-kit.js`, 'utf8');

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
const done = [];
for (const name of wanted.length ? wanted : STYLES) {
  const style = await import(pathToFileURL(`${here}${set.folder}${name}.mjs`).href);
  const file = `${out}${name}--${slug}.${ext}`;
  const started = Date.now();
  if (style.svg) {
    await page.setContent(`<html><body style="margin:0">${style.svg(fig)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('svg').first().screenshot({ path: file, ...(set.type === 'jpeg' ? { type: 'jpeg', quality: 92 } : { type: 'png' }) });
  } else {
    await page.setContent('<html><body style="margin:0"></body></html>');
    await page.addScriptTag({ content: kit });
    const url = await page.evaluate(style.paint, style.args(fig));
    await writeFile(file, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  }
  done.push({ name, title: style.title, file });
  console.log(`✓ ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
}

if (sheet) {
  const cells = await Promise.all(done.map(async (d) => `<figure style="margin:0"><img src="data:image/${set.type};base64,${(await readFile(d.file)).toString('base64')}" style="width:400px;height:400px;display:block"><figcaption style="font:15px sans-serif;color:#ccc;padding:6px 0 12px">${d.title}</figcaption></figure>`));
  const cols = Math.min(4, cells.length);
  await page.setViewportSize({ width: cols * 412 + 12, height: 800 });
  await page.setContent(`<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},400px);gap:12px;padding:12px">${cells.join('')}</body></html>`);
  await page.screenshot({ path: sheet, fullPage: true });
  console.log(`sheet: ${sheet}`);
}
await browser.close();
