// The pages for choosing pictures for the social feed, published as artifacts together with the pictures of a set of
// figures (see figure-sets.mjs) from media/<set>/feed/, at the same paths (feed/<design>/<slug>--<colours>.png). Tapping
// a picture opens it at full size, to save.
//
// The feed page ("Myth feed", "Symbol feed") opens on a mixed feed, three across like a profile grid, every picture in
// a different design from its neighbours and the colours alternating; a tab shows one design for all the figures. With
// --transparent it makes the transparent library instead ("Transparent myth pictures", "Transparent symbol pictures"):
// one design at a time, in black ink or in white ink with nothing behind, over checks that only mark where the picture
// is empty, light under black ink and dark under white so the ink shows.
//
//   node tools/myths/styles/feed-page.mjs [--set symbols] [--transparent] <out.html>

import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FEED } from './index.mjs';
import { FIGURE_SETS } from './figure-sets.mjs';

const args = process.argv.slice(2);
const option = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : null);
const transparent = args.includes('--transparent');
const setName = option('--set') ?? 'myths';
const out = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--set');
if (!out || !FIGURE_SETS[setName]) throw new Error('usage: node tools/myths/styles/feed-page.mjs [--set myths|symbols] [--transparent] <out.html>');
const here = fileURLToPath(new URL('.', import.meta.url));
const designs = [];
for (const name of FEED) {
  const m = await import(pathToFileURL(`${here}mono/${name}.mjs`).href);
  designs.push({ name, title: m.title });
}

// what each tile says: a myth under the place in the chart it stands for; a symbol over the words the site describes it
// with, under the heading of its group
const SETS = {
  myths: {
    noun: 'myth',
    every: 'Every figure',
    named: 'named after the myth',
    example: 'europa-and-the-bull',
    tile: (f) => ({ kicker: f.astrology, title: f.myth, alt: f.myth }),
    // five across, three on a tablet, two on a phone
    across: 5,
    columns: '.sheet { grid-template-columns: repeat(5, minmax(0, 1fr)); }\n@media (max-width: 980px) { .sheet { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
    extra: '',
  },
  symbols: {
    noun: 'symbol',
    every: 'The symbols of the 12 signs, the 12 celestials (the Sun, the Moon, the planets, Chiron and Black Moon Lilith) and the 5 aspects, as the site draws them,',
    named: 'named after the sign, the body or the aspect',
    example: 'aries',
    tile: (f) => ({ title: f.name, about: f.about, alt: `the symbol of ${f.name}`, group: { signs: 'Signs', aspects: 'Aspects' }[f.family] ?? 'Celestials' }),
    // the celestials and the signs are twelve each: six, four, three or two across, so each fills its rows and the next
    // group starts on a new one; the five aspects come last
    across: 6,
    columns: '.sheet { grid-template-columns: repeat(6, minmax(0, 1fr)); }\n@media (max-width: 980px) { .sheet { grid-template-columns: repeat(4, minmax(0, 1fr)); } }\n@media (max-width: 760px) { .sheet { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
    extra: ' They are the symbols of the site&rsquo;s own symbol font, Noto Sans Symbols, drawn heavier; the symbols of the Sun, the sextile, the square and the trine are not in that font, so they are drawn to match.',
  },
};
const set = SETS[setName];
const figs = (await FIGURE_SETS[setName].load()).map((f) => ({ slug: f.slug, ...set.tile(f) }));
const pictures = figs.length * designs.length * 2;
const Noun = set.noun[0].toUpperCase() + set.noun.slice(1);

// each ink: its value in the file names, its label, and the words for the pictures' alt text
const page = transparent
  ? {
      title: `Transparent ${set.noun} pictures`,
      heading: `Transparent ${set.noun} pictures`,
      lede: `${set.every} in the ${designs.length} designs you kept with nothing behind the ink, in black ink for light grounds and in white ink for dark ones: ${pictures} pictures, 2000 px square. The checks only mark where a picture is empty; they are not in the files. Tap a picture to open it full size and save it.`,
      note: `The files are also on the branch, in media/${FIGURE_SETS[setName].out}&lt;design&gt;/ next to the others, ${set.named}: for example feed/woodcut/${set.example}--white-transparent.png. In the mosaic only the light stones are kept, so its ground and mortar fall away; the holes of the paper cut are see-through too.${set.extra}`,
      mixed: false,
      inks: [['black', 'Black ink', 'black ink on a transparent ground'], ['white', 'White ink', 'white ink on a transparent ground']],
      start: { design: designs[0].name, ink: 'black' },
      suffix: '-transparent',
      // the checks stand for the empty ground; under white ink they are dark, or the ink would vanish into them
      css: `:root { --checks-light: #ffffff; --checks-light-2: #dadada; --checks-dark: #2b2b2b; --checks-dark-2: #3d3d3d; }
.sheet.ink-black img { background: repeating-conic-gradient(var(--checks-light) 0 25%, var(--checks-light-2) 0 50%) 0 0 / 20px 20px; }
.sheet.ink-white img { background: repeating-conic-gradient(var(--checks-dark) 0 25%, var(--checks-dark-2) 0 50%) 0 0 / 20px 20px; }
`,
    }
  : {
      title: `${Noun} feed`,
      heading: `The ${set.noun} feed`,
      lede: `${set.every} in the ${designs.length} designs you kept, white on black and black on white: ${pictures} pictures, 2000 px square. The mixed feed gives each picture a different design from its neighbours. Tap a picture to open it full size and save it.`,
      note: `The files are also on the branch, in media/${FIGURE_SETS[setName].out}&lt;design&gt;/, ${set.named}: for example feed/woodcut/${set.example}--black-on-white.png.${set.extra}`,
      mixed: true,
      inks: [['alternate', 'Alternate'], ['white-on-black', 'White on black', 'white on black'], ['black-on-white', 'Black on white', 'black on white']],
      start: { design: 'mixed', ink: 'alternate' },
      suffix: '',
      css: '',
    };

