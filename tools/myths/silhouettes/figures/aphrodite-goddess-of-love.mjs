// Venus (Aphrodite), after the Aphrodite of Melos (the Venus de Milo, Louvre, about 150–125 BC): the
// armless goddess, her weight on her right leg, the left knee forward under the drapery slipping from
// her hips, her head turned to her left.
import { blob, circle, ellipse, limb, poly } from '../lib.mjs';

export const slug = 'aphrodite-goddess-of-love';
export const myth = 'Aphrodite, goddess of love';
export const astrology = 'Venus';

export function draw() {
  return [
    // hair gathered in a knot at the back, the face turned to her left (our right)
    circle(484, 118, 20),
    ellipse(510, 142, 33, 42, 10),
    limb(505, 176, 19, 500, 222, 25),
    // shoulders, the broken arms and the bare torso, her right hip (our left) pushed out by the weight
    blob([[520, 212], [552, 222], [584, 236], [602, 258], [612, 292], [618, 334], [600, 340], [592, 312], [588, 352],
      [578, 398], [586, 442], [604, 478], [520, 474], [416, 480], [432, 432], [446, 384], [440, 338], [430, 302],
      [424, 298], [408, 292], [414, 256], [436, 236], [468, 222], [492, 212]]),
    // the himation from the hips down, the left knee (our right) bending forward under it
    blob([[414, 474], [470, 462], [532, 470], [606, 468], [626, 506], [640, 566], [652, 628], [646, 690], [628, 752],
      [620, 812], [628, 870], [638, 906], [520, 914], [412, 910], [414, 862], [424, 800], [426, 740], [420, 680],
      [414, 620], [410, 560], [408, 510]]),
    // the base
    poly([[392, 902], [656, 902], [664, 930], [384, 930]]),
  ];
}
