// Poseidon (Neptune), after the Poseidon of Melos (National Archaeological Museum, Athens).
import { blob, circle, cut, limb, line, poly } from '../lib.mjs';

export const slug = 'poseidon-god-of-the-sea';
export const myth = 'Poseidon, god of the sea';
export const astrology = 'Neptune';

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

// a man's arm at this scale, [t, outer, inner], upper arm then forearm, each arm drawn in one piece; the
// forearm narrows at its end so the wrist tucks into the hand without a step
const UPPER_ARM = [[0, 17, 15], [0.12, 27, 24], [0.3, 28, 24], [0.5, 25, 23], [0.75, 22, 20], [0.9, 20, 19]];
const FOREARM = [[0.1, 20, 19], [0.22, 21, 19], [0.45, 18, 16], [0.75, 15, 13], [0.92, 12, 11], [1, 8, 8]];
const CALF = [[0, 20, 20], [0.1, 22, 21], [0.25, 26, 25], [0.4, 25, 27], [0.55, 20, 23], [0.72, 16, 17],
  [0.88, 13, 14], [1, 12, 12]];

export function draw() {
  return [
    // the trident, planted on the base
    line([[318, 878], [318, 148]], 9),
    line([[290, 96], [290, 134], [296, 147], [318, 151], [340, 147], [346, 134], [346, 96]], 8),
    line([[318, 151], [318, 92]], 8),
    poly([[318, 74], [328, 96], [318, 91], [308, 96]]),
    poly([[290, 80], [299, 102], [290, 97], [281, 102]]),
    poly([[346, 80], [355, 102], [346, 97], [337, 102]]),

    // the bearded head turned to his left, the hair thick and the beard full
    blob([[548, 175], [570, 180], [584, 194], [588, 208], [590, 218], [592, 225], [600, 240], [592, 244],
      [596, 250], [602, 258], [605, 268], [600, 275], [603, 285], [596, 293], [592, 302], [579, 309],
      [566, 297], [553, 286], [536, 282], [520, 276], [510, 266], [512, 258], [504, 248], [504, 236],
      [508, 228], [503, 216], [506, 202], [513, 194], [516, 184], [530, 177]]),
    limb(546, 266, 24, 550, 300, 30),

    // torso, the right side stretched under the raised arm
    blob([[533, 258], [526, 273], [510, 285], [492, 290], [478, 294], [466, 304], [462, 318], [462, 340],
      [470, 362], [478, 386], [484, 410], [490, 436], [492, 458], [488, 478], [484, 500], [486, 522], [518, 548],
      [550, 533], [582, 552], [612, 546], [616, 525], [616, 501], [612, 480], [609, 460], [610, 441],
      [616, 422], [620, 403], [621, 386], [642, 362], [646, 339], [638, 320], [623, 305], [603, 292],
      [584, 279], [569, 260]]),

    // the right arm raised high, the fist round the shaft above his head
    circle(470, 318, 27),
    member([[470, 318], [382, 254], [324, 178]], [UPPER_ARM, FOREARM], -1),
    blob([[304, 162], [318, 154], [334, 158], [338, 174], [334, 190], [318, 194], [304, 186]]),

    // the left arm lowered, free of the body
    circle(628, 330, 25),
    member([[628, 330], [664, 430], [670, 530]], [UPPER_ARM, FOREARM], 1),
    member([[670, 508], [671, 556], [665, 596]], [[[0, 10, 10], [0.45, 12, 11], [0.75, 13, 13], [1, 13, 13]],
      [[0, 13, 13], [0.5, 11, 10], [1, 5, 4]]], 1),

    // the feet below the hem: the right carries him, the left is set forward and out
    blob([[515, 842], [541, 842], [549, 860], [557, 872], [555, 879], [504, 879], [501, 870], [508, 856]]),
    blob([[608, 840], [632, 842], [650, 858], [668, 872], [666, 879], [612, 879], [604, 864]]),

    // the himation wrapped round his hips from a roll at the waist to his feet, the bent left knee pressing
    // out through it; the roll shows only as the swell at either side of the top edge
    blob([[476, 462], [520, 458], [570, 460], [610, 448], [632, 452], [641, 466], [638, 486], [635, 506],
      [636, 530], [632, 570], [624, 640], [624, 700], [632, 770], [646, 846], [616, 854], [588, 846],
      [560, 854], [532, 846], [506, 854], [484, 848], [484, 780], [478, 700], [472, 620], [471, 548],
      [473, 510], [470, 494], [468, 478]]),

    // the dolphin at his feet, diving head down beside the right leg as the statue's support
    // (its spine runs from the beak on the base up to the tail: [t, back, belly] depths along it)
    member([[386, 878], [392, 840], [396, 790], [408, 742], [424, 704], [442, 674]], [
      [[0, 4, 4], [0.45, 7, 8], [0.8, 18, 16], [1, 23, 19]], [[0.5, 27, 23], [1, 28, 25]],
      [[0.5, 26, 22], [1, 22, 19]], [[0.5, 17, 14], [1, 13, 11]], [[0.5, 9, 8], [1, 6, 6]]], 1),
    // its dorsal fin, flipper, flukes and eye
    poly([[378, 792], [356, 762], [350, 744], [366, 750], [388, 756]]),
    poly([[412, 824], [440, 846], [434, 851], [408, 838]]),
    poly([[437, 673], [424, 668], [416, 654], [435, 658], [445, 669], [458, 671], [468, 684], [453, 686],
      [445, 678]]),
    cut(circle(381, 846, 3.5)),

    // the base
    poly([[278, 879], [690, 879], [698, 904], [270, 904]]),
  ];
}
