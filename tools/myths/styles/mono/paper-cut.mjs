// A paper cut in the folk manner of the Chinese jianzhi or the Polish wycinanki: the figure cut whole from white paper,
// then pierced, with a row of holes along its edge, a fine cut line within, and stars and crescents in its body.
import { placed, svgDoc } from '../common.mjs';

export const name = 'paper-cut';
export const title = 'Paper cut';
export const about = 'Cut whole from white paper, then pierced: holes along the edge, a fine cut within, stars and crescents in the body.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'pc', s: 0.94 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 4 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  // the paper, with its cut line a little inside the edge
  const img = g.createImageData(S, S);
  for (let i = 0; i < S * S; i += 1) {
    const v = m[i] && !(Math.abs(din[i] - 24) < 1) ? 255 : 0;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.fillStyle = '#000';
  // the holes along the edge
  const near = [];
  const deep = [];
  for (let i = 0; i < S * S; i += 1) {
    if (!m[i]) continue;
    if (Math.abs(din[i] - 11) < 0.6) near.push(i);
    if (din[i] > 42) deep.push(i);
  }
  const holes = new K.Points(S, 24);
  K.scatter(near, S, 22, rnd, holes, 0);
  for (let i = 0; i < holes.x.length; i += 1) {
    g.beginPath();
    g.arc(holes.x[i], holes.y[i], 3.6, 0, Math.PI * 2);
    g.fill();
  }
  // stars and crescents in turn, where the body is broad enough to hold them
  const marks = new K.Points(S, 80);
  K.scatter(deep, S, 74, rnd, marks, 0);
  for (let j = 0; j < marks.x.length; j += 1) {
    const [x, y] = [marks.x[j], marks.y[j]];
    const r = Math.min(22, din[Math.floor(y) * S + Math.floor(x)] - 32);
    if (r < 8) continue;
    g.fillStyle = '#000';
    g.beginPath();
    if (j % 2) {
      for (let k = 0; k < 10; k += 1) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        const q = k % 2 ? r * 0.42 : r;
        g.lineTo(x + q * Math.cos(a), y + q * Math.sin(a));
      }
      g.fill();
    } else {
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(x + r * 0.38, y - r * 0.18, r * 0.82, 0, Math.PI * 2);
      g.fill();
    }
  }
  return canvas.toDataURL('image/png');
}
