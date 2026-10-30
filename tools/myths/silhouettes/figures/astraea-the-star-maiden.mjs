// Astraea, after the winged maidens of Greek art and the winged Virgo of the ancient star maps, the ear of wheat in her hand.
import { blob, chain, circle, ellipse, limb, line } from '../lib.mjs';

export const slug = 'astraea-the-star-maiden';
export const myth = 'Astraea, the star maiden';
export const astrology = 'Virgo';

const L = (x) => x;
const R = (x) => 1000 - x;

// a wing raised behind the shoulder: its coverts, then long feathers fanned up from them, overlapping until near their tips
const FEATHERS = [[350, 150, 330, 74], [360, 168, 352, 86], [372, 186, 376, 104], [384, 204, 400, 130], [398, 224, 422, 162],
  [412, 246, 440, 200], [426, 268, 454, 242]];
const wing = (m) => [
  blob([[440, 300], [410, 282], [380, 254], [354, 218], [336, 178], [328, 136], [328, 104],
    ...FEATHERS.map(([, , x, y]) => [x + 10, y + 26]), [452, 286]].map(([x, y]) => [m(x), y])),
  ...FEATHERS.map(([x1, y1, x2, y2]) => limb(m(x1), y1, 18, m(x2), y2, 3)),
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

export function draw() {
  return [
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
    ellipse(470, 858, 18, 7),
    ellipse(530, 860, 18, 7),
    // her right arm held out with the ear of wheat, the star Spica; her left lowered, holding a torch
    chain([[440, 302, 19], [398, 384, 14], [352, 344, 10]]),
    ellipse(345, 336, 10, 13, -20),
    wheat(342, 330, 50, -12),
    chain([[560, 302, 19], [596, 396, 14], [612, 480, 10]]),
    ellipse(614, 492, 10, 13),
    line([[616, 404], [616, 640]], 8),
    ellipse(616, 400, 13, 6),
    blob([[616, 290], [624, 314], [630, 304], [636, 330], [640, 356], [632, 382], [618, 394], [602, 388], [594, 364],
      [598, 340], [604, 324], [608, 302]], 0.8),
  ];
}
