// Brush and ink: the outline laid down with a brush held at a slant, so the stroke swells where the edge runs across
// the slant and thins where it runs along it, wavers a little as a hand does, and breaks where the brush runs dry.
import { placed, svgDoc } from '../common.mjs';

export const name = 'brush';
export const title = 'Brush';
export const about = 'The outline in brush and ink: the stroke swells and thins with its direction, and breaks where the brush runs dry.';

export function args(fig) {
  const f = placed(fig, { fill: '#fff', ids: 'br', s: 0.9 });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, seed: 5 };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, seed }) {
  const K = window.kit;
  const m = await K.mask(svg, S);
  const din = K.distance(m.map((v) => 1 - v), S);
  const dout = K.distance(m, S);
  // the distance to the edge, negative inside the figure
  const sd = new Float32Array(S * S);
  for (let i = 0; i < S * S; i += 1) sd[i] = m[i] ? 0.5 - din[i] : dout[i] - 0.5;
  const waver = K.noise(S, 140, seed);
  const dry = K.noise(S, 5, seed + 1);
  const streak = K.noise(S, 30, seed + 2);
  const slant = Math.PI / 4;
  const ink = new Float32Array(S * S);
  for (let y = 1; y < S - 1; y += 1) {
    for (let x = 1; x < S - 1; x += 1) {
      const i = y * S + x;
      const d = sd[i];
      if (d < -16 || d > 16) continue;
      // the slope of the distance gives the edge's direction where this pixel is
      const a = Math.atan2(sd[i + S] - sd[i - S], sd[i + 1] - sd[i - 1]);
      const w = (1.6 + 6.4 * Math.abs(Math.sin(a - slant))) * (0.75 + 0.5 * waver[i]);
      let v = K.cover(Math.abs(d), w);
      // the bristles part more toward the sides of the stroke than in its middle
      if (v > 0 && dry[i] * (0.6 + (0.8 * Math.abs(d)) / w) > 0.84 + 0.1 * streak[i]) v = 0;
      ink[i] = v;
    }
  }
  return K.picture(ink, S);
}
