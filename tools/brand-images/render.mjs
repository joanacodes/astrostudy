#!/usr/bin/env node
// The Astro Study — share and social pictures, drawn from the site's own fonts, colours and meadow.
//
// Each picture is a small HTML page photographed by a headless browser at the exact size a platform
// asks for. Building them from the site's own Fraunces, Inter and planet symbols, its frosted glass
// and its meadow keeps every post, pin and link preview recognisably the site's, without anyone
// opening a design tool — and a new article gets its pictures the moment it exists.
//
//   node render.mjs examples/carousel-saturn.json [more.json…] [--out <dir>]
//   node render.mjs --site [--force]           (redraws only pages whose words or look changed)
//
// README.md has the job format and every template's fields.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const FONTS = path.join(ROOT, 'static/fonts');
const MEDIA = path.join(ROOT, 'static/media');
const CONTENT = path.join(ROOT, 'content');
const SITE_URL = 'astrostudy.co.uk';
// What each site picture was last drawn from (output path → hash), so a run redraws only what changed.
// A hash, not file dates: a fresh checkout dates every file now, which would redraw everything.
const MANIFEST = path.join(HERE, '.cache/manifest.json');

const SIZES = {
  og: [1200, 630],
  square: [1080, 1080],
  post: [1080, 1350],
  story: [1080, 1920],
  pin: [1000, 1500],
};
const DEFAULT_SIZE = { cover: 'post', glyph: 'og', quote: 'post', stat: 'post', challenge: 'post', carousel: 'post' };

// Words the pictures write themselves, per language; anything a job gives wins.
const WORDS = {
  en: {
    swipe: 'Swipe',
    stars: (n) => `${n} out of 5 stars`,
    statLabel: 'In my tests',
    challengeLabel: 'The Blind Chart Challenge',
    challengeTitle: 'Which one <em>is you?</em>',
    challengeSub: 'Three anonymous readings. Only one was written for you.',
    challengeChance: 'Chance: 1 in 3',
    resultTitle: 'I picked <em>my chart</em>',
    blog: 'Blog',
    astrology: 'Astrology encyclopaedia',
  },
  fr: {
    swipe: 'Faites glisser',
    stars: (n) => `${n} étoiles sur 5`,
    statLabel: 'Dans mes tests',
    challengeLabel: 'Le défi du thème à l’aveugle',
    challengeTitle: 'Laquelle <em>est la vôtre ?</em>',
    challengeSub: 'Trois lectures anonymes. Une seule a été écrite pour vous.',
    challengeChance: 'Au hasard : 1 sur 3',
    resultTitle: 'J’ai trouvé <em>mon thème</em>',
    blog: 'Blog',
    astrology: 'Encyclopédie de l’astrologie',
  },
};
const words = (lang) => WORDS[lang] || WORDS[String(lang || '').slice(0, 2)] || WORDS.en;

/* ---------------------------------------------------------------------------------------------
   Text helpers */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Planet, sign and star symbols get the text-style variation selector, so no phone or browser draws
// them as colour emoji; the symbols font covers exactly these code points.
const SYMBOL = /([☀-⛿✀-➿■-◿])(?!︎)/g;
const plainSymbols = (html) => String(html ?? '').replace(SYMBOL, '$1︎');

// A glyph field may hold a pair ("☌/☍"): the slash is drawn thinner, as on the site.
function glyphHTML(str) {
  return Array.from(String(str || '✦'))
    .map((ch) => (ch === '/' ? '<span class="slash">/</span>' : ch === ' ' ? ' ' : `${ch}︎`))
    .join('');
}

/* ---------------------------------------------------------------------------------------------
   The page every picture is drawn in */

const fileURL = (p) => pathToFileURL(p).href;

function fontCSS() {
  const face = (family, file, style, weight, range) => `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};src:url("${fileURL(path.join(FONTS, file))}") format("woff2");${range ? `unicode-range:${range};` : ''}}`;
  const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  const EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF';
  const SYMBOLS = 'U+25A1,U+25B3,U+2605,U+2609,U+260C-260D,U+263D,U+263F-2640,U+2642-2653,U+26B7-26B8,U+2726';
  return [
    face('Fraunces', 'fraunces-normal-latin.woff2', 'normal', '300 600', LATIN),
    face('Fraunces', 'fraunces-normal-latin-ext.woff2', 'normal', '300 600', EXT),
    face('Fraunces', 'fraunces-italic-latin.woff2', 'italic', '300 600', LATIN),
    face('Fraunces', 'fraunces-italic-latin-ext.woff2', 'italic', '300 600', EXT),
    face('Inter', 'inter-normal-latin.woff2', 'normal', '300 600', LATIN),
    face('Inter', 'inter-normal-latin-ext.woff2', 'normal', '300 600', EXT),
    face('Astro Symbols', 'noto-sans-symbols-astro.woff2', 'normal', '400', SYMBOLS),
  ].join('\n');
}

