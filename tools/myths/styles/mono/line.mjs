// An outline and nothing else: a firm line round the figure's edge and a fine one just inside it, as an engraver
// outlines a letter. Parts too thin to hold the inner line keep only the outer one. Both are measured with the exact
// distance from the edge, so the inner line keeps its distance round every curve.
import { placed, svgDoc } from '../common.mjs';

export const name = 'line';
export const title = 'Line';
export const about = 'An outline only: a firm line round the edge and a fine one just inside it.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'ln', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  const ink = new Float32Array(S * S);
  for (let i = 0; i < S * S; i += 1) {
    const edge = m[i] ? din[i] - 0.5 : dout[i] - 0.5;
    let v = K.cover(edge, 2.6);
    if (m[i]) v = Math.max(v, K.cover(Math.abs(din[i] - 15), 1.1));
    ink[i] = v;
  }
  return K.picture(ink, S);
}
