// The Queen of the Night, after the Burney Relief (British Museum, Old Babylonian, about 1800–1750 BC).
import { blob, chain, circle, cut, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'lilith-queen-of-the-night';
export const myth = 'The Queen of the Night, often linked to Lilith';
export const astrology = 'Black Moon Lilith';

// the relief is symmetrical: each half is drawn once, for m(x) = x (our left) and m(x) = 1000 - x (our right)
const L = (x) => x;
const R = (x) => 1000 - x;
const pts = (m, list) => list.map(([x, y]) => [m(x), y]);
const ring = (m, cx, cy, r, w) => line(pts(m, Array.from({ length: 33 }, (_, i) => [cx + r * Math.sin((i / 32) * 2 * Math.PI), cy - r * Math.cos((i / 32) * 2 * Math.PI)])), w);

// a shaggy edge along an open run of outline points: a lock pushed out between every two of them
function scallop(list, amp) {
  const out = [];
  for (let i = 0; i < list.length - 1; i += 1) {
    const [x1, y1] = list[i];
    const [x2, y2] = list[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    out.push([x1, y1], [(x1 + x2) / 2 + ((y1 - y2) / d) * amp, (y1 + y2) / 2 + ((x2 - x1) / d) * amp]);
  }
  out.push(list[list.length - 1]);
  return out;
}

// an owl seen from the front, standing: ear tufts, a broad head running straight into the body, talons
function owl(m, cx) {
  const o = (list) => pts(m, list.map(([x, y]) => [cx + x, y]));
  return [
    blob(o([[-38, 628], [-19, 622], [0, 627], [19, 622], [38, 628], [45, 652], [45, 682], [49, 716], [51, 750], [45, 780],
      [32, 798], [13, 808], [0, 812], [-13, 808], [-32, 798], [-45, 780], [-51, 750], [-49, 716], [-45, 682], [-45, 652]])),
    limb(m(cx - 31), 634, 10, m(cx - 46), 608, 2.5),
    limb(m(cx + 31), 634, 10, m(cx + 46), 608, 2.5),
    ...[-17, 17].map((x) => [limb(m(cx + x), 800, 7, m(cx + x - 8), 812, 4), limb(m(cx + x), 800, 7, m(cx + x + 8), 812, 4)]),
  ];
}

const PRIMARIES = [[182, 602], [214, 600], [246, 596], [278, 588], [310, 578], [342, 564], [372, 546], [400, 524]];

function half(m) {
  return [
    // the wing hangs from behind the shoulder, its top edge running under the arm so the raised forearm stands clear
    blob(pts(m, [[442, 340], [400, 362], [345, 378], [300, 366], [258, 344], [222, 324], [194, 330], [178, 362],
      [171, 410], [172, 452], [200, 474], [262, 482], [330, 478], [388, 462], [416, 438], [430, 396]])),
    // its long primaries, overlapping, the outermost longest, parting only towards their tips
    blob(pts(m, [[188, 440], ...PRIMARIES.map(([x, y]) => [x + 3, y - 40]), [414, 440], [300, 430]])),
    ...PRIMARIES.map(([x, y], i) => chain([[m(x + 10 + i * 1.5), 432, 17], [m(x + 4), 432 + (y - 432) * 0.7, 15], [m(x), y, 2.5]])),
    // the raised arm and the rod-and-ring in the fist
    chain([[m(437), 320, 22], [m(385), 338, 18], [m(332), 357, 15]]),
    chain([[m(332), 357, 14], [m(329), 322, 13], [m(323), 266, 10]]),
    ellipse(m(322), 249, 12, 17),
    line([[m(294), 248], [m(350), 248]], 8),
    ring(m, 322, 206, 20, 7),
    // the leg, ending in a bird's foot whose talons grip the lion's back
    blob(pts(m, [[438, 505], [433, 548], [438, 600], [445, 646], [440, 692], [446, 732], [450, 758], [472, 758],
      [478, 716], [483, 680], [488, 648], [494, 600], [500, 548], [500, 522], [472, 506]])),
    limb(m(461), 752, 11, m(461), 772, 9),
    ...[[424, 786, 413, 797, 413, 810], [459, 798, 455, 810, 457, 822], [490, 786, 497, 797, 496, 810]].map(
      ([x, y, cx, cy, tx, ty]) => chain([[m(461), 772, 8], [m(x), y, 5.5], [m(cx), cy, 3], [m(tx), ty, 1]])),
    // the horns of the crown, tier above tier, each curving up from the cap
    ...[[186, 470], [160, 475], [134, 481]].map(([y, x]) =>
      chain([[m(x + 2), y, 8], [m(x - 12), y - 2, 6.5], [m(x - 19), y - 10, 4], [m(x - 21), y - 21, 1.5]])),
    owl(m, 362),
    // the lion lying down, its back to the other lion's
    blob(pts(m, [[478, 812], [440, 795], [380, 800], [320, 806], [272, 804], [190, 860], [212, 876], [260, 884],
      [330, 880], [390, 886], [440, 895], [496, 868], [498, 840]])),
    ellipse(m(440), 846, 58, 50),
    limb(m(210), 860, 24, m(112), 882, 14),
    ellipse(m(92), 884, 24, 12),
    limb(m(228), 852, 20, m(140), 878, 12),
    ellipse(m(126), 880, 20, 10),
    limb(m(478), 880, 16, m(372), 888, 12),
    ellipse(m(362), 888, 20, 10),
    // its mane, full and shaggy from the crown of the head down the neck, and the blunt muzzle jutting out of it
    blob(pts(m, scallop([[132, 716], [150, 698], [176, 688], [206, 686], [234, 694], [258, 712], [274, 738], [282, 768],
      [282, 798], [268, 822]], 7).concat(scallop([[236, 850], [204, 862], [176, 856], [150, 850], [124, 842], [102, 828]], 7),
      [[120, 790], [138, 736]]))),
    blob(pts(m, [[68, 752], [72, 744], [84, 738], [100, 733], [116, 724], [134, 716], [152, 722], [164, 750], [158, 790],
      [136, 806], [112, 808], [94, 802], [84, 792], [78, 784], [70, 774], [67, 762]])),
    limb(m(138), 716, 9, m(143), 697, 7),
  ];
}

export function draw() {
  return [
    half(L),
    half(R),
    // the cap of the horned crown, and her hair falling in two heavy curls to the shoulders
    poly([[468, 196], [474, 160], [480, 128], [488, 112], [500, 108], [512, 112], [520, 128], [526, 160], [532, 196]]),
    circle(500, 103, 8),
    ellipse(500, 214, 46, 30),
    ...[458, 542].map((x) => [ellipse(x, 244, 15, 36), circle(x, 270, 15)]),
    ellipse(500, 232, 30, 40),
    limb(500, 268, 15, 500, 302, 19),
    // the body, frontal and bare
    blob([[462, 298], [440, 304], [420, 316], [414, 332], [428, 348], [440, 362], [446, 385], [450, 410], [456, 440],
      [450, 468], [440, 492], [436, 512], [470, 528], [500, 530], [530, 528], [564, 512], [560, 492], [550, 468], [544, 440], [550, 410],
      [554, 385], [560, 362], [572, 348], [586, 332], [580, 316], [560, 304], [538, 298]]),
    // the owls' eyes
    ...[345, 379, 621, 655].map((x) => cut(circle(x, 660, 12))),
  ];
}
