// Castor and Pollux (Gemini), after the Dioscuri of Roman coins and statues: spears, pilos caps, stars.
import { blob, circle, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'castor-and-pollux';
export const myth = 'Castor and Pollux';
export const astrology = 'Gemini';

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

// a youth's limbs at this scale, [t, outer, inner], each starting narrow where it tucks into the body; the
// arm's halves also taper into the elbow, for the sharply bent spear arm (the hanging arm leaves those off)
const THIGH = [[0, 19, 19], [0.06, 31, 29], [0.16, 33, 29], [0.38, 31, 27], [0.6, 27, 24], [0.8, 23.5, 23.5],
  [0.93, 20.5, 22]];
const CALF = [[0, 19.5, 19.5], [0.1, 21, 20], [0.25, 24, 23], [0.4, 23, 24], [0.55, 19, 21.5], [0.72, 15.5, 16.5],
  [0.88, 13, 14], [1, 12, 12]];
const UPPER_ARM = [[0, 16, 14], [0.12, 24, 22], [0.3, 25, 22], [0.5, 23, 21], [0.75, 20, 18], [0.9, 18, 17],
  [1, 13, 13]];
const FOREARM = [[0, 13, 13], [0.1, 18, 17], [0.22, 20, 18], [0.45, 17, 15], [0.75, 14, 13], [0.92, 11, 10],
  [1, 7, 7]];
const HAND = [[[0, 9, 9], [0.3, 10, 10], [0.65, 12, 13], [1, 11, 12]], [[0, 11, 12], [0.4, 10, 10], [0.8, 8, 7],
  [1, 4, 4]]];

// one twin, drawn on the left (m = 1) or mirrored into his brother on the right (m = -1). Each stands as
// the Polykleitan spear-bearers do: the weight on the inner leg, the spear in the outer hand
function twin(m) {
  const X = (x) => (m > 0 ? x : 1000 - x);
  const P = (pts) => pts.map(([x, y]) => [X(x), y]);
  return [
    // the spear, upright on the base
    line(P([[198, 878], [198, 172]]), 8),
    poly(P([[198, 98], [208, 128], [206, 154], [198, 172], [190, 154], [188, 128]])),

    // the star above his head
    poly(P([[372, 90], [378, 115], [398, 121], [378, 127], [372, 152], [366, 127], [346, 121], [366, 115]])),

    // the head under the egg-shaped pilos, whose rim stands just proud of it
    ellipse(X(372), 266, 28, 41),
    blob(P([[340, 254], [336, 234], [339, 212], [346, 194], [355, 180], [364, 171], [372, 168], [380, 171],
      [389, 180], [398, 194], [405, 212], [408, 234], [404, 254], [372, 258]])),
    limb(X(373), 294, 19, X(372), 326, 24),

    // the torso, the inner hip carrying the weight
    blob(P([[391, 300], [395, 314], [403, 325], [419, 334], [437, 342], [450, 350], [461, 366], [465, 385],
      [462, 406], [440, 427], [435, 443], [430, 458], [424, 474], [424, 490], [430, 507], [435, 526],
      [434, 547], [430, 568], [402, 574], [372, 560], [342, 577], [314, 572], [311, 553], [311, 530],
      [314, 511], [317, 492], [316, 474], [311, 457], [308, 439], [306, 424], [286, 401], [283, 380],
      [290, 362], [304, 348], [322, 336], [338, 327], [350, 316], [356, 300]])),

    // the outer arm raised, the fist round the spear at the height of the head
    circle(X(295), 373, 25),
    member(P([[295, 373], [194, 420]]), [[[0, 21, 19], ...UPPER_ARM.slice(1)]], -m),
    circle(X(194), 420, 18),
    member(P([[194, 420], [198, 318]]), [FOREARM], m),
    blob(P([[183, 296], [194, 288], [206, 290], [213, 301], [213, 315], [208, 326], [192, 328], [183, 319]])),

    // the inner arm hanging free of the body
    member(P([[442, 375], [464, 476], [471, 568]]), [UPPER_ARM.slice(0, -2), FOREARM.slice(2)], m),
    member(P([[470, 549], [475, 594], [471, 628]]), HAND, m),

    // the legs: the inner one straight under him, the outer relaxed, its foot set out
    member(P([[402, 537], [393, 715], [389, 853]]), [THIGH, CALF], m),
    member(P([[342, 544], [339, 722], [297, 851]]), [THIGH, CALF], -m),
    blob(P([[401, 844], [378, 844], [371, 860], [364, 872], [366, 879], [410, 879], [413, 872], [407, 860]])),
    blob(P([[307, 842], [286, 844], [273, 860], [257, 872], [259, 879], [306, 879], [311, 868]])),
  ];
}

export function draw() {
  return [
    twin(1),
    twin(-1),
    // the base they share
    poly([[178, 879], [822, 879], [830, 904], [170, 904]]),
  ];
}
