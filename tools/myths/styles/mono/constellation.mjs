// A constellation: the figure as its stars, set along the middle of its body and limbs and joined by lines, over a
// faint dotted outline and a dust of fainter stars, the way star maps draw the figure of a sign.
import { placed, svgDoc } from '../common.mjs';

export const name = 'constellation';
export const title = 'Constellation';
export const about = 'The figure as stars along its body and limbs, joined by lines, over a faint dotted outline.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'cn', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 8 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  // the middle of the figure: points no nearer the edge than their neighbours
  const ridge = [];
  const rim = [];
  for (let y = 1; y < S - 1; y += 1) {
    for (let x = 1; x < S - 1; x += 1) {
      const i = y * S + x;
      if (!m[i]) continue;
      if (din[i] > 3 && din[i] >= din[i - 1] && din[i] >= din[i + 1] && din[i] >= din[i - S] && din[i] >= din[i + S]) ridge.push(i);
      if (Math.abs(din[i] - 0.8) < 0.5) rim.push(i);
    }
  }
  const stars = new K.Points(S, 90);
  K.scatter(ridge, S, 82, rnd, stars, 0);
  const dots = new K.Points(S, 12);
  K.scatter(rim, S, 11, rnd, dots, 0);
  // join the stars as a tree, shortest links first, each link only where it keeps inside the figure
  const n = stars.x.length;
  const links = [];
  for (let a = 0; a < n; a += 1) {
    for (let b = a + 1; b < n; b += 1) {
      const d = Math.hypot(stars.x[a] - stars.x[b], stars.y[a] - stars.y[b]);
      if (d > 230) continue;
      let inside = 0;
      const steps = Math.ceil(d / 4);
      for (let k = 0; k <= steps; k += 1) {
        const px = Math.round(stars.x[a] + ((stars.x[b] - stars.x[a]) * k) / steps);
        const py = Math.round(stars.y[a] + ((stars.y[b] - stars.y[a]) * k) / steps);
        inside += m[py * S + px];
      }
      if (inside / (steps + 1) >= 0.85) links.push([d, a, b]);
    }
  }
  links.sort((p, q) => p[0] - q[0]);
  const root = Array.from({ length: n }, (_, i) => i);
  const find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
  const tree = [];
  for (const [, a, b] of links) {
    if (find(a) !== find(b)) {
      root[find(a)] = find(b);
      tree.push([a, b]);
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, S, S);
  // the dust of faint stars
  for (let i = 0; i < 900; i += 1) {
    g.fillStyle = `rgba(255,255,255,${(0.15 + rnd() * 0.4).toFixed(2)})`;
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, 0.6 + rnd() ** 3 * 1.6, 0, Math.PI * 2);
    g.fill();
  }
  // the dotted outline: faint, but enough to tell the figure by when its stars are few
  g.fillStyle = 'rgba(255,255,255,.62)';
  for (let i = 0; i < dots.x.length; i += 1) {
    g.beginPath();
    g.arc(dots.x[i], dots.y[i], 2, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = 'rgba(255,255,255,.82)';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  for (const [a, b] of tree) {
    g.beginPath();
    g.moveTo(stars.x[a], stars.y[a]);
    g.lineTo(stars.x[b], stars.y[b]);
    g.stroke();
  }
  for (let i = 0; i < n; i += 1) {
    const [x, y] = [stars.x[i], stars.y[i]];
    const r = 4 + rnd() * 6;
    const glow = g.createRadialGradient(x, y, 0, x, y, r * 3.2);
    glow.addColorStop(0, 'rgba(255,255,255,.45)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = glow;
    g.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(x, y, r * 0.55, 0, Math.PI * 2);
    g.fill();
    // the brightest get four rays
    if (r > 8) {
      g.beginPath();
      for (let k = 0; k < 8; k += 1) {
        const q = k % 2 ? r * 0.3 : r * 2.6;
        g.lineTo(x + Math.cos((k * Math.PI) / 4) * q, y + Math.sin((k * Math.PI) / 4) * q);
      }
      g.closePath();
      g.fill();
    }
  }
  return canvas.toDataURL('image/png');
}
