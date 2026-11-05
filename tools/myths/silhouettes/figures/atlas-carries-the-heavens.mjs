// Atlas, after the Farnese Atlas (Naples, National Archaeological Museum), a Roman marble copy of a Hellenistic work.
import { blob, chain, circle, cut, limb, line } from '../lib.mjs';

export const slug = 'atlas-carries-the-heavens';
export const myth = 'Atlas carries the heavens';
export const astrology = 'The constellations';

// points drawn upright round (0, 0), scaled by k, turned by deg (clockwise on screen) and set down at (x, y)
function turn(points, x, y, deg, k = 1) {
  const t = (deg * Math.PI) / 180;
  return points.map(([u, v]) => [x + k * (u * Math.cos(t) - v * Math.sin(t)), y + k * (u * Math.sin(t) + v * Math.cos(t))]);
}

// a constellation cut into the globe: the stars as small holes joined by thin lines
function constellation(stars, path) {
  return [cut(line(path.map((i) => stars[i]), 4)), ...stars.map(([x, y]) => cut(circle(x, y, 6)))];
}

// the bearded head in profile, upright, facing right, about 110 high round its centre
const HEAD = [[-10, -58], [24, -50], [36, -32], [42, -16], [38, -10], [56, 8], [44, 14], [48, 20], [50, 34], [46, 48],
  [50, 62], [36, 86], [16, 76], [6, 58], [-4, 50], [-34, 32], [-50, 6], [-52, -20], [-40, -46]];

export function draw() {
  return [
    // the globe resting on his shoulders
    circle(542, 250, 150),
    // two constellations cut into it, the Plough and Cassiopeia, and a few stars
    constellation([[430, 200], [436, 232], [470, 236], [474, 204], [500, 190], [522, 178], [548, 156]],
      [0, 1, 2, 3, 0, 3, 4, 5, 6]),
    constellation([[582, 232], [606, 256], [628, 236], [652, 262], [672, 238]], [0, 1, 2, 3, 4]),
    cut(circle(612, 150, 6)), cut(circle(474, 300, 6)), cut(circle(542, 260, 5)), cut(circle(638, 316, 5)),
    // the back bent forward under the weight
    blob([[408, 668], [396, 636], [400, 600], [414, 564], [436, 526], [468, 488], [506, 452], [548, 424], [588, 406],
      [626, 404], [648, 424], [656, 452], [650, 482], [630, 506], [608, 526], [588, 548], [578, 572], [550, 594],
      [516, 612], [480, 634], [446, 656], [426, 668]]),
    // the head bowed low under the globe, the beard hanging over the knee
    limb(620, 414, 34, 688, 480, 26),
    blob(turn(HEAD, 706, 500, 46)),
    // the right arm, elbow out, the palm pressed to the globe's right side, well clear of the bowed head
    chain([[628, 426, 29], [696, 404, 25], [762, 380, 19]]),
    chain([[762, 380, 20], [746, 326, 19], [724, 272, 13]]),
    chain([[724, 272, 13], [706, 236, 16], [690, 198, 9]]),
    // the left arm, elbow out the other way, the hand on the globe's left side
    chain([[542, 448, 28], [456, 434, 24], [372, 420, 19]]),
    chain([[372, 420, 20], [380, 364, 19], [394, 312, 13]]),
    chain([[394, 312, 13], [398, 276, 16], [402, 238, 9]]),
    // the right knee down on the rock, the shin rising behind to the heel, the toes tucked under
    chain([[450, 632, 44], [426, 720, 38], [402, 790, 32], [382, 848, 26]]),
    chain([[382, 852, 26], [322, 828, 27], [258, 818, 15]]),
    chain([[258, 818, 15], [244, 846, 13], [234, 874, 9]]),
    // the left leg forward, the foot planted
    chain([[480, 622, 43], [582, 612, 36], [690, 636, 27]]),
    chain([[690, 636, 27], [672, 720, 29], [682, 846, 17]]),
    blob([[664, 840], [698, 836], [744, 856], [774, 866], [786, 878], [776, 887], [668, 887]]),
    // the rock
    blob([[198, 892], [218, 876], [282, 872], [382, 876], [492, 874], [602, 876], [712, 882], [782, 884], [806, 894],
      [796, 908], [662, 910], [502, 910], [342, 910], [212, 908]]),
  ];
}