const html = `<title>${page.title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Inter:wght@400;500&display=swap">
<style>
/* A picture library laid out as a feed: the mixed view packs the tiles three across with hairline gaps, like a
   profile grid; one design at a time shows every figure with its caption. The site's own paper, ink and type. */
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
.sheet { display: grid; gap: 22px 14px; }
${set.columns}
@media (max-width: 560px) { .sheet { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 10px; } }
.group { grid-column: 1 / -1; margin: 12px 0 0; font: 400 22px/1.2 var(--serif); }
.group:first-child { margin-top: 0; }
figure { margin: 0; display: grid; gap: 8px; align-content: start; min-width: 0; }
figure a { display: block; }
.sheet figure a { border-radius: 3px; overflow: hidden; }
figure img { display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 1; background: var(--well); }
figcaption { display: grid; gap: 1px; }
.kicker { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.name { font: 400 15px/1.3 var(--serif); }
.about { font-size: 12px; line-height: 1.4; color: var(--muted); }
.note { margin: 32px 0 0; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; max-width: 72ch; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
${page.css}</style>
<div class="wrap">
  <header>
    <p class="eyebrow">The Astro Study &middot; Myths behind the chart</p>
    <h1>${page.heading}</h1>
    <p class="lede">${page.lede}</p>
    <div class="controls">
      <div class="pills" role="group" aria-label="Design" id="designs"></div>
      <div class="pills" role="group" aria-label="Colours" id="inks"></div>
    </div>
  </header>
  <div id="view"></div>
  <p class="note">${page.note}</p>
</div>
<script>
const FIGS = ${JSON.stringify(figs)};
const DESIGNS = ${JSON.stringify(designs)};
const PAGE = ${JSON.stringify({ mixed: page.mixed, inks: page.inks, suffix: page.suffix, across: set.across })};
const WORDS = Object.fromEntries(PAGE.inks.map(([value, , words]) => [value, words]));
const state = ${JSON.stringify(page.start)};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function pills(el, items, key) {
  el.innerHTML = items.map(([value, label]) => '<button type="button" data-' + key + '="' + value + '" aria-pressed="' + (state[key] === value) + '">' + esc(label) + '</button>').join('');
}

function render() {
  pills(document.getElementById('designs'), [...(PAGE.mixed ? [['mixed', 'Mixed feed']] : []), ...DESIGNS.map((d) => [d.name, d.title])], 'design');
  pills(document.getElementById('inks'), PAGE.inks, 'ink');
  const mixed = state.design === 'mixed';
  const cols = mixed ? 3 : PAGE.across;
  // the mixed feed runs on past the last figure to fill its last row, starting the figures over in other designs
  const count = mixed ? Math.ceil(FIGS.length / cols) * cols : FIGS.length;
  const tiles = [];
  for (let i = 0; i < count; i += 1) {
    const f = FIGS[i % FIGS.length];
    if (!mixed && f.group && f.group !== (FIGS[i - 1] || {}).group) tiles.push('<h2 class="group">' + esc(f.group) + '</h2>');
    // neighbours along a row and down a column of three always differ: steps of 3 and 9 are never a multiple of 8
    const design = mixed ? DESIGNS[(i * 3) % DESIGNS.length] : DESIGNS.find((d) => d.name === state.design);
    const ink = state.ink !== 'alternate' ? state.ink : ((Math.floor(i / cols) + (i % cols)) % 2 ? 'black-on-white' : 'white-on-black');
    const src = 'feed/' + design.name + '/' + f.slug + '--' + ink + PAGE.suffix + '.png';
    tiles.push('<figure><a href="' + src + '" target="_blank" rel="noopener"><img src="' + src + '" alt="' + esc(f.alt + ', ' + design.title.toLowerCase() + ', ' + WORDS[ink]) + '" width="2000" height="2000" loading="lazy" decoding="async"></a>'
      + '<figcaption>' + (f.kicker ? '<span class="kicker">' + esc(f.kicker) + '</span>' : '') + '<span class="name">' + esc(f.title) + '</span>'
      + (f.about ? '<span class="about">' + esc(f.about) + '</span>' : '') + '</figcaption></figure>');
  }
  const view = document.getElementById('view');
  view.className = (mixed ? 'feed' : 'sheet') + ' ink-' + state.ink;
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
console.log(`${out}: ${figs.length} ${set.noun}s × ${designs.length} designs${transparent ? ', transparent' : ''}`);
