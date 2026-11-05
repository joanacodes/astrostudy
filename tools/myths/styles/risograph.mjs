// A risograph print: two inks, fluorescent pink and blue, laid one after the other through a stencil drum, so they
// overprint to violet where they cross, never quite in register, with the paper showing through the grain of each.
import { fraunces, placed, sparkle, svgDoc } from './common.mjs';

export const name = 'risograph';
export const title = 'Risograph';
export const about = 'A two-colour print from a risograph: fluorescent pink and blue overprinting, a little out of register, grainy.';

const PAPER = '#f3eee2';
const PINK = '#ff5c93';
const BLUE = '#2d5bd2';

// the grain of a drum: specks where the ink did not take, different for each pass
const grain = (id, seed, cut) => `<filter id="${id}f" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  12 0 0 0 ${-cut}"/></filter>`
  + `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/><rect width="1000" height="1000" filter="url(#${id}f)"/></mask>`;

export function svg(fig) {
  const at = { s: 0.74, dy: -6 };
  const blue = placed(fig, { ...at, dx: -5, dy: at.dy + 3, fill: BLUE, ids: 'ri1' });
  const shade = placed(fig, { ...at, dx: 16, dy: at.dy + 13, fill: PINK, ids: 'ri2' });
  const defs = blue.defs + shade.defs + fraunces() + grain('ri-g1', 3, 7.6) + grain('ri-g2', 9, 7.9)
    + `<pattern id="ri-dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="4.5" cy="4.5" r="2.7" fill="${PINK}"/></pattern>`
    + `<pattern id="ri-fine" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(70)"><circle cx="3.5" cy="3.5" r="1.5" fill="${BLUE}"/></pattern>`;
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${PAPER}"/>`,
    // the pink pass: a sun in halftone, the ground, and the figure's shadow
    '<g style="mix-blend-mode:multiply" mask="url(#ri-g1)">',
    '<circle cx="600" cy="400" r="300" fill="url(#ri-dots)"/>',
    `<circle cx="600" cy="400" r="300" fill="none" stroke="${PINK}" stroke-width="12"/>`,
    `<rect x="0" y="790" width="1000" height="210" fill="${PINK}"/>`,
    shade.body,
    '</g>',
    // the blue pass, set down a little off: the figure, some stars, a band of fine dots, the name
    '<g style="mix-blend-mode:multiply" mask="url(#ri-g2)" transform="translate(-3 2)">',
    blue.body,
    [[130, 150, 22], [220, 300, 12], [880, 130, 16], [90, 520, 10]].map(([x, y, r]) => sparkle(x, y, r, BLUE)).join(''),
    '<rect x="0" y="40" width="1000" height="56" fill="url(#ri-fine)"/>',
    `<text x="500" y="935" text-anchor="middle" font-family="Fraunces, serif" font-weight="800" font-size="92" letter-spacing="6" fill="${BLUE}">SAGITTARIUS</text>`,
    '</g>',
  ].join(''));
}
