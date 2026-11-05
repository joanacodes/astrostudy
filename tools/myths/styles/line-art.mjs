// Fine line on a night sky, the way astrology is often drawn today: the figure in one even gold line with a faint
// glow, inside a ring marked like a dial, among stars.
import { edge, placed, random, sparkle, svgDoc } from './common.mjs';

export const name = 'line-art';
export const title = 'Gold line';
export const about = 'A modern celestial look: the figure in a single gold line on night blue, inside a fine ring among the stars.';

const GOLD = '#e3c27c';

export function svg(fig) {
  const rnd = random(9);
  const at = { s: 0.72, dy: 6 };
  const line = placed(fig, { ...at, fill: '#fff', ids: 'la1' });
  const glow = placed(fig, { ...at, fill: '#fff', ids: 'la2' });
  let dust = '';
  for (let i = 0; i < 330; i += 1) {
    const r = 0.35 + rnd() ** 3 * 1.5;
    dust += `<circle cx="${(rnd() * 1000).toFixed(1)}" cy="${(rnd() * 1000).toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  let ticks = '';
  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * 2 * Math.PI;
    const r2 = i % 6 ? 437 : 449;
    ticks += `M${(500 + 430 * Math.cos(a)).toFixed(1)} ${(500 + 430 * Math.sin(a)).toFixed(1)} L${(500 + r2 * Math.cos(a)).toFixed(1)} ${(500 + r2 * Math.sin(a)).toFixed(1)} `;
  }
  const spark = [[140, 150, 15], [860, 120, 11], [905, 860, 14], [95, 880, 10], [210, 820, 6], [800, 300, 7], [300, 120, 6], [700, 880, 8]]
    .map(([x, y, r]) => sparkle(x, y, r, GOLD)).join('');
  const defs = line.defs + glow.defs
    + '<radialGradient id="la-sky" cx=".5" cy=".46" r=".72"><stop offset="0" stop-color="#1c2a56"/><stop offset="1" stop-color="#0a1027"/></radialGradient>'
    + edge('la-line', 2.4, GOLD)
    + `<filter id="la-glow" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feMorphology in="SourceAlpha" operator="dilate" radius="1.4" result="o"/><feMorphology in="SourceAlpha" operator="erode" radius="1.4" result="i"/><feComposite in="o" in2="i" operator="out" result="r"/><feGaussianBlur in="r" stdDeviation="5" result="g"/><feFlood flood-color="${GOLD}" flood-opacity=".7"/><feComposite in2="g" operator="in"/></filter>`;
  return svgDoc(defs, [
    '<rect width="1000" height="1000" fill="url(#la-sky)"/>',
    dust,
    `<circle cx="500" cy="500" r="430" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity=".85"/>`,
    `<circle cx="500" cy="500" r="456" fill="none" stroke="${GOLD}" stroke-width=".7" opacity=".5"/>`,
    `<path d="${ticks}" stroke="${GOLD}" stroke-width=".9" opacity=".7"/>`,
    spark,
    `<g filter="url(#la-glow)">${glow.body}</g>`,
    `<g filter="url(#la-line)">${line.body}</g>`,
  ].join(''));
}
