// Cut paper in layers, stacked a little apart so each throws a soft shadow on the one behind: night sky, a moon
// in two rings, hills one behind another, the figure cut from pale paper standing on the nearest.
import { dropShadow, noise, placed, random, sparkle, svgDoc } from './common.mjs';

export const name = 'paper-cut';
export const title = 'Paper cut';
export const about = 'Layers of cut paper stacked a little apart, each throwing a soft shadow on the one behind.';

const SKY = '#1e3046';
const FIG = '#f2ede0';

// a hill line across the canvas through the given heights, smoothed, closed along the bottom
function hills(heights) {
  const n = heights.length - 1;
  const pts = heights.map((h, i) => [-20 + (i / n) * 1040, h]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` C${(x0 + (x1 - x0) / 2).toFixed(1)} ${y0} ${(x0 + (x1 - x0) / 2).toFixed(1)} ${y1} ${x1.toFixed(1)} ${y1}`;
  }
  return `${d} L1020 1020 L-20 1020 Z`;
}

export function svg(fig) {
  const rnd = random(12);
  const at = { s: 0.7, dy: 50 };
  const f = placed(fig, { ...at, fill: FIG, ids: 'pc' });
  const stars = Array.from({ length: 16 }, () => sparkle(60 + rnd() * 880, 50 + rnd() * 380, 5 + rnd() * 9, FIG)).join('');
  const defs = f.defs + dropShadow('pc-sh', 7, 7, 0.5, '#07111c') + noise('pc-paper', 0.6, 3, 5);
  const layer = (body) => `<g filter="url(#pc-sh)">${body}</g>`;
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${SKY}"/>`,
    layer(stars),
    layer('<circle cx="650" cy="350" r="290" fill="#294462"/>'),
    layer('<circle cx="650" cy="350" r="215" fill="#e6b067"/>'),
    layer(`<path d="${hills([700, 660, 690, 640, 600, 650, 700])}" fill="#2a5244"/>`),
    layer(`<path d="${hills([800, 780, 805, 822, 812, 790, 805])}" fill="#457453"/>`),
    layer(f.body),
    layer(`<path d="${hills([925, 905, 935, 915, 940, 912, 930])}" fill="#1d3f34"/>`),
    // the grain of the paper over every layer
    '<rect width="1000" height="1000" filter="url(#pc-paper)" opacity=".1" style="mix-blend-mode:multiply"/>',
  ].join(''));
}
