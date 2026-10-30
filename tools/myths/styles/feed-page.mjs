// The page for choosing pictures for the social feed, published as the "Myth feed" artifact together with the
// pictures in media/myths/feed/, at the same paths (feed/<design>/<slug>--<colours>.png). It opens on a mixed feed,
// three across like a profile grid, every picture in a different design from its neighbours and the colours
// alternating; a tab shows one design for all the figures. Tapping a picture opens it at full size, to save.
//
//   node tools/myths/styles/feed-page.mjs <out.html>

import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FEED } from './index.mjs';
import { chartRank } from '../silhouettes/order.mjs';

const out = process.argv[2];
if (!out) throw new Error('usage: node tools/myths/styles/feed-page.mjs <out.html>');
const here = fileURLToPath(new URL('.', import.meta.url));
const figuresDir = fileURLToPath(new URL('../silhouettes/figures/', import.meta.url));
const figs = [];
for (const file of (await readdir(figuresDir)).filter((f) => f.endsWith('.mjs'))) {
  const m = await import(pathToFileURL(`${figuresDir}${file}`).href);
  figs.push({ slug: m.slug, myth: m.myth, astrology: m.astrology });
}
figs.sort((a, b) => chartRank(a.astrology) - chartRank(b.astrology));
const designs = [];
for (const name of FEED) {
  const m = await import(pathToFileURL(`${here}mono/${name}.mjs`).href);
  designs.push({ name, title: m.title });
}
const pictures = figs.length * designs.length * 2;

const html = `<title>Myth feed</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Inter:wght@400;500&display=swap">
<style>
/* A picture library laid out as a feed: the mixed view packs the tiles three across with hairline gaps, like a
   profile grid; one design at a time shows every figure with its sign. The site's own paper, ink and type. */
:root { --page: #f3f1ea; --text: #1c211b; --muted: #5d6358; --line: rgba(28, 33, 27, 0.14); --well: #e4e0d4;
  --serif: "Fraunces", Georgia, serif; --sans: "Inter", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; color-scheme: dark; } }
:root[data-theme="dark"] { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; color-scheme: dark; }
body { background: var(--page); color: var(--text); font: 15px/1.5 var(--sans); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header { display: grid; gap: 12px; padding-bottom: 22px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(28px, 4vw, 40px)/1.1 var(--serif); text-wrap: balance; }
.lede { margin: 0; max-width: 68ch; color: var(--muted); }
.controls { display: grid; gap: 10px; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pills button { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 999px; padding: 6px 13px; font: inherit; font-size: 13px; cursor: pointer; }
.pills button[aria-pressed="true"] { background: var(--text); color: var(--page); border-color: var(--text); }
.feed { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3px; max-width: 760px; margin: 0 auto; }
.feed figcaption { display: none; }
.sheet { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 22px 14px; }
@media (max-width: 980px) { .sheet { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 560px) { .sheet { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 10px; } }
figure { margin: 0; display: grid; gap: 8px; align-content: start; min-width: 0; }
figure a { display: block; }
.sheet figure a { border-radius: 3px; overflow: hidden; }
figure img { display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 1; background: var(--well); }
figcaption { display: grid; gap: 1px; }
.sign { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.myth { font: 400 15px/1.3 var(--serif); }
.note { margin: 32px 0 0; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; max-width: 72ch; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
<div class="wrap">
  <header>
    <p class="eyebrow">The Astro Study &middot; Myths behind the chart</p>
    <h1>The myth feed</h1>
    <p class="lede">Every figure in the ${designs.length} designs you kept, white on black and black on white: ${pictures} pictures, 2000 px square. The mixed feed gives each picture a different design from its neighbours. Tap a picture to open it full size and save it.</p>
    <div class="controls">
      <div class="pills" role="group" aria-label="Design" id="designs"></div>
      <div class="pills" role="group" aria-label="Colours" id="inks"></div>
    </div>
  </header>
  <div id="view"></div>
  <p class="note">The files are also on the branch, in media/myths/feed/&lt;design&gt;/, named after the myth: for example feed/woodcut/europa-and-the-bull--black-on-white.png.</p>
</div>
<script>
const FIGS = ${JSON.stringify(figs)};
const DESIGNS = ${JSON.stringify(designs)};
const INKS = [['alternate', 'Alternate'], ['white-on-black', 'White on black'], ['black-on-white', 'Black on white']];
const state = { design: 'mixed', ink: 'alternate' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function pills(el, items, key) {
  el.innerHTML = items.map(([value, label]) => '<button type="button" data-' + key + '="' + value + '" aria-pressed="' + (state[key] === value) + '">' + esc(label) + '</button>').join('');
}

function render() {
  pills(document.getElementById('designs'), [['mixed', 'Mixed feed'], ...DESIGNS.map((d) => [d.name, d.title])], 'design');
  pills(document.getElementById('inks'), INKS, 'ink');
  const mixed = state.design === 'mixed';
  const cols = mixed ? 3 : 5;
  const tiles = FIGS.map((f, i) => {
    // neighbours along a row and down a column of three always differ: steps of 3 and 9 are never a multiple of 8
    const design = mixed ? DESIGNS[(i * 3) % DESIGNS.length] : DESIGNS.find((d) => d.name === state.design);
    const ink = state.ink !== 'alternate' ? state.ink : ((Math.floor(i / cols) + (i % cols)) % 2 ? 'black-on-white' : 'white-on-black');
    const src = 'feed/' + design.name + '/' + f.slug + '--' + ink + '.png';
    return '<figure><a href="' + src + '" target="_blank" rel="noopener"><img src="' + src + '" alt="' + esc(f.myth + ', ' + design.title.toLowerCase() + ', ' + ink.replaceAll('-', ' ')) + '" width="2000" height="2000" loading="lazy" decoding="async"></a>'
      + '<figcaption><span class="sign">' + esc(f.astrology) + '</span><span class="myth">' + esc(f.myth) + '</span></figcaption></figure>';
  });
  const view = document.getElementById('view');
  view.className = mixed ? 'feed' : 'sheet';
  view.innerHTML = tiles.join('');
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-design], [data-ink]');
  if (!b) return;
  if (b.dataset.design) state.design = b.dataset.design;
  if (b.dataset.ink) state.ink = b.dataset.ink;
  render();
});
render();
</script>
`;
await writeFile(out, html);
console.log(`${out}: ${figs.length} figures × ${designs.length} designs`);
