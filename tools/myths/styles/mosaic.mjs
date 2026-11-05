// A black-and-white floor mosaic of the kind laid at Ostia in the second century AD: the figure in black stone
// tesserae on a white marble ground, the rows of tesserae following the figure's outline inside it and round it,
// the rest of the ground in straight courses, framed by black bands; grey mortar between the stones.
import { placed, svgDoc } from './common.mjs';

export const name = 'mosaic';
export const title = 'Roman mosaic';
export const about = 'A black-and-white floor mosaic like those at Ostia, second century AD: stone tesserae, the rows following the figure.';

// the stones: for the figure (and the border bands) and for the ground, the usual stone, an odd one and how many
// of the odd ones there are; and the mortar
export const STONES = {
  figure: { main: [42, 38, 36], odd: [74, 64, 57], share: 0.2 },
  ground: { main: [238, 232, 219], odd: [224, 213, 190], share: 0.14 },
  mortar: [178, 170, 154],
};

export function args(fig, { s = 0.8, stones = STONES, type = 'image/jpeg' } = {}) {
  const f = placed(fig, { fill: '#fff', ids: 'mo', s });
  return { svg: svgDoc(f.defs, f.body, 2000), S: 2000, T: 20, seed: 11, stones, type };
}

// runs in the page, with canvas-kit.js loaded
export async function paint({ svg, S, T, seed, stones, type }) {
  const K = window.kit;
  const rnd = K.random(seed);
  const m = await K.mask(svg, S);
  const ground = m.map((v) => 1 - v);
  const din = K.distance(ground, S);
  const dout = K.distance(m, S);
  const pts = new K.Points(S, T);
  const band = (on, dist, target) => {
    const c = [];
    for (let i = 0; i < S * S; i += 1) if (on(i) && Math.abs(dist[i] - target) < 0.75) c.push(i);
    return c;
  };
  // rows inside the figure, one within another, following its outline inwards
  for (let k = 0; ; k += 1) {
    const c = band((i) => m[i], din, T * (k + 0.5));
    if (!c.length) break;
    K.scatter(c, S, T * 0.92, rnd, pts, 1);
  }
  // parts narrower than a tessera get one row along their middle
  const thin = [];
  for (let y = 1; y < S - 1; y += 1) {
    for (let x = 1; x < S - 1; x += 1) {
      const i = y * S + x;
      if (m[i] && din[i] < T * 0.5 && din[i] >= din[i - 1] && din[i] >= din[i + 1] && din[i] >= din[i - S] && din[i] >= din[i + S]) thin.push(i);
    }
  }
  K.scatter(thin, S, T * 0.72, rnd, pts, 1);
  // two rows of the white ground laid round the figure
  for (let k = 0; k < 2; k += 1) K.scatter(band((i) => !m[i], dout, T * (k + 0.5)), S, T * 0.92, rnd, pts, 0);
  // the rest of the ground in straight courses; at the edge, two black bands with a white one between
  const n = S / T;
  for (let gy = 0; gy < n; gy += 1) {
    for (let gx = 0; gx < n; gx += 1) {
      const x = (gx + 0.5) * T + (rnd() - 0.5) * 2;
      const y = (gy + 0.5) * T + (rnd() - 0.5) * 2;
      const i = Math.floor(y) * S + Math.floor(x);
      if (m[i] || dout[i] < T * 2.3 || pts.crowded(x, y, T * 0.78)) continue;
      const edge = Math.min(gx, gy, n - 1 - gx, n - 1 - gy);
      pts.add(x, y, edge < 2 || edge === 3 ? 2 : 0);
    }
  }
  // each stone its own shade, a few of an odd colour (creamier marble, browner limestone)
  const col = new Float32Array(pts.x.length * 3);
  for (let i = 0; i < pts.x.length; i += 1) {
    const v = rnd();
    const kind = pts.tag[i] === 0 ? stones.ground : stones.figure;
    const c = v < kind.share ? kind.odd : kind.main;
    const j = (rnd() - 0.5) * 16;
    col.set([c[0] + j, c[1] + j, c[2] + j], i * 3);
  }
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d');
  const img = g.createImageData(S, S);
  const d = img.data;
  const near = [0, 0, 0, 0];
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      pts.nearest2(x + 0.5, y + 0.5, near);
      const p = (y * S + x) * 4;
      if (near[3] - near[1] < 2.2) {
        d[p] = stones.mortar[0];
        d[p + 1] = stones.mortar[1];
        d[p + 2] = stones.mortar[2];
      } else {
        // each stone a little domed: darker toward its edges
        const s = 1 - 0.1 * Math.min(1, near[1] / (T * 0.62)) ** 2;
        const k = near[0] * 3;
        d[p] = col[k] * s;
        d[p + 1] = col[k + 1] * s;
        d[p + 2] = col[k + 2] * s;
      }
      d[p + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return canvas.toDataURL(type, 0.92);
}
