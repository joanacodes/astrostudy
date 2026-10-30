// A stencil: the figure cut from a sheet and sprayed through it, so it is crossed by the bridges that hold the sheet
// together, and its edge carries a haze of overspray.
import { placed, svgDoc } from '../common.mjs';

export const name = 'stencil';
export const title = 'Stencil';
export const about = 'Sprayed through a cut sheet: crossed by the bridges that hold the sheet together, hazed with overspray at the edge.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'st', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 6 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  const a = Math.PI * 0.12;
  const [ca, sa] = [Math.cos(a), Math.sin(a)];
  const ink = new Float32Array(S * S);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const i = y * S + x;
      if (m[i]) {
        // the bridges: slanting bars across the figure at an even spacing
        const u = x * ca + y * sa;
        const bridge = Math.abs(u - Math.round(u / 150) * 150) < 5;
        ink[i] = bridge ? 0 : din[i] < 1 ? 0.85 : 1;
      } else if (dout[i] < 30 && rnd() < 0.55 * Math.exp(-dout[i] / 6)) {
        ink[i] = 0.85;
      }
    }
  }
  return K.picture(ink, S);
}
