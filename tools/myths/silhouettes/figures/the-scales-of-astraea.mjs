// Astraea, the star-maiden of justice and last of the gods to leave the earth (Ovid, Metamorphoses 1), holding up the balance.
import { blob, circle, cut, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'the-scales-of-astraea';
export const myth = 'The scales of Astraea';
export const astrology = 'Libra';

// Everything is drawn on a 1000 grid and lifted by DY so that the whole stands in the middle of the canvas.
const DY = -30;
const P = ([x, y]) => [x, y + DY];
const at = (pts) => pts.map(P);

// The balance hangs from the ring in her hand, its centre on the middle line x = 500. One half of the beam, its
// cords and its pan are drawn and mirrored, so that it hangs dead level.
const RING = [500, 184];
const BEAM_Y = 226;
const HALF = 300;
const PAN_Y = 434;
const PAN_R = 90;

function half(m) {
  const end = 500 + m * HALF;
  return [
    limb(...P([500, BEAM_Y]), 9, ...P([end, BEAM_Y]), 6),
    circle(...P([end, BEAM_Y]), 10),
    line(at([[end, BEAM_Y], [end, BEAM_Y + 24]]), 7),
    // the cords fanning from the hook to the rim of the pan
    line(at([[end, BEAM_Y + 22], [end - PAN_R + 8, PAN_Y]]), 6),
    line(at([[end, BEAM_Y + 22], [end + PAN_R - 8, PAN_Y]]), 6),
    // the pan: a shallow bowl under a flat rim
    line(at([[end - PAN_R - 6, PAN_Y], [end + PAN_R + 6, PAN_Y]]), 10),
    blob(at(Array.from({ length: 13 }, (_, i) => {
      const t = (Math.PI * i) / 12;
      return [end + PAN_R * Math.cos(t), PAN_Y + 38 * Math.sin(t)];
    }))),
  ];
}

// points along a smooth curve through the given points (Catmull-Rom, its ends held), for the folds
function smooth(points, steps = 10) {
  const out = [];
  const n = points.length;
  const p = (i) => points[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i += 1) {
    for (let k = 0; k < steps; k += 1) {
      const t = k / steps;
      const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
      const f = (j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t
        + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t);
      out.push([f(0), f(1)]);
    }
  }
  out.push(p(n - 1));
  return out;
}

// the hand that holds up the balance: the palm, three fingers lifted and fanned, the forefinger and thumb
// pinching the ring
function hand() {
  const finger = (a, b, r1, r2) => limb(...P(a), r1, ...P(b), r2);
  return [
    blob(at([[462, 184], [468, 168], [481, 155], [494, 154], [501, 164], [495, 182], [483, 196], [470, 197]])),
    finger([482, 157], [491, 135], 4.4, 3),
    finger([488, 160], [502, 135], 4.8, 3.2),
    finger([494, 163], [512, 140], 4.8, 3.2),
    blob(at([[496, 162], [506, 158], [511, 166], [506, 174], [500, 172], [498, 168]])),
    finger([486, 188], [499, 175], 5.5, 3.5),
  ];
}

export function draw() {
  return [
    // the plinth
    poly(at([[400, 898], [600, 898], [608, 924], [392, 924]])),
    // the body and the peplos to the feet: her weight on her left leg (our right), so that hip swings out and the
    // drapery falls straight below it, while the other knee eases forward; her left hand draws the skirt aside
    blob(at([[456, 396], [470, 372], [488, 362], [512, 362], [538, 374], [556, 388], [549, 410], [546, 432], [542, 454],
      [538, 476], [546, 504], [562, 532], [578, 566], [584, 600], [594, 628], [588, 664], [580, 700], [576, 760],
      [580, 830], [590, 894], [546, 900], [500, 902], [456, 900], [420, 894], [436, 830], [446, 762], [452, 702],
      [446, 650], [444, 592], [450, 538], [460, 502], [466, 472], [461, 446], [458, 420]])),
    // the girdle under the breast, the long folds of the skirt, and the folds drawn out to her hand
    cut(line(at(smooth([[460, 462], [500, 472], [542, 464]])), 4)),
    [[[474, 556], [466, 700], [458, 880]], [[502, 576], [500, 720], [500, 886]], [[540, 610], [546, 740], [552, 884]],
      [[520, 560], [556, 600], [580, 640]]].map((fold) => cut(line(at(smooth(fold)), 4))),
    // the head turned up a little towards the raised hand, the hair gathered in a knot, the neck
    ellipse(...P([496, 304]), 30, 39, -16),
    circle(...P([525, 280]), 17),
    limb(...P([497, 336]), 13, ...P([500, 368]), 19),
    // the raised right arm (our left), the elbow eased out, the forearm up to the hand
    blob(at([[440, 382], [424, 352], [416, 320], [414, 288], [422, 258], [436, 232], [450, 208], [462, 188], [480, 194],
      [468, 216], [454, 242], [444, 272], [442, 304], [446, 338], [454, 370], [460, 394]])),
    hand(),
    // the lowered left arm, held away from the waist, the hand gathering a fold of the skirt
    blob(at([[556, 388], [574, 400], [586, 430], [592, 466], [597, 500], [593, 536], [587, 566], [583, 586], [568, 588],
      [570, 556], [574, 526], [574, 500], [568, 468], [560, 436], [552, 412]])),
    blob(at([[568, 580], [586, 578], [596, 594], [596, 614], [588, 624], [576, 620], [570, 602]])),
    // the ring, and the hanger, the pivot and the beam, cut clear of the arm they hang in front of
    cut(line(at([[500, RING[1] + 10], [500, BEAM_Y]]), 7 + 10)),
    cut(line(at([[196, BEAM_Y], [804, BEAM_Y]]), 18 + 10)),
    circle(...P(RING), 13),
    cut(circle(...P(RING), 6.5)),
    line(at([[500, RING[1] + 10], [500, BEAM_Y]]), 7),
    circle(...P([500, BEAM_Y]), 11),
    half(1),
    half(-1),
  ];
}