// The same tokens as the site's :root (assets/css/site.css), so a picture and a page never drift.
const BASE_CSS = `
:root{
  --paper:#f3f1ea; --ink:#1c211b; --ink-2:#474e44; --ink-3:#4b5249; --line:rgba(28,33,27,.14); --line-2:rgba(28,33,27,.3);
  --accent:#b5512c; --accent-ink:#8f3d1f; --gold:#c98a2e;
  --serif:"Astro Symbols","Fraunces","Iowan Old Style",Georgia,serif;
  --sans:"Astro Symbols","Inter",system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--W);height:var(--H);overflow:hidden;background:#9db6c9}
body{position:relative;font-family:var(--sans);color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal;font-optical-sizing:auto}
em{font-style:italic;font-weight:300}
.bg{position:absolute;inset:0;background-image:var(--bg);background-repeat:no-repeat;background-size:var(--bw) var(--bh);background-position:var(--bx) var(--by)}

/* Frosted glass. A screenshot can't be trusted to draw backdrop-filter, so each pane carries its own
   blurred copy of the meadow, lined up with the one behind it (place() below), under the paper tint. */
.glass{position:relative;overflow:hidden;isolation:isolate;border-radius:calc(var(--u)*34);border:1px solid rgba(255,255,255,.62);
  box-shadow:0 calc(var(--u)*34) calc(var(--u)*90) calc(var(--u)*-40) rgba(20,40,20,.5), inset 0 1px 0 rgba(255,255,255,.5)}
.glass__bg{position:absolute;z-index:0;background-image:var(--bg);background-repeat:no-repeat;background-size:var(--bw) var(--bh);filter:blur(calc(var(--u)*34)) saturate(1.45) brightness(1.06)}
.glass::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(247,246,241,.64),rgba(244,243,237,.74))}
.glass>:not(.glass__bg){position:relative;z-index:2}
/* a patch of sky, as on the menu cards and blog covers: the glyph sits on it in white */
.glass--sky::before{background:linear-gradient(160deg,rgba(143,176,201,.78) 0%,rgba(195,212,224,.62) 55%,rgba(223,227,214,.58) 100%)}

.label{display:flex;align-items:center;gap:calc(var(--u)*20);font:500 calc(var(--u)*21)/1.25 var(--sans);letter-spacing:.15em;text-transform:uppercase;color:var(--ink-2)}
.label::after{content:"";flex:1;height:1px;background:var(--line-2)}
.label--bare::after{display:none}
.title{font-family:var(--serif);font-weight:330;letter-spacing:-.03em;line-height:1.03;color:var(--ink);text-wrap:balance}
.title em{font-weight:300}
.text{font:400 calc(var(--u)*32)/1.45 var(--sans);color:var(--ink-2);text-wrap:pretty}
.note{font:400 calc(var(--u)*22)/1.5 var(--sans);color:var(--ink-3);text-wrap:pretty}
.wm{display:flex;align-items:baseline;gap:.2em;font-family:var(--serif);font-weight:360;letter-spacing:-.02em;color:var(--ink);white-space:nowrap}
.wm em{font-weight:300}
.wm__dot{align-self:center;width:.5em;height:.5em;margin-right:.28em;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff6df,#e9b26a 55%,#c76a35);box-shadow:0 0 .55em .12em rgba(255,214,150,.75)}
.url{font:500 calc(var(--u)*18)/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--ink-2);white-space:nowrap}
.foot{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*24);margin-top:auto;padding-top:calc(var(--u)*30);border-top:1px solid var(--line)}
.foot .wm{font-size:calc(var(--u)*30)}
.sym,.slash{font-family:var(--serif)}
.slash{font-family:var(--sans);font-weight:300;margin:0 .06em;opacity:.7}

/* The site's lit words: "chart" glows like a low sun from its last letter, "Syna" in the red. */
.sunword,.redword{-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;padding-right:.04em}
.sunword{background-image:linear-gradient(to left,#f7c25a 0%,#eea23c 24%,#d77a33 46%,#8a4a26 60%,var(--ink) 72%);filter:drop-shadow(0 0 calc(var(--u)*12) rgba(245,172,72,.6))}
.redword{background-image:linear-gradient(to left,#d96a3c 0%,var(--accent) 30%,#8f3d1f 62%,#4a2a1c 88%,var(--ink) 100%);filter:drop-shadow(0 0 calc(var(--u)*11) rgba(200,90,50,.5))}
.struck{text-decoration:line-through;text-decoration-thickness:.06em;text-decoration-color:var(--accent)}
.marked{text-decoration:underline;text-decoration-thickness:.05em;text-underline-offset:.16em;text-decoration-color:var(--accent)}
.lit{color:#fff;background:var(--accent);padding:0 .22em .04em;border-radius:.18em;-webkit-box-decoration-break:clone;box-decoration-break:clone}

/* the stage holds the card inside the safe margins; the card never grows past it (fit() shrinks
   the type instead), so nothing is ever cut at the edge of the picture */
.stage{position:absolute;display:flex;flex-direction:column}
.card{display:flex;flex-direction:column;max-height:100%;min-height:0}
.card__in{display:flex;flex-direction:column;min-height:0;overflow:hidden}

/* "3/6" on a carousel slide, in white on the sky */
.counter{position:absolute;z-index:3;top:calc(var(--u)*54);right:calc(var(--u)*64);font:500 calc(var(--u)*22)/1 var(--sans);letter-spacing:.16em;color:rgba(255,255,255,.94);text-shadow:0 1px 8px rgba(8,22,40,.35)}

/* a faint zodiac ring, lifted from the preloader */
.wheel{position:absolute;pointer-events:none}
.wheel svg{width:100%;height:100%;overflow:visible}
.wheel .w-line{fill:none;stroke:currentColor;stroke-width:.6}
.wheel .w-faint{opacity:.6}
.wheel text{font:9px/1 "Astro Symbols",serif;fill:currentColor;text-anchor:middle;dominant-baseline:central}
`;

