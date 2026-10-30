// The whole feed: every picture of both sets, the myths and the symbols, in every design, white on black and black on
// white, in one profile grid three across, in a shuffled order where no picture sits beside or under one in the same
// design, the colours alternate, and the same myth or symbol never comes back within six pictures. Shuffle deals a new
// order and the address keeps it (#mix-<number>), so an order can be found again. Tapping a picture shows it larger,
// with the file it comes from.
//
// A page carries at most 511 files, fewer than the 784 pictures, so this one carries a small copy of each
// white-on-black picture (thumbs.py) and shows the black-on-white one by inverting it, as feed.mjs made it.
//
//   node tools/myths/styles/whole-feed.mjs <out-dir>     writes <out-dir>/index.html and <out-dir>/thumbs/

import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FEED } from './index.mjs';
import { FIGURE_SETS } from './figure-sets.mjs';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node tools/myths/styles/whole-feed.mjs <out-dir>');
const here = fileURLToPath(new URL('.', import.meta.url));
const media = fileURLToPath(new URL('../../../media/', import.meta.url));

const designs = [];
for (const name of FEED) {
  const m = await import(pathToFileURL(`${here}mono/${name}.mjs`).href);
  designs.push({ name, title: m.title });
}
// what a picture shows, in the words the other pages use: a myth under its place in the chart, a symbol under its group
// and over the words the site describes it with
const subjects = [];
for (const f of await FIGURE_SETS.myths.load()) subjects.push({ set: 'myths', slug: f.slug, kicker: f.astrology, title: f.myth });
for (const f of await FIGURE_SETS.symbols.load()) subjects.push({ set: 'symbols', slug: f.slug, kicker: { signs: 'Sign', aspects: 'Aspect' }[f.family] ?? 'Celestial', title: f.name, about: f.about });
const count = (set) => subjects.filter((s) => s.set === set).length;

const sources = subjects.flatMap((s) => designs.map((d) => `${media}${FIGURE_SETS[s.set].out}${d.name}/${s.slug}--white-on-black.png`));
await mkdir(`${dir}/thumbs`, { recursive: true });
execFileSync('python3', ['-I', `${here}thumbs.py`, `${dir}/thumbs`, ...sources]);
const pictures = sources.length * 2;

