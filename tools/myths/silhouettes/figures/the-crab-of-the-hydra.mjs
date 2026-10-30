// Karkinos, the crab Hera sent against Heracles at Lerna, seen from above as on the silver coins of Akragas, 5th century BC.
import { blob, chain, circle, cut, limb } from '../lib.mjs';

export const slug = 'the-crab-of-the-hydra';
export const myth = 'Karkinos, the crab of the Hydra';
export const astrology = 'Cancer';

// Everything is drawn once, for the crab's left side (our right), in offsets from the middle of the shell, then
// mirrored: m = 1 on our right, -1 on our left. A coin crab is strictly symmetrical, and so is this one.
const X0 = 500;
const Y0 = 594;
const place = (m, [dx, dy]) => [X0 + m * dx, Y0 + dy];
const rad = (deg) => (deg * Math.PI) / 180;
// the point `len` away from p in direction `deg` (0 = outwards, 90 = towards the back), in offset space
const toward = ([x, y], len, deg) => [x + len * Math.cos(rad(deg)), y + len * Math.sin(rad(deg))];

// a walking leg: the long flat merus, the short carpus, the propodus and the pointed dactyl, each segment a
// tapered rod a little narrower than the end of the one before it, so that every joint shows as a knuckle
function leg(m, base, [a1, a2, a3, a4], [l1, l2, l3, l4], w) {
  const knee = toward(base, l1, a1);
  const wrist = toward(knee, l2, a2);
  const ankle = toward(wrist, l3, a3);
  const tip = toward(ankle, l4, a4);
  const at = (p) => place(m, p);
  return [
    limb(...at(base), w, ...at(knee), w * 0.84),
    limb(...at(knee), w * 0.66, ...at(wrist), w * 0.64),
    limb(...at(wrist), w * 0.6, ...at(ankle), w * 0.5),
    limb(...at(ankle), w * 0.42, ...at(tip), 1.2),
  ];
}

// a finger: a tapering curve along a quadratic Bezier from a, pulled towards c, to b, cut into short limbs so
// that its outline stays smooth
function horn(at, a, c, b, r1, r2, n = 14) {
  const joints = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const q = (k) => (1 - t) * (1 - t) * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k];
    joints.push([...at([q(0), q(1)]), r1 + (r2 - r1) * t ** 1.3]);
  }
  return chain(joints);
}

// The chela, in its own frame: u runs from the wrist along the hand to the fingers, v towards the outside. The
// palm widens from the wrist to the fingers; the fixed finger grows out of its inner side, the movable one from
// a hinge at the outer corner; both curve towards each other, as a crab's do, but are held apart so that the
// pincer reads as open.
const palm = [[-8, -22], [20, -38], [60, -52], [104, -58], [136, -52], [152, -34], [150, 0], [152, 38], [136, 56],
  [104, 62], [60, 56], [20, 40], [-8, 22]];

function claw(m) {
  const shoulder = [104, -96];
  const elbow = [182, -150];
  const wrist = [208, -212];
  const th = rad(-118);
  const local = ([u, v]) => [
    wrist[0] + u * Math.cos(th) - v * Math.sin(th),
    wrist[1] + u * Math.sin(th) + v * Math.cos(th),
  ];
  const at = (p) => place(m, local(p));
  return [
    limb(...place(m, shoulder), 31, ...place(m, elbow), 26),
    limb(...place(m, elbow), 21, ...place(m, wrist), 26),
    blob(palm.map(at)),
    horn(at, [118, -30], [212, -36], [246, 2], 28, 3),
    horn(at, [126, 36], [214, 76], [250, 42], 23, 3),
  ];
}

// the right half of the shell, from the middle of the brow round to the middle of the back
const shell = [[0, -127], [26, -124], [46, -112], [66, -113], [94, -121], [130, -110], [160, -84], [178, -44], [183, -2],
  [174, 42], [150, 80], [112, 108], [60, 125], [0, 131]];
// the whole outline, scaled by k about the middle of the shell: k a little over 1 gives the hairline round it
const shellAt = (k) => [...shell, ...shell.slice(1, -1).reverse().map(([x, y]) => [-x, y])]
  .map(([x, y]) => place(1, [x * k, y * k]));

export function draw() {
  const both = (fn) => [fn(1), fn(-1)];
  return [
    // eight walking legs, four a side, fanned so that air shows between every pair
    both((m) => [
      leg(m, [142, -50], [-14, 4, 14, 26], [106, 44, 58, 52], 20),
      leg(m, [152, -8], [4, 22, 32, 44], [108, 44, 56, 50], 20),
      leg(m, [146, 36], [22, 42, 52, 62], [102, 42, 52, 48], 19),
      leg(m, [124, 78], [42, 60, 70, 78], [92, 40, 48, 46], 18),
    ]),
    both(claw),
    // a hairline of air round the shell, so that it lies over the legs like a plate
    cut(blob(shellAt(1.045))),
    // eye stalks standing in their sockets on the front edge of the shell
    both((m) => [limb(...place(m, [46, -108]), 14, ...place(m, [52, -146]), 12.5), circle(...place(m, [53, -152]), 15.5)]),
    // the shell, broad, with the brow projecting between the eye sockets
    blob(shellAt(1)),
  ];
}