// What runs in the page: load what it needs, shrink type that doesn't fit, line the glass up with
// the meadow, then tell the renderer it's ready (window.__ready) with any warnings.
const PAGE_JS = `
(async () => {
  const warnings = [];
  const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  try {
    const img = new Image();
    img.src = __BG__;
    await img.decode();
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
    await document.fonts.ready;
    await raf();

    // Shrink, a little at a time and all together, the type of any box whose words overflow it: a
    // long French title gets smaller rather than cut. Each item stops at its own floor.
    for (const box of document.querySelectorAll('[data-fit-box]')) {
      const items = [...box.querySelectorAll('[data-fit]')];
      const over = () => box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1;
      let rounds = 0;
      while (over() && rounds++ < 80) {
        let moved = false;
        for (const el of items) {
          const size = parseFloat(getComputedStyle(el).fontSize);
          const floor = parseFloat(el.dataset.fit || '0');
          if (size * 0.97 >= floor) {
            el.style.fontSize = size * 0.97 + 'px';
            moved = true;
          }
        }
        if (!moved) break;
      }
      if (over()) warnings.push('text still overflows its card after shrinking to the minimum');
    }

    // The meadow is drawn a little larger than the picture, so every glass pane's blurred copy has
    // image under all its edges (a blur next to nothing fades to white).
    const W = innerWidth, H = innerHeight, m = 90;
    const [fx, fy] = __POS__.split(/\\s+/).map((v) => parseFloat(v) / 100);
    const s = Math.max((W + 2 * m) / img.naturalWidth, (H + 2 * m) / img.naturalHeight) * (__ZOOM__);
    const bw = img.naturalWidth * s, bh = img.naturalHeight * s;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const bx = clamp((W - bw) * fx, W - bw + m, -m);
    const by = clamp((H - bh) * fy, H - bh + m, -m);
    const root = document.documentElement.style;
    root.setProperty('--bw', bw + 'px');
    root.setProperty('--bh', bh + 'px');
    root.setProperty('--bx', bx + 'px');
    root.setProperty('--by', by + 'px');
    for (const g of document.querySelectorAll('.glass')) {
      const r = g.getBoundingClientRect();
      const layer = g.querySelector(':scope > .glass__bg');
      if (!layer) continue;
      Object.assign(layer.style, {
        left: -r.left - g.clientLeft - m + 'px',
        top: -r.top - g.clientTop - m + 'px',
        width: W + 2 * m + 'px',
        height: H + 2 * m + 'px',
        backgroundPosition: bx + m + 'px ' + (by + m) + 'px',
      });
    }
    await raf();
  } catch (err) {
    warnings.push(String(err && err.message || err));
  }
  window.__warnings = warnings;
  window.__ready = true;
})();
`;

function wheelSVG() {
  const signs = '♈♉♊♋♌♍♎♏♐♑♒♓';
  const r = (d) => (d * Math.PI) / 180;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = r(i * 30);
    ticks += `M${(-80 * Math.cos(a)).toFixed(1)} ${(80 * Math.sin(a)).toFixed(1)}L${(-100 * Math.cos(a)).toFixed(1)} ${(100 * Math.sin(a)).toFixed(1)}`;
  }
  const glyphs = Array.from(signs)
    .map((g, i) => {
      const a = r(i * 30 + 15);
      return `<text x="${(-90 * Math.cos(a)).toFixed(1)}" y="${(90 * Math.sin(a)).toFixed(1)}">${g}︎</text>`;
    })
    .join('');
  return `<svg viewBox="-110 -110 220 220" aria-hidden="true"><circle class="w-line" r="100"/><circle class="w-line" r="80"/><circle class="w-line w-faint" r="56"/><path class="w-line w-faint" d="${ticks}"/>${glyphs}</svg>`;
}

const wordmark = (extra = '') => `<div class="wm ${extra}"><span class="wm__dot"></span><span>The Astro <em>Study</em></span></div>`;

/* ---------------------------------------------------------------------------------------------
   Sizes and backgrounds */

function dims(size) {
  const wh = SIZES[size];
  if (!wh) throw new Error(`unknown size "${size}" (use ${Object.keys(SIZES).join(', ')})`);
  const [w, h] = wh;
  const orient = size === 'og' ? 'land' : size === 'square' ? 'square' : 'port';
  // one design unit = 1px on a 1080-wide picture, so every size shares the same proportions;
  // the link preview is designed at its own 1200×630
  const u = size === 'og' ? 1 : w / 1080;
  return { w, h, u, orient, size };
}

function background(job, d, jobDir) {
  let file = job.background
    ? [path.resolve(jobDir || process.cwd(), job.background), path.join(MEDIA, job.background)].find((p) => existsSync(p))
    : null;
  if (job.background && !file) throw new Error(`background not found: ${job.background}`);
  file ||= path.join(MEDIA, d.orient === 'land' ? 'meadow-poster-wide.jpg' : 'meadow-poster-tall.jpg');
  // the tall still keeps its clean sky at the top for the glyph; the wide one is framed on its clouds
  const pos = job.backgroundPosition || (d.orient === 'land' ? '50% 42%' : d.size === 'story' ? '50% 50%' : '50% 34%');
  return { url: fileURL(file), pos, zoom: Number(job.backgroundZoom) || 1 };
}

function pageHTML({ d, lang, bg, cls, body, css = '' }) {
  return `<!doctype html><html lang="${esc(lang || 'en')}"><head><meta charset="utf-8">
<style>${fontCSS()}${BASE_CSS}${css}</style>
<style>:root{--W:${d.w}px;--H:${d.h}px;--u:${d.u}px;--bg:url("${bg.url}")}</style>
</head><body class="is-${d.orient} size-${d.size} ${cls || ''}"><div class="bg"></div>${plainSymbols(body)}
<script>${PAGE_JS.replace('__BG__', JSON.stringify(bg.url)).replace('__POS__', JSON.stringify(bg.pos)).replace('__ZOOM__', String(bg.zoom))}</script>
</body></html>`;
}