const html = `<title>Myth and symbol feed</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Inter:wght@400;500&display=swap">
<style>
/* One profile grid of everything, three across with hairline gaps, under a short header; a picture opens over the
   page in a plain viewer. The site's own paper, ink and type. */
:root { --page: #f3f1ea; --text: #1c211b; --muted: #5d6358; --line: rgba(28, 33, 27, 0.14); --well: #e4e0d4; --veil: rgba(243, 241, 234, 0.97);
  --serif: "Fraunces", Georgia, serif; --sans: "Inter", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; --veil: rgba(20, 24, 18, 0.97); color-scheme: dark; } }
:root[data-theme="dark"] { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); --well: #20251e; --veil: rgba(20, 24, 18, 0.97); color-scheme: dark; }
body { background: var(--page); color: var(--text); font: 15px/1.5 var(--sans); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header { display: grid; gap: 12px; padding-bottom: 22px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(28px, 4vw, 40px)/1.1 var(--serif); text-wrap: balance; }
.lede { margin: 0; max-width: 68ch; color: var(--muted); }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; }
button { font: inherit; color: inherit; cursor: pointer; }
.pills button, .viewer nav button { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 999px; padding: 6px 13px; font-size: 13px; }
.pills button[aria-pressed="true"] { background: var(--text); color: var(--page); border-color: var(--text); }
.shuffle { border: 1px solid var(--text); background: var(--text); color: var(--page); border-radius: 6px; padding: 7px 18px; font-size: 14px; font-weight: 500; }
.count { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
.feed { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3px; max-width: 760px; margin: 0 auto; }
.tile { display: block; width: 100%; max-width: 100%; aspect-ratio: 1; padding: 0; border: 0; background: var(--well); cursor: zoom-in; }
.tile img, .viewer img { display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 1; }
/* the black-on-white pictures are the white-on-black ones inverted, which is how their files were made */
.inv { filter: invert(1); }
.note { margin: 32px auto 0; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; max-width: 72ch; }
.viewer { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; overflow-y: auto; background: var(--veil);
  padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
.viewer figure { margin: 0; display: grid; gap: 14px; width: min(512px, 100%); }
.viewer figcaption { display: grid; gap: 3px; min-width: 0; }
.kicker { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.viewer h2 { margin: 0; font: 400 22px/1.25 var(--serif); }
.viewer p { margin: 0; font-size: 13px; color: var(--muted); }
.file { overflow-wrap: anywhere; }
.viewer nav { display: flex; flex-wrap: wrap; gap: 6px; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
[hidden] { display: none !important; }
</style>
<div class="wrap">
  <header>
    <p class="eyebrow">The Astro Study &middot; Myths behind the chart</p>
    <h1>The myth and symbol feed</h1>
    <p class="lede">All ${pictures} pictures, the ${count('myths')} myths and the ${count('symbols')} symbols in the ${designs.length} designs you kept, white on black and black on white, in a random order. No picture sits beside or under one in the same design, the colours alternate, and the same myth or symbol never comes back within six pictures. Shuffle for a new order; tap a picture to see which one it is.</p>
    <div class="controls">
      <button type="button" class="shuffle" id="shuffle">Shuffle</button>
      <div class="pills" role="group" aria-label="Colours" id="inks"></div>
      <span class="count" id="count"></span>
    </div>
  </header>
  <div class="feed" id="feed"></div>
  <p class="note">These are small copies, so that hundreds of pictures scroll smoothly. The full-size files, 2000 px, are on the Myth feed and Symbol feed pages and on the branch, in media/myths/feed/ and media/symbols/feed/; tap a picture for its file name. The black-on-white tiles are the white-on-black copies inverted, which is how the full-size black-on-white files were made, so they look the same.</p>
</div>
<div class="viewer" id="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" hidden>
  <figure>
    <img id="viewer-img" alt="" width="512" height="512">
    <figcaption>
      <span class="kicker" id="viewer-kicker"></span>
      <h2 id="viewer-title"></h2>
      <p id="viewer-about"></p>
      <p id="viewer-meta"></p>
      <p class="file" id="viewer-file"></p>
    </figcaption>
    <nav aria-label="Pictures"><button type="button" id="prev">Previous</button><button type="button" id="next">Next</button><button type="button" id="close">Close</button></nav>
  </figure>
</div>
<script>
const SUBJECTS = ${JSON.stringify(subjects)};
const DESIGNS = ${JSON.stringify(designs)};
const INKS = [['alternate', 'Alternate'], ['white-on-black', 'White on black'], ['black-on-white', 'Black on white']];
const WORDS = { 'white-on-black': 'white on black', 'black-on-white': 'black on white' };
const state = { seed: 0, ink: 'alternate', order: [], open: -1 };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// mulberry32, the seeded generator the pictures were drawn with
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// one deal: the pictures shuffled, then laid into the grid one by one, each the first left in the pack that keeps the
// rules where it lands (the colour its square asks for, a design unlike the pictures to its left and above it, a myth
// or symbol not among the last six); a rule is let go only when nothing left in the pack keeps it
function deal(seed, ink) {
  const rnd = random(seed);
  const pack = [];
  SUBJECTS.forEach((_, s) => DESIGNS.forEach((_, d) => Object.keys(WORDS).forEach((k) => { if (ink === 'alternate' || ink === k) pack.push({ s, d, ink: k }); })));
  for (let i = pack.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [pack[i], pack[j]] = [pack[j], pack[i]];
  }
  const order = [];
  let broken = 0;
  while (pack.length) {
    const i = order.length;
    const col = i % 3;
    const want = ink !== 'alternate' ? ink : (Math.floor(i / 3) + col) % 2 ? 'black-on-white' : 'white-on-black';
    const left = col ? order[i - 1] : null;
    const up = i >= 3 ? order[i - 3] : null;
    const recent = new Set(order.slice(Math.max(0, i - 6)).map((p) => p.s));
    const rules = [
      (p) => p.ink === want && p.d !== left?.d && p.d !== up?.d && !recent.has(p.s),
      (p) => p.ink === want && p.d !== left?.d && p.d !== up?.d,
      (p) => p.ink === want,
      () => true,
    ];
    let j = -1;
    let level = 0;
    for (; level < rules.length; level += 1) {
      j = pack.findIndex(rules[level]);
      if (j >= 0) break;
    }
    if (level) broken += 1;
    order.push(pack.splice(j, 1)[0]);
  }
  return { order, broken };
}

// the deals of one order number are tried in turn until one keeps every rule (about one in four does, and a deal
// takes under a millisecond), so a number always gives the same feed
function arrange(seed, ink) {
  let best = null;
  for (let k = 0; k < 64; k += 1) {
    const d = deal(seed * 64 + k, ink);
    if (!best || d.broken < best.broken) best = d;
    if (!d.broken) break;
  }
  return best.order;
}

const thumb = (p) => 'thumbs/' + SUBJECTS[p.s].set + '/' + DESIGNS[p.d].name + '/' + SUBJECTS[p.s].slug + '.webp';
const alt = (p) => SUBJECTS[p.s].title + ', ' + DESIGNS[p.d].title.toLowerCase() + ', ' + WORDS[p.ink];

function render() {
  state.order = arrange(state.seed, state.ink);
  $('inks').innerHTML = INKS.map(([v, label]) => '<button type="button" data-ink="' + v + '" aria-pressed="' + (state.ink === v) + '">' + label + '</button>').join('');
  $('count').textContent = state.order.length + ' pictures, order ' + state.seed;
  $('feed').innerHTML = state.order.map((p, i) => '<button type="button" class="tile" data-i="' + i + '"><img src="' + thumb(p) + '" alt="' + esc(alt(p)) + '"'
    + (p.ink === 'black-on-white' ? ' class="inv"' : '') + ' width="512" height="512" loading="lazy" decoding="async"></button>').join('');
}

function show(i) {
  const n = state.order.length;
  state.open = (i + n) % n;
  const p = state.order[state.open];
  const s = SUBJECTS[p.s];
  const d = DESIGNS[p.d];
  $('viewer-img').src = thumb(p);
  $('viewer-img').className = p.ink === 'black-on-white' ? 'inv' : '';
  $('viewer-img').alt = alt(p);
  $('viewer-kicker').textContent = s.kicker;
  $('viewer-title').textContent = s.title;
  $('viewer-about').textContent = s.about || '';
  $('viewer-about').hidden = !s.about;
  $('viewer-meta').textContent = d.title + ', ' + WORDS[p.ink] + ' (' + (state.open + 1) + ' of ' + n + ')';
  $('viewer-file').textContent = 'media/' + s.set + '/feed/' + d.name + '/' + s.slug + '--' + p.ink + '.png';
  if ($('viewer').hidden) {
    $('viewer').hidden = false;
    document.body.style.overflow = 'hidden';
    $('close').focus();
  }
}

function close() {
  $('viewer').hidden = true;
  document.body.style.overflow = '';
  const tile = document.querySelector('.tile[data-i="' + state.open + '"]');
  if (tile) tile.focus();
}

// the order in the address, as #mix-<number>; a page opened without one gets a new order, put in the address too
function start() {
  const m = location.hash.match(/^#mix-(\\d{1,6})$/);
  let seed = m ? Number(m[1]) : 0;
  if (!seed) {
    seed = 1 + Math.floor(Math.random() * 99999);
    try { history.replaceState(null, '', '#mix-' + seed); } catch (e) { /* the order still shows, only not in the address */ }
  }
  if (seed !== state.seed) {
    state.seed = seed;
    render();
  }
}

$('shuffle').addEventListener('click', () => {
  location.hash = 'mix-' + (1 + Math.floor(Math.random() * 99999));
  start();
});
$('inks').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ink]');
  if (!b) return;
  state.ink = b.dataset.ink;
  render();
});
$('feed').addEventListener('click', (e) => {
  const t = e.target.closest('.tile');
  if (t) show(Number(t.dataset.i));
});
$('prev').addEventListener('click', () => show(state.open - 1));
$('next').addEventListener('click', () => show(state.open + 1));
$('close').addEventListener('click', close);
$('viewer').addEventListener('click', (e) => { if (e.target === $('viewer')) close(); });
document.addEventListener('keydown', (e) => {
  if ($('viewer').hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(state.open - 1);
  if (e.key === 'ArrowRight') show(state.open + 1);
});
window.addEventListener('hashchange', start);
start();
</script>
`;
await writeFile(`${dir}/index.html`, html);
console.log(`${dir}/index.html: ${pictures} pictures from ${sources.length} small copies`);
