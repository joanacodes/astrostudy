// The sea-goat of Capricorn, after the Augustan type on the coins of Augustus (the denarii and cistophori struck
// for his birth sign) and on Roman cameos: the front of a leaping goat ending in a fish's tail.
import * as kit from '../lib.mjs';

export const slug = 'the-sea-goat';
export const myth = 'The sea-goat';
export const astrology = 'Capricorn';

// the figure is laid out on the canvas as below, then moved (and scaled about the centre) by FIT to sit in the middle
const FIT = { dx: -12, dy: 50, s: 1 };
const fit = ([x, y]) => [500 + (x - 500) * FIT.s + FIT.dx, 500 + (y - 500) * FIT.s + FIT.dy];
const blob = (pts, t) => kit.blob(pts.map(fit), t);
const poly = (pts) => kit.poly(pts.map(fit));
const line = (pts, w) => kit.line(pts.map(fit), w * FIT.s);
const circle = (x, y, r) => kit.circle(...fit([x, y]), r * FIT.s);
const ellipse = (x, y, rx, ry, deg) => kit.ellipse(...fit([x, y]), rx * FIT.s, ry * FIT.s, deg);
const limb = (x1, y1, r1, x2, y2, r2) => kit.limb(...fit([x1, y1]), r1 * FIT.s, ...fit([x2, y2]), r2 * FIT.s);
const chain = (js) => kit.chain(js.map(([x, y, r]) => [...fit([x, y]), r * FIT.s]));
const { cut } = kit;

const rad = (d) => (d * Math.PI) / 180;
const ang = (p, q) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

// points (or [x, y, r] joints) turned about a pivot; positive degrees lift the front (right) up
function turn(pts, cx, cy, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return pts.map(([x, y, ...rest]) => [cx + (x - cx) * c + (y - cy) * s, cy - (x - cx) * s + (y - cy) * c, ...rest]);
}

// an outline drawn in the frame of a bone from joint a to joint b: v runs 0 → 1 down the bone, u across it
// (positive = the front of the limb), both in units of the bone's length
function bone(a, b, pts) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return pts.map(([u, v]) => [a[0] + v * dx + u * dy, a[1] + v * dy - u * dx]);
}

// a cloven hoof hung from the coronet (x, y); the pastern comes in at `pasternDeg`; s the hoof's height
function hoof(x, y, pasternDeg, s) {
  const deg = pasternDeg - 62;
  const u = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const v = [-u[1], u[0]];
  const at = ([a, b]) => [x + s * (a * u[0] + b * v[0]), y + s * (a * u[1] + b * v[1])];
  return blob([[-0.55, -0.05], [0.35, -0.08], [0.85, 0.6], [0.95, 0.95], [-0.6, 1.0], [-0.75, 0.55]].map(at), 0.6);
}

// below the knee or the hock: the short cannon, the fetlock with its dewclaw, the pastern and the hoof (B: height
// at the withers)
function lower(top, f, c, B) {
  const [fx, fy] = bone(top, f, [[-0.08, 1.0]])[0];
  return [
    limb(...top, 0.026 * B, fx, fy, 0.03 * B),
    limb(fx, fy, 0.027 * B, ...c, 0.022 * B),
    hoof(...c, ang([fx, fy], c), 0.055 * B),
  ];
}

// the forearm, in the frame of its bone from the elbow to the knee: the muscle full at the top and in front, the
// point of the elbow behind, the flat knee at the foot
const FOREARM = [[0.2, -0.08], [0.24, 0.12], [0.18, 0.45], [0.12, 0.8], [0.12, 0.97], [0.11, 1.08], [-0.11, 1.08],
  [-0.14, 0.98], [-0.1, 0.85], [-0.1, 0.5], [-0.16, 0.2], [-0.24, 0.02], [-0.15, -0.12]];

// a foreleg: elbow, knee, fetlock and coronet
function foreleg(e, k, f, c, B) {
  return [blob(bone(e, k, FOREARM)), ...lower(k, f, c, B)];
}

// points spaced along the smooth open curve through pts (Catmull-Rom, as blob() draws), each with its direction
function curve(pts, n) {
  const p = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out = [];
  for (let k = 0; k <= n; k += 1) {
    const t = (k / n) * (pts.length - 1);
    const i = Math.min(Math.floor(t), pts.length - 2);
    const u = t - i;
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const q = (j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u
      + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u * u);
    const d = (j) => 0.5 * ((p2[j] - p0[j]) + 2 * (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u
      + 3 * (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u);
    const len = Math.hypot(d(0), d(1)) || 1;
    out.push({ x: q(0), y: q(1), dx: d(0) / len, dy: d(1) / len });
  }
  return out;
}

// a tail or a lock of hair: a stroke tapering from r0 to r1 along a smooth curve through the points
function strand(pts, r0, r1, n = 32) {
  return chain(curve(pts, n).map(({ x, y }, k) => [x, y, r0 + ((r1 - r0) * k) / n]));
}

export function draw() {
  const G = 340;
  // the fish tail: from the goat's waist it sweeps down and back, curls under and rises behind him to the fin
  const spine = [[520, 470], [455, 525], [400, 595], [340, 660], [270, 695], [205, 688], [165, 645], [155, 585],
    [168, 528], [192, 486]];

  return [
    // the fish tail, tapering smoothly to the fin
    strand(spine, 62, 12, 40),
    // the tail fin, forked: two broad lobes swept apart like a crescent
    blob([[202, 500], [214, 470], [236, 444], [264, 428], [292, 424], [272, 440], [250, 462], [228, 494]]),
    blob([[180, 494], [172, 462], [160, 432], [140, 408], [116, 392], [124, 418], [140, 450], [162, 500]]),
    // a fin like a frill where the goat turns into the fish, its rays raked back under the belly
    blob([[590, 512], [580, 548], [566, 576], [552, 592], [546, 574], [532, 588], [514, 602], [512, 582], [496, 592],
      [478, 600], [478, 572], [494, 548], [524, 530]]),



    // far foreleg, folded under the chest
    foreleg([672, 505], [744, 548], [714, 602], [700, 616], G),
    // the neck and body in one outline: the neck rising to the poll, the deep chest, the waist
    blob([[718, 242], [700, 268], [676, 300], [650, 330], [622, 354], [595, 368], [560, 382], [528, 402], [505, 435],
      [500, 470], [515, 500], [550, 525], [600, 538], [650, 535], [690, 520], [718, 495], [732, 462], [730, 425],
      [722, 392], [726, 354], [738, 318]]),

    // the head: a straight face, the beard under the chin, the eye
    blob([[712, 252], [726, 238], [748, 236], [772, 254], [796, 279], [809, 296], [810, 305], [801, 311], [788, 313],
      [764, 309], [744, 306], [730, 300], [716, 280]]),
    blob([[786, 308], [798, 318], [797, 346], [787, 372], [778, 346], [770, 314]]),
    cut(circle(760, 262, 5.5)),
    // the ear, and the long horns swept back over the neck
    strand([[738, 266], [716, 274], [694, 282]], 10, 4),
    strand([[728, 240], [715, 205], [690, 176], [650, 156], [604, 154], [566, 168]], 20, 5),
    strand([[722, 244], [705, 212], [675, 186], [634, 172], [592, 176]], 15, 4),
    // near foreleg raised and reaching forward as he leaps
    foreleg([698, 488], [790, 470], [852, 492], [868, 503], G),

  ];
}
