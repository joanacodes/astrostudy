// After the Roman type of Sagittarius as a centaur drawing his bow, as on the engraved gems of the sign.
import * as kit from '../lib.mjs';

export const slug = 'the-centaur-archer';
export const myth = 'The centaur archer';
export const astrology = 'Sagittarius';

// the figure is laid out on the canvas as below, then moved (and scaled about the centre) by FIT to sit in the middle
const FIT = { dx: 43, dy: -6, s: 1 };
const fit = ([x, y]) => [500 + (x - 500) * FIT.s + FIT.dx, 500 + (y - 500) * FIT.s + FIT.dy];
const blob = (pts, t) => kit.blob(pts.map(fit), t);
const poly = (pts) => kit.poly(pts.map(fit));
const line = (pts, w) => kit.line(pts.map(fit), w * FIT.s);
const circle = (x, y, r) => kit.circle(...fit([x, y]), r * FIT.s);
const limb = (x1, y1, r1, x2, y2, r2) => kit.limb(...fit([x1, y1]), r1 * FIT.s, ...fit([x2, y2]), r2 * FIT.s);
const chain = (js) => kit.chain(js.map(([x, y, r]) => [...fit([x, y]), r * FIT.s]));

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
  return [limb(...t, r, ...h, 0.036 * W), limb(...h, 0.03 * W, px, py, 0.015 * W), ...lower(h, f, c, W)];
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
function head(x, y, h, deg) {
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
      [0.06, 0.6], [-0.08, 0.44], [-0.12, 0.26]].map(at)),
    blob([...curls, [0.3, -0.27], [0.1, -0.33], [-0.15, -0.15], [-0.25, 0.1], [-0.3, 0.3], [-0.42, 0.28]].map(at)),
  ];
}

// the bow drawn to full stretch: grip g, arrow along `deg`, half its length, the limbs bent back by `bend`
function bow(g, deg, half, bend) {
  const a = [Math.cos(rad(deg)), -Math.sin(rad(deg))];
  const n = [-a[1], a[0]];
  const pts = [];
  for (let i = -10; i <= 10; i += 1) {
    const t = i / 10;
    const back = bend * t * t - (Math.abs(t) > 0.8 ? 0.9 * bend * ((Math.abs(t) - 0.8) / 0.2) ** 2 : 0);
    pts.push([g[0] + n[0] * half * t - a[0] * back, g[1] + n[1] * half * t - a[1] * back]);
  }
  return pts;
}

export function draw() {
  // the horse's trunk is laid out standing, in units of its height at the withers, then lifted 18° about
  // the hip joint as he rears
  const W = 380;
  const hip = [330, 637];
  const at = ([x, y]) => [hip[0] + (x + 0.62) * W, hip[1] - (y - 0.8) * W];
  const T = (pts) => turn(pts.map(at), ...hip, 18);
  const P = (x, y) => T([[x, y]])[0];

  // the arrow, from the hand at the jaw up and forward through the grip of the bow
  const nock = [612, 322];
  const deg = 25;
  const a = [Math.cos(rad(deg)), -Math.sin(rad(deg))];
  const grip = [nock[0] + 175 * a[0], nock[1] + 175 * a[1]];
  const arc = bow(grip, deg, 140, 46);
  const tip = [nock[0] + 215 * a[0], nock[1] + 215 * a[1]];

  return [
    // the tail streaming out behind, its hair parting into locks
    strand([[272, 598], [238, 574], [195, 566], [152, 574], [116, 596], [90, 628]], 17, 5),
    strand([[270, 606], [234, 590], [192, 586], [152, 596], [122, 620], [106, 654]], 18, 5),
    strand([[268, 614], [234, 606], [196, 606], [162, 620], [144, 650]], 15, 5),
    // far legs: the foreleg reaching down, the hind leg planted ahead of the near one
    foreleg([582, 627], [640, 700], [655, 782], [668, 803], W),
    hindleg(P(-0.55, 0.64), 0.12 * W, [338, 770], [390, 842], [407, 864], W),
    // the man's torso and the horse's trunk in one sweep, his back running into the horse's
    blob([[572, 352], [552, 362], [536, 378], [534, 402], [538, 435], [543, 462], [538, 485],
      ...T([[-0.06, 0.985], [-0.18, 0.955], [-0.36, 0.96], [-0.48, 0.985], [-0.58, 0.995], [-0.68, 0.975], [-0.74, 0.94],
        [-0.795, 0.85], [-0.8, 0.76], [-0.78, 0.66], [-0.7, 0.58], [-0.52, 0.6], [-0.45, 0.625], [-0.3, 0.575],
        [-0.12, 0.545], [0.0, 0.54], [0.05, 0.555], [0.14, 0.6], [0.205, 0.72], [0.215, 0.84]]),
      [632, 498], [636, 470], [642, 442], [649, 418], [650, 396], [645, 376], [610, 356]]),
    // near legs: the hind leg planted, the hock bent under him; the foreleg raised and folded at the knee
    hindleg(P(-0.62, 0.64), 0.12 * W, [292, 775], [338, 848], [355, 870], W),
    foreleg([604, 620], [702, 603], [687, 686], [669, 707], W),
    // neck and bearded head, raised a little to sight along the arrow
    limb(588, 362, 19, 594, 322, 17),
    head(598, 294, 60, -8),
    // the drawing arm, its elbow raised behind the head, the hand at the jaw
    chain([[546, 378, 19], [470, 340, 11], [600, 320, 9.5]]),
    circle(nock[0] - 4, nock[1], 10),
    // the bow arm stretched to the grip
    chain([[644, 378, 19], [706, 318, 13], [758, 262, 9.5]]),
    circle(...grip, 10),
    // the bow, its string drawn to the jaw, the arrow
    line(arc, 7),
    line([arc[0], nock, arc[arc.length - 1]], 3),
    line([[nock[0] - 8 * a[0], nock[1] - 8 * a[1]], tip], 4),
    poly([[tip[0] + 18 * a[0], tip[1] + 18 * a[1]], [tip[0] - 6 * a[0] + 8 * a[1], tip[1] - 6 * a[1] - 8 * a[0]],
      [tip[0] - 2 * a[0], tip[1] - 2 * a[1]], [tip[0] - 6 * a[0] - 8 * a[1], tip[1] - 6 * a[1] + 8 * a[0]]]),
  ];
}
