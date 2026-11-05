// Stipple, as engravers built tone with the point and dotwork tattooists do now: nothing but dots, packed closer
// where it is darker. The figure darkens toward its edges and on the side away from the light; behind it a moon
// shaded as a sphere, kept clear of the figure by a ring of bare paper; a fine line round the figure.
import { placed, svgDoc } from './common.mjs';

export const name = 'stipple';
export const title = 'Stipple';
export const about = 'Dotwork, as engravers stippled and tattooists work now: tone made of dots alone, closer together where it is darker.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'st', s: 0.74, dy: 20 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 3 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  // the light comes from the upper left, so a point is in the figure's shade when the figure ends just below and
  // to the right of it
  const [sx, sy] = [26, 30];
  const moon = { x: 1180, y: 820, r: 640 };
  const L = [-0.5, -0.6, 0.62].map((v) => v / Math.hypot(-0.5, -0.6, 0.62));
  const tone = (x, y) => {
    const i = y * S + x;
    if (m[i]) {
      let t = 0.42 + 0.4 * Math.exp(-din[i] / 40);
      const xs = x + sx;
      const ys = y + sy;
      if (xs >= S || ys >= S || !m[ys * S + xs]) t += 0.3;
      return Math.min(0.97, t);
    }
    const nx = (x - moon.x) / moon.r;
    const ny = (y - moon.y) / moon.r;
    const q = nx * nx + ny * ny;
    if (q > 1 || dout[i] < 28) return 0;
    const lit = Math.max(0, nx * L[0] + ny * L[1] + Math.sqrt(1 - q) * L[2]);
    return 0.03 + 0.3 * (1 - lit) ** 1.6;
  };
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  g.fillStyle = '#f5f0e6';
  g.fillRect(0, 0, S, S);
  g.fillStyle = '#1c1916';
  const step = 5;
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      const px = x + rnd() * step;
      const py = y + rnd() * step;
      const t = tone(Math.min(S - 1, px | 0), Math.min(S - 1, py | 0));
      if (t <= 0 || rnd() > t) continue;
      g.beginPath();
      g.arc(px, py, 1.5 + 1.6 * t, 0, Math.PI * 2);
      g.fill();
    }
  }
  // the outline, drawn last and fine
  const img = g.getImageData(0, 0, S, S);
  for (let i = 0; i < S * S; i += 1) {
    if (m[i] && din[i] < 2.2) {
      img.data[i * 4] = 28;
      img.data[i * 4 + 1] = 25;
      img.data[i * 4 + 2] = 22;
    }
  }
  g.putImageData(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}
