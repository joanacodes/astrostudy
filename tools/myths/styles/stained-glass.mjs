// Stained glass: a round window whose panes are held in lead. The figure is pieced from warm glass, the sky round it
// from blues and violets cut in rings, as the panes of a rose window run; the light comes through brightest at the
// middle of each pane and from the upper left; the window is set in stone.
import { placed, svgDoc } from './common.mjs';

export const name = 'stained-glass';
export const title = 'Stained glass';
export const about = 'A round window of coloured glass held in lead: the figure in warm glass, the sky round it in blues.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'sg', s: 0.74, dy: 12 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 21 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  const C = S / 2;
  const R = S * 0.46;
  // panes of the figure: points scattered evenly through it
  const inner = new K.Points(S, 80);
  const cand = [];
  for (let i = 0; i < S * S; i += 1) if (m[i] && din[i] > 10) cand.push(i);
  K.scatter(cand, S, 70, rnd, inner, 0);
  // panes of the sky: rings round the middle, the panes larger toward the rim
  const outer = new K.Points(S, 160);
  outer.add(C, C, 0);
  for (let r = 90, ring = 1; r < R + 80; r += 120 + ring * 6, ring += 1) {
    const n = Math.max(6, Math.round((2 * Math.PI * r) / (130 + ring * 8)));
    const off = rnd() * Math.PI;
    for (let k = 0; k < n; k += 1) {
      const a = off + (k / n) * 2 * Math.PI + (rnd() - 0.5) * 0.12;
      outer.add(C + r * Math.cos(a), C + r * Math.sin(a), ring);
    }
  }
  const warm = [[236, 168, 60], [244, 200, 96], [221, 124, 46], [198, 84, 48], [242, 216, 140], [214, 150, 52]];
  // the sky's glass deepens from pale blues at the middle to deep blues and violets at the rim
  const cool = [
    [[78, 140, 206], [64, 150, 168], [92, 128, 196]],
    [[46, 96, 182], [44, 126, 146], [72, 84, 168]],
    [[30, 62, 140], [70, 54, 136], [24, 82, 120]],
    [[20, 40, 104], [52, 36, 108], [16, 54, 92]],
  ];
  const colIn = new Float32Array(inner.x.length * 3);
  for (let i = 0; i < inner.x.length; i += 1) colIn.set(warm[Math.floor(rnd() * warm.length)], i * 3);
  const colOut = new Float32Array(outer.x.length * 3);
  for (let i = 0; i < outer.x.length; i += 1) {
    const list = cool[Math.min(cool.length - 1, Math.floor(outer.tag[i] / 2))];
    colOut.set(list[Math.floor(rnd() * list.length)], i * 3);
  }
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  const img = g.createImageData(S, S);
  const d = img.data;
  const near = [0, 0, 0, 0];
  const LEAD = [30, 28, 27];
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const p = (y * S + x) * 4;
      const i = y * S + x;
      const r = Math.hypot(x - C, y - C);
      let c;
      if (r > R + 26) {
        // the stone round the window
        const n = 60 + (rnd() - 0.5) * 10;
        c = [n, n * 0.94, n * 0.88];
      } else if (r > R - 6) {
        c = LEAD;
      } else {
        const inside = m[i] === 1;
        const pts = inside ? inner : outer;
        pts.nearest2(x + 0.5, y + 0.5, near);
        const edge = inside ? din[i] : dout[i];
        if (edge < 9 || near[3] - near[1] < 9) {
          c = LEAD;
        } else {
          const col = inside ? colIn : colOut;
          const k = near[0] * 3;
          const glow = (0.74 + 0.36 * (1 - Math.min(1, near[1] / 80))) * (0.88 + 0.22 * (1 - (x + y) / (2 * S)));
          const n = 1 + (rnd() - 0.5) * 0.06;
          c = [col[k] * glow * n, col[k + 1] * glow * n, col[k + 2] * glow * n];
        }
      }
      d[p] = c[0];
      d[p + 1] = c[1];
      d[p + 2] = c[2];
      d[p + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}
