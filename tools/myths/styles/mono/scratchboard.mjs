// Scratchboard: a board inked black and the drawing scratched out of it, so every line is light. The figure is
// modelled in hatching that thickens where the light falls on it and crosses itself where it is brightest; its edge
// is scratched clean.
import { placed, svgDoc } from '../common.mjs';

export const name = 'scratchboard';
export const title = 'Scratchboard';
export const about = 'Scratched out of black: hatching that thickens where the light falls and crosses itself where it is brightest.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'sb', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const lit = K.shade(m, S, 20, 44);
  const a1 = Math.PI * 0.18;
  const a2 = -Math.PI * 0.27;
  const gap = 8;
  const ink = new Float32Array(S * S);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const i = y * S + x;
      if (!m[i]) continue;
      if (din[i] < 2.2) {
        ink[i] = 1;
        continue;
      }
      const t = Math.min(1, Math.max(0, (lit[i] - 0.25) / 0.7));
      const u1 = x * Math.cos(a1) + y * Math.sin(a1);
      let v = K.cover(Math.abs(u1 - Math.round(u1 / gap) * gap), 0.35 + 2.6 * t);
      if (t > 0.55) {
        const u2 = x * Math.cos(a2) + y * Math.sin(a2);
        v = Math.max(v, K.cover(Math.abs(u2 - Math.round(u2 / gap) * gap), (t - 0.55) * 4.5));
      }
      ink[i] = v;
    }
  }
  return K.picture(ink, S);
}
