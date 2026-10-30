// The page comparing the drawing styles, published as the "Myth drawing styles" artifact. Writes into <out>/ the
// page (index.html), a 900 px preview of each picture (thumbs/) and the 2000 px pictures themselves (full/), all to be
// published together: the page shows the previews and opens the full pictures.
//
//   node tools/myths/styles/gallery.mjs <out> [slug]

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { GROUPS } from './index.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [outArg, slug = 'the-centaur-archer'] = process.argv.slice(2);
if (!outArg) throw new Error('usage: node tools/myths/styles/gallery.mjs <out> [slug]');
const out = outArg.replace(/\/?$/, '/');
const here = fileURLToPath(new URL('.', import.meta.url));
const media = fileURLToPath(new URL('../../../media/myths/styles/', import.meta.url));
const fig = await import(pathToFileURL(fileURLToPath(new URL(`../silhouettes/figures/${slug}.mjs`, import.meta.url))).href);
await mkdir(`${out}thumbs`, { recursive: true });
await mkdir(`${out}full`, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
const groups = [];
for (const g of GROUPS) {
  const items = [];
  for (const name of g.styles) {
    const style = await import(pathToFileURL(`${here}${name}.mjs`).href);
    const file = `${name}--${slug}.jpg`;
    await copyFile(`${media}${file}`, `${out}full/${name}.jpg`);
    const data = (await readFile(`${media}${file}`)).toString('base64');
    await page.setContent(`<body style="margin:0"><img src="data:image/jpeg;base64,${data}" style="width:900px;height:900px;display:block"></body>`);
    await page.screenshot({ path: `${out}thumbs/${name}.jpg`, type: 'jpeg', quality: 84 });
    items.push({ name, title: style.title, about: style.about, file });
  }
  groups.push({ title: g.title, items });
}
await browser.close();

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const count = groups.reduce((n, g) => n + g.items.length, 0);
const html = `<title>Myth drawing styles</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Inter:wght@400;500&display=swap">
<style>
/* A contact sheet of one figure in every style, grouped by where each style comes from; the site's own paper, ink
   and type, so the pictures carry the colour. */
:root { --page: #f3f1ea; --text: #1c211b; --muted: #5d6358; --line: rgba(28, 33, 27, 0.14); --well: #e4e0d4;
  --serif: "Fraunces", Georgia, serif; --sans: "Inter", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; color-scheme: dark; } }
:root[data-theme="dark"] { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; color-scheme: dark; }
body { background: var(--page); color: var(--text); font: 15px/1.5 var(--sans); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header { display: grid; gap: 10px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
.eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(28px, 4vw, 40px)/1.1 var(--serif); text-wrap: balance; }
.lede { margin: 0; max-width: 66ch; color: var(--muted); }
section { display: grid; gap: 16px; padding-top: 30px; }
h2 { margin: 0; font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
/* four to a group: a row of four, two rows of two, or one column on a phone */
.grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px 20px; }
@media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .grid { grid-template-columns: minmax(0, 1fr); } }
figure { margin: 0; display: grid; gap: 10px; align-content: start; min-width: 0; }
figure a { display: block; border-radius: 4px; overflow: hidden; }
figure img { display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 1; background: var(--well); }
figcaption { display: grid; gap: 3px; }
.name { font: 400 20px/1.25 var(--serif); }
.about { color: var(--muted); font-size: 14px; }
.file { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
.note { margin: 36px 0 0; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; max-width: 72ch; }
a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
</style>
<div class="wrap">
  <header>
    <p class="eyebrow">The Astro Study &middot; Myths behind the chart</p>
    <h1>${count} ways to draw the myths</h1>
    <p class="lede">${esc(fig.myth)} of ${esc(fig.astrology)}, drawn in ${count} styles, so the 25 figures can share one look. Open a picture to see it at full size.</p>
  </header>
${groups.map((g) => `  <section>
    <h2>${esc(g.title)}</h2>
    <div class="grid">
${g.items.map((it) => `      <figure><a href="full/${it.name}.jpg" target="_blank" rel="noopener"><img src="thumbs/${it.name}.jpg" alt="${esc(fig.myth)} as ${esc(it.title.toLowerCase())}" width="900" height="900" loading="lazy"></a><figcaption><span class="name">${esc(it.title)}</span><span class="about">${esc(it.about)}</span><span class="file">${esc(it.file)}</span></figcaption></figure>`).join('\n')}
    </div>
  </section>`).join('\n')}
  <p class="note">The stars on the atlas plate are placed for the look, not where the stars of ${esc(fig.astrology)} are. Every picture is 2000 px square, in media/myths/styles/ under the name shown, and can be drawn again for any of the 25 figures.</p>
</div>
`;
await writeFile(`${out}index.html`, html);
console.log(`${out}index.html: ${count} styles`);
