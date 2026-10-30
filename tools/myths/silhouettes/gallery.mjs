// One page showing every silhouette, white on black or black on white, with its myth and what it stands
// for in astrology: published as the "Myth silhouettes" artifact.
//
//   node tools/myths/silhouettes/gallery.mjs <out.html>

import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { toSvg } from './lib.mjs';

const out = process.argv[2];
if (!out) throw new Error('usage: node tools/myths/silhouettes/gallery.mjs <out.html>');
const here = fileURLToPath(new URL('.', import.meta.url));
// the order of a chart: the lights and planets, the points, then the signs from Aries to Pisces
const order = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron',
  'Black Moon Lilith', 'The constellations', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const figs = [];
for (const file of (await readdir(`${here}figures`)).filter((f) => f.endsWith('.mjs'))) {
  const m = await import(pathToFileURL(`${here}figures/${file}`).href);
  figs.push({ slug: m.slug, myth: m.myth, astrology: m.astrology, svg: toSvg(m.draw(), { fg: 'currentColor', bg: null, size: 1000, ids: `${m.slug}-m` }) });
}
const rank = (a) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a));
figs.sort((a, b) => rank(a.astrology) - rank(b.astrology));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const html = `<meta charset="utf-8">
<title>Myth silhouettes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Inter:wght@400;500&display=swap">
<style>
/* A plate cabinet: each myth on its own square plate, the silhouette in the plate's ink. The page itself
   follows the viewer's theme; the plates keep the colours chosen with the switch. */
:root { --page: #f3f1ea; --text: #1c211b; --muted: #5d6358; --line: rgba(28, 33, 27, 0.14); --plate: #000; --ink: #fff;
  --serif: "Fraunces", Georgia, serif; --sans: "Inter", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); color-scheme: dark; } }
:root[data-theme="dark"] { --page: #141812; --text: #ebeae2; --muted: #a6ab9e; --line: rgba(235, 234, 226, 0.14); color-scheme: dark; }
body { background: var(--page); color: var(--text); font: 15px/1.5 var(--sans); }
body.inverse { --plate: #fff; --ink: #000; }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header { display: grid; gap: 10px; padding-bottom: 20px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(28px, 4vw, 40px)/1.1 var(--serif); }
.lede { margin: 0; max-width: 70ch; color: var(--muted); }
.switch { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 3px; width: max-content; }
.switch button { border: 0; background: transparent; color: var(--text); border-radius: 999px; padding: 6px 14px; cursor: pointer; font: inherit; font-size: 13px; }
.switch button[aria-pressed="true"] { background: var(--text); color: var(--page); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
@media (max-width: 520px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; } .myth { font-size: 15px; } }
figure { margin: 0; display: grid; gap: 8px; align-content: start; }
.plate { aspect-ratio: 1; max-width: 100%; background: var(--plate); color: var(--ink); border-radius: 4px; overflow: hidden; }
.plate svg { width: 100%; height: 100%; display: block; }
figcaption { display: grid; gap: 2px; }
.sign { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.myth { font: 400 16px/1.3 var(--serif); }
.file { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
<div class="wrap">
  <header>
    <p class="eyebrow">The Astro Study &middot; Myths behind the chart</p>
    <h1>Myth silhouettes</h1>
    <p class="lede">${figs.length} figures from the myths behind the planets and the signs, drawn after the ancient works that show them. Each exists as an SVG to recolour and as 2000 px PNGs, white on black and black on white, in media/myths/silhouettes/ under the name shown.</p>
    <div class="switch" role="group" aria-label="Colours">
      <button type="button" data-ink="white" aria-pressed="true">White on black</button>
      <button type="button" data-ink="black" aria-pressed="false">Black on white</button>
    </div>
  </header>
  <div class="grid">
${figs.map((f) => `    <figure><div class="plate">${f.svg}</div><figcaption><span class="sign">${esc(f.astrology)}</span><span class="myth">${esc(f.myth)}</span><span class="file">${esc(f.slug)}</span></figcaption></figure>`).join('\n')}
  </div>
</div>
<script>
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ink]');
  if (!b) return;
  document.body.classList.toggle('inverse', b.dataset.ink === 'black');
  document.querySelectorAll('[data-ink]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
});
</script>
`;
await writeFile(out, html);
console.log(`${out}: ${figs.length} figures`);
