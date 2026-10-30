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
  const hy = 410;
  const k = 1.42;
  return [
    // the mantle billowing over his head in a wide arch, the vault of the sky
    blob([[140, 370], [134, 290], [156, 214], [214, 148], [304, 108], [404, 92], [500, 88], [596, 92], [696, 108],
      [786, 148], [844, 214], [866, 290], [860, 370], [840, 344], [822, 300], [774, 264], [706, 242], [644, 248],
      [574, 226], [500, 240], [426, 226], [356, 248], [294, 242], [226, 264], [178, 300], [160, 344]]),
    // its ends streaming out from his fists
    blob([[138, 370], [116, 388], [92, 416], [76, 460], [96, 442], [120, 426], [148, 412], [162, 390]]),
    blob([[862, 370], [884, 388], [908, 416], [924, 460], [904, 442], [880, 426], [852, 412], [838, 390]]),
    // both arms raised, the elbows out, the fists high
    chain([[374, 566, 33], [272, 552, 28], [170, 534, 22]]),
    chain([[170, 534, 23], [160, 460, 20], [150, 392, 15]]),
    circle(150, 374, 20),
    chain([[626, 566, 33], [728, 552, 28], [830, 534, 22]]),
    chain([[830, 534, 23], [840, 460, 20], [850, 392, 15]]),
    circle(850, 374, 20),
    // the bearded head turned to his right, the hair and beard curling
    limb(500, 488, 46, 502, 548, 54),
    blob(at(HEAD, hx, hy, k)),
    ...[[-2, -46], [17, -46], [33, -40], [48, -29], [55, -12], [57, 6], [53, 23], [52, 40], [43, 56], [27, 68]]
      .map(([u, v]) => circle(hx + k * u, hy + k * v, 12)),
    ...[[-51, 34], [-50, 49], [-51, 64], [-42, 80]].map(([u, v]) => circle(hx + k * u, hy + k * v, 11)),
    // the broad chest narrowing to the waist, the body ending there as on the breastplate
    blob([[452, 532], [500, 528], [548, 532], [628, 548], [650, 578], [636, 612], [614, 672], [598, 750], [598, 830],
      [592, 872], [500, 886], [408, 872], [402, 830], [402, 750], [386, 672], [364, 612], [350, 578], [372, 548]]),
  ];
}