/* ---------------------------------------------------------------------------------------------
   Templates. Each returns [{ file suffix, size, html }]. The CSS for a template sits beside it:
   positions per orientation, type sizes in design units (calc(var(--u)*N)). */

const fit = (min) => `data-fit="${min}"`;

// cover — a label, a title, an optional line, on glass over the meadow
const COVER_CSS = `
.is-port .stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--u)*300);bottom:calc(var(--u)*64);justify-content:flex-end}
.size-story .stage{top:calc(var(--u)*330);bottom:calc(var(--u)*380)}
.is-square .stage{left:calc(var(--u)*56);right:calc(var(--u)*56);top:calc(var(--u)*200);bottom:calc(var(--u)*56);justify-content:flex-end}
.is-land .stage{left:48px;top:48px;bottom:48px;width:730px}
.is-land .card{flex:1}
.cover .card__in{padding:calc(var(--u)*60) calc(var(--u)*60) calc(var(--u)*48);gap:calc(var(--u)*30)}
.is-land.cover .card__in{padding:46px 50px 38px;gap:22px;height:100%}
.cover .title{font-size:calc(var(--u)*96)}
.is-square.cover .title{font-size:calc(var(--u)*86)}
.size-story.cover .title{font-size:calc(var(--u)*104)}
.is-land.cover .title{font-size:70px;margin-top:auto}
.cover .text{font-size:calc(var(--u)*34)}
.is-land.cover .text{font-size:26px;line-height:1.45}
.cover .wheel{left:50%;width:calc(var(--u)*500);height:calc(var(--u)*500);top:calc(var(--u)*70);transform:translateX(-50%);color:rgba(255,255,255,.62)}
.size-story.cover .wheel{top:calc(var(--u)*270);width:calc(var(--u)*560);height:calc(var(--u)*560)}
.is-land.cover .wheel{left:auto;right:56px;top:120px;width:380px;height:380px;transform:none}
.is-square.cover .wheel{display:none}
`;
function cover(job, d) {
  const w = words(job.lang);
  const label = job.label ? `<p class="label">${job.label}</p>` : '';
  const text = job.subtitle || job.text ? `<p class="text" ${fit(18 * d.u)}>${job.subtitle || job.text}</p>` : '';
  const right = job.swipe ? `<span class="url">${esc(job.swipe === true ? w.swipe : job.swipe)} →</span>` : `<span class="url">${esc(job.url || SITE_URL)}</span>`;
  return {
    cls: 'cover',
    css: COVER_CSS,
    body: `${job.wheel === false ? '' : `<div class="wheel">${wheelSVG()}</div>`}
<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    ${label}
    <h1 class="title" ${fit(34 * d.u)}>${job.title || ''}</h1>
    ${text}
    <div class="foot">${wordmark()}${right}</div>
  </div>
</div></div>`,
  };
}

// glyph — a big symbol in white on the sky, then the title and one line on glass
const GLYPH_CSS = `
.glyph-zone{position:absolute;display:flex;align-items:center;justify-content:center}
.glyph-big{font-family:var(--serif);color:#fff;line-height:1;white-space:nowrap;text-shadow:0 calc(var(--u)*6) calc(var(--u)*50) rgba(10,32,56,.38),0 0 calc(var(--u)*2) rgba(10,32,56,.25)}
.glyph-big .slash{opacity:.85}
.is-port .glyph-zone{left:0;right:0;top:calc(var(--u)*70);height:calc(var(--H)*0.40)}
.size-story .glyph-zone{top:calc(var(--u)*260);height:calc(var(--u)*640)}
.is-port .glyph-zone::before,.is-square .glyph-zone::before{content:"";position:absolute;width:calc(var(--u)*720);height:calc(var(--u)*720);border-radius:50%;background:radial-gradient(closest-side,rgba(8,22,40,.11),rgba(8,22,40,0))}
.is-port .glyph-big{position:relative;font-size:calc(var(--u)*300)}
.is-port .stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--H)*0.47);bottom:calc(var(--u)*64);justify-content:flex-end}
.size-story .stage{top:calc(var(--u)*960);bottom:calc(var(--u)*380)}
.is-square .glyph-zone{left:0;right:0;top:calc(var(--u)*40);height:calc(var(--u)*400)}
.is-square .glyph-big{position:relative;font-size:calc(var(--u)*230)}
.is-square .stage{left:calc(var(--u)*56);right:calc(var(--u)*56);top:calc(var(--u)*430);bottom:calc(var(--u)*56);justify-content:flex-end}
.is-land .sky{position:absolute;left:48px;top:48px;bottom:48px;width:380px;display:flex;align-items:center;justify-content:center}
.is-land .glyph-big{font-size:210px}
.is-land .glyph-big.is-pair{font-size:150px}
.is-land .stage{left:452px;right:48px;top:48px;bottom:48px}
.is-land .card{flex:1}
.glyph .card__in{padding:calc(var(--u)*56) calc(var(--u)*60) calc(var(--u)*46);gap:calc(var(--u)*26)}
.is-land.glyph .card__in{padding:42px 46px 34px;gap:18px;height:100%}
.glyph .title{font-size:calc(var(--u)*80)}
.is-square.glyph .title{font-size:calc(var(--u)*70)}
.is-land.glyph .title{font-size:60px;margin-top:auto}
.glyph .text{font-size:calc(var(--u)*31)}
.is-land.glyph .text{font-size:24px;line-height:1.45}
.is-port .glyph-big.is-pair{font-size:calc(var(--u)*220)}
`;
function glyph(job, d, extra = {}) {
  const pair = /[\/ ]/.test(String(job.glyph || '').trim());
  const big = `<div class="glyph-big${pair ? ' is-pair' : ''}">${glyphHTML(job.glyph)}</div>`;
  const zone =
    d.orient === 'land'
      ? `<div class="glass glass--sky sky"><div class="glass__bg"></div>${big}</div>`
      : `<div class="glyph-zone">${big}</div>`;
  const label = job.label ? `<p class="label">${job.label}</p>` : '';
  const text = job.text || job.description ? `<p class="text" ${fit(17 * d.u)}>${job.text || job.description}</p>` : '';
  const right = extra.right ?? `<span class="url">${esc(job.url || SITE_URL)}</span>`;
  return {
    cls: 'glyph',
    css: GLYPH_CSS,
    body: `${zone}${extra.counter || ''}
<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    ${label}
    <h1 class="title" ${fit(30 * d.u)}>${job.title || ''}</h1>
    ${text}
    <div class="foot">${wordmark()}${right}</div>
  </div>
</div></div>`,
  };
}

