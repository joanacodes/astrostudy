// After the Roman fresco of Chiron teaching Achilles the lyre, from the Basilica at Herculaneum (Naples, Museo Archeologico Nazionale).
import * as kit from '../lib.mjs';

export const slug = 'chiron-teaches-achilles-the-lyre';
export const myth = 'The centaur Chiron teaches Achilles the lyre';
export const astrology = 'Chiron';

// the figure is laid out on the canvas as below, then moved (and scaled about the centre) by FIT to sit in the middle
const FIT = { dx: 44, dy: -83, s: 1.2 };
const fit = ([x, y]) => [500 + (x - 500) * FIT.s + FIT.dx, 500 + (y - 500) * FIT.s + FIT.dy];
const blob = (pts, t) => kit.blob(pts.map(fit), t);
const poly = (pts) => kit.poly(pts.map(fit));
const line = (pts, w) => kit.line(pts.map(fit), w * FIT.s);
const circle = (x, y, r) => kit.circle(...fit([x, y]), r * FIT.s);
const ellipse = (x, y, rx, ry, deg) => kit.ellipse(...fit([x, y]), rx * FIT.s, ry * FIT.s, deg);
const limb = (x1, y1, r1, x2, y2, r2) => kit.limb(...fit([x1, y1]), r1 * FIT.s, ...fit([x2, y2]), r2 * FIT.s);
const chain = (js) => kit.chain(js.map(([x, y, r]) => [...fit([x, y]), r * FIT.s]));

const rad = (d) => (d * Math.PI) / 180;
const ang = (p, q) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

// an outline drawn in the frame of a bone from joint a to joint b: v runs 0 → 1 down the bone, u across it
// (positive = the front of the limb), both in units of the bone's length
function bone(a, b, pts) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return pts.map(([u, v]) => [a[0] + v * dx + u * dy, a[1] + v * dy - u * dx]);
}

// a hoof hung from the coronet (x, y); the pastern comes in at `pasternDeg`; s the hoof's height
function hoof(x, y, pasternDeg, s) {
  const deg = pasternDeg - 58;
  const u = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const v = [-u[1], u[0]];
  const at = ([a, b]) => [x + s * (a * u[0] + b * v[0]), y + s * (a * u[1] + b * v[1])];
  return poly([[-0.5, -0.05], [0.35, -0.1], [0.95, 0.9], [0.85, 1.0], [-0.7, 1.0], [-0.75, 0.6], [-0.68, 0.3]].map(at));
}

// below the knee or the hock: the cannon, the fetlock joint, the pastern and the hoof (W: height at the withers)
function lower(top, f, c, W) {
  const [fx, fy] = bone(top, f, [[-0.07, 1.0]])[0];
  return [
    limb(...top, 0.025 * W, fx, fy, 0.03 * W),
    limb(fx, fy, 0.027 * W, ...c, 0.018 * W),
    hoof(...c, ang([fx, fy], c), 0.05 * W),
  ];
}

// the forearm, in the frame of its bone from the elbow to the knee: the muscle full at the top and in front, the
// point of the elbow behind, the flat knee at the foot
const FOREARM = [[0.22, -0.08], [0.26, 0.12], [0.2, 0.45], [0.13, 0.8], [0.13, 0.97], [0.12, 1.08], [-0.12, 1.08],
  [-0.15, 0.98], [-0.11, 0.85], [-0.11, 0.5], [-0.17, 0.2], [-0.26, 0.02], [-0.16, -0.12]];

// a foreleg: elbow, knee, fetlock and coronet
function foreleg(e, k, f, c, W) {
  return [blob(bone(e, k, FOREARM)), ...lower(k, f, c, W)];
}

// a hind leg: the gaskin tapers from the bottom of the thigh (t, r) to the hock h; the point of the hock juts
// up behind the joint, carried by the cannon
function hindleg(t, r, h, f, c, W) {
  const [px, py] = bone(h, f, [[-0.09, -0.2]])[0];
  return [limb(...t, r, ...h, 0.036 * W), limb(...h, 0.03 * W, px, py, 0.018 * W), ...lower(h, f, c, W)];
}

// a tail or a lock of hair: a stroke tapering from r0 to r1 along a smooth curve through the points
function strand(pts, r0, r1, n = 32) {
  const p = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out = [];
  for (let k = 0; k <= n; k += 1) {
    const t = (k / n) * (pts.length - 1);
    const i = Math.min(Math.floor(t), pts.length - 2);
    const u = t - i;
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const q = (j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u
      + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u * u);
    out.push([q(0), q(1), r0 + ((r1 - r0) * k) / n]);
  }
  return chain(out);
}

