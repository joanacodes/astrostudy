// Op art: the whole picture ruled in level lines, and where they cross the figure they swell and lift, as if laid
// over a relief of it, so the figure stands out of the lines themselves.
import { placed, svgDoc } from '../common.mjs';

export const name = 'op-art';
export const title = 'Ruled lines';
export const about = 'The picture ruled in level lines that swell and lift where they cross the figure, as if laid over a relief of it.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'op', s: 0.88 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const soft = K.blur(m, S, 12);
  const gap = 15;
  const lift = 30;
  const ink = new Float32Array(S * S);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const i = y * S + x;
      // the relief: smooth, but with a step at the figure's edge, so its outline stays sharp in the lines
      const h = Math.max(soft[i], m[i] * 0.75);
      const v = y + lift * h;
      ink[i] = K.cover(Math.abs(v - Math.round(v / gap) * gap), 0.9 + 3.6 * h);
    }
  }
  return K.picture(ink, S);
}
