// Zeus (Jupiter), after the Artemision Bronze (National Archaeological Museum, Athens), about 460 BC.
import { blob, circle, poly } from '../lib.mjs';

export const slug = 'zeus-with-the-thunderbolt';
export const myth = 'Zeus with the thunderbolt';
export const astrology = 'Jupiter';

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

// the thunderbolt: a zigzag band pointed at both ends, thickest at the grip, centred on (x, y)
function bolt(x, y, deg, len) {
  const a = (deg * Math.PI) / 180;
  const at = (s, t) => [x + (Math.cos(a) * s - Math.sin(a) * t) * len,
    y + (Math.sin(a) * s + Math.cos(a) * t) * len];
  const spine = [[-1, 0.04, 0], [-0.55, -0.06, 0.075], [-0.45, 0.14, 0.085], [0, 0, 0.1], [0.45, -0.14, 0.085],
    [0.55, 0.06, 0.075], [1, -0.04, 0]];
  const top = [];
  const bottom = [];
  spine.forEach(([s, t, w], i) => {
    const [ps, pt] = spine[Math.max(0, i - 1)];
    const [ns, nt] = spine[Math.min(spine.length - 1, i + 1)];
    const ds = ns - ps;
    const dt = nt - pt;
    const d = Math.hypot(ds, dt);
    top.push(at(s + (dt / d) * w, t - (ds / d) * w));
    bottom.push(at(s - (dt / d) * w, t + (ds / d) * w));
  });
  return poly([...top, ...bottom.slice(1, -1).reverse()]);
}

// a man's limbs at this scale. Arms: [t, outer, inner], each half tapering into the elbow so the sharply bent
// right arm meets round there (the straight left arm leaves those ends off). Legs, seen from the side:
// [t, back, front], so the calf swells behind and the shin runs straight in front
const UPPER_ARM = [[0, 18, 16], [0.12, 30, 27], [0.3, 31, 27], [0.5, 28, 26], [0.75, 25, 23], [0.9, 22, 21],
  [1, 16, 16]];
const FOREARM = [[0, 16, 16], [0.1, 22, 21], [0.22, 24, 22], [0.45, 21, 19], [0.75, 17, 15], [1, 14, 13]];
const THIGH = [[0, 24, 24], [0.08, 40, 42], [0.3, 39, 41], [0.55, 35, 36], [0.8, 28, 30], [0.92, 25, 27]];
const CALF = [[0, 23, 24], [0.12, 29, 23], [0.28, 34, 21], [0.45, 31, 19], [0.65, 23, 17], [0.85, 16, 15],
  [1, 15, 14]];

export function draw() {
  return [
    // the head in profile to the right, bearded, the hair bound in braids round it
    blob([[495, 119], [523, 125], [538, 141], [543, 158], [545, 170], [549, 182], [556, 196], [546, 201],
      [550, 207], [556, 217], [558, 233], [555, 252], [545, 270], [531, 281], [515, 268], [499, 250],
      [481, 246], [464, 242], [456, 226], [450, 207], [447, 186], [450, 162], [460, 140], [477, 124]]),
    member([[493, 228], [489, 272]], [[[0, 24, 24], [1, 32, 32]]], 1),

    // the torso square to us, as the bronze is made to be seen
    // (the hips flow into the striding thighs: no corner at either side)
    blob([[469, 244], [447, 262], [421, 272], [403, 284], [395, 300], [399, 318], [409, 338], [413, 362],
      [419, 390], [427, 420], [424, 450], [422, 476], [421, 497], [418, 514], [447, 532], [489, 540],
      [527, 530], [561, 509], [556, 488], [557, 464], [555, 440], [551, 420], [559, 390], [565, 362],
      [569, 338], [579, 318], [583, 300], [575, 284], [557, 272], [531, 262], [509, 244]]),

    // the left arm stretched straight out ahead, the hand open
    circle(571, 288, 30),
    member([[571, 288], [714, 284], [831, 282]], [UPPER_ARM.slice(0, -1), FOREARM.slice(1)], 1),
    blob([[823, 268], [850, 268], [872, 271], [896, 275], [912, 279], [916, 284], [910, 289], [890, 291],
      [866, 295], [845, 297], [823, 295]]),
    member([[844, 274], [874, 262]], [[[0, 7, 7], [0.6, 5.5, 5.5], [1, 4.5, 4.5]]], 1),

    // the right arm drawn back above the shoulder, the fist about to hurl the bolt
    circle(407, 286, 30),
    member([[407, 286], [269, 249]], [UPPER_ARM], -1),
    circle(269, 249, 22),
    member([[269, 249], [229, 139]], [FOREARM], 1),
    bolt(221, 124, -6, 124),
    blob([[205, 112], [221, 106], [237, 112], [241, 128], [235, 142], [217, 146], [205, 138]]),

    // the stride: the right leg straight behind, its heel raised; the left bent ahead, its foot flat
    member([[467, 500], [363, 683], [265, 839]], [THIGH, CALF], -1),
    blob([[253, 830], [277, 834], [297, 862], [313, 874], [331, 876], [333, 881], [299, 881], [269, 866],
      [245, 852]]),
    member([[511, 500], [631, 673], [679, 851]], [THIGH, CALF], -1),
    blob([[667, 842], [691, 842], [707, 858], [743, 868], [767, 874], [769, 881], [659, 881], [655, 862]]),

    // the base
    poly([[221, 880], [791, 880], [799, 906], [213, 906]]),
  ];
}
