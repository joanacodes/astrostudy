// Athenian red-figure, as from about 530 BC: the figure left in the colour of the clay and the ground round it
// painted black, so it glows out of the glaze; a band of tongues on the shoulder above, and the ground line below a
// meander broken by saltire squares, as the red-figure painters drew it.
import { CLAY, GLAZE, meander } from './black-figure.mjs';
import { noise, placed, svgDoc } from './common.mjs';

export const name = 'red-figure';
export const title = 'Red-figure vase';
export const about = 'Athenian vase painting from about 530 BC: the figure left in the orange clay, the ground painted black.';

// glazed tongues hanging from a line, with a narrow strip of clay left between each and the next
function tongues(y, h, x0, x1, ink) {
  const n = Math.round((x1 - x0) / (h * 0.74));
  const wid = (x1 - x0) / n;
  let d = '';
  // the tongues stop short of the band's foot, so their rounded ends stand out against the clay
  const len = h * 0.72;
  for (let i = 0; i < n; i += 1) {
    const a = x0 + i * wid + wid * 0.08;
    const b = a + wid * 0.84;
    const r = (b - a) / 2;
    d += `M${a.toFixed(1)} ${y} V${(y + len - r).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${b.toFixed(1)} ${(y + len - r).toFixed(1)} V${y} Z`;
  }
  return `<rect x="${x0}" y="${y - 7}" width="${x1 - x0}" height="7" fill="${ink}"/><path d="${d}" fill="${ink}"/>`;
}

export function svg(fig) {
  const at = { s: 0.84, dy: 21 };
  const f = placed(fig, { ...at, fill: CLAY, ids: 'rf' });
  const defs = f.defs + noise('rf-mottle', 0.01, 4, 21) + noise('rf-grain', 0.7, 1, 5)
    // the black glaze has a sheen, brightest where the pot's curve turns to the light
    + '<radialGradient id="rf-gloss" cx=".3" cy=".42" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${GLAZE}"/>`,
    '<rect width="1000" height="1000" fill="url(#rf-gloss)"/>',
    `<rect x="0" y="92" width="1000" height="70" fill="${CLAY}"/>`, tongues(99, 63, 0, 1000, GLAZE),
    `<rect x="0" y="850" width="1000" height="66" fill="${CLAY}"/>`, meander(852, 62, 0, 1000, GLAZE, 3),
    f.body,
    '<rect width="1000" height="1000" filter="url(#rf-mottle)" opacity=".2" style="mix-blend-mode:multiply"/>',
    '<rect width="1000" height="1000" filter="url(#rf-grain)" opacity=".07" style="mix-blend-mode:multiply"/>',
  ].join(''));
}