// quote — a review: the stars, the words, who said it
const QUOTE_CSS = `
.stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--u)*90);bottom:calc(var(--u)*90);justify-content:center}
.size-story .stage{top:calc(var(--u)*300);bottom:calc(var(--u)*380)}
.is-land .stage{left:56px;right:56px;top:44px;bottom:44px}
.quote .card__in{padding:calc(var(--u)*64) calc(var(--u)*64) calc(var(--u)*50);gap:calc(var(--u)*34)}
.is-land.quote .card__in{padding:40px 52px 32px;gap:18px}
.stars{display:flex;gap:calc(var(--u)*8);font:400 calc(var(--u)*46)/1 "Astro Symbols",serif;color:var(--gold)}
.is-land .stars{font-size:30px}
.q{font-family:var(--serif);font-style:italic;font-weight:300;font-size:calc(var(--u)*84);line-height:1.08;letter-spacing:-.025em;color:var(--ink);text-wrap:balance}
.is-land .q{font-size:50px}
.who{display:flex;flex-direction:column;gap:calc(var(--u)*6)}
.who strong{font:600 calc(var(--u)*28)/1.3 var(--sans);color:var(--ink)}
.who span{font:400 calc(var(--u)*24)/1.4 var(--sans);color:var(--ink-2)}
.is-land .who strong{font-size:20px}
.is-land .who span{font-size:17px}
`;
function quote(job, d) {
  const n = Math.max(0, Math.min(5, Number(job.stars ?? 0))); // only a rating the person gave
  const stars = n ? `<div class="stars" role="img" aria-label="${esc(words(job.lang).stars(n))}">${'★︎'.repeat(n)}</div>` : '';
  const q = String(job.quote || '').trim();
  const quoted = /^[“"«]/.test(q) ? q : job.lang?.startsWith('fr') ? `« ${q} »` : `“${q}”`;
  return {
    cls: 'quote',
    css: QUOTE_CSS,
    body: `<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    ${stars}
    <p class="q" ${fit(28 * d.u)}>${quoted}</p>
    <div class="who">${job.author ? `<strong>${job.author}</strong>` : ''}${job.context ? `<span ${fit(14 * d.u)}>${job.context}</span>` : ''}</div>
    <div class="foot">${wordmark()}<span class="url">${esc(job.url || SITE_URL)}</span></div>
  </div>
</div></div>`,
  };
}

// stat — one number that carries the post, and what it means
const STAT_CSS = `
.stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--u)*90);bottom:calc(var(--u)*90);justify-content:center}
.size-story .stage{top:calc(var(--u)*300);bottom:calc(var(--u)*380)}
.is-land .stage{left:56px;right:56px;top:44px;bottom:44px}
.stat .card__in{padding:calc(var(--u)*64) calc(var(--u)*64) calc(var(--u)*50);gap:calc(var(--u)*30)}
.stat-num,.stat-words{display:flex;flex-direction:column;gap:calc(var(--u)*30)}
.is-land.stat .card__in{padding:38px 52px 30px;gap:14px}
.n{font-family:var(--serif);font-weight:300;font-size:calc(var(--u)*270);line-height:.92;letter-spacing:-.045em;white-space:nowrap;margin-left:-.04em}
.is-land .card__in{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr auto;column-gap:44px;row-gap:14px;align-items:center}
.is-land .card__in>.label,.is-land .card__in>.foot{grid-column:1/-1}
.is-land .stat-num{display:flex;flex-direction:column;gap:18px}
.is-land .stat-words{display:flex;flex-direction:column;gap:14px}
.is-land .n{font-size:176px}
.rule{width:calc(var(--u)*140);height:calc(var(--u)*3);background:var(--accent);border-radius:2px}
.say{font-family:var(--serif);font-weight:340;font-size:calc(var(--u)*54);line-height:1.12;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
.is-land .say{font-size:34px}
.is-land .note{font-size:16px}
`;
function statCard(job, d) {
  const w = words(job.lang);
  return {
    cls: 'stat',
    css: STAT_CSS,
    body: `<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    <p class="label">${job.label || w.statLabel}</p>
    <div class="stat-num">
      <p class="n" ${fit(90 * d.u)}><span class="${job.numberStyle === 'plain' ? '' : job.numberStyle === 'red' ? 'redword' : 'sunword'}">${job.number || ''}</span></p>
      <div class="rule"></div>
    </div>
    <div class="stat-words">
      <p class="say" ${fit(24 * d.u)}>${job.text || ''}</p>
      ${job.note ? `<p class="note" ${fit(14 * d.u)}>${job.note}</p>` : ''}
    </div>
    <div class="foot">${wordmark()}<span class="url">${esc(job.url || SITE_URL)}</span></div>
  </div>
</div></div>`,
  };
}

// challenge — the Blind Chart Challenge: three readings, one is yours (or the result card)
const CHALLENGE_CSS = `
.stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--u)*80);bottom:calc(var(--u)*80);justify-content:center}
.size-story .stage{top:calc(var(--u)*290);bottom:calc(var(--u)*360)}
.is-land .stage{left:48px;right:48px;top:40px;bottom:40px}
.challenge .card__in{padding:calc(var(--u)*60) calc(var(--u)*60) calc(var(--u)*48);gap:calc(var(--u)*30)}
.is-land.challenge .card__in{padding:36px 46px 28px;gap:16px}
.challenge .title{font-size:calc(var(--u)*104)}
.is-land.challenge .title{font-size:56px}
.challenge .text{font-size:calc(var(--u)*34)}
.is-land.challenge .text{font-size:22px}
.choices{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*22);margin-top:calc(var(--u)*6)}
.choice{display:flex;flex-direction:column;gap:calc(var(--u)*14);padding:calc(var(--u)*26) calc(var(--u)*24) calc(var(--u)*30);border-radius:calc(var(--u)*24);background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.75);box-shadow:0 calc(var(--u)*14) calc(var(--u)*34) calc(var(--u)*-20) rgba(20,40,20,.35)}
.is-land .choice{padding:16px 18px 18px;gap:9px;border-radius:16px}
.choice b{font:italic 300 calc(var(--u)*92)/.9 var(--serif);color:var(--accent);letter-spacing:-.03em}
.is-land .choice b{font-size:52px}
.choice i{display:block;height:calc(var(--u)*11);border-radius:99px;background:rgba(28,33,27,.13)}
.is-land .choice i{height:7px}
.choice i:nth-of-type(2){width:88%}.choice i:nth-of-type(3){width:96%}.choice i:nth-of-type(4){width:64%}
.choice p{font:400 calc(var(--u)*22)/1.4 var(--sans);color:var(--ink-2)}
.choice.is-yours{background:rgba(255,255,255,.72);border-color:var(--accent);box-shadow:0 0 0 calc(var(--u)*2) rgba(181,81,44,.35),0 calc(var(--u)*14) calc(var(--u)*34) calc(var(--u)*-20) rgba(20,40,20,.35)}
.mark{width:calc(var(--u)*150);height:calc(var(--u)*150)}
.is-land .mark{width:84px;height:84px}
.chance{font:500 calc(var(--u)*20)/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--accent-ink)}
`;
function challenge(job, d) {
  const w = words(job.lang);
  const isResult = job.variant === 'result';
  const letters = ['A', 'B', 'C'];
  const picked = String(job.picked || '').toUpperCase();
  const choices = (job.choices || letters.map((l) => ({ letter: l })))
    .slice(0, 3)
    .map((c, i) => {
      const letter = c.letter || letters[i];
      const inner = c.text ? `<p>${c.text}</p>` : '<i></i><i></i><i></i><i></i>';
      return `<div class="choice${isResult && picked === letter ? ' is-yours' : ''}"><b>${esc(letter)}</b>${inner}</div>`;
    })
    .join('');
  const mark = `<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#b5512c" stroke-width="2.4"/><path d="M30 52 L44 65 L71 36" fill="none" stroke="#b5512c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const body = isResult
    ? `${mark}
    <h1 class="title" ${fit(36 * d.u)}>${job.title || w.resultTitle}</h1>
    ${job.result ? `<p class="text" ${fit(16 * d.u)}>${job.result}</p>` : ''}
    ${job.showChoices === false ? '' : `<div class="choices">${choices}</div>`}`
    : `<h1 class="title" ${fit(36 * d.u)}>${job.title || w.challengeTitle}</h1>
    <p class="text" ${fit(16 * d.u)}>${job.subtitle || w.challengeSub}</p>
    <div class="choices">${choices}</div>`;
  return {
    cls: 'challenge',
    css: CHALLENGE_CSS,
    body: `<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    <p class="label">${job.label || w.challengeLabel}</p>
    ${body}
    <div class="foot">${wordmark()}<span class="chance">${job.chance || w.challengeChance}</span></div>
  </div>
</div></div>`,
  };
}

// the last slide of a carousel: the name, one line, the address
const END_CSS = `
.stage{left:calc(var(--u)*64);right:calc(var(--u)*64);top:calc(var(--u)*560);bottom:calc(var(--u)*120);justify-content:center}
.end .card__in{align-items:center;text-align:center;padding:calc(var(--u)*70) calc(var(--u)*64) calc(var(--u)*60);gap:calc(var(--u)*30)}
.end .wm{font-size:calc(var(--u)*76)}
.end .text{font-size:calc(var(--u)*34);max-width:22em}
.end .url{font-size:calc(var(--u)*22);color:var(--accent-ink)}
.end .wheel{left:50%;top:calc(var(--u)*70);width:calc(var(--u)*480);height:calc(var(--u)*480);transform:translateX(-50%);color:rgba(255,255,255,.66)}
`;
function endSlide(slide, d, counter) {
  return {
    cls: 'end',
    css: END_CSS,
    body: `<div class="wheel">${wheelSVG()}</div>${counter}
<div class="stage"><div class="glass card"><div class="glass__bg"></div>
  <div class="card__in" data-fit-box>
    ${wordmark()}
    ${slide.title ? `<p class="title" style="font-size:calc(var(--u)*56)" ${fit(26 * d.u)}>${slide.title}</p>` : ''}
    ${slide.text ? `<p class="text" ${fit(18 * d.u)}>${slide.text}</p>` : ''}
    <span class="url">${esc(slide.url || SITE_URL)}</span>
  </div>
</div></div>`,
  };
}

// carousel — the first slide is a cover, the middle ones a symbol and a few lines, the last the name
function carousel(job) {
  const slides = job.slides || [];
  if (slides.length < 2) throw new Error(`${job.name}: a carousel needs at least two slides`);
  const d = dims('post');
  const n = slides.length;
  return slides.map((s, i) => {
    const counter = `<div class="counter">${i + 1}/${n}</div>`;
    let t;
    if (i === 0) t = cover({ ...job, ...s, swipe: s.swipe ?? true, wheel: s.wheel ?? job.wheel }, d);
    else if (i === n - 1) t = endSlide(s, d, counter);
    else t = s.glyph ? glyph({ ...job, ...s, label: s.label }, d, { counter, right: '' }) : cover({ ...job, ...s, label: s.label, wheel: s.wheel ?? true }, d);
    if (i > 0 && i < n - 1 && !s.glyph) t.body = counter + t.body;
    return { suffix: `-${String(i + 1).padStart(2, '0')}`, d, ...t };
  });
}

const TEMPLATES = { cover, glyph, quote, stat: statCard, challenge };

function expand(job) {
  if (!job || typeof job !== 'object') throw new Error('a job must be an object');
  if (!job.name) throw new Error('every job needs a "name" (the file name it is written to)');
  if (job.template === 'carousel') return carousel(job);
  const make = TEMPLATES[job.template];
  if (!make) throw new Error(`${job.name}: unknown template "${job.template}" (use cover, glyph, quote, stat, challenge, carousel)`);
  const sizes = job.sizes || [job.size || DEFAULT_SIZE[job.template]];
  return sizes.map((size) => ({ suffix: sizes.length > 1 ? `-${size}` : '', d: dims(size), ...make(job, dims(size)) }));
}

/* ---------------------------------------------------------------------------------------------
   The site's own pages: an Open Graph picture for every article (and pins, on request) */

// Just enough YAML for the site's front matter: top-level `key: value` lines, quoted strings,
// [lists] and booleans. Nested blocks (sitemap:) are skipped.
function frontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, raw] = kv;
    const v = raw.trim();
    if (v === '') continue;
    if (v === 'true' || v === 'false') out[key] = v === 'true';
    else if (v.startsWith('"')) {
      try {
        out[key] = JSON.parse(v);
      } catch {
        out[key] = v.slice(1, -1);
      }
    } else if (v.startsWith('[')) {
      try {
        out[key] = JSON.parse(v);
      } catch {
        out[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      }
    } else out[key] = v.replace(/^'|'$/g, '');
  }
  return out;
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

// The pictures' paths follow the page's file, like Hugo's .File.Dir + .File.ContentBaseName:
// content/en/blog/unknown-birth-time.md → static/og/en/blog/unknown-birth-time.jpg (link previews,
// 1200×630) and static/pin/en/blog/unknown-birth-time.jpg (Pinterest, 1000×1500, which the blog's
// feed points to). A page bundle (…/saturn/index.md) is named after its folder, inside it:
// …/saturn/saturn.jpg. JPEG keeps them light for the crawlers that fetch them.
async function siteJobs() {
  const jobs = [];
  if (!existsSync(CONTENT)) return jobs;
  for (const lang of await readdir(CONTENT)) {
    for (const section of ['blog', 'astrology']) {
      const dir = path.join(CONTENT, lang, section);
      if (!existsSync(dir)) continue;
      for (const file of await walk(dir)) {
        const name = path.basename(file);
        if (name.startsWith('_index')) continue;
        const fm = frontMatter(await readFile(file, 'utf8'));
        if (fm.draft === true) continue;
        const isBundle = name === 'index.md';
        const base = isBundle ? path.basename(path.dirname(file)) : path.basename(file, '.md');
        // the folder as Hugo's .File.Dir has it (a bundle's own folder included), so the template finds
        // the picture at .File.Dir + .File.ContentBaseName without knowing how the page was written
        const relDir = path.relative(path.join(CONTENT, lang), path.dirname(file));
        const w = words(lang);
        const job = {
          lang,
          label: esc((fm.categories && fm.categories[0]) || (section === 'blog' ? w.blog : w.astrology)),
          title: esc(fm.title || base),
          description: esc(fm.description || fm.summary || ''),
          glyph: fm.glyph,
          categories: fm.categories || [],
          source: file,
        };
        for (const [size, folder] of [['og', 'og'], ['pin', 'pin']]) {
          jobs.push({
            ...job,
            name: base,
            template: fm.glyph ? 'glyph' : 'cover',
            size,
            format: 'jpeg',
            file: path.join(ROOT, 'static', folder, lang, relDir, `${base}.jpg`),
          });
        }
      }
    }
  }
  return jobs;
}

/* ---------------------------------------------------------------------------------------------
   The manifest: what each site picture was drawn from */

const sha = (data) => createHash('sha256').update(data).digest('hex');

// Everything that shapes how a picture looks but isn't in the page itself: this script (layouts,
// type, words it writes), the meadow stills and the fonts. Change any of them and every picture
// is redrawn once.
async function lookHash() {
  const files = [fileURLToPath(import.meta.url)];
  for (const dir of [MEDIA, FONTS]) {
    for (const name of (await readdir(dir)).sort()) if (/\.(jpe?g|png|webp|woff2)$/i.test(name)) files.push(path.join(dir, name));
  }
  const h = createHash('sha256');
  for (const f of files) h.update(path.basename(f)).update(await readFile(f));
  return h.digest('hex');
}

// A page's picture changes only when what it shows changes: its template and size, language,
// title, description, symbol, categories and the label drawn from them.
function pictureHash(job, look) {
  const { template, size, lang, title, description, glyph, categories, label, format } = job;
  return sha(JSON.stringify({ v: 1, look, template, size, lang, title, description, glyph: glyph || '', categories, label, format }));
}

async function readManifest() {
  try {
    const data = JSON.parse(await readFile(MANIFEST, 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

async function writeManifest(manifest) {
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
}

/* ---------------------------------------------------------------------------------------------
   Rendering */

async function loadPlaywright() {
  const tries = ['playwright', process.env.PLAYWRIGHT_MODULE, '/opt/node22/lib/node_modules/playwright/index.mjs'].filter(Boolean);
  for (const t of tries) {
    try {
      return await import(t.startsWith('/') ? pathToFileURL(t).href : t);
    } catch {
      // next
    }
  }
  throw new Error('Playwright is not installed: run `npm install` in tools/brand-images, then `npx playwright install chromium`.');
}

function parseArgs(argv) {
  const args = { files: [], out: path.join(HERE, 'out'), site: false, force: false, workers: 3 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = path.resolve(argv[++i]);
    else if (a === '--site') args.site = true;
    else if (a === '--force') args.force = true;
    else if (a === '--workers') args.workers = Math.max(1, Number(argv[++i]) || 1);
    else if (a === '-h' || a === '--help') args.help = true;
    else args.files.push(path.resolve(a));
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.site && !args.files.length)) {
    console.log(`Usage:
  node render.mjs <job.json> [more.json…] [--out <dir>]   pictures from job files (default out: tools/brand-images/out)
  node render.mjs --site [--force]                        for every blog and encyclopaedia page: a link preview
                                                          (static/og/…/<page>.jpg) and a Pinterest pin (static/pin/…/<page>.jpg);
                                                          only what changed is redrawn (tools/brand-images/.cache/manifest.json)
See README.md for the job format.`);
    return;
  }

  // Every render: { file, d, html }
  const renders = [];
  for (const file of args.files) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    const jobs = Array.isArray(parsed) ? parsed : parsed.jobs || [parsed];
    for (const job of jobs) {
      for (const r of expand(job)) {
        const bg = background(job, r.d, path.dirname(file));
        const jpeg = /^jpe?g$/i.test(String(job.format || ''));
        renders.push({ file: path.join(args.out, `${job.name}${r.suffix}.${jpeg ? 'jpg' : 'png'}`), jpeg, d: r.d, html: pageHTML({ d: r.d, lang: job.lang, bg, cls: r.cls, body: r.body, css: r.css }) });
      }
    }
  }
  let skipped = 0;
  let manifest = null;
  if (args.site) {
    manifest = await readManifest();
    const look = await lookHash();
    const seen = new Set();
    for (const job of await siteJobs()) {
      const key = path.relative(ROOT, job.file).split(path.sep).join('/');
      const hash = pictureHash(job, look);
      seen.add(key);
      // the same words, the same look and the picture still there: nothing to draw
      if (!args.force && manifest[key] === hash && existsSync(job.file)) {
        skipped++;
        continue;
      }
      const [r] = expand(job);
      renders.push({ file: job.file, key, hash, jpeg: true, d: r.d, html: pageHTML({ d: r.d, lang: job.lang, bg: background(job, r.d), cls: r.cls, body: r.body, css: r.css }) });
    }
    // pages that are gone leave the manifest (their pictures stay where they are; nothing is deleted)
    for (const key of Object.keys(manifest)) if (!seen.has(key)) delete manifest[key];
  }
  if (!renders.length) {
    if (manifest) await writeManifest(manifest);
    console.log(`rendered 0, skipped ${skipped}${skipped ? ' — every picture is up to date (--force redraws them)' : ''}`);
    return;
  }

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'astrostudy-pictures-'));
  let failed = 0;
  let rendered = 0;
  try {
    const context = await browser.newContext({ deviceScaleFactor: 1 });
    let next = 0;
    const worker = async (k) => {
      const page = await context.newPage();
      while (next < renders.length) {
        const r = renders[next++];
        try {
          const html = path.join(tmp, `p${k}-${next}.html`);
          await writeFile(html, r.html);
          await page.setViewportSize({ width: r.d.w, height: r.d.h });
          await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
          await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
          const warnings = await page.evaluate('window.__warnings || []');
          await mkdir(path.dirname(r.file), { recursive: true });
          const shot = r.jpeg ? { type: 'jpeg', quality: 86 } : { type: 'png' };
          await page.screenshot({ path: r.file, ...shot, clip: { x: 0, y: 0, width: r.d.w, height: r.d.h } });
          // a short path when the picture is under where you are, the full one otherwise
          const rel = path.relative(process.cwd(), r.file);
          const shown = rel && !rel.startsWith('..') ? rel : r.file;
          console.log(`wrote ${shown} (${r.d.w}×${r.d.h})`);
          for (const w of warnings) console.warn(`  warning: ${shown}: ${w}`);
          rendered++;
          if (manifest && r.key) manifest[r.key] = r.hash;
        } catch (err) {
          failed++;
          console.error(`failed ${r.file}: ${err.message}`);
        }
      }
      await page.close();
    };
    await Promise.all(Array.from({ length: Math.min(args.workers, renders.length) }, (_, k) => worker(k)));
  } finally {
    await browser.close();
    await rm(tmp, { recursive: true, force: true });
    // written even after a failure, so what did get drawn isn't drawn again next time
    if (manifest) await writeManifest(manifest);
  }
  console.log(`rendered ${rendered}, skipped ${skipped}${failed ? `, failed ${failed}` : ''}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
