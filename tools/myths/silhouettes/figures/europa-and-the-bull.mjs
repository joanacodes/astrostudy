// Europa carried off by Zeus as a white bull, after the Roman type of the mosaics and wall paintings (the
// Europa mosaic from Byblos, Beirut National Museum): seated sideways on the bull's back, one hand on his horn,
// her veil billowing above her head like a sail.
import * as kit from '../lib.mjs';

export const slug = 'europa-and-the-bull';
export const myth = 'Europa and the bull';
export const astrology = 'Taurus';

// the figure is laid out facing right, as below, then mirrored so the bull walks to the left, and moved (and scaled
// about the centre) by FIT to sit in the middle of the canvas
const FIT = { dx: -11, dy: -52, s: 1.18 };
const fit = ([x, y]) => [500 - (x - 500) * FIT.s + FIT.dx, 500 + (y - 500) * FIT.s + FIT.dy];
const blob = (pts, t) => kit.blob(pts.map(fit), t);
const poly = (pts) => kit.poly(pts.map(fit));
const line = (pts, w) => kit.line(pts.map(fit), w * FIT.s);
const circle = (x, y, r) => kit.circle(...fit([x, y]), r * FIT.s);
const ellipse = (x, y, rx, ry, deg) => kit.ellipse(...fit([x, y]), rx * FIT.s, ry * FIT.s, -deg);
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
    limb(...top, 0.044 * B, fx, fy, 0.047 * B),
    limb(fx, fy, 0.042 * B, ...c, 0.035 * B),
    hoof(...c, ang([fx, fy], c), 0.07 * B),
  ];
}

// a foreleg: the forearm tapers from a circle (t, r) at the elbow to the broad knee k
function foreleg(t, r, k, f, c, B) {
  return [limb(...t, r, ...k, 0.055 * B), circle(...k, 0.056 * B), ...lower(k, f, c, B)];
}

// a hind leg: the gaskin tapers from the bottom of the thigh (t, r) to the hock h; the point of the hock juts
// up behind the joint, carried by the cannon
function hindleg(t, r, h, f, c, B) {
  const [px, py] = bone(h, f, [[-0.12, -0.18]])[0];
  return [limb(...t, r, ...h, 0.056 * B), limb(...h, 0.05 * B, px, py, 0.032 * B), ...lower(h, f, c, B)];
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

// a woman's head in profile facing right: (x, y) the middle of the skull, h crown to chin, tilted by deg; her hair
// waved back from the brow into a knot at the nape
function womanHead(x, y, h, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const at = ([u, v]) => [x + h * (u * c - v * s), y + h * (u * s + v * c)];
  return [
    blob([[-0.44, 0.02], [-0.42, -0.27], [-0.26, -0.46], [-0.02, -0.53], [0.2, -0.47], [0.32, -0.34], [0.36, -0.2],
      [0.38, -0.06], [0.385, 0.0], [0.47, 0.17], [0.41, 0.21], [0.42, 0.26], [0.395, 0.29], [0.41, 0.32],
      [0.37, 0.37], [0.37, 0.44], [0.27, 0.5], [0.08, 0.43], [-0.12, 0.3], [-0.3, 0.2]].map(at), 0.9),
    blob([[-0.5, 0.05], [-0.5, -0.28], [-0.3, -0.52], [0.0, -0.6], [0.25, -0.5], [0.36, -0.32], [0.2, -0.36], [-0.1, -0.28],
      [-0.25, 0.0], [-0.3, 0.22], [-0.45, 0.25]].map(at)),
    circle(...at([-0.55, 0.12]), 0.2 * h),
  ];
}

// a veil filled by the wind: the band between two arcs about (cx, cy), from angle a0 to a1 (degrees, clockwise on
// the screen), thickest where the wind fills it and drawn to points at both ends
function veil(cx, cy, r, w, a0, a1) {
  const outer = [];
  const inner = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const a = rad(a0 + (a1 - a0) * t);
    const k = Math.sin(Math.PI * t);
    const ro = r + w * (0.35 * k + 0.45 * k ** 3);
    const ri = r - w * 0.2 * k;
    outer.push([cx + ro * Math.cos(a), cy + ro * Math.sin(a)]);
    inner.push([cx + ri * Math.cos(a), cy + ri * Math.sin(a)]);
  }
  return blob([...outer, ...inner.reverse().slice(1, -1)]);
}