// a bearded man's head in profile facing right: (x, y) the middle of the skull, h crown to chin, tilted by deg;
// the hair a cap of curls, every other point round the skull pushed out
function head(x, y, h, deg, beard = 1) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const at = ([u, v]) => [x + h * (u * c - v * s), y + h * (u * s + v * c)];
  const curls = [];
  for (let i = 0; i <= 11; i += 1) {
    const t = rad(-200 + (165 * i) / 11);
    const r = i % 2 ? 1.0 : 1.1;
    curls.push([-0.04 + 0.47 * r * Math.cos(t), -0.06 + 0.5 * r * Math.sin(t)]);
  }
  return [
    blob([[-0.44, 0.02], [-0.42, -0.26], [-0.26, -0.45], [-0.02, -0.53], [0.2, -0.47], [0.32, -0.34], [0.37, -0.2],
      [0.4, -0.06], [0.405, 0.0], [0.52, 0.16], [0.445, 0.2], [0.455, 0.25], [0.425, 0.28], [0.445, 0.31],
      [0.4, 0.36], [0.425, 0.44], [0.32, 0.5], [0.08, 0.42], [-0.1, 0.3], [-0.3, 0.2]].map(at), 0.9),
    blob([[0.1, 0.12], [0.3, 0.33], [0.41, 0.36], [0.47, 0.45], [0.45, 0.56], [0.37, 0.65], [0.22, 0.68],
      [0.06, 0.6], [-0.08, 0.44], [-0.12, 0.26]].map(([u, v]) => at([u, v < 0.36 ? v : 0.36 + (v - 0.36) * beard]))),
    blob([...curls, [0.3, -0.27], [0.1, -0.33], [-0.15, -0.15], [-0.25, 0.1], [-0.3, 0.3], [-0.42, 0.28]].map(at)),
  ];
}

// a human leg in profile facing right (h: the head's height): the thigh tapers to the knee, the calf swells behind
// the shin, the foot runs from the heel under the ankle to the toes
function leg(hip, knee, ankle, toe, h) {
  const [ax, ay] = ankle;
  const [tx, ty] = toe;
  return [
    limb(...hip, 0.4 * h, ...knee, 0.22 * h),
    blob(bone(knee, ankle, [[0.13, -0.05], [0.13, 0.4], [0.09, 0.97], [-0.09, 1.03], [-0.12, 0.72], [-0.22, 0.36], [-0.15, -0.03]])),
    blob([[ax + 0.08 * h, ay - 0.03 * h], [ax + 0.34 * h, ay + 0.1 * h], [tx - 0.06 * h, ty - 0.07 * h], [tx, ty - 0.025 * h],
      [tx - 0.05 * h, ty], [ax - 0.1 * h, ty], [ax - 0.16 * h, ty - 0.07 * h], [ax - 0.08 * h, ay - 0.03 * h]], 0.8),
  ];
}

// a boy's head in profile facing right: the skull rounder, the nose smaller, no beard, a cap of short curls
function boyHead(x, y, h, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const at = ([u, v]) => [x + h * (u * c - v * s), y + h * (u * s + v * c)];
  const curls = [];
  for (let i = 0; i <= 11; i += 1) {
    const t = rad(-205 + (170 * i) / 11);
    const r = i % 2 ? 1.0 : 1.08;
    curls.push([-0.05 + 0.48 * r * Math.cos(t), -0.07 + 0.5 * r * Math.sin(t)]);
  }
  return [
    blob([[-0.46, 0.02], [-0.44, -0.27], [-0.27, -0.47], [-0.02, -0.54], [0.21, -0.47], [0.33, -0.33], [0.37, -0.18],
      [0.39, -0.05], [0.395, 0.02], [0.47, 0.17], [0.41, 0.21], [0.42, 0.26], [0.395, 0.29], [0.41, 0.32],
      [0.37, 0.37], [0.37, 0.44], [0.27, 0.5], [0.08, 0.44], [-0.12, 0.3], [-0.32, 0.2]].map(at), 0.9),
    blob([...curls, [0.3, -0.27], [0.1, -0.32], [-0.15, -0.14], [-0.24, 0.1], [-0.3, 0.26], [-0.44, 0.24]].map(at)),
  ];
}

