// Selene and Endymion, after the Roman sarcophagi carved with the myth, such as the one in the Metropolitan Museum of Art, New York.
import { blob, chain, circle, limb, poly } from '../lib.mjs';

export const slug = 'selene-and-endymion';
export const myth = 'Selene and Endymion';
export const astrology = 'Moon';

// points round a circle from angle a0 to a1 (radians), turning the way that passes through angle via
function arcPoints(cx, cy, r, a0, a1, via, n = 24) {
  const tau = 2 * Math.PI;
  const mod = (v) => ((v % tau) + tau) % tau;
  const span = mod(a1 - a0);
  const sweep = mod(via - a0) < span ? span : span - tau;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = a0 + (sweep * i) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
}

// a crescent: the part of circle (x1, y1, r1) left uncovered by circle (x2, y2, r2)
function crescent(x1, y1, r1, x2, y2, r2) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(r1 * r1 - a * a);
  const [ux, uy] = [(x2 - x1) / d, (y2 - y1) / d];
  const [px, py] = [x1 + a * ux, y1 + a * uy];
  const t1 = [px - h * uy, py + h * ux];
  const t2 = [px + h * uy, py - h * ux];
  const away = Math.atan2(-uy, -ux);
  const ang = (cx, cy, [x, y]) => Math.atan2(y - cy, x - cx);
  const outer = arcPoints(x1, y1, r1, ang(x1, y1, t1), ang(x1, y1, t2), away, 36);
  const inner = arcPoints(x2, y2, r2, ang(x2, y2, t2), ang(x2, y2, t1), away, 36);
  return poly([...outer, ...inner]);
}

// points drawn upright round (0, 0), scaled by k, turned by deg (clockwise on screen) and set down at (x, y)
function turn(points, x, y, deg = 0, k = 1) {
  const t = (deg * Math.PI) / 180;
  return points.map(([u, v]) => [x + k * (u * Math.cos(t) - v * Math.sin(t)), y + k * (u * Math.sin(t) + v * Math.cos(t))]);
}

// her head in profile facing right, about 84 high, the hair waved back from the brow
const SELENE = [[-4, -42], [16, -38], [26, -28], [30, -18], [31, -8], [40, 6], [32, 10], [34, 15], [31, 19], [32, 23],
  [28, 30], [16, 34], [10, 40], [-16, 32], [-30, 14], [-34, -8], [-28, -30], [-16, -40]];

// his head in profile facing left, young and beardless, the short hair curling at the back
const ENDYMION = [[0, -42], [-22, -36], [-32, -22], [-36, -8], [-34, -2], [-44, 10], [-34, 14], [-36, 20], [-32, 26],
  [-30, 34], [-18, 40], [0, 38], [16, 34], [26, 26], [36, 22], [38, 8], [44, -2], [40, -16], [42, -28], [30, -36],
  [24, -46], [12, -44]];

export function draw() {
  return [
    // the veil billowing in a great arc from her raised hand, over her head and on above the sleeper, its
    // folds rippling along the hem
    blob([[154, 198], [136, 181], [138, 147], [169, 115], [225, 92], [304, 78], [391, 76], [476, 87], [550, 111],
      [610, 144], [649, 181], [664, 224], [642, 209], [628, 239], [608, 206], [586, 180], [560, 162], [532, 172],
      [505, 176], [478, 152], [450, 134], [422, 146], [395, 154], [368, 142], [340, 130], [314, 144], [290, 154],
      [264, 148], [240, 152], [216, 170], [196, 184], [178, 192], [167, 198]]),
    blob([[156, 198], [131, 213], [109, 235], [95, 262], [120, 245], [142, 228], [165, 211]]),
    // the crescent moon rising behind her shoulders
    crescent(274, 361, 116, 274, 311, 105),
    // the goddess leaning down towards him: head, neck, the raised arm holding the veil, the other reaching out
    blob(turn(SELENE, 292, 276, 18, 1.1)),
    circle(257, 258, 15),
    limb(281, 311, 12, 272, 347, 17),
    chain([[241, 358, 17], [196, 282, 12], [160, 211, 9]]),
    circle(154, 197, 11),
    chain([[308, 365, 17], [360, 419, 12], [404, 468, 9]]),
    limb(404, 468, 9, 421, 491, 6),
    // the high-girdled chiton, clinging to the front leg as she alights, streaming back from the other
    blob([[239, 350], [277, 343], [315, 356], [330, 385], [326, 414], [308, 428], [241, 430], [225, 412], [225, 379]]),
    blob([[308, 423], [317, 479], [333, 558], [351, 659], [362, 748], [369, 806], [348, 806], [326, 759], [290, 703],
      [241, 670], [185, 663], [124, 681], [68, 706], [113, 654], [165, 609], [198, 565], [216, 502], [232, 453],
      [241, 423]]),
    // her bare feet below the hem: the front one touching the rock, the other lifted behind
    chain([[360, 793, 12], [369, 833, 9]]),
    limb(369, 833, 9, 391, 858, 7),
    chain([[210, 663, 16], [151, 710, 10]]),
    limb(151, 710, 9, 129, 748, 7),
    // Endymion asleep on the rock at her feet, his head thrown back under his arched arm
    blob(turn(ENDYMION, 458, 774, 40, 1)),
    limb(488, 798, 22, 470, 786, 15),
    chain([[496, 806, 16], [522, 702, 12], [444, 690, 9]]),
    limb(444, 690, 9, 422, 708, 6),
    blob([[480, 790], [530, 798], [598, 818], [656, 838], [666, 866], [606, 870], [538, 852], [490, 838], [470, 816]]),
    chain([[646, 858, 27], [754, 864, 18], [852, 874, 11]]),
    limb(852, 874, 10, 882, 878, 7),
    chain([[644, 850, 25], [736, 794, 17], [812, 862, 11]]),
    limb(812, 862, 10, 840, 868, 7),
    // the rock
    blob([[312, 874], [372, 868], [422, 852], [462, 816], [492, 824], [562, 852], [692, 878], [872, 884], [906, 892],
      [898, 908], [612, 910], [322, 910]]),
  ];
}
