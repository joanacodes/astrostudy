// Heracles wrestling the Nemean lion, after the Attic black-figure vases of the later sixth century BC.
import { blob, chain, circle, cut, ellipse, limb, poly } from '../lib.mjs';

export const slug = 'heracles-and-the-nemean-lion';
export const myth = 'Heracles wrestles the Nemean lion';
export const astrology = 'Leo';

// where one body passes in front of the other, a thin line is taken out around it, as the vase painters incised it
const GAP = 7;
const incise = (...shapes) => shapes.flat(Infinity).map((s) => cut({ stroke: s.d, width: 2 * GAP }));

// the lion's head in profile, roaring: points given facing right about the eye, scaled by k and turned by deg
function lionHead(ox, oy, k, deg) {
  const a = (deg * Math.PI) / 180;
  const P = ([x, y]) => [ox + k * (x * Math.cos(a) - y * Math.sin(a)), oy + k * (x * Math.sin(a) + y * Math.cos(a))];
  const mane = [[8, -44], [-14, -68], [-40, -88], [-34, -70], [-64, -86], [-96, -78], [-82, -64], [-116, -56], [-134, -30],
    [-118, -24], [-144, 0], [-140, 30], [-124, 26], [-130, 60], [-108, 90], [-96, 72], [-84, 108], [-56, 122], [-50, 100],
    [-26, 128], [-2, 112], [-6, 92], [18, 100], [30, 78], [14, 60], [-4, 36]];
  return [
    blob(mane.map(P), 0.85),
    blob([[-24, -36], [6, -42], [26, -34], [42, -22], [58, -14], [72, -6], [78, 4], [76, 16], [66, 26], [40, 28], [14, 30],
      [-16, 24]].map(P)),
    poly([[60, 22], [70, 22], [65, 40]].map(P)),
    blob([[12, 30], [36, 48], [58, 64], [66, 74], [52, 80], [28, 66], [4, 46]].map(P)),
    limb(...P([-6, -40]), 12 * k, ...P([0, -54]), 9 * k),
  ];
}

// a forepaw reaching along deg: a round paw, its claws bared as short hooks curving down off the front
const forepaw = (x, y, deg) => {
  const t = (deg * Math.PI) / 180;
  return [
    ellipse(x, y, 23, 17, deg),
    ...[-0.35, 0.1, 0.55].map((o) => {
      const [cx, cy] = [x + 20 * Math.cos(t + o), y + 20 * Math.sin(t + o)];
      return chain([[cx, cy, 4], [cx + 7 * Math.cos(t + 0.5), cy + 7 * Math.sin(t + 0.5), 2.4],
        [cx + 9 * Math.cos(t + 1.3), cy + 9 * Math.sin(t + 1.3), 1]]);
    }),
  ];
};

// the whole group scaled by k and moved by (dx, dy) to fill the frame: the kit's outlines are absolute M, L and C points, a
// circle is drawn with relative arcs (radii and end point scale, flags do not), and a rod or an incision keeps its width in proportion
function placed(shapes, k, dx, dy) {
  const num = (n) => Math.round(n * 10) / 10;
  const path = (d) => d.replace(/([MLCa])([^MLCaZ]*)/g, (_, c, body) => {
    const n = body.trim().split(/[\s,]+/).map(Number);
    const out = c === 'a'
      ? n.map((v, i) => ([0, 1, 5, 6].includes(i % 7) ? num(v * k) : v))
      : n.map((v, i) => num(i % 2 ? v * k + dy : v * k + dx));
    return `${c}${out.join(' ')} `;
  });
  return shapes.flat(Infinity).map((s) => (s.stroke ? { ...s, stroke: path(s.stroke), width: s.width * k } : { ...s, d: path(s.d) }));
}

export function draw() {
  // the lion rearing on its hind legs, its forepaws clawing the air, roaring; its back pressed against the hero
  const lion = [
    // the far hind leg, then the near one: the thigh forward to the stifle, back to the pointed hock, down to the paw
    blob([[452, 662], [546, 682], [570, 728], [558, 760], [546, 792], [544, 830], [558, 854], [566, 870], [522, 874],
      [514, 860], [506, 828], [494, 798], [476, 752], [460, 706]]),
    blob([[488, 650], [600, 672], [628, 724], [616, 758], [602, 790], [600, 830], [616, 854], [624, 870], [580, 876],
      [572, 862], [560, 830], [548, 798], [530, 752], [506, 704]]),
    blob([[476, 655], [492, 590], [520, 530], [562, 476], [608, 432], [652, 440], [676, 492], [672, 536], [650, 568],
      [624, 594], [604, 628], [596, 672], [540, 690], [486, 688]]),
    // the forelegs, elbows tucked back under the chest, forearms reaching out with the claws bared
    chain([[648, 456, 30], [664, 500, 25], [734, 482, 21], [784, 448, 17]]),
    forepaw(800, 438, -32),
    chain([[660, 500, 32], [668, 556, 27], [736, 578, 22], [786, 600, 18]]),
    forepaw(802, 606, 20),
    // the mane falling over the chest, and the roaring head
    blob([[640, 430], [676, 426], [700, 448], [712, 476], [700, 490], [708, 512], [690, 518], [694, 542], [672, 538],
      [668, 562], [650, 544], [640, 500], [634, 466]], 0.85),
    lionHead(712, 320, 1.08, -12),
  ];
  // its tail, lashing out between the hero's legs; the root, drawn after the incision, keeps it joined to the rump
  const tailRoot = chain([[486, 655, 11], [452, 700, 10]]);
  const tail = [
    chain([[452, 700, 10], [420, 748, 9], [402, 800, 8], [378, 836, 7], [348, 840, 6], [328, 822, 5]]),
    ellipse(322, 808, 16, 10, 70),
  ];
  // Heracles behind it, bent forward over its back: legs braced, the back and buttocks
  const hero = [
    chain([[295, 600, 42], [205, 728, 28], [168, 788, 25], [130, 858, 15]]),
    blob([[108, 880], [112, 860], [132, 850], [148, 860], [174, 870], [178, 882]]),
    chain([[320, 610, 44], [402, 702, 28], [404, 752, 26], [394, 858, 15]]),
    blob([[376, 882], [378, 860], [398, 852], [416, 864], [446, 874], [448, 884]]),
    blob([[258, 594], [270, 560], [300, 538], [346, 516], [396, 488], [446, 454], [484, 426], [510, 412], [524, 455],
      [502, 492], [462, 524], [422, 556], [386, 588], [350, 616], [318, 630], [282, 620]]),
  ];
  // the parts of him that lie over the lion: the curly head pressed into its mane, the arm locked round its throat
  const heroFront = [
    limb(486, 420, 25, 512, 392, 22),
    blob([[494, 340], [506, 320], [528, 312], [550, 320], [564, 340], [574, 360], [565, 370], [570, 388], [556, 414],
      [534, 408], [510, 396], [494, 376]]),
    ...[[498, 332, 12], [510, 316, 12], [528, 309, 11], [490, 352, 11], [492, 374, 10]].map(([x, y, r]) => circle(x, y, r)),
    chain([[492, 440, 28], [606, 452, 23], [690, 410, 18]]),
    ellipse(700, 404, 17, 16),
  ];
  return placed([
    lion,
    incise(heroFront),
    hero,
    heroFront,
    incise(tail),
    tailRoot,
    tail,
  ], 1.08, -8, -93);
}