// a lyre: (x, y) the middle of its sound box, H its height to the crossbar, leaning by deg; the two arms rise
// from the tortoise-shell sound box and curl out at the top, the crossbar joins them, the strings run between
function lyre(x, y, H, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const at = ([u, v]) => [x + H * (u * c - v * s), y + H * (u * s + v * c)];
  const arm = (k) => strand([[0.13 * k, -0.04], [0.27 * k, -0.3], [0.21 * k, -0.62], [0.24 * k, -0.86], [0.31 * k, -0.98]].map(at),
    0.05 * H, 0.025 * H, 24);
  return [
    ellipse(...at([0, 0]), 0.22 * H, 0.13 * H, deg),
    arm(-1),
    arm(1),
    line([at([-0.31, -0.83]), at([0.31, -0.83])], 0.05 * H),
    ...[-0.1, -0.035, 0.035, 0.1].map((u) => line([at([u, -0.05]), at([u, -0.83])], 2)),
  ];
}

export function draw() {
  // Chiron's horse body, standing, laid out in units of its height at the withers, x forward from the withers and
  // y up from the ground; the back is shortened a little so the horse does not outweigh the man
  const W = 380;
  const P = (x, y) => [470 + (x < 0 ? 0.88 * x : x) * W, 890 - y * W];
  const T = (pts) => pts.map(([x, y]) => P(x, y));
  // the boy's head height: he stands about seven heads tall
  const h = 58;

  return [
    // the tail falling from the croup in a long curve, swinging out at the end
    strand([P(-0.74, 0.94), [186, 585], [170, 640], [160, 700], [156, 760], [142, 805]], 17, 5),
    strand([P(-0.77, 0.9), [192, 605], [182, 660], [174, 720], [166, 778]], 16, 6),
    strand([P(-0.76, 0.86), [204, 612], [200, 650]], 18, 14),
    // far legs: the foreleg set back, the hind leg taking the weight under the belly
    foreleg(P(0.04, 0.58), P(0.0, 0.29), P(-0.02, 0.115), P(0.02, 0.055), W),
    hindleg(P(-0.58, 0.6), 0.14 * W, P(-0.63, 0.37), P(-0.6, 0.115), P(-0.56, 0.055), W),
    // Chiron's torso and the horse's body in one sweep
    blob([[543, 335], [518, 346], [498, 362], [490, 392], [492, 425], [497, 455], [488, 485],
      ...T([[-0.06, 0.985], [-0.18, 0.955], [-0.36, 0.96], [-0.48, 0.985], [-0.58, 0.995], [-0.68, 0.975], [-0.74, 0.94],
        [-0.795, 0.85], [-0.8, 0.76], [-0.78, 0.66], [-0.7, 0.58], [-0.52, 0.6], [-0.45, 0.625], [-0.3, 0.575],
        [-0.12, 0.545], [0.0, 0.54], [0.05, 0.555], [0.14, 0.6], [0.205, 0.72], [0.215, 0.84]]),
      [564, 532], [574, 498], [578, 468], [588, 442], [602, 418], [608, 394], [602, 368], [574, 342]]),
    // his far hand set on his hip, the elbow out behind
    chain([[504, 372, 20], [445, 428, 14], [488, 470, 11]]),
    // near legs: the foreleg square under the chest, the hind leg at rest, its hoof tipped on the toe
    foreleg(P(0.11, 0.58), P(0.12, 0.29), P(0.12, 0.115), P(0.16, 0.055), W),
    hindleg(P(-0.68, 0.6), 0.14 * W, P(-0.76, 0.38), P(-0.7, 0.15), P(-0.675, 0.075), W),
    // Chiron's neck and long-bearded head, bent to look down at the boy
    limb(552, 345, 21, 562, 315, 19),
    head(578, 290, 72, 14, 1.8),
    // the boy Achilles, standing with his weight on the back leg
    leg([610, 708], [600, 800], [584, 870], [612, 892], h),
    leg([624, 708], [644, 802], [640, 872], [676, 892], h),
    blob([[614, 552], [604, 572], [600, 600], [604, 636], [600, 668], [594, 700], [600, 732], [640, 718], [650, 690],
      [651, 660], [656, 632], [660, 604], [655, 576], [640, 556]]),
    limb(622, 540, 12.5, 624, 560, 13.5),
    boyHead(632, 504, h, 6),
    // his arms: the far one holding the lyre out, the near one plucking the strings
    chain([[634, 566, 13], [672, 592, 10], [704, 590, 8]]),
    chain([[626, 568, 14.5], [642, 630, 11], [690, 624, 8.5]]),
    // the lyre
    lyre(714, 648, 150, 10),
    // Chiron's arm reaching over the boy to guide the lyre
    chain([[594, 376, 21], [650, 455, 14.5], [714, 518, 10.5]]),
    circle(724, 524, 12),
  ];
}
