// Feed posts for The Astro Study, each laid out after one of the reference layouts in the owner's folder of examples,
// and drawn from facts the site already holds (the encyclopaedia, the reading pages) or that can be computed (the
// moon's phases). Every post writes, into media/posts/<slug>/:
//
//   post.png      1080 × 1350, the 4:5 portrait the feeds show in full
//   caption.md    the caption, the alt text and the date to post it, from the same entry as the picture
//
//   node tools/posts/render.mjs              every post
//   node tools/posts/render.mjs <slug>…      only those
//
// The posts themselves, their words, alt text and caption, are in posts.mjs.
//
// The layouts, each a function of a post's words, so the Studio can fill them again (the reference picture in
// brackets):
//   eventPoster       an aura of colour, a spaced name, the date in mono, the title in italic serif (3074)
//   cultureExplainer  a drawing on a strong colour, an uppercase question, a mono line in {{ brackets }} (3046)
//   boldStatement     a heavy lowercase statement ending in an italic serif phrase, small labels, an arrow (3053)
//   condensedSerif    a narrow cream serif headline on a dark colour, small caps above and below (3039, 3048)
//   thisVsThat        bold caps over serif on red corduroy, a drawn arrow, two framed pictures (3076)
//   numberedSeries    a warmed full-bleed picture, a number in the corner, a yellow lowercase headline (3057)
//   quietTile         one earthy colour and one small line (3055)
//   threeChoices      three cards, A, B and C, for the blind test
//   handDrawnPoster   big loose drawings in one flat colour on another, a small title, small text (3036)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { POSTS } from './posts.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const b64 = async (path) => (await readFile(`${root}${path}`)).toString('base64');

// the site's own serif, inlined (only its opsz and wght axes are in these files); Inter Display and the mono come
// from the machine that renders
const fonts = `<style>
@font-face { font-family: "Fraunces"; font-style: normal; font-weight: 100 900; src: url(data:font/woff2;base64,${await b64('static/fonts/fraunces-normal-latin.woff2')}) format("woff2"); }
@font-face { font-family: "Fraunces"; font-style: italic; font-weight: 100 900; src: url(data:font/woff2;base64,${await b64('static/fonts/fraunces-italic-latin.woff2')}) format("woff2"); }
</style>`;

// film grain over a whole post: fractal noise, grey, faint
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter><rect width="400" height="400" filter="url(#g)"/></svg>')}")`;

const page = (css, body) => `<!DOCTYPE html><html><head><meta charset="utf-8">${fonts}<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body { position: relative; -webkit-font-smoothing: antialiased; }
.grain { position: absolute; inset: 0; background-image: ${GRAIN}; mix-blend-mode: overlay; opacity: .5; pointer-events: none; }
.mono { font-family: "DejaVu Sans Mono", "Liberation Mono", monospace; }
${css}</style></head><body>${body}<div class="grain"></div></body></html>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = (list) => list.map((l) => (l ? `<span>${esc(l)}</span>` : '<span class="gap"></span>')).join('');

// a picture from media/ as a data URL, and the same picture used as a stencil, so a white-on-transparent drawing can
// be printed in any colour of ink
const png = async (path) => `url(data:image/png;base64,${await b64(path)})`;
const stencil = async (path, colour) => `background: ${colour}; -webkit-mask: ${await png(path)} center / contain no-repeat; mask: ${await png(path)} center / contain no-repeat;`;

// after the event poster with the blurred dark rectangle (3074): mist at the edges, a glow, a near-black heart
function eventPoster({ name, date, title, subtitle, details, palette = {} }) {
  const p = { mist: '#c8ccc8', glow: '#5c2219', core: '#140c0b', ink: '#efe6da', ...palette };
  return page(`
