// Hermes (Mercury), after the Hermes of the Belvedere and Farnese type (Vatican Museums; British Museum).
import { blob, circle, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'hermes-messenger-of-the-gods';
export const myth = 'Hermes, messenger of the gods';
export const astrology = 'Mercury';

const rad = (deg) => (deg * Math.PI) / 180;

// a small wing rooted at (x, y), pointing along `deg`, its feathers on the side `side` (1 or -1) of that line
function wing(x, y, deg, len, side) {
  const a = rad(deg);
  const u = [Math.cos(a), Math.sin(a)];
  const v = [-Math.sin(a) * side, Math.cos(a) * side];
  const P = (s, t) => [x + (u[0] * s + v[0] * t) * len, y + (u[1] * s + v[1] * t) * len];
  return blob([P(0, -0.06), P(0.2, -0.17), P(0.45, -0.22), P(0.72, -0.19), P(1, -0.06), P(0.82, 0.04),
    P(0.92, 0.16), P(0.66, 0.14), P(0.72, 0.3), P(0.48, 0.24), P(0.5, 0.4), P(0.3, 0.3), P(0.24, 0.42),
    P(0.1, 0.28), P(0, 0.14)], 0.85);
}

// the caduceus: a staff topped by a knob and two wings, two snakes crossing three times round it and
// rearing up at the top so their heads face each other across the staff
function caduceus(x, top, bottom) {
  const out = [line([[x, bottom], [x, top + 8]], 9), circle(x, top + 8, 8)];
  out.push(wing(x - 3, top + 34, -150, 36, -1), wing(x + 3, top + 34, -30, 36, 1));
  const y0 = top + 236; // tails
  const y1 = top + 86; // the last crossing
  const half = (y0 - y1) / 3;
  for (const s of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 90; i += 1) {
      const t = (i / 90) * 3.75;
      const amp = 15 + 7 * (t / 3.75);
      pts.push([x + s * amp * Math.sin(Math.PI * t), y0 - half * t]);
    }
    const [hx, hy] = pts[pts.length - 1];
    out.push(line(pts, 7), ellipse(hx + s * 5, hy - 2, 8, 5.5, s * -25));
  }
  return out;
}

// a limb drawn as one smooth outline: `joints` are the bone's points from the body outwards, and each
// segment has a profile of [t, outer, inner] half-widths at the fraction t along it, the outer side being
// to the screen's left (out = -1) or right (out = 1) when the bone points down
function member(joints, profiles, out) {
  const outer = [];
  const inner = [];
  for (let k = 0; k < joints.length - 1; k += 1) {
    const [ax, ay] = joints[k];
    const [bx, by] = joints[k + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const nx = (by - ay) / len;
    const ny = -(bx - ax) / len;
    for (const [t, wo, wi] of profiles[k]) {
      const px = ax + (bx - ax) * t;
      const py = ay + (by - ay) * t;
      outer.push([px + out * nx * wo, py + out * ny * wo]);
      inner.push([px - out * nx * wi, py - out * ny * wi]);
    }
  }
  return blob([...outer, ...inner.reverse()]);
}

// the profiles of a man's leg (thigh, then calf), arm (upper arm, then forearm) and hand at this scale; each
// starts narrow so the end tucked into the body stays hidden
const THIGH = [[0, 22, 22], [0.06, 36, 33], [0.16, 38, 33], [0.38, 36, 31], [0.6, 31, 28], [0.8, 27, 27],
  [0.93, 23.5, 25]];
const CALF = [[0, 22.5, 22.5], [0.1, 24, 23], [0.25, 27.5, 26.5], [0.4, 26.5, 28], [0.55, 22, 24.5],
  [0.72, 18, 19], [0.88, 15, 16], [1, 14, 14]];
const UPPER_ARM = [[0, 18, 16], [0.12, 28, 25], [0.3, 29, 25], [0.5, 26, 24], [0.75, 23, 21], [0.95, 20, 19]];
const FOREARM = [[0, 20, 19], [0.18, 22, 20], [0.45, 19, 17], [0.75, 15.5, 14.5], [1, 12.5, 12]];
const HAND = [[[0, 10, 10], [0.3, 12, 12], [0.65, 14, 15], [1, 13, 14]], [[0, 13, 14], [0.4, 12, 12], [0.8, 9, 8],
  [1, 5, 4]]];

export function draw() {
  return [
    // the head inclined to his right (our left), under the petasos
    ellipse(458, 174, 32, 47, -6),
    limb(460, 204, 21, 464, 244, 27),
    // the petasos: a domed crown, a brim curving down at the edges, a wing on either side
    ellipse(457, 140, 37, 30, -6),
    blob([[390, 168], [420, 154], [458, 148], [494, 142], [524, 148], [496, 157], [458, 162], [422, 167]]),
    wing(430, 130, -125, 50, -1),
    wing(484, 124, -55, 50, 1),

    // torso: his weight on the right leg (our left), so that hip rides higher and out and that shoulder
    // drops, while the free side runs long and straight
    blob([[442, 214], [438, 230], [428, 243], [410, 253], [390, 262], [374, 272], [362, 290], [357, 312],
      [361, 336], [386, 360], [392, 378], [398, 396], [404, 414], [404, 432], [398, 452], [392, 474],
      [393, 498], [398, 522], [430, 528], [464, 512], [498, 532], [530, 526], [534, 504], [534, 478],
      [530, 456], [527, 434], [528, 414], [534, 394], [538, 374], [540, 356], [562, 330], [566, 306],
      [558, 286], [542, 270], [520, 256], [500, 242], [484, 222]]),

    // right arm hanging free of the body, the elbow a little bent
    member([[384, 300], [358, 416], [350, 522]], [UPPER_ARM, FOREARM], -1),
    member([[352, 500], [346, 552], [350, 590]], HAND, -1),

    // legs: the right carries him, the left is relaxed, its knee drawn in and dropped, the foot set out
    member([[430, 486], [440, 690], [444, 848]], [THIGH, CALF], -1),
    member([[498, 494], [502, 698], [550, 846]], [THIGH, CALF], 1),
    blob([[431, 838], [457, 838], [465, 856], [473, 870], [471, 879], [420, 879], [417, 870], [424, 856]]),
    blob([[539, 836], [562, 838], [578, 856], [596, 870], [594, 879], [540, 879], [534, 866]]),
    // the little wings at his ankles
    wing(431, 838, -160, 46, -1),
    wing(563, 836, -20, 46, 1),

    // left arm: the upper arm down, the forearm forward with the caduceus in the hand
    caduceus(634, 100, 470),
    // the chlamys over the left shoulder and down behind the arm
    blob([[520, 264], [544, 264], [570, 272], [588, 290], [596, 320], [602, 360], [608, 400], [588, 412],
      [580, 360], [564, 300], [540, 282]]),
    circle(552, 298, 28),
    member([[552, 298], [582, 410]], [UPPER_ARM], 1),
    limb(582, 410, 20, 622, 422, 14),
    // wrapped round the forearm and falling in folds, free of the leg
    blob([[590, 398], [624, 396], [646, 410], [656, 446], [662, 520], [670, 600], [678, 704], [652, 668],
      [634, 652], [618, 658], [602, 674], [598, 600], [597, 520], [596, 466], [592, 436]], 0.75),
    ellipse(634, 424, 14, 18),

    // the base
    poly([[352, 879], [622, 879], [630, 904], [344, 904]]),
  ];
}
