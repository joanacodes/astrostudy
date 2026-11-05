// Contour lines: the figure filled with lines that follow its outline inwards at an even spacing, like the contours
// of a map or the ridges of a fingerprint, and two echoes of the outline fading away round it.
import { placed, svgDoc } from '../common.mjs';

export const name = 'topographic';
export const title = 'Contour lines';
export const about = 'Lines following the outline inwards at an even spacing, like a map\'s contours, with echoes fading round it.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'tp', s: 0.86 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  const gap = 18;
  const ink = new Float32Array(S * S);
  for (let i = 0; i < S * S; i += 1) {
    if (m[i]) {
      ink[i] = K.cover(Math.abs(din[i] - Math.round(din[i] / gap) * gap), 2.2);
    } else if (dout[i] < gap * 2.5) {
      const k = Math.round(dout[i] / gap);
      if (k >= 1) ink[i] = K.cover(Math.abs(dout[i] - k * gap), 1.6) * (1 - dout[i] / (gap * 2.8));
    }
  }
  return K.picture(ink, S);
}