body { background: ${p.mist}; color: ${p.ink}; }
.glow { position: absolute; left: 110px; top: 100px; width: 860px; height: 1150px; background: ${p.glow}; filter: blur(70px); border-radius: 60px; }
.core { position: absolute; left: 190px; top: 190px; width: 700px; height: 980px; background: ${p.core}; filter: blur(55px); border-radius: 40px; }
.text { position: absolute; left: 0; right: 0; top: 560px; display: grid; justify-items: center; text-align: center; }
.name { font: 600 25px/1 "Inter", sans-serif; letter-spacing: .42em; margin-right: -.42em; }
.date { font-size: 25px; letter-spacing: .06em; margin-top: 26px; }
h1 { font: italic 300 132px/1 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.01em; margin-top: 30px; }
h2 { font: italic 300 64px/1 "Fraunces", serif; font-variation-settings: "opsz" 144; margin-top: 6px; }
.details { display: grid; margin-top: 46px; font-size: 22px; line-height: 1.32; letter-spacing: .08em; text-transform: uppercase; }
.details .gap { height: 18px; }
`, `<div class="glow"></div><div class="core"></div>
<div class="text"><p class="name">${esc(name)}</p><p class="date mono">${esc(date)}</p><h1>${esc(title)}</h1><h2>${esc(subtitle)}</h2>
<p class="details mono">${lines(details)}</p></div>`);
}

// after the culture explainers on electric blue (3046): the picture large, the question in uppercase under it
async function cultureExplainer({ picture, question, aside, label, bg = '#2b31d4', ink = '#fff' }) {
  return page(`
body { background: ${bg}; color: ${ink}; }
.pic { position: absolute; left: 40px; top: 40px; width: 1000px; height: 1000px; ${await stencil(picture, ink)} }
h1 { position: absolute; left: 48px; right: 48px; top: 1078px; font: 500 74px/.98 "Inter Display", "Inter", sans-serif; letter-spacing: -.012em; text-transform: uppercase; }
.aside { position: absolute; left: 50px; right: 50px; bottom: 54px; font-size: 21px; letter-spacing: .02em; opacity: .9; }
.label { position: absolute; right: 50px; bottom: 54px; font-size: 17px; letter-spacing: .14em; text-transform: uppercase; opacity: .75; }
`, `<div class="pic"></div><h1>${question.map(esc).join('<br>')}</h1>
<p class="aside mono">{{ ${esc(aside)} }}</p><p class="label mono">${esc(label)}</p>`);
}

// after the bold statements (3053): heavy lowercase sans, an italic serif phrase, corner labels, an arrow
function boldStatement({ labels, statement, flourish, note, call, colours = {} }) {
  const c = { bg: '#f1ebe1', ink: '#8e1f14', note: '#3b2420', ...colours };
  return page(`
