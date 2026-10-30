// Halftone: the figure printed as a screen of dots set at 45 degrees, each as large as the light is strong where it
// stands, as newspapers print a photograph; the dots stop at a fine line round the edge.
import { placed, svgDoc } from '../common.mjs';

export const name = 'halftone';
export const title = 'Halftone';
export const about = 'A screen of dots at 45 degrees, each as large as the light where it stands, as a newspaper prints a photograph.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'ht', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const lit = K.shade(m, S, 20, 44);
  const p = 15;
  const r2 = Math.SQRT1_2;
  const ink = new Float32Array(S * S);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const i = y * S + x;
      if (!m[i]) continue;
      if (din[i] < 1.8) {
        ink[i] = 1;
        continue;
      }
      // the centre of this pixel's dot on the turned screen, and the light there
      const cu = Math.round(((x + y) * r2) / p) * p;
      const cv = Math.round(((y - x) * r2) / p) * p;
      const cx = (cu - cv) * r2;
      const cy = (cu + cv) * r2;
      const c = Math.min(S - 1, Math.max(0, Math.round(cy))) * S + Math.min(S - 1, Math.max(0, Math.round(cx)));
      const t = m[c] ? 0.12 + 0.88 * Math.min(1, Math.max(0, (lit[c] - 0.15) / 0.8)) : 0.12;
      ink[i] = K.cover(Math.hypot(x - cx, y - cy), (p / 2) * Math.sqrt(t) * 1.15);
    }
  }
  return K.picture(ink, S);
}
