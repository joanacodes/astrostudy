// Astraea, after the winged Victories of Greek and Roman art, with the ear of wheat that marks Virgo on the ancient star globes.
import { blob, chain, circle, ellipse, limb, line } from '../lib.mjs';

export const slug = 'astraea-the-star-maiden';
export const myth = 'Astraea, the star maiden';
export const astrology = 'Virgo';

// the wings are drawn once, for m(x) = x (our left) and m(x) = 1000 - x (our right)
const L = (x) => x;
const R = (x) => 1000 - x;

// a wing spread from behind the shoulder: the coverts, the long primaries parted at its end, the secondaries overlapping
// along its lower edge until near their tips
const SECONDARIES = [[296, 230, 240, 286], [322, 244, 278, 304], [348, 258, 316, 318], [374, 272, 352, 326],
  [400, 286, 388, 330], [426, 298, 424, 330]];
const wing = (m) => [
  blob([[452, 300], [430, 272], [398, 238], [358, 204], [312, 178], [266, 162], [232, 160], [220, 176], [236, 214],
    ...SECONDARIES.map(([, , x, y]) => [x + 4, y - 26]), [446, 312]].map(([x, y]) => [m(x), y])),
  ...[[250, 166, 176, 138], [254, 178, 170, 166], [260, 192, 174, 196], [268, 206, 184, 226], [280, 220, 202, 254]].map(
    ([x1, y1, x2, y2]) => limb(m(x1), y1, 15, m(x2), y2, 3)),
  ...SECONDARIES.map(([x1, y1, x2, y2]) =>
    chain([[m(x1), y1, 18], [m((x1 + 2 * x2) / 3), (y1 + 2 * y2) / 3, 15], [m(x2), y2, 4]])),
];

// an ear of wheat on its stalk: kernels in two rows up the spike, awns standing off them
function wheat(x, y, len, deg) {
  const a = (deg * Math.PI) / 180;
  const P = (u, v) => [x + u * Math.sin(a) + v * Math.cos(a), y - u * Math.cos(a) + v * Math.sin(a)];
  return [
    line([P(0, 0), P(len, 0)], 4),
    ...Array.from({ length: 7 }, (_, i) => [-1, 1].map((s) => [
      ellipse(...P(len + 6 + i * 9, s * 5), 5, 8, deg + s * 20),
      line([P(len + 10 + i * 9, s * 7), P(len + 30 + i * 9, s * 13)], 1.6),
    ])),
    ellipse(...P(len + 70, 0), 4, 7, deg),
  ];
}

// the figure scaled by k and moved by (dx, dy) to fill the frame: the kit's outlines are absolute M, L and C points, a
// circle is drawn with relative arcs (radii and end point scale, flags do not), and a rod keeps its width in proportion
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
  return placed([
    wing(L),
    wing(R),
    // the head turned towards the wheat, the hair gathered in a knot at the back
    ellipse(502, 212, 33, 45),
    circle(530, 176, 16),
    blob([[480, 192], [470, 206], [463, 214], [469, 220], [467, 228], [471, 238], [486, 254], [502, 256]]),
    limb(500, 250, 15, 500, 286, 18),
    // the chiton: girdled high, its overfold falling to the hips and dipping at the sides
    blob([[468, 280], [436, 290], [426, 312], [430, 336], [444, 350], [452, 372], [440, 420], [426, 472], [446, 462],
      [500, 458], [554, 462], [574, 472], [560, 420], [548, 372], [556, 350], [570, 336], [574, 312], [564, 290],
      [532, 280]]),
    // the long skirt, falling straight over the standing leg and pushed out by the other knee, folds at the hem
    blob([[442, 464], [436, 540], [432, 620], [426, 700], [418, 780], [410, 846], [424, 856], [440, 846], [456, 858],
      [472, 846], [488, 858], [504, 846], [520, 858], [536, 846], [552, 858], [568, 846], [584, 856], [596, 846],
      [588, 790], [584, 720], [580, 650], [572, 610], [564, 540], [558, 464]]),
    blob([[452, 838], [490, 838], [492, 860], [470, 866], [450, 862]]),
    blob([[510, 840], [548, 840], [550, 862], [530, 868], [508, 864]]),
    // her right arm held out with the ear of wheat, the star Spica; her left lowered, holding a burning torch
    chain([[440, 304, 21], [404, 404, 15], [348, 448, 11]]),
    ellipse(340, 450, 10, 13, -40),
    wheat(337, 444, 40, -10),
    chain([[560, 304, 21], [590, 404, 15], [646, 498, 11]]),
    ellipse(652, 510, 10, 13),
    line([[660, 470], [660, 740]], 8),
    ellipse(660, 466, 13, 6),
    blob([[660, 366], [668, 388], [674, 378], [680, 404], [684, 428], [676, 450], [662, 460], [646, 454], [638, 432],
      [642, 410], [648, 396], [652, 376]], 0.8),
  ], 1.09, -45, -46);
}