body { background: ${c.bg}; color: ${c.ink}; }
.top { position: absolute; left: 64px; right: 64px; top: 58px; display: flex; justify-content: space-between; font: 600 17px/1.35 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.top p:last-child { text-align: right; }
h1 { position: absolute; left: 58px; right: 58px; top: 290px; font: 900 158px/.86 "Inter Display", "Inter", sans-serif; letter-spacing: -.05em; word-spacing: .16em; }
h1 em { display: block; margin-top: 18px; font: italic 300 170px/.86 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.02em; word-spacing: 0; }
.note { position: absolute; left: 64px; bottom: 64px; width: 660px; font: 400 25px/1.38 "Inter", sans-serif; color: ${c.note}; }
.call { position: absolute; right: 64px; bottom: 64px; display: grid; justify-items: end; gap: 6px; font: 600 17px/1.2 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.call svg { width: 92px; height: 40px; }
`, `<div class="top"><p>${labels[0].map(esc).join('<br>')}</p><p>${labels[1].map(esc).join('<br>')}</p></div>
<h1>${statement.map(esc).join('<br>')}<em>${flourish.map(esc).join('<br>')}</em></h1>
<p class="note">${note.map(esc).join('<br>')}</p>
<div class="call"><svg viewBox="0 0 92 40" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 20 H86 M68 4 L88 20 L68 36"/></svg><p>${esc(call)}</p></div>`);
}

// after the condensed serif on a dark colour (3039, 3048): a cream serif headline drawn narrow, small caps above and
// below; a drawing in the same cream if there is one
async function condensedSerif({ kicker, symbol, headline, italic, body, footer, bg = '#4a0f0c', ink = '#efe3d1', size = 250 }) {
  const top = symbol ? 450 : 300;
  return page(`
body { background: ${bg}; color: ${ink}; }
.kicker { position: absolute; left: 0; right: 0; top: 96px; text-align: center; font: 600 17px/1 "Inter", sans-serif; letter-spacing: .3em; margin-right: -.3em; text-transform: uppercase; }
.symbol { position: absolute; left: 400px; top: 170px; width: 280px; height: 280px; ${symbol ? await stencil(symbol, ink) : ''} }
h1 { position: absolute; left: -100px; right: -100px; top: ${top}px; text-align: center; font: 400 ${size}px/.92 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.02em; transform: scaleX(.78); }
h1 em { display: block; font-style: italic; font-weight: 300; }
.body { position: absolute; left: 120px; right: 120px; top: ${top + (italic ? 2 : 1) * size * 0.92 + 70}px; text-align: center; font: 300 37px/1.32 "Fraunces", serif; font-variation-settings: "opsz" 36; }
.footer { position: absolute; left: 0; right: 0; bottom: 84px; text-align: center; font: 600 15px/1 "Inter", sans-serif; letter-spacing: .26em; margin-right: -.26em; text-transform: uppercase; opacity: .8; }
`, `<p class="kicker">${esc(kicker)}</p>${symbol ? '<div class="symbol"></div>' : ''}
<h1>${esc(headline)}${italic ? `<em>${esc(italic)}</em>` : ''}</h1><p class="body">${esc(body)}</p><p class="footer">${esc(footer)}</p>`);
}

// after "posts they skip vs posts they stay for" (3076): corduroy in deep red, bold caps over serif, a drawn arrow,
// two small framed pictures underneath
async function thisVsThat({ brand, a, b, tiles }) {
  const tile = async ({ symbol, caption }) => `<figure><div class="pic" style="${await stencil(symbol, '#fff')}"></div><figcaption>${esc(caption)}</figcaption></figure>`;
  return page(`
body { color: #fff; background: repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0 3px, rgba(255,255,255,.035) 3px 7px, rgba(0,0,0,0) 7px 10px), #5a1610; }
.brand { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font: 700 18px/1 "Inter", sans-serif; letter-spacing: .14em; margin-right: -.14em; text-transform: uppercase; }
.block { position: absolute; left: 116px; top: 230px; }
.caps { display: block; font: 800 104px/.92 "Inter Display", "Inter", sans-serif; letter-spacing: -.015em; text-transform: uppercase; }
.serif { display: block; font: 300 112px/.98 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.02em; }
.serif.it { font-style: italic; }
.serif small { font-size: 46px; font-style: normal; margin-left: 14px; }
.arrow { position: absolute; left: 760px; top: 250px; width: 190px; height: 330px; }
.tiles { position: absolute; left: 200px; right: 200px; top: 870px; display: flex; justify-content: space-between; }
figure { width: 300px; display: grid; gap: 16px; justify-items: center; }
figure .pic { width: 300px; height: 300px; }
figcaption { font: 400 24px/1.3 "Inter", sans-serif; text-align: center; }
`, `<p class="brand">${esc(brand)}</p>
<div class="block"><span class="caps">${esc(a[0])}</span><span class="serif">${esc(a[1])}<small>vs</small></span><span class="caps">${esc(b[0])}</span><span class="serif it">${esc(b[1])}</span></div>
<svg class="arrow" viewBox="0 0 190 330" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 18 C 130 10, 182 120, 150 230 C 140 262, 126 284, 112 300"/><path d="M84 270 L111 302 L142 284"/></svg>
<div class="tiles">${(await Promise.all(tiles.map(tile))).join('')}</div>`);
}

// after the numbered series over warm photographs (3057): the picture full bleed and warmed, the number in the corner,
// a bold lowercase headline in yellow and two lines under it
async function numberedSeries({ number, label, headline, text, picture }) {
  return page(`
body { background: #24160d; color: #f3c234; }
.pic { position: absolute; inset: 0; background: ${await png(picture)} center 45% / 150% no-repeat; filter: sepia(1) saturate(1.7) hue-rotate(-14deg) brightness(.62) contrast(1.08); }
.shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,10,4,.35) 0%, rgba(20,10,4,0) 30%, rgba(20,10,4,.25) 55%, rgba(20,10,4,.92) 100%); }
.top { position: absolute; left: 64px; right: 64px; top: 58px; display: flex; justify-content: space-between; font: 600 20px/1 "Inter", sans-serif; letter-spacing: .14em; text-transform: uppercase; }
h1 { position: absolute; left: 60px; right: 60px; bottom: 250px; font: 800 132px/.86 "Inter Display", "Inter", sans-serif; letter-spacing: -.04em; }
.text { position: absolute; left: 64px; width: 800px; bottom: 96px; font: 400 29px/1.36 "Inter", sans-serif; color: #f5e2a6; }
`, `<div class="pic"></div><div class="shade"></div><div class="top"><p>${esc(number)}</p><p>${esc(label)}</p></div>
<h1>${headline.map(esc).join('<br>')}</h1><p class="text">${esc(text)}</p>`);
}

// after the quiet tiles between photographs (3055): one plain earthy colour and one small line in the middle
function quietTile({ line, signature, bg = '#55603f', ink = '#efe7d6' }) {
  return page(`
body { background: ${bg}; color: ${ink}; display: grid; place-items: center; }
.line { width: 720px; text-align: center; font: italic 300 44px/1.35 "Fraunces", serif; font-variation-settings: "opsz" 72; }
.sig { position: absolute; left: 0; right: 0; bottom: 80px; text-align: center; font: 600 15px/1 "Inter", sans-serif; letter-spacing: .26em; margin-right: -.26em; text-transform: uppercase; opacity: .7; }
`, `<p class="line">${esc(line)}</p><p class="sig">${esc(signature)}</p>`);
}

// the blind test shown as what it is: three cards, A, B and C, one of them written from your chart
function threeChoices({ kicker, title, flourish, note, call }) {
  const bars = (widths) => widths.map((w) => `<i style="width:${w}%"></i>`).join('');
  const card = (letter, widths) => `<div class="card"><b>${letter}</b>${bars(widths)}</div>`;
  return page(`
body { background: #ece6da; color: #1d201c; }
.top { position: absolute; left: 64px; right: 64px; top: 58px; display: flex; justify-content: space-between; font: 600 17px/1.35 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.top p:last-child { text-align: right; }
h1 { position: absolute; left: 58px; right: 58px; top: 190px; font: 900 118px/.9 "Inter Display", "Inter", sans-serif; letter-spacing: -.045em; word-spacing: .14em; }
h1 em { display: block; margin-top: 10px; font: italic 300 124px/.92 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.02em; word-spacing: 0; color: #8e1f14; }
.cards { position: absolute; left: 64px; right: 64px; top: 640px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.card { height: 380px; border: 3px solid #1d201c; border-radius: 22px; background: #f8f4ec; padding: 30px 26px; display: grid; align-content: start; gap: 18px; }
.card b { font: 400 72px/1 "Fraunces", serif; font-variation-settings: "opsz" 144; margin-bottom: 14px; }
.card i { display: block; height: 14px; border-radius: 7px; background: #cfc6b6; }
.note { position: absolute; left: 64px; bottom: 64px; width: 700px; font: 400 25px/1.38 "Inter", sans-serif; color: #3b3a33; }
.call { position: absolute; right: 64px; bottom: 64px; display: grid; justify-items: end; gap: 6px; font: 600 17px/1.2 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.call svg { width: 92px; height: 40px; }
`, `<div class="top"><p>${kicker[0].map(esc).join('<br>')}</p><p>${kicker[1].map(esc).join('<br>')}</p></div>
<h1>${esc(title)}<em>${esc(flourish)}</em></h1>
<div class="cards">${card('A', [92, 100, 78, 96, 64])}${card('B', [100, 86, 94, 72, 88])}${card('C', [88, 98, 70, 100, 58])}</div>
<p class="note">${note.map(esc).join('<br>')}</p>
<div class="call"><svg viewBox="0 0 92 40" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 20 H86 M68 4 L88 20 L68 36"/></svg><p>${esc(call)}</p></div>`);
}

// a star drawn by hand, wobbling: five points with uneven arms, its edge roughened by a displacement filter
function handStar(x, y, r, turn, rnd) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const a = turn + (i * Math.PI) / 5 - Math.PI / 2;
    const rr = (i % 2 ? r * (0.38 + rnd() * 0.08) : r * (0.88 + rnd() * 0.24));
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<path d="M${pts.join(' L')} Z"/>`;
}
const crescent = (x, y, r, turn) => `<path transform="rotate(${turn} ${x} ${y})" d="M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * 0.78} ${r} 0 1 1 ${x} ${y - r} Z"/>`;
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// after the hand-drawn poster in two flat colours (3036): big loose drawings in one colour over the other, stars and
// moons scattered by hand, a small title in the middle and a block of small text at the foot
async function handDrawnPoster({ bg, ink, drawn, drawings, stars = [], moons = [], kicker, title, text, titleAt = 600 }) {
  const rnd = seeded(7);
  const art = [];
  for (const d of drawings) {
    if (d.symbol) art.push(`<div class="art" style="left:${d.x - d.size / 2}px;top:${d.y - d.size / 2}px;width:${d.size}px;height:${d.size}px;${await stencil(d.symbol, drawn)}"></div>`);
    else art.push(`<p class="art word" style="left:${d.x - d.size}px;top:${d.y - d.size / 2}px;width:${2 * d.size}px;font-size:${d.size}px;color:${drawn}">${esc(d.text)}</p>`);
  }
  return page(`
body { background: ${bg}; color: ${ink}; }
.art { position: absolute; }
.word { text-align: center; font: 400 1em/1 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.03em; line-height: 1; }
svg.sky { position: absolute; inset: 0; }
.mid { position: absolute; left: 0; right: 0; top: ${titleAt}px; display: grid; justify-items: center; gap: 12px; text-align: center; }
.kicker { font-size: 21px; letter-spacing: .06em; }
h1 { font: 500 58px/1.05 "Inter", sans-serif; letter-spacing: -.02em; }
.text { position: absolute; left: 90px; right: 90px; bottom: 70px; font: 400 21px/1.42 "Inter", sans-serif; text-align: center; }
`, `${art.join('')}
<svg class="sky" viewBox="0 0 1080 1350"><filter id="hand"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter>
<g fill="${drawn}" filter="url(#hand)">${stars.map(([x, y, r]) => handStar(x, y, r, rnd() * 0.6, rnd)).join('')}${moons.map(([x, y, r, t]) => crescent(x, y, r, t)).join('')}</g></svg>
<div class="mid"><p class="kicker mono">${esc(kicker)}</p><h1>${title.map(esc).join('<br>')}</h1></div>
<p class="text">${esc(text)}</p>`);
}

const LAYOUTS = { eventPoster, cultureExplainer, boldStatement, condensedSerif, thisVsThat, numberedSeries, quietTile, threeChoices, handDrawnPoster };

const wanted = process.argv.slice(2);
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const post of POSTS.filter((p) => !wanted.length || wanted.includes(p.slug))) {
  const out = `${root}media/posts/${post.slug}/`;
  await mkdir(out, { recursive: true });
  await tab.setContent(await LAYOUTS[post.layout](post.words));
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `${out}post.png`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await writeFile(`${out}caption.md`, `# ${post.slug}\n\nPost on: ${post.postOn}\n\n## Alt text\n\n${post.alt}\n\n## Caption\n\n${post.caption}\n`);
  console.log(`✓ media/posts/${post.slug}/`);
}
await browser.close();
