// After the Roman wall paintings of Phrixus and Helle on the golden ram, from Pompeii (Naples, Museo Archeologico Nazionale).
import * as kit from '../lib.mjs';

export const slug = 'phrixus-and-the-golden-ram';
export const myth = 'Phrixus rides the golden ram';
export const astrology = 'Aries';

// the figure is laid out on the canvas as below, then moved (and scaled about the centre) by FIT to sit in the middle
const FIT = { dx: 0, dy: -8, s: 1.06 };
const fit = ([x, y]) => [500 + (x - 500) * FIT.s + FIT.dx, 500 + (y - 500) * FIT.s + FIT.dy];
const blob = (pts, t) => kit.blob(pts.map(fit), t);
const circle = (x, y, r) => kit.circle(...fit([x, y]), r * FIT.s);
const limb = (x1, y1, r1, x2, y2, r2) => kit.limb(...fit([x1, y1]), r1 * FIT.s, ...fit([x2, y2]), r2 * FIT.s);
const chain = (js) => kit.chain(js.map(([x, y, r]) => [...fit([x, y]), r * FIT.s]));
const { cut } = kit;

const rad = (d) => (d * Math.PI) / 180;
const ang = (p, q) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

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

// below the knee or the hock: the short cannon, the fetlock, the pastern and the hoof (B: height at the withers)
function lower(top, f, c, B) {
  const [fx, fy] = bone(top, f, [[-0.08, 1.0]])[0];
  return [
    limb(...top, 0.026 * B, fx, fy, 0.03 * B),
    limb(fx, fy, 0.027 * B, ...c, 0.022 * B),
    hoof(...c, ang([fx, fy], c), 0.055 * B),
  ];
}

// a foreleg: the forearm tapers from a circle (t, r) at the elbow to the broad knee k
function foreleg(t, r, k, f, c, B) {
  return [limb(...t, r, ...k, 0.038 * B), circle(...k, 0.038 * B), ...lower(k, f, c, B)];
}

// a hind leg: the gaskin tapers from the bottom of the thigh (t, r) to the hock h; the point of the hock juts
// up behind the joint, carried by the cannon
function hindleg(t, r, h, f, c, B) {
  const [px, py] = bone(h, f, [[-0.12, -0.18]])[0];
  return [limb(...t, r, ...h, 0.042 * B), limb(...h, 0.034 * B, px, py, 0.022 * B), ...lower(h, f, c, B)];
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

// points spaced along the smooth closed curve that blob() draws through pts
function along(pts, n) {
  const m = pts.length;
  const p = (i) => pts[(i + m) % m];
  const out = [];
  for (let k = 0; k < n; k += 1) {
    const t = (k / n) * m;
    const i = Math.floor(t);
    const u = t - i;
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const q = (j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u
      + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u * u);
    out.push([q(0), q(1)]);
  }
  return out;
}

// fleece: the smooth outline through pts with every other point along it puffed out, so the rim curls like wool
function fleece(pts, n, puff) {
  const ring = along(pts, n);
  let area = 0;
  ring.forEach(([x1, y1], i) => {
    const [x2, y2] = ring[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  });
  const side = area > 0 ? 1 : -1;
  return blob(ring.map(([x, y], i) => {
    const [xa, ya] = ring[(i + n - 1) % n];
    const [xb, yb] = ring[(i + 1) % n];
    const len = Math.hypot(xb - xa, yb - ya);
    const k = i % 2 ? puff : 0;
    return [x - (side * (yb - ya) * k) / len, y + (side * (xb - xa) * k) / len];
  }));
}

// a ram's horn: a spiral round (cx, cy) from the root at angle a0 (degrees, on the screen) winding back over the
// ear, down and forward round the cheek, the radius shrinking from r0 to r1 and the horn tapering from w0 to w1
function horn(cx, cy, a0, sweep, r0, r1, w0, w1) {
  const pts = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const a = rad(a0 - sweep * t);
    const r = r0 + (r1 - r0) * t;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), w0 + (w1 - w0) * t]);
  }
  return pts;
}

export function draw() {
  // the ram's height at the withers, which sets the thickness of his legs
  const R = 300;
  // the ram's body, a woolly barrel, the chest round in front and the rump round behind
  const body = [[676, 445], [665, 405], [630, 378], [570, 362], [500, 358], [430, 362], [368, 374], [320, 394], [288, 426],
    [276, 466], [282, 506], [306, 540], [350, 562], [420, 574], [500, 576], [575, 564], [632, 540], [666, 500]];
  // the horn's coil, round the ear: the root on the poll, back, down and forward under the ear, the tip at the cheek
  const coil = horn(672, 372, 300, 345, 58, 14, 23, 6);
  // the boy's head height
  const h = 50;
  // Phrixus's near leg, bent round the ram's flank: hip, knee, ankle, toe
  const thigh = [[530, 374, 15], [590, 428, 10.5]];
  const shin = [[590, 428, 10.5], [566, 500, 7], [586, 512, 5.5]];
  // white on white, so a limb lying over the fleece is parted from it by a fine groove cut round it first
  const grooved = (js) => [...chain(js.map(([x, y, r]) => [x, y, r + 4])).map(cut), chain(js)];

  return [
    // the sea below: a row of breaking waves
    strand([[110, 790], [200, 780], [300, 788], [400, 778], [500, 788], [600, 778], [700, 788], [800, 778], [890, 786]], 6, 6),
    ...[160, 360, 560, 760].map((x) => strand([[x, 788], [x + 40, 766], [x + 80, 736], [x + 115, 730], [x + 128, 746], [x + 110, 756]], 9, 3)),
    // Phrixus's cloak streaming back in the wind
    blob([[594, 286], [560, 266], [518, 254], [476, 258], [438, 246], [400, 250], [372, 240], [392, 262], [430, 274],
      [470, 282], [512, 292], [552, 306], [584, 316]]),
    // far legs: the foreleg folded under the chest, the hind leg trailing
    foreleg([612, 532], 0.08 * R, [672, 578], [646, 628], [634, 645], R),
    hindleg([356, 520], 0.13 * R, [286, 584], [242, 626], [228, 643], R),
    // the fleece over the body
    fleece(body, 60, 7),
    // the neck and the Roman-nosed head held forward
    blob([[628, 400], [650, 362], [676, 336], [702, 322], [726, 326], [752, 340], [772, 364], [786, 392], [791, 410],
      [784, 422], [768, 426], [748, 420], [724, 412], [702, 420], [680, 450], [660, 480]]),
    cut(circle(728, 354, 5.5)),
    // near legs: the foreleg reaching forward, the hind leg stretched back
    foreleg([650, 520], 0.08 * R, [726, 552], [790, 574], [808, 582], R),
    hindleg([330, 528], 0.13 * R, [246, 574], [182, 600], [162, 606], R),
    // the great horn curling round the ear, parted from the head by a fine groove
    ...chain(coil.map(([x, y, w]) => [x, y, w + 4])).map(cut),
    chain(coil),
    // Phrixus astride, leaning along the ram's neck, his leg round its flank, his hands on the horn
    ...grooved(thigh),
    ...grooved(shin),
    blob([[505, 370], [512, 340], [532, 310], [556, 290], [580, 280], [604, 292], [602, 314], [586, 336], [566, 358],
      [552, 376]]),
    limb(592, 290, 10, 606, 272, 9.5),
    boyHead(620, 250, h, 12),
    chain([[594, 296, 11], [640, 322, 8.5], [683, 322, 6.5]]),
    circle(688, 322, 8),
  ];
}
