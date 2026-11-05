// A plate of a star atlas engraved in copper, as Hevelius's of 1690: the constellation's figure drawn in hatching
// over the grid of the heavens, the stars set over it by their brightness, the ecliptic running across, the plate
// framed by a graduated border. The stars here are placed for the look only, not where the real ones are.
import { edge, figureMask, fraunces, noise, placed, random, svgDoc } from './common.mjs';

export const name = 'star-atlas';
export const title = 'Star-atlas engraving';
export const about = 'A copper-engraved plate of a star atlas of the 1600s: the figure hatched over the grid of the sky, in a graduated border.';

const INK = '#2a2219';
const PAPER = '#eee1c3';

// an engraved star: rays round a point, as many and as long as the star is bright
function star(x, y, mag) {
  if (mag >= 4) return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(7 - mag) * 0.75}" fill="${INK}"/>`;
  const r = [0, 11, 8.5, 6.2][mag];
  const n = 8;
  const pts = [];
  for (let i = 0; i < n * 2; i += 1) {
    const a = (i / (n * 2)) * 2 * Math.PI - Math.PI / 2;
    const q = i % 2 ? r * 0.3 : r;
    pts.push(`${(x + q * Math.cos(a)).toFixed(1)} ${(y + q * Math.sin(a)).toFixed(1)}`);
  }
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 3}" fill="${PAPER}"/><path d="M${pts.join(' L')} Z" fill="${INK}"/>`;
}

export function svg(fig) {
  const rnd = random(1690);
  const at = { s: 0.74, dy: 30 };
  const f = placed(fig, { ...at, fill: '#000', ids: 'sa' });
  // the grid: circles of declination round a pole far above the plate, and hour circles running to it
  const pole = [500, -1500];
  const grid = [];
  for (let k = 0; k < 9; k += 1) grid.push(`<circle cx="${pole[0]}" cy="${pole[1]}" r="${1610 + k * 120}" fill="none"/>`);
  for (let k = -5; k <= 5; k += 1) {
    const a = Math.PI / 2 + (k * 4.2 * Math.PI) / 180;
    grid.push(`<path d="M${pole[0] + 1500 * Math.cos(a)} ${pole[1] + 1500 * Math.sin(a)} L${pole[0] + 3200 * Math.cos(a)} ${pole[1] + 3200 * Math.sin(a)}"/>`);
  }
  // the ecliptic: a band with its degrees marked, crossing the plate
  const ecl = (t, off = 0) => [62 + t * 876, 650 - t * 190 + off];
  let ticks = '';
  for (let i = 0; i <= 44; i += 1) {
    const [x1, y1] = ecl(i / 44, -7);
    const [x2, y2] = ecl(i / 44, i % 5 ? -2 : 3);
    ticks += `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} `;
  }
  // stars scattered by brightness: few bright, many faint
  const stars = [];
  for (let i = 0; i < 95; i += 1) {
    const x = 80 + rnd() * 840;
    const y = 150 + rnd() * 770;
    const v = rnd();
    stars.push(star(x, y, v < 0.04 ? 1 : v < 0.12 ? 2 : v < 0.26 ? 3 : v < 0.5 ? 4 : v < 0.75 ? 5 : 6));
  }
  // the graduated border: alternate degrees filled
  let scale = '';
  for (let i = 0; i < 44; i += 1) {
    if (i % 2) continue;
    const p = 62 + i * 19.9;
    scale += `M${p.toFixed(1)} 46 h19.9 v8 h-19.9 Z M${p.toFixed(1)} 946 h19.9 v8 h-19.9 Z M46 ${p.toFixed(1)} v19.9 h8 v-19.9 Z M946 ${p.toFixed(1)} v19.9 h8 v-19.9 Z `;
  }
  const defs = f.defs + fraunces() + noise('sa-grain', 0.9, 2, 4) + noise('sa-fox', 0.005, 4, 9)
    + `<pattern id="sa-h1" width="6.4" height="6.4" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><path d="M0 0 V6.4" stroke="${INK}" stroke-width="1.05"/></pattern>`
    + `<pattern id="sa-h2" width="4.8" height="4.8" patternUnits="userSpaceOnUse" patternTransform="rotate(-36)"><path d="M0 0 V4.8" stroke="${INK}" stroke-width=".95"/></pattern>`
    + figureMask('sa-fig', fig, at) + figureMask('sa-shade', fig, at, [-11, -13])
    + edge('sa-edge', 2.2, INK)
    + '<clipPath id="sa-plate"><rect x="62" y="62" width="876" height="876"/></clipPath>'
    + `<path id="sa-ecl" d="M${ecl(0.04, -12).join(' ')} L${ecl(0.5, -12).join(' ')}"/>`;
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${PAPER}"/>`,
    '<rect width="1000" height="1000" filter="url(#sa-fox)" opacity=".16" style="mix-blend-mode:multiply"/>',
    '<g clip-path="url(#sa-plate)">',
    `<g stroke="${INK}" stroke-width=".9" stroke-opacity=".5" fill="none">${grid.join('')}</g>`,
    `<path d="M${ecl(0, -7).join(' ')} L${ecl(1, -7).join(' ')} M${ecl(0, 3).join(' ')} L${ecl(1, 3).join(' ')}" stroke="${INK}" stroke-width="1.1" fill="none"/>`,
    `<path d="${ticks}" stroke="${INK}" stroke-width=".8"/>`,
    `<text font-family="Fraunces, serif" font-style="italic" font-size="17" letter-spacing="5" fill="${INK}"><textPath href="#sa-ecl">ECLIPTICA</textPath></text>`,
    '<rect width="1000" height="1000" fill="url(#sa-h1)" mask="url(#sa-fig)"/>',
    '<rect width="1000" height="1000" fill="url(#sa-h2)" mask="url(#sa-shade)"/>',
    `<g filter="url(#sa-edge)">${f.body}</g>`,
    stars.join(''),
    '</g>',
    `<rect x="40" y="40" width="920" height="920" fill="none" stroke="${INK}" stroke-width="3"/>`,
    `<rect x="62" y="62" width="876" height="876" fill="none" stroke="${INK}" stroke-width="1.2"/>`,
    `<path d="${scale}" fill="${INK}"/>`,
    `<path d="M46 46 H954 V954 H46 Z M54 54 H946 V946 H54 Z" fill="none" stroke="${INK}" stroke-width=".8"/>`,
    `<rect x="300" y="88" width="400" height="58" fill="${PAPER}"/>`,
    `<text x="500" y="130" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="40" letter-spacing="9" fill="${INK}">SAGITTARIUS</text>`,
    '<rect width="1000" height="1000" filter="url(#sa-grain)" opacity=".06" style="mix-blend-mode:multiply"/>',
  ].join(''));
}
