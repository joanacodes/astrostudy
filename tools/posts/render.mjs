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
// Three layouts so far, each a function of a post's words, so the Studio can fill them again:
//   eventPoster       an aura of colour, a spaced name, the date in mono, the title in italic serif, details in mono
//   cultureExplainer  a picture on electric blue, an uppercase question, a mono line in {{ brackets }}
//   boldStatement     a heavy lowercase statement ending in an italic serif phrase, small labels, an arrow
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

// after the event poster with the blurred dark rectangle (3074): mist at the edges, a glow, a near-black heart
function eventPoster({ name, date, title, subtitle, details }) {
  return page(`
body { background: #c8ccc8; color: #efe6da; }
.glow { position: absolute; left: 110px; top: 100px; width: 860px; height: 1150px; background: #5c2219; filter: blur(70px); border-radius: 60px; }
.core { position: absolute; left: 190px; top: 190px; width: 700px; height: 980px; background: #140c0b; filter: blur(55px); border-radius: 40px; }
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
async function cultureExplainer({ picture, question, aside, label }) {
  const img = await b64(picture);
  return page(`
body { background: #2b31d4; color: #fff; }
.pic { position: absolute; left: 40px; top: 40px; width: 1000px; height: 1000px; background: url(data:image/png;base64,${img}) center / cover; }
h1 { position: absolute; left: 48px; right: 48px; top: 1078px; font: 500 74px/.98 "Inter Display", "Inter", sans-serif; letter-spacing: -.012em; text-transform: uppercase; }
.aside { position: absolute; left: 50px; right: 50px; bottom: 54px; font-size: 21px; letter-spacing: .02em; opacity: .9; }
.label { position: absolute; right: 50px; bottom: 54px; font-size: 17px; letter-spacing: .14em; text-transform: uppercase; opacity: .75; }
`, `<div class="pic"></div><h1>${question.map(esc).join('<br>')}</h1>
<p class="aside mono">{{ ${esc(aside)} }}</p><p class="label mono">${esc(label)}</p>`);
}

// after the bold statements on cream (3053): heavy lowercase sans, an italic serif phrase, corner labels, an arrow
function boldStatement({ labels, statement, flourish, note, call }) {
  return page(`
body { background: #f1ebe1; color: #8e1f14; }
.top { position: absolute; left: 64px; right: 64px; top: 58px; display: flex; justify-content: space-between; font: 600 17px/1.35 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.top p:last-child { text-align: right; }
h1 { position: absolute; left: 58px; right: 58px; top: 290px; font: 900 158px/.86 "Inter Display", "Inter", sans-serif; letter-spacing: -.05em; word-spacing: .16em; }
h1 em { display: block; margin-top: 18px; font: italic 300 170px/.86 "Fraunces", serif; font-variation-settings: "opsz" 144; letter-spacing: -.02em; word-spacing: 0; }
.note { position: absolute; left: 64px; bottom: 64px; width: 640px; font: 400 25px/1.38 "Inter", sans-serif; color: #3b2420; }
.call { position: absolute; right: 64px; bottom: 64px; display: grid; justify-items: end; gap: 6px; font: 600 17px/1.2 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.call svg { width: 92px; height: 40px; }
`, `<div class="top"><p>${labels[0].map(esc).join('<br>')}</p><p>${labels[1].map(esc).join('<br>')}</p></div>
<h1>${statement.map(esc).join('<br>')}<em>${flourish.map(esc).join('<br>')}</em></h1>
<p class="note">${note.map(esc).join('<br>')}</p>
<div class="call"><svg viewBox="0 0 92 40" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 20 H86 M68 4 L88 20 L68 36"/></svg><p>${esc(call)}</p></div>`);
}

const LAYOUTS = { eventPoster, cultureExplainer, boldStatement };

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