export function draw() {
  // the bull, laid out in units of his height at the withers: the forequarters heavy under the hump, a deep
  // dewlap, the back falling a little to the hips, the head carried forward so the horns come within her reach
  const B = 340;
  const P = (x, y) => [560 + x * B, 860 - y * B];
  const T = (pts) => pts.map(([x, y]) => P(x, y));
  // the head in its own frame: u from the poll (0) down to the muzzle (1), v across it, toward the face positive
  const [qx, qy] = P(0.38, 1.04);
  const [mx, my] = P(0.69, 0.68);
  const L = Math.hypot(mx - qx, my - qy);
  const ax = [(mx - qx) / L, (my - qy) / L];
  const H = (pts) => pts.map(([u, v]) => [qx + u * L * ax[0] + v * L * ax[1], qy + u * L * ax[1] - v * L * ax[0]]);
  // Europa, seated sideways just behind the bull's hump, her head turned to his horns
  const h = 58;
  const [hx, hy] = [588, 326];

  return [
    // the tail lifted behind in an S, its tuft at the end
    strand(T([[-0.88, 0.98], [-1.0, 1.05], [-1.11, 0.99], [-1.14, 0.86], [-1.11, 0.73]]), 0.026 * B, 0.015 * B),
    ellipse(...P(-1.105, 0.69), 0.034 * B, 0.068 * B, -15),
    // far legs: the foreleg planted, the hind leg stepping forward
    foreleg(P(0.03, 0.5), 0.12 * B, P(0.04, 0.26), P(0.05, 0.09), P(0.08, 0.045), B),
    hindleg(P(-0.7, 0.62), 0.18 * B, P(-0.74, 0.33), P(-0.67, 0.095), P(-0.64, 0.045), B),
    // the body and the short thick neck under the hump, the dewlap hanging from the jaw to the brisket
    blob(T([[0.0, 1.08], [-0.2, 1.0], [-0.42, 0.975], [-0.62, 0.985], [-0.74, 1.0], [-0.86, 0.99], [-0.93, 0.955],
      [-0.965, 0.86], [-0.96, 0.74], [-0.93, 0.63], [-0.86, 0.57], [-0.74, 0.55], [-0.6, 0.5], [-0.42, 0.46],
      [-0.22, 0.445], [0.0, 0.44], [0.08, 0.44], [0.16, 0.4], [0.25, 0.42], [0.31, 0.47], [0.36, 0.55], [0.4, 0.64],
      [0.43, 0.74], [0.42, 0.86], [0.38, 1.0], [0.28, 1.08], [0.15, 1.12]])),
    // the head: the broad brow with its curls, the face falling to a blunt square muzzle, the deep jaw; the eye
    blob(H([[0.0, 0.06], [0.1, 0.22], [0.35, 0.25], [0.6, 0.23], [0.82, 0.21], [0.96, 0.19], [1.03, 0.07], [1.0, -0.07],
      [0.9, -0.14], [0.74, -0.19], [0.55, -0.3], [0.35, -0.38], [0.18, -0.36], [0.04, -0.25], [-0.05, -0.08]])),
    ...H([[0.03, 0.14], [0.1, 0.2], [0.0, 0.0]]).map(([x, y]) => circle(x, y, 0.03 * B)),
    cut(circle(...H([[0.3, 0.1]])[0], 0.02 * B)),
    // near legs: the foreleg lifted mid-stride, the hind leg pushing off behind
    foreleg(P(0.1, 0.5), 0.12 * B, P(0.26, 0.35), P(0.2, 0.19), P(0.17, 0.15), B),
    hindleg(P(-0.83, 0.62), 0.18 * B, P(-0.93, 0.34), P(-0.97, 0.09), P(-0.94, 0.045), B),


    // horns sweeping forward and up from the poll, the ear below them
    strand(T([[0.4, 1.05], [0.47, 1.1], [0.53, 1.18], [0.55, 1.27], [0.51, 1.34]]), 0.055 * B, 0.014 * B),
    strand(T([[0.37, 1.06], [0.41, 1.15], [0.45, 1.23], [0.43, 1.3]]), 0.045 * B, 0.012 * B),
    strand(H([[0.1, -0.2], [0.06, -0.4], [0.02, -0.55]]), 0.04 * B, 0.015 * B),

    // her mantle, slipped to her hips, its end fluttering back over the bull's back
    blob([[530, 500], [494, 492], [458, 484], [424, 488], [396, 478], [412, 500], [446, 512], [486, 520], [524, 524]]),
    // Europa's torso, turned three-quarters to us, rising from the bull's back
    blob([[514, 516], [507, 482], [510, 450], [520, 420], [536, 396], [556, 382], [592, 378], [614, 390], [616, 414],
      [606, 442], [598, 470], [606, 500], [604, 522]]),
    limb(578, 382, 12.5, 586, 356, 12),

    womanHead(hx, hy, h, 4),
    // her near arm reaching forward to grasp the horn
    chain([[604, 392, 13], [676, 418, 10], [738, 446, 7.5]]),
    circle(...P(0.54, 1.21), 9),
    // her far arm raised behind her head, holding up the veil that billows round it like a sail
    chain([[552, 392, 13], [532, 314, 10], [570, 236, 7.5]]),
    blob([[570, 234], [538, 218], [500, 222], [470, 244], [452, 278], [446, 318], [454, 358], [470, 392], [492, 424],
      [512, 446], [518, 424], [506, 392], [496, 356], [492, 318], [498, 284], [516, 258], [544, 246]]),

  ];
}
