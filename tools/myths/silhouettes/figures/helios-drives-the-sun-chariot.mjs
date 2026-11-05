// Helios, after the Helios metope from the temple of Athena at Troy (Berlin, Antikensammlung).
import { blob, chain, circle, cut, limb, line, poly } from '../lib.mjs';

export const slug = 'helios-drives-the-sun-chariot';
export const myth = 'Helios drives the sun chariot';
export const astrology = 'Sun';

const rad = (d) => (d * Math.PI) / 180;

// points drawn round (0, 0), scaled by k and set down at (x, y)
const at = (points, x, y, k = 1) => points.map(([u, v]) => [x + k * u, y + k * v]);

// the closed outline blob() draws through these points, sampled densely, so that it can be traced with a line
function outline(points, steps = 8) {
  const n = points.length;
  const q = (i) => points[(i + n) % n];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const [p0, p1, p2, p3] = [q(i - 1), q(i), q(i + 1), q(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let j = 0; j < steps; j += 1) {
      const t = j / steps;
      const u = 1 - t;
      out.push([0, 1].map((d) => u * u * u * p1[d] + 3 * u * u * t * c1[d] + 3 * u * t * t * c2[d] + t * t * t * p2[d]));
    }
  }
  return [...out, out[0]];
}

// a horse's forepart, leaping to the right, its breast at (0, 0): the arched neck, the head tucked in, the
// ears pricked, and the forelegs thrown up, folded at the knee
const NECK = [[-150, -30], [-95, -55], [-88, -95], [-70, -140], [-45, -175], [-15, -200], [8, -212], [30, -150],
  [24, -110], [14, -60], [4, -20], [0, 0], [-12, 30], [-70, 48], [-150, 52]];
const HEAD = [[10, -214], [24, -214], [40, -198], [62, -168], [80, -142], [92, -126], [96, -116], [90, -106],
  [82, -104], [68, -112], [52, -118], [36, -126], [24, -138], [14, -170], [6, -196]];
const EARS = [[[4, -208], [2, -236], [16, -212]], [[14, -212], [20, -240], [28, -206]]];
const NEAR = [[-18, 28, 18], [44, 22, 12], [38, 96, 9], [48, 112, 11]];
const FAR = [[-34, 36, 17], [18, 54, 12], [-2, 122, 9], [8, 138, 11]];

// one horse, and the thin gap that parts it from the horses behind it, as a black-figure painter incises it
// (only along the neck, head and legs: the body behind runs into the chariot and needs no line)
function horse(x, y, k, legs, gap) {
  const p = ([u, v]) => [x + k * u, y + k * v];
  const joints = (leg, g) => leg.map(([u, v, r]) => [...p([u, v]), k * r + g]);
  const neck = outline(NECK.map(p)).slice(8, 12 * 8 + 1); // from the withers, over the poll, down to the chest
  const parted = gap ? [
    cut(line(neck, 2 * gap)),
    cut(line(outline(HEAD.map(p)), 2 * gap)),
    ...legs.map((leg) => chain(joints(leg, gap)).map(cut)),
  ] : [];
  return [
    ...parted,
    blob(NECK.map(p)),
    blob(HEAD.map(p)),
    ...EARS.map((ear) => poly(ear.map(p))),
    ...legs.map((leg) => chain(joints(leg, 0))),
  ];
}

// the radiate crown: n rays round (cx, cy) from angle a0 to a1 (degrees), long and short in turn
function rays(cx, cy, n, a0, a1, r0, long, short, half) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const a = rad(a0 + ((a1 - a0) * i) / (n - 1));
    const r1 = i % 2 ? short : long;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    out.push(poly([[cx + r0 * c - half * s, cy + r0 * s + half * c], [cx + r1 * c, cy + r1 * s],
      [cx + r0 * c + half * s, cy + r0 * s - half * c]]));
  }
  return out;
}

// a wave breaking to the right: its back rising from the trough at (x, y) to the crest, then curling over
function wave(x, y, w, h, width) {
  const cx = x + 0.86 * w;
  const cy = y - 0.6 * h;
  const r0 = 0.4 * h;
  const pts = [[x, y], [x + 0.25 * w, y - 0.18 * h], [x + 0.5 * w, y - 0.55 * h], [x + 0.7 * w, y - 0.9 * h]];
  for (let i = 0; i <= 30; i += 1) {
    const t = i / 30;
    const a = rad(-90 + 400 * t);
    const r = r0 * (1 - 0.72 * t);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return line(pts, width);
}

// his face in profile, turned to the horses, young and beardless
const FACE = [[-4, -40], [16, -36], [28, -24], [32, -10], [31, -4], [40, 8], [32, 12], [34, 18], [31, 22], [32, 28],
  [26, 34], [14, 38], [8, 44], [-14, 38], [-28, 24], [-36, 6], [-36, -14], [-28, -30], [-16, -38]];

export function draw() {
  const team = [[549, 583, [NEAR, FAR]], [609, 523, [NEAR, FAR]], [669, 463, [NEAR, FAR]], [729, 403, [NEAR, FAR]]];
  const fist = [463, 375];
  const spokes = [0, 1, 2, 3, 4, 5].map((i) => rad(15 + i * 60));
  return [
    // the chariot wheel skimming the waves
    circle(341, 647, 74),
    cut(circle(341, 647, 60)),
    circle(341, 647, 14),
    ...spokes.map((a) => line([[341, 647], [341 + 64 * Math.cos(a), 647 + 64 * Math.sin(a)]], 8)),
    // the sea the horses rise from
    poly([[107, 851], [871, 851], [879, 869], [871, 887], [107, 887], [99, 869]]),
    ...[0, 1, 2, 3, 4].map((i) => wave(113 + i * 152, 863, 152, 128, 18)),
    // the four horses, each a step further and higher than the one before
    ...team.slice().reverse().map(([x, y, legs], i) => horse(x, y, 1, legs, i ? 4 : 0)),
    // the chariot box, drawn after the team so the lines that part the horses stop at its edge
    blob([[277, 459], [409, 453], [441, 483], [459, 543], [451, 583], [409, 603], [289, 603], [271, 543]]),
    // the reins, from his fist to the four mouths
    ...team.map(([x, y]) => line([fist, [x + 88, y - 108]], 4)),
    // Helios: the cloak streaming behind, the long belted chiton of a charioteer, the arm out with the reins
    blob([[301, 289], [265, 283], [221, 293], [179, 317], [145, 353], [119, 397], [149, 381], [167, 385], [139, 431],
      [181, 401], [221, 381], [259, 371], [289, 359]]),
    blob([[289, 297], [327, 289], [359, 301], [371, 331], [371, 375], [361, 401], [365, 429], [355, 473], [285, 475],
      [279, 429], [283, 401], [275, 375], [277, 323]]),
    chain([[355, 313, 17], [403, 363, 13], [451, 375, 10]]),
    blob(at([[-12, -10], [10, -12], [16, 0], [10, 12], [-12, 10]], ...fist)),
    limb(319, 265, 14, 311, 295, 17),
    blob(at(FACE, 327, 223, 1.05)),
    // the crown of rays
    ...rays(323, 221, 13, 150, 390, 44, 110, 86, 8),
  ];
}
