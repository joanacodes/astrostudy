// Stipple in white: the figure built of light dots on black, packed closer and larger where the light falls on it,
// with a fine line round its edge; the way an engraver stipples, turned to white on black.
import { placed, svgDoc } from '../common.mjs';

export const name = 'stipple';
export const title = 'Stipple';
export const about = 'Built of dots alone, closer and larger where the light falls, with a fine line round the edge.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'sp', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 3 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const lit = K.shade(m, S, 20, 44);
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, S, S);
  g.fillStyle = '#fff';
  const step = 5;
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      const px = x + rnd() * step;
      const py = y + rnd() * step;
      const i = Math.min(S - 1, py | 0) * S + Math.min(S - 1, px | 0);
      if (!m[i]) continue;
      const t = 0.08 + 0.92 * Math.min(1, Math.max(0, (lit[i] - 0.15) / 0.8));
      if (rnd() > t) continue;
      g.beginPath();
      g.arc(px, py, 1.3 + 1.3 * t, 0, Math.PI * 2);
      g.fill();
    }
  }
  const img = g.getImageData(0, 0, S, S);
  for (let i = 0; i < S * S; i += 1) {
    if (m[i] && din[i] < 1.6) img.data.fill(255, i * 4, i * 4 + 3);
  }
  g.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}
