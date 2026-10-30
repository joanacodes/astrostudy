// What the style samples share: the figure placed on the 1000 × 1000 canvas, the SVG document around it, a seeded
// random source (so a style renders the same every time) and the filters several styles use.
import { readFileSync } from 'node:fs';
import { toParts } from '../silhouettes/lib.mjs';

// the figure's markup in `fill`, scaled by s about the canvas centre, then moved by (dx, dy); `ids` must differ for
// every copy of the figure in one document, since its cut-outs are masks with ids
export function placed(fig, { fill = '#fff', ids = 'f', s = 1, dx = 0, dy = 0 } = {}) {
  const { defs, body } = toParts(fig.draw(), { fg: fill, ids });
  return { defs, body: `<g transform="translate(${500 + dx} ${500 + dy}) scale(${s}) translate(-500 -500)">${body}</g>` };
}

// the middle of the figure's bounding box as placed (from the points of its outlines, near enough for placing things
// behind it)
export function middle(fig, { s = 1, dx = 0, dy = 0 } = {}) {
  const pts = toParts(fig.draw()).body.match(/[ML]-?[\d.]+ -?[\d.]+/g).map((p) => p.slice(1).split(' ').map(Number));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const mid = (lo, hi, d) => 500 + ((lo + hi) / 2 - 500) * s + d;
  return [mid(Math.min(...xs), Math.max(...xs), dx), mid(Math.min(...ys), Math.max(...ys), dy)];
}

export const svgDoc = (defs, body, size = 1000) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${size}" height="${size}"><defs>${defs}</defs>${body}</svg>`;

// a mask that lets through only the figure (placed as given); `away` shifts a second copy that is taken out again,
// which leaves the band along the figure's edges on the side away from the shift: its shadow side
export function figureMask(id, fig, at, away = null) {
  const a = placed(fig, { ...at, fill: '#fff', ids: `${id}a` });
  const b = away && placed(fig, { ...at, dx: (at.dx || 0) + away[0], dy: (at.dy || 0) + away[1], fill: '#000', ids: `${id}b` });
  return `${a.defs}${b ? b.defs : ''}<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">`
    + `<rect width="1000" height="1000" fill="#000"/>${a.body}${b ? b.body : ''}</mask>`;
}

// mulberry32: a small seeded generator
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// fractal noise in grey, opaque: laid over a surface at low opacity it gives paper, clay or metal its grain
export const noise = (id, freq, octaves = 3, seed = 1) => `<filter id="${id}" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
  + `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}"/>`
  + '<feColorMatrix values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/></filter>';

// a line `w` wide along the edges of whatever the filter is applied to, centred on them, in `colour`
export const edge = (id, w, colour) => `<filter id="${id}" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse">`
  + `<feMorphology in="SourceAlpha" operator="dilate" radius="${w / 2}" result="out"/>`
  + `<feMorphology in="SourceAlpha" operator="erode" radius="${w / 2}" result="in"/>`
  + `<feComposite in="out" in2="in" operator="out" result="ring"/><feFlood flood-color="${colour}"/>`
  + '<feComposite in2="ring" operator="in"/></filter>';

// light falling from the upper left on a relief whose height is the blurred alpha of what the filter is applied to:
// `diffuse` gives the shading (a flat surface comes out mid-grey, for an overlay), `specular` the highlights (for a screen)
export const relief = (id, { blur = 3, height = 6, kind = 'diffuse', elevation = 42, exponent = 30, constant = 0.8 } = {}) => `<filter id="${id}" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
  + `<feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="h"/>`
  + (kind === 'diffuse'
    ? `<feDiffuseLighting in="h" surfaceScale="${height}" diffuseConstant="${(0.5 / Math.sin((elevation * Math.PI) / 180)).toFixed(3)}" lighting-color="#fff"><feDistantLight azimuth="225" elevation="${elevation}"/></feDiffuseLighting>`
    : `<feSpecularLighting in="h" surfaceScale="${height}" specularConstant="${constant}" specularExponent="${exponent}" lighting-color="#fff"><feDistantLight azimuth="225" elevation="${elevation}"/></feSpecularLighting>`)
  + '</filter>';

// a soft shadow under whatever the filter is applied to, as of a thing lying a little above the surface
export const dropShadow = (id, dy, blur, opacity, colour = '#000') => `<filter id="${id}" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse">`
  + `<feDropShadow dx="${dy * 0.3}" dy="${dy}" stdDeviation="${blur}" flood-color="${colour}" flood-opacity="${opacity}"/></filter>`;

// the site's own serif, inlined, for lettering
const font = (file) => readFileSync(new URL(`../../../static/fonts/${file}`, import.meta.url)).toString('base64');
export const fraunces = () => '<style>'
  + `@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${font('fraunces-normal-latin.woff2')}) format("woff2")}`
  + `@font-face{font-family:"Fraunces";font-style:italic;font-weight:100 900;src:url(data:font/woff2;base64,${font('fraunces-italic-latin.woff2')}) format("woff2")}`
  + '</style>';

// a four-pointed sparkle
export const sparkle = (x, y, r, fill) => {
  const k = r * 0.22;
  return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z" fill="${fill}"/>`;
};
