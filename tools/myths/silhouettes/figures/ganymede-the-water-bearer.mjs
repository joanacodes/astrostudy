// Ganymede as the water-bearer, after the Roman statues of the Trojan youth in a Phrygian cap with Zeus's eagle at his feet.
import { blob, chain, circle, ellipse, limb, line } from '../lib.mjs';

export const slug = 'ganymede-the-water-bearer';
export const myth = 'Ganymede, cup-bearer of the gods, the water-bearer';
export const astrology = 'Aquarius';

// the amphora on his shoulder, drawn along its axis from foot to mouth and tipped by deg
function amphora(cx, cy, deg) {
  const a = (deg * Math.PI) / 180;
  const P = ([u, v]) => [cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)];
  const side = (s) => [[-58, 8 * s], [-50, 24 * s], [-30, 40 * s], [-8, 44 * s], [14, 42 * s], [30, 34 * s], [40, 22 * s], [46, 13 * s]];
  return [
    blob([...side(-1), ...side(1).reverse()].map(P), 0.9),
    limb(...P([44, 0]), 13, ...P([72, 0]), 12),
    ellipse(...P([76, 0]), 7, 19, deg),
    ellipse(...P([-66, 0]), 6, 17, deg),
    limb(...P([-60, 0]), 9, ...P([-50, 0]), 14),
    ...[-1, 1].map((s) => line([[64, 12 * s], [62, 30 * s], [46, 36 * s], [34, 30 * s]].map(P), 7)),
  ];
}

// Zeus's eagle hovering, wings spread and fingered, tail fanned, its head turned down towards him: drawn about its body at scale k
function eagle(ox, oy, k) {
  const P = ([x, y]) => [ox + k * x, oy + k * y];
  const L = (x1, y1, r1, x2, y2, r2) => limb(...P([x1, y1]), k * r1, ...P([x2, y2]), k * r2);
  const wing = (s) => [
    blob([[12, -30], [50, -54], [90, -68], [122, -70], [130, -50], [130, -20], [118, 0], [90, 8], [60, 12], [30, 16],
      [12, 22]].map(([x, y]) => P([s * x, y]))),
    ...[[122, -64, 152, -80], [126, -52, 164, -62], [128, -40, 168, -40], [126, -28, 162, -18], [120, -16, 150, 2]].map(
      ([x1, y1, x2, y2]) => L(s * x1, y1, 10, s * x2, y2, 3)),
  ];
  return [
    wing(-1),
    wing(1),
    blob([[-14, 36], [14, 36], [32, 84], [16, 80], [0, 88], [-16, 80], [-32, 84]].map(P)),
    ellipse(...P([0, 0]), 22 * k, 46 * k),
    L(0, -36, 18, 8, -52, 14),
    circle(...P([12, -58]), 15 * k),
    chain([[22, -62, 7], [32, -58, 5], [34, -49, 1.5]].map(([x, y, r]) => [...P([x, y]), k * r])),
  ];
}

export function draw() {
  // the water, falling from the urn's mouth in a long curve to the ground, where it splashes
  const fall = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14;
    return [662 + 176 * t, 300 + 60 * t + 504 * t * t, 11 - 3 * t];
  });
  return [
    chain(fall),
    ellipse(842, 866, 42, 7),
    ...[[806, 846, 5], [874, 842, 4], [858, 826, 3], [820, 828, 3]].map(([x, y, r]) => circle(x, y, r)),
    amphora(592, 236, 40),
    // the Phrygian cap, its peak falling forward and its flap down the cheek; the face turned towards the urn
    blob([[410, 252], [404, 206], [412, 168], [430, 140], [456, 124], [484, 122], [504, 130], [516, 144], [520, 162],
      [508, 158], [494, 150], [484, 162], [476, 172], [462, 196], [452, 246], [430, 256]]),
    blob([[440, 160], [478, 160], [486, 178], [496, 196], [488, 204], [490, 214], [484, 228], [462, 242], [440, 236],
      [430, 210]]),
    limb(452, 236, 17, 452, 274, 20),
    // the body in contrapposto: the weight on his right leg, that hip pushed out, the other knee bent and the heel raised
    blob([[436, 266], [392, 284], [370, 298], [364, 318], [378, 340], [384, 362], [388, 392], [396, 418], [386, 452],
      [380, 480], [384, 520], [452, 522], [514, 500], [512, 465], [510, 428], [516, 395], [524, 360], [530, 330],
      [544, 296], [528, 280], [502, 272], [468, 266]]),
    blob([[384, 510], [392, 580], [400, 630], [404, 662], [398, 700], [404, 750], [418, 826], [444, 828], [446, 790],
      [450, 720], [446, 662], [444, 640], [448, 580], [452, 520]]),
    blob([[416, 822], [446, 824], [452, 846], [452, 862], [412, 862], [410, 846]]),
    blob([[458, 522], [514, 498], [512, 540], [506, 600], [500, 668], [506, 720], [516, 780], [522, 828], [502, 830],
      [494, 790], [478, 730], [468, 672], [466, 640], [462, 580]]),
    blob([[500, 824], [524, 826], [542, 848], [538, 858], [514, 852]]),
    // his left arm steadying the urn, his right hanging with the cup he pours for the gods
    chain([[536, 302, 21], [600, 362, 15], [618, 304, 11]]),
    ellipse(624, 292, 12, 15, 30),
    chain([[378, 308, 20], [356, 418, 16], [344, 506, 11]]),
    ellipse(340, 520, 11, 15),
    blob([[308, 532], [358, 532], [352, 546], [338, 554], [326, 554], [312, 546]]),
    limb(332, 552, 4, 332, 570, 4),
    ellipse(332, 572, 12, 4),
    eagle(218, 228, 0.88),
  ];
}
