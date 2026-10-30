// Ares (Mars), after the Ares Borghese (Louvre, Paris), a Roman copy of a Greek original.
import { blob, circle, cut, limb, line, poly } from '../lib.mjs';

export const slug = 'ares-god-of-war';
export const myth = 'Ares, god of war';
export const astrology = 'Mars';

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

// points round an ellipse, closing on the first one: a smooth outline through them, or its rim as a rod
// (the kit's ellipse is a 48-sided polygon, whose facets would show on a shield this large)
function oval(x, y, rx, ry, deg, n) {
  const t = (deg * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * 2 * Math.PI;
    const u = rx * Math.cos(a);
    const v = ry * Math.sin(a);
    pts.push([x + u * Math.cos(t) - v * Math.sin(t), y + u * Math.sin(t) + v * Math.cos(t)]);
  }
  return pts;
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
// an arm bent sharply at the elbow is drawn in two outlines; each tapers into a round joint, so the two
// meet there without a lump
const BENT_UPPER_ARM = [[0, 18, 16], [0.12, 28, 25], [0.3, 29, 25], [0.5, 26, 24], [0.75, 23, 21], [0.9, 21, 20],
  [1, 15, 15]];
const BENT_FOREARM = [[0, 15, 15], [0.1, 21, 20], [0.22, 23, 21], [0.45, 20, 18], [0.75, 16, 15], [1, 14, 13]];

export function draw() {
  return [
    // the spear, upright, its butt on the base
    line([[282, 878], [282, 150]], 9),
    poly([[282, 80], [294, 112], [292, 140], [282, 158], [272, 140], [270, 112]]),

    // the head turned to his right (our left) and bowed, the Corinthian helmet pushed up off the face
    limb(472, 222, 22, 470, 258, 28),
    blob([[432, 160], [428, 176], [425, 184], [414, 201], [421, 206], [418, 213], [421, 220], [424, 226],
      [421, 234], [428, 241], [446, 242], [468, 234], [488, 222], [502, 210], [508, 194], [500, 172],
      [470, 160]]),
    // (in profile: the cheek guard and the nose guard jut forward over the brow, the neck guard flares)
    blob([[432, 166], [414, 163], [402, 156], [401, 148], [408, 143], [397, 135], [410, 125], [426, 112],
      [450, 103], [480, 101], [506, 108], [524, 124], [534, 146], [538, 172], [547, 208], [528, 204],
      [512, 192], [494, 182], [474, 176], [454, 172]], 0.8),
    // the crest seated along the dome, its horsehair falling down behind
    blob([[436, 109], [442, 90], [460, 77], [492, 71], [526, 75], [552, 89], [568, 111], [576, 138], [580, 172],
      [576, 206], [568, 226], [562, 198], [558, 164], [550, 136], [536, 118], [510, 106], [480, 102],
      [452, 106]]),

    // torso: his weight on the right leg (our left), so that hip rides higher and that shoulder drops
    blob([[446, 226], [442, 242], [433, 255], [415, 265], [396, 273], [380, 283], [368, 301], [363, 322],
      [367, 346], [392, 369], [397, 387], [403, 405], [409, 422], [409, 440], [403, 459], [397, 481],
      [398, 505], [403, 528], [435, 534], [468, 518], [501, 538], [533, 532], [537, 510], [537, 485],
      [533, 463], [530, 442], [531, 422], [537, 403], [541, 383], [542, 365], [564, 340], [580, 318],
      [578, 296], [564, 282], [544, 274], [522, 264], [504, 252], [494, 236]]),

    // right arm bent, the hand gripping the spear at the height of the chest
    member([[390, 311], [336, 418]], [BENT_UPPER_ARM], -1),
    circle(336, 418, 21),
    member([[336, 418], [290, 346]], [BENT_FOREARM], 1),
    blob([[268, 326], [280, 316], [294, 318], [302, 330], [302, 346], [296, 358], [278, 360], [268, 350]]),

    // the right leg carries him
    member([[435, 493], [444, 693], [448, 848]], [THIGH, CALF], -1),
    blob([[435, 840], [461, 840], [469, 856], [477, 870], [475, 879], [424, 879], [421, 870], [428, 856]]),

    // the round shield standing on its rim against his left leg; its rim is cut as a ring before the leg is
    // drawn, so the ring breaks where the leg passes in front of it
    blob(oval(620, 726, 100, 150, -6, 36).slice(1)),
    cut(line(oval(620, 726, 84, 134, -6, 144), 6)),
    member([[501, 501], [505, 701], [552, 846]], [THIGH, CALF], 1),
    blob([[541, 838], [564, 840], [580, 856], [598, 870], [596, 879], [542, 879], [536, 866]]),

    // left arm hanging, the hand resting on the rim of the shield
    circle(554, 309, 28),
    member([[554, 309], [584, 418], [592, 520]], [UPPER_ARM, FOREARM], 1),
    member([[592, 512], [594, 552], [596, 590]], HAND, 1),

    // the base
    poly([[260, 879], [736, 879], [744, 904], [252, 904]]),
  ];
}
