// Heracles resting on the dead Nemean lion, after the first metope of the Temple of Zeus at Olympia (about 460 BC); the club is not on the metope but names him in silhouette.
import { blob, chain, circle, cut, ellipse, limb, line } from '../lib.mjs';

export const slug = 'heracles-and-the-nemean-lion';
export const myth = 'Heracles and the Nemean lion';
export const astrology = 'Leo';

// a jagged run of locks along an outline: between every two points a tuft of uneven length sticks out, swept along by sweep
function tufts(list, depth, sweep) {
  const out = [];
  for (let i = 0; i < list.length - 1; i += 1) {
    const [x1, y1] = list[i];
    const [x2, y2] = list[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    const [tx, ty] = [(x2 - x1) / d, (y2 - y1) / d];
    const h = depth * (1 + 0.35 * Math.sin(i * 2.3));
    out.push([x1, y1], [(x1 + x2) / 2 + ty * h + tx * sweep, (y1 + y2) / 2 - tx * h + ty * sweep]);
  }
  out.push(list[list.length - 1]);
  return out;
}

// a polyline cut into steps of about step, so the locks come thick and even
function dense(list, step) {
  const out = [list[0]];
  for (let i = 1; i < list.length; i += 1) {
    const [x1, y1] = list[i - 1];
    const [x2, y2] = list[i];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
    for (let j = 1; j <= n; j += 1) out.push([x1 + ((x2 - x1) * j) / n, y1 + ((y2 - y1) * j) / n]);
  }
  return out;
}

// points given about (cx, cy) turned by deg
const turned = (list, cx, cy, deg) => {
  const a = (deg * Math.PI) / 180;
  return list.map(([u, v]) => [cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)]);
};

// a big paw lying flat, toes forward: the pad and three toes scalloping its front
const paw = (x, y, s) => [
  ellipse(x, y, 30 * s, 14 * s),
  ...[[22, -3], [28, 5], [21, 12]].map(([u, v]) => circle(x + u * s, y + v * s, 8.5 * s)),
];

// the dead lion, lying along the ground facing right, drawn about the root of its tail on the ground (ox, oy) at scale k
function lion(ox, oy, k) {
  const P = ([x, y]) => [ox + k * x, oy + k * y];
  const C = (list) => chain(list.map(([x, y, r]) => [...P([x, y]), r * k]));
  // the mane's crest over the neck and shoulders, coming down over the ear to the brow, and its ruff under the throat
  const crest = [[250, -168], [276, -226], [330, -274], [396, -296], [452, -292], [492, -268], [520, -236], [536, -200], [534, -166]];
  const ruff = [[488, -80], [482, -56], [450, -36], [400, -24], [360, -20]];
  return [
    // the long tail, curling up behind it to its tuft
    C(Array.from({ length: 15 }, (_, i) => {
      const t = i / 14;
      const b = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
      return [b[1] * -60 + b[2] * -140 + b[3] * -112, b[0] * -120 + b[1] * -160 + b[2] * -120 + b[3] * -52, 12 - 5 * t];
    })),
    ellipse(...P([-108, -38]), 12 * k, 21 * k, -20),
    // the hind leg thrown back: the stifle forward, back up to the hock, down to the paw, as a cat's bends
    C([[110, -70, 30], [80, -36, 22], [-24, -64, 12]]),
    C([[-24, -64, 11], [4, -16, 11]]),
    paw(...P([20, -15]), k * 0.9),
    // the round haunch, the waist drawn up behind the deep chest
    ellipse(...P([84, -112]), 74 * k, 76 * k),
    blob([[0, -130], [60, -184], [140, -176], [210, -156], [270, -164], [330, -190], [380, -150], [380, -40], [350, -8],
      [300, -18], [240, -52], [200, -60], [160, -60], [110, -64], [30, -70]].map(P)),
    // the forelegs stretched out, the big paws flat on the ground
    C([[350, -60, 30], [480, -40, 21], [540, -36, 16]]),
    paw(...P([566, -36]), k * 0.9),
    C([[330, -40, 34], [490, -18, 24], [552, -16, 18]]),
    paw(...P([582, -14]), k),
    // the mane, its locks swept back in a hump over the shoulders and hanging in a ruff from the throat
    blob([...tufts(dense(crest, 14), 9, -7), [510, -140], [490, -100], ...tufts(dense(ruff, 14), 7, 5), [300, -60], [262, -120]]
      .map(P), 0.8),
    // the head sunk on the paws, eyes shut and mouth closed: a flat brow, a straight nose, a broad square muzzle
    blob([[485, -132], [515, -148], [540, -152], [562, -148], [576, -138], [596, -128], [612, -120], [622, -112], [623, -104],
      [618, -98], [622, -90], [618, -80], [606, -74], [594, -71], [595, -63], [575, -55], [545, -51], [515, -54], [488, -72]].map(P)),
    cut(line([[608, -75], [590, -71], [572, -67]].map(P), 4 * k)),
    cut(line([[564, -120], [573, -123], [582, -121]].map(P), 4 * k)),
    // a small round ear, half lost in the mane
    circle(...P([512, -153]), 11 * k),
  ];
}

// the scene scaled by k and moved by (dx, dy) to sit centred: the kit's outlines are absolute M, L and C points, a circle
// is drawn with relative arcs (radii and end point scale, flags do not), and a rod keeps its width in proportion
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
  // Heracles, young and beardless, weary: his foot on the lion's haunch, his elbow on that knee, his head sunk on his hand
  const hero = [
    chain([[232, 540, 46], [226, 640, 33], [222, 690, 26], [212, 740, 27], [196, 856, 15]]),
    circle(234, 680, 16),
    blob([[176, 882], [178, 862], [196, 850], [214, 860], [244, 872], [248, 884]]),
    // the torso bent forward from the hips: the buttock, the hollow of the back, the rounded shoulders; the chest, the belly
    blob([[180, 550], [187, 521], [217, 497], [259, 466], [287, 423], [315, 380], [345, 356], [373, 347], [420, 390],
      [406, 429], [371, 465], [331, 497], [296, 535], [262, 573], [233, 590]]),
    chain([[246, 545, 46], [420, 505, 30]]),
    chain([[420, 505, 30], [432, 562, 28], [452, 688, 16]]),
    blob([[438, 712], [458, 698], [482, 706], [512, 712], [516, 722], [440, 722]]),
    limb(386, 366, 21, 432, 342, 18),
    blob(turned([[-38, -2], [-30, -30], [-10, -44], [14, -42], [30, -30], [37, -14], [36, -8], [44, 6], [38, 10], [40, 15],
      [37, 19], [39, 23], [33, 32], [16, 38], [-8, 34], [-30, 20]], 466, 312, 35)),
    ...turned([[24, -38], [10, -45], [-6, -46], [-21, -40], [-32, -29], [-39, -14], [-40, 2]], 466, 312, 35).map(
      ([x, y]) => circle(x, y, 9)),
    chain([[382, 382, 26], [426, 482, 20], [452, 376, 13]]),
    ellipse(455, 360, 16, 18),
  ];
  // the club in his other hand, its heavy knotted end on the ground behind him
  const club = [
    chain([[206, 560, 9], [176, 660, 13], [144, 762, 18], [116, 852, 23]]),
    ...[[197, 621, 7], [161, 668, 8], [169, 725, 9], [127, 766, 10], [143, 822, 10], [100, 840, 8]].map(([x, y, r]) => circle(x, y, r)),
  ];
  return placed([club, lion(407, 880, 0.84), hero], 0.958, 12, -48);
}
