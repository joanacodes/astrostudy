// Caelus, after the breastplate of the Augustus of Prima Porta (Vatican Museums).
import { blob, chain, circle, limb } from '../lib.mjs';

export const slug = 'caelus-spreads-the-sky';
export const myth = 'Caelus spreads the sky';
export const astrology = 'Uranus';

// points drawn upright round (0, 0), scaled by k and set down at (x, y)
const at = (points, x, y, k = 1) => points.map(([u, v]) => [x + k * u, y + k * v]);

// the bearded head in profile, facing left, about 100 from crown to chin round its centre: a straight Greek
// profile, a full curling beard, the hair falling in locks behind
const HEAD = [[0, -52], [-25, -46], [-38, -32], [-44, -20], [-47, -8], [-46, -4], [-58, 16], [-48, 20], [-53, 26],
  [-57, 38], [-52, 50], [-58, 62], [-50, 76], [-36, 96], [-18, 92], [-4, 78], [16, 76], [36, 70], [52, 56], [58, 40],
  [56, 26], [62, 8], [58, -12], [52, -30], [40, -44], [22, -52]];

export function draw() {
  const hx = 494;
  const hy = 424;
  const k = 1.42;
  return [
    // the mantle billowing over his head in a wide arch, the vault of the sky
    blob([[140, 384], [134, 304], [156, 228], [214, 162], [304, 122], [404, 106], [500, 102], [596, 106], [696, 122],
      [786, 162], [844, 228], [866, 304], [860, 384], [840, 358], [822, 314], [774, 278], [706, 256], [644, 262],
      [574, 240], [500, 254], [426, 240], [356, 262], [294, 256], [226, 278], [178, 314], [160, 358]]),
    // its ends streaming out from his fists
    blob([[138, 384], [116, 402], [92, 430], [76, 474], [96, 456], [120, 440], [148, 426], [162, 404]]),
    blob([[862, 384], [884, 402], [908, 430], [924, 474], [904, 456], [880, 440], [852, 426], [838, 404]]),
    // both arms raised, the elbows out, the fists high
    chain([[374, 580, 33], [272, 566, 28], [170, 548, 22]]),
    chain([[170, 548, 23], [160, 474, 20], [150, 406, 15]]),
    circle(150, 388, 20),
    chain([[626, 580, 33], [728, 566, 28], [830, 548, 22]]),
    chain([[830, 548, 23], [840, 474, 20], [850, 406, 15]]),
    circle(850, 388, 20),
    // the bearded head turned to his right, the hair and beard curling
    limb(500, 502, 46, 502, 562, 54),
    blob(at(HEAD, hx, hy, k)),
    ...[[-2, -46], [17, -46], [33, -40], [48, -29], [55, -12], [57, 6], [53, 23], [52, 40], [43, 56], [27, 68]]
      .map(([u, v]) => circle(hx + k * u, hy + k * v, 12)),
    ...[[-51, 34], [-50, 49], [-51, 64], [-42, 80]].map(([u, v]) => circle(hx + k * u, hy + k * v, 11)),
    // the broad chest narrowing to the waist, the body ending there as on the breastplate
    blob([[452, 546], [500, 542], [548, 546], [628, 562], [650, 592], [636, 626], [614, 686], [598, 764], [598, 844],
      [592, 886], [500, 900], [408, 886], [402, 844], [402, 764], [386, 686], [364, 626], [350, 592], [372, 562]]),
  ];
}
