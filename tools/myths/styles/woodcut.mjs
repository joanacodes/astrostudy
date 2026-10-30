// A woodcut, or a linocut: what is left standing on the block prints black, every stroke of the gouge prints as the
// white of the paper. The figure is cut clear with a ring of black left round it, rays are cut into the sky behind,
// the ground is cut in strokes, and lines across the figure's shadow side are left standing for its shade.
import { figureMask, middle, noise, placed, random, svgDoc } from './common.mjs';

export const name = 'woodcut';
export const title = 'Woodcut';
export const about = 'A relief print: what the gouge cut away is the white of the paper, what was left standing on the block prints black.';

const INK = '#17130f';
const PAPER = '#f0e8d8';

// ink, paper and the block's margin can be given, for the black-and-white set's full-bleed block
export function svg(fig, { ink = INK, paper = PAPER, margin = 70, grain = true } = {}) {
  const rnd = random(77);
  // a figure that stands on nothing (a symbol) is set in the middle of the block with no ground under it, no sun is cut
  // where its open spaces would show it (a point inside a ring makes another symbol), and its rings and loops stay shut
  const floats = Boolean(fig.floating);
  const at = { s: 0.78, dy: floats ? 0 : 14 };
  const figure = placed(fig, { ...at, fill: paper, ids: 'wc1' });
  const halo = placed(floats && fig.solid ? { draw: fig.solid } : fig, { ...at, fill: '#000', ids: 'wc2' });
  // rays cut from behind the middle of the figure out to the edge of the block, each a thin wedge widening as it goes;
  // they start a little way out from a small cut sun, which shows wherever the figure does not cover it (cut all the
  // way in, the wedges would run together into a grey blur where they meet)
  const c = middle(fig, at);
  let rays = floats ? '' : `M${c[0] - 30} ${c[1]} a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z `;
  for (let i = 0; i < 70; i += 1) {
    const a = (i / 70) * 2 * Math.PI + rnd() * 0.02;
    const w = (0.55 + rnd() * 0.5) * (Math.PI / 180);
    const [r0, r] = [52, 760];
    const at2 = (q, b) => `${(c[0] + q * Math.cos(b)).toFixed(1)} ${(c[1] + q * Math.sin(b)).toFixed(1)}`;
    rays += `M${at2(r0, a - w * 0.07)} L${at2(r, a - w)} L${at2(r, a + w)} L${at2(r0, a + w * 0.07)} Z `;
  }
  // the ground, cut in long strokes, each a thin lens
  let ground = '';
  for (let y = 838; !floats && y < 920; y += 13) {
    for (let x = 80 + rnd() * 40; x < 920;) {
      const len = 60 + rnd() * 140;
      const t = 2 + rnd() * 2.5;
      const x2 = Math.min(920, x + len);
      ground += `M${x.toFixed(1)} ${y} Q${((x + x2) / 2).toFixed(1)} ${(y - t).toFixed(1)} ${x2.toFixed(1)} ${y} Q${((x + x2) / 2).toFixed(1)} ${(y + t).toFixed(1)} ${x.toFixed(1)} ${y} Z `;
      x = x2 + 12 + rnd() * 30;
    }
  }
  const defs = figure.defs + halo.defs + noise('wc-paper', 0.8, 2, 2)
    // cut edges are never quite straight
    + '<filter id="wc-rough" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="8"/><feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>'
    // and the ink never takes everywhere: specks of paper show through the black
    + '<filter id="wc-specks" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -9.6"/></filter>'
    + '<mask id="wc-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/><rect width="1000" height="1000" filter="url(#wc-specks)"/></mask>'
    + '<filter id="wc-grow" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feMorphology operator="dilate" radius="15"/></filter>'
    + `<mask id="wc-free" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/><g filter="url(#wc-grow)">${halo.body}</g></mask>`
    + figureMask('wc-shade', fig, at, [-13, -15])
    + `<pattern id="wc-lines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="10" height="3.8" fill="${ink}"/></pattern>`
    + `<clipPath id="wc-block"><rect x="${margin}" y="${margin}" width="${1000 - 2 * margin}" height="${1000 - 2 * margin}"/></clipPath>`;
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${paper}"/>`,
    grain ? '<rect width="1000" height="1000" filter="url(#wc-paper)" opacity=".07" style="mix-blend-mode:multiply"/>' : '',
    '<g filter="url(#wc-rough)"><g mask="url(#wc-ink)">',
    `<rect x="${margin}" y="${margin}" width="${1000 - 2 * margin}" height="${1000 - 2 * margin}" fill="${ink}"/>`,
    `<g clip-path="url(#wc-block)" mask="url(#wc-free)" fill="${paper}"><path d="${rays}"/><path d="${ground}"/></g>`,
    figure.body,
    '<rect width="1000" height="1000" fill="url(#wc-lines)" mask="url(#wc-shade)"/>',
    '</g></g>',
  ].join(''));
}
