// Pisces as Aratus describes it (Phaenomena): two fish, Aphrodite and Eros fleeing Typhon, their tails bound by one cord.
import { circle, cut, line, poly } from '../lib.mjs';

export const slug = 'two-fish-bound-by-a-cord';
export const myth = 'The two fish bound by a cord';
export const astrology = 'Pisces';

// points along a smooth curve through the given points (Catmull-Rom, its ends held)
function smooth(points, steps = 12) {
  const out = [];
  const n = points.length;
  const p = (i) => points[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i += 1) {
    for (let k = 0; k < steps; k += 1) {
      const t = k / steps;
      const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
      const f = (j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t
        + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t);
      out.push([f(0), f(1)]);
    }
  }
  out.push(p(n - 1));
  return out;
}

// One fish, drawn in its own frame: u runs from the snout (0) back to the tips of the tail (528), v is up
// towards the back. The whole silhouette is one outline, run by run: each run is a smooth curve, and where two
// runs meet (the tips of the fins and of the tail, the fork) the corner stays sharp.
const OUTLINE = [
  // snout, brow and back, up the front edge of the dorsal fin to its tip
  [[0, -1], [4, 8], [16, 22], [38, 38], [70, 50], [104, 57], [120, 64], [142, 82], [164, 100], [184, 112]],
  // down its curved trailing edge, along the back to the narrow of the tail and out to the tip of the upper lobe
  [[184, 112], [186, 98], [194, 82], [208, 68], [228, 57], [260, 48], [305, 36], [350, 24], [392, 15], [430, 10],
    [448, 18], [476, 38], [504, 58], [530, 80]],
  // the inner edge of the upper lobe to the fork, and out again along the lower one
  [[530, 80], [518, 56], [506, 34], [496, 14], [492, 0]],
  [[492, 0], [496, -14], [506, -34], [518, -56], [530, -80]],
  // back to the narrow of the tail, along the belly to the anal fin and down its trailing edge
  [[530, -80], [504, -58], [476, -38], [448, -18], [430, -10], [392, -15], [356, -24], [336, -29], [342, -39], [350, -50],
    [358, -58]],
  // up its leading edge, along the belly to the pelvic fin and down its trailing edge
  [[358, -58], [340, -51], [320, -43], [302, -38], [288, -37], [260, -44], [215, -50], [186, -52], [192, -61],
    [200, -72]],
  // up its leading edge and along the belly and the chin back to the snout
  [[200, -72], [182, -64], [164, -56], [148, -51], [134, -49], [100, -45], [70, -37], [40, -27], [16, -14], [4, -6],
    [0, -1]],
];
const outline = OUTLINE.flatMap((run, i) => smooth(run).slice(i ? 1 : 0));
const gill = smooth([[78, 44], [88, 22], [91, 0], [88, -22], [78, -38]]);

const rad = (deg) => (deg * Math.PI) / 180;

// the map for a fish whose snout is at [x, y], heading `deg` (0 = right), scaled by k, its back always up
function placer([x, y], deg, facingRight, k) {
  const b = [-Math.cos(rad(deg)), -Math.sin(rad(deg))];
  const n = facingRight ? [Math.sin(rad(deg)), -Math.cos(rad(deg))] : [-Math.sin(rad(deg)), Math.cos(rad(deg))];
  return (u, v) => [x + k * (u * b[0] + v * n[0]), y + k * (u * b[1] + v * n[1])];
}

function fish(map) {
  const at = (pts) => pts.map(([u, v]) => map(u, v));
  return [
    poly(at(outline)),
    // the eye, the edge of the gill cover and the mouth, cut out of the head
    cut(circle(...map(34, 10), 9)),
    cut(line(at(gill), 4)),
    cut(line(at([[-6, -3], [9, -4]]), 3.5)),
  ];
}

// where the cord crosses itself: the index, along the cord, of the strand that passes over
function overCrossing(pts) {
  const hit = (a, b, c, d) => {
    const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
    if (!den) return false;
    const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
    const s = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
    return t > 0 && t < 1 && s > 0 && s < 1;
  };
  for (let j = 2; j < pts.length - 1; j += 1) {
    for (let i = 0; i < j - 1; i += 1) if (hit(pts[i], pts[i + 1], pts[j], pts[j + 1])) return j;
  }
  return -1;
}

// The two fish are placed as images of each other through the point O, set a little below the middle of the
// canvas because the top fish's dorsal fin rises further than anything of the bottom fish hangs.
const O = [500, 524];
const top = placer([O[0] + 200, O[1] - 238], -6, true, 1.12);
const bottom = placer([O[0] - 200, O[1] + 238], 174, false, 1.12);
const CORD = 14;

// the cord's binding round the narrow of a tail: a band a little wider than the tail, parted from it by a hairline
const binding = (map) => {
  const band = [map(438, 17), map(438, -17)];
  return [cut(line(band, 10 + 8)), line(band, 10)];
};

// The cord leaves the top fish's tail heading down and reaches the bottom fish's heading down too, its two ends
// images of each other through O, as the fish are; between them it throws one loop. Its free points were drawn
// about the middle of the canvas and move down with O.
const shift = ([x, y]) => [x, y + O[1] - 500];
const ends = [top(438, -17), top(440, -50), ...[[236, 432], [280, 482], [356, 504], [424, 500]].map(shift)];
const loop = [[480, 496], [528, 478], [552, 442], [540, 406], [500, 390], [462, 404], [446, 444], [460, 484], [488, 512],
  [530, 520]].map(shift);

export function draw() {
  const cord = smooth([...ends, ...loop, ...ends.map(([x, y]) => [2 * O[0] - x, 2 * O[1] - y]).reverse()], 24);
  const over = overCrossing(cord);
  return [
    fish(top),
    fish(bottom),
    binding(top),
    binding(bottom),
    line(cord, CORD),
    // where the cord passes over itself, a gap either side of the upper strand, so the loop reads as a loop
    over > 0 ? [cut(line(cord.slice(over - 2, over + 3), CORD + 14)), line(cord.slice(over - 9, over + 10), CORD)] : [],
  ];
}
