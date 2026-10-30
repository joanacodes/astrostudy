// Hades enthroned, after the Roman copies of the seated Serapis of Alexandria (Bryaxis's lost cult statue), with Cerberus at his feet.
import { blob, chain, circle, cut, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'hades-enthroned-with-cerberus';
export const myth = 'Hades, king of the underworld, enthroned with Cerberus';
export const astrology = 'Pluto';

// a turned throne leg, from the seat down to the dais: bulb, neck, shaft, ring, foot
const turnedLeg = (x, y0, y1) => chain([[x, y0, 13], [x, y0 + 30, 17], [x, y0 + 58, 9], [x, y1 - 40, 11], [x, y1 - 26, 15], [x, y1, 10]]);

// Cerberus, drawn about a point on the ground (ox, oy) at scale k so he can be sized against the god
function cerberus(ox, oy, k) {
  const P = ([x, y]) => [ox + k * x, oy + k * y];
  const L = (x1, y1, r1, x2, y2, r2) => limb(...P([x1, y1]), k * r1, ...P([x2, y2]), k * r2);
  const E = (x, y, rx, ry, deg = 0) => ellipse(...P([x, y]), k * rx, k * ry, deg);
  // one head in profile, its muzzle pointing along deg (0 = right, 180 = left), its pricked ear kept on top
  const head = (x, y, deg) => {
    const s = Math.cos((deg * Math.PI) / 180) < 0 ? -1 : 1;
    const a = ((s < 0 ? deg - 180 : deg) * Math.PI) / 180;
    const p = (list) => list.map(([u, v]) => P([x + s * u * Math.cos(a) - v * Math.sin(a), y + s * u * Math.sin(a) + v * Math.cos(a)]));
    return [
      blob(p([[44, -2], [41, -10], [26, -12], [14, -16], [6, -34], [-10, -44], [-28, -36], [-38, -18], [-40, 4], [-30, 22],
        [-8, 30], [18, 24], [36, 15], [45, 8]])),
      blob(p([[-2, -40], [-10, -58], [-16, -76], [-26, -54], [-24, -36]]), 0.6),
    ];
  };
  return [
    // sitting: the body sloping down to the haunch, the hind paw, the forelegs one behind the other
    blob([[-74, -170], [-66, -200], [-38, -226], [0, -218], [37, -176], [73, -114], [99, -52], [105, -16], [87, 0],
      [25, 0], [-15, -12], [-28, -60], [-38, -104], [-58, -122], [-76, -140]].map(P)),
    E(55, -57, 52, 57),
    L(77, -10, 14, 5, -4, 11),
    E(-5, -4, 21, 6),
    L(-20, -146, 21, -24, -10, 14),
    E(-34, -4, 19, 6),
    L(-54, -150, 24, -62, -10, 15),
    E(-74, -5, 22, 7),
    // the serpent that serves him as a tail, curling up over the haunch
    chain([[101, -30, 11], [122, -52, 10], [130, -84, 9], [124, -114, 8], [108, -132, 7], [96, -142, 9], [82, -146, 4]].map(
      ([x, y, r]) => [...P([x, y]), k * r])),
    // three necks from one chest, and three heads: one growling forward, one raised, one looking back
    L(-48, -184, 32, -92, -198, 27),
    L(-36, -200, 32, -56, -278, 27),
    L(-16, -206, 32, 26, -250, 27),
    head(-112, -200, 170),
    head(-62, -305, 205),
    head(46, -262, 15),
  ];
}

// the scene moved sideways to sit centred: the kit's outlines are absolute M, L and C points (a circle's arcs are relative)
const shifted = (shapes, dx) => shapes.flat(Infinity).map((s) => {
  const key = s.stroke ? 'stroke' : 'd';
  const move = (_, c, nums) => `${c}${nums.trim().split(/\s+/).map((n, i) => (i % 2 ? n : Math.round((+n + dx) * 10) / 10)).join(' ')} `;
  return { ...s, [key]: s[key].replace(/([MLC])([-\d. ]+)/g, move) };
});

export function draw() {
  return shifted([
    // the dais and the throne: a high back ending in a scroll, the seat, two turned legs and their stretcher
    poly([[150, 852], [935, 852], [945, 884], [140, 884]]),
    blob([[206, 612], [196, 480], [188, 340], [184, 236], [190, 210], [210, 200], [228, 210], [234, 240], [238, 340],
      [242, 480], [250, 612]]),
    circle(200, 206, 21),
    cut(circle(197, 204, 7)),
    poly([[195, 600], [440, 600], [444, 628], [195, 628]]),
    turnedLeg(214, 628, 852),
    turnedLeg(420, 628, 852),
    line([[214, 768], [420, 768]], 10),
    // the footstool, in front of the throne's leg
    poly([[396, 802], [532, 802], [528, 852], [400, 852]]),
    // the god: the lap, the himation hanging from the knee to the ankle, a sandalled foot below
    blob([[246, 600], [244, 548], [300, 534], [400, 532], [486, 538], [512, 556], [516, 610], [510, 680], [506, 740],
      [514, 786], [500, 793], [486, 787], [470, 793], [454, 788], [458, 720], [462, 662], [444, 628], [320, 610]]),
    blob([[456, 800], [460, 782], [486, 780], [504, 788], [526, 796], [530, 802]]),
    // the chest and shoulders, upright against the throne
    blob([[246, 600], [242, 520], [244, 440], [252, 392], [276, 360], [306, 356], [336, 372], [352, 410], [358, 450],
      [356, 495], [346, 540]]),
    // the head: hair falling to the nape, brow, nose, the full beard; the crown
    blob([[318, 246], [350, 258], [360, 278], [357, 286], [362, 292], [372, 306], [362, 312], [366, 318], [374, 330],
      [380, 348], [380, 364], [372, 382], [356, 390], [338, 384], [318, 370], [296, 360], [280, 348], [270, 320],
      [272, 290], [282, 262]]),
    poly([[284, 268], [286, 248], [294, 224], [304, 246], [318, 218], [330, 246], [342, 224], [348, 250], [352, 268]]),
    // the arm reaching out to hold the sceptre
    chain([[300, 386, 25], [430, 385, 19], [526, 320, 14]]),
    ellipse(542, 312, 15, 18),
    line([[552, 128], [552, 852]], 12),
    ellipse(552, 118, 11, 15),
    cerberus(785, 852, 1.12),
  ], -40);
}
