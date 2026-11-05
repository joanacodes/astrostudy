// The scorpion Earth sent to kill Orion (as Ovid tells it, Fasti 5), seen from above as on ancient engraved gems.
import { blob, chain, circle, cut, ellipse, limb, line, poly } from '../lib.mjs';

export const slug = 'orion-and-the-scorpion';
export const myth = 'Orion and the Scorpion';
export const astrology = 'Scorpio';

// The body, claws and legs are drawn once in offsets from the waist (where the head-plate meets the back) and
// mirrored: m = 1 on our right, -1 on our left. Only the tail, curled to our right, breaks the symmetry.
const X0 = 500;
const Y0 = 552;
const S = 1.38;
const place = (m, [dx, dy]) => [X0 + S * m * dx, Y0 + S * dy];
const rad = (deg) => (deg * Math.PI) / 180;
const toward = ([x, y], len, deg) => [x + len * Math.cos(rad(deg)), y + len * Math.sin(rad(deg))];
const halves = (pts) => [...pts, ...pts.slice(1, -1).reverse().map(([x, y]) => [-x, y])];

// a finger of the claw: a tapering curve along a quadratic Bezier from a, pulled towards c, to b, cut into short
// limbs so that its outline stays smooth
function horn(m, a, c, b, r1, r2, n = 14) {
  const joints = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const q = (k) => (1 - t) * (1 - t) * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k];
    joints.push([...place(m, [q(0), q(1)]), S * (r1 + (r2 - r1) * t ** 1.3)]);
  }
  return chain(joints);
}

// a walking leg: femur, patella, tibia and tarsus, each a tapered rod a little narrower than the end of the one
// before it, so that the joints show
function leg(m, base, [a1, a2, a3, a4], [l1, l2, l3, l4], w) {
  const knee = toward(base, l1, a1);
  const shin = toward(knee, l2, a2);
  const ankle = toward(shin, l3, a3);
  const tip = toward(ankle, l4, a4);
  const at = (p) => place(m, p);
  return [
    limb(...at(base), S * w, ...at(knee), S * w * 0.9),
    limb(...at(knee), S * w * 0.76, ...at(shin), S * w * 0.7),
    limb(...at(shin), S * w * 0.64, ...at(ankle), S * w * 0.54),
    limb(...at(ankle), S * w * 0.46, ...at(tip), S * 1.2),
  ];
}

// a pedipalp: femur and patella reaching forward, the swollen hand, and the two fingers held a little open
function palp(m) {
  const at = (p) => place(m, p);
  return [
    limb(...at([28, -70]), S * 11, ...at([94, -120]), S * 10),
    limb(...at([94, -120]), S * 11, ...at([108, -168]), S * 16),
    ellipse(...at([106, -210]), S * 44, S * 33, m > 0 ? -96 : -84),
    horn(m, [90, -242], [80, -280], [66, -304], 13, 2),
    horn(m, [122, -242], [126, -286], [98, -312], 12, 2),
  ];
}

// the head-plate, notched in front over the little chelicerae, and the back of seven plates from the waist to the
// tail, with the depth and half-width of each seam between two plates
const headPlate = [[0, -74], [14, -78], [32, -78], [42, -62], [48, -34], [52, -8], [50, 4], [0, 4]];
const back = [[0, -4], [52, -4], [62, 28], [66, 66], [64, 104], [56, 134], [42, 154], [24, 166], [0, 168]];
const plateSeams = [[24, 60], [48, 66], [72, 68], [96, 66], [120, 60], [142, 50]];

// The spine of the tail: a curve that leaves the end of the back heading backwards and turns ever more tightly
// (K0 to K1 degrees a unit) to our right, then forwards and over, as a scorpion's tail curls when it is raised to
// strike; its last `hook` units, the sting itself, bend harder still, so that the point comes down at the back.
// Returns the point and heading at every unit of length.
const K0 = 0.55;
const K1 = 0.82;
function spine(len, hook, start = [0, 156], dir = 72) {
  const out = [{ q: start, h: dir }];
  let [x, y] = start;
  let h = dir;
  for (let s = 1; s <= len; s += 1) {
    h -= K0 + ((K1 - K0) * s) / len + (s > len - hook ? 0.35 : 0);
    x += Math.cos(rad(h));
    y += Math.sin(rad(h));
    out.push({ q: [x, y], h });
  }
  return out;
}

// a rigid tail segment from joint p to joint q: a barrel with rounded shoulders, narrow where it meets the next
function barrel(p, q, half) {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const [ux, uy] = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
  const side = [];
  for (let i = 0; i <= 16; i += 1) {
    const t = i / 16;
    side.push([t, half * (0.52 + 0.48 * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)))]);
  }
  const pt = ([t, w], k) => place(1, [p[0] + ux * len * t - uy * w * k, p[1] + uy * len * t + ux * w * k]);
  return poly([...side.map((a) => pt(a, 1)), ...side.reverse().map((a) => pt(a, -1))]);
}

// the stretch of the spine from s0 to s1 as a solid band whose half-width at each point is half(t), t running
// from 0 to 1 along it: the bulb of the sting swelling and narrowing into the spike
function band(sp, s0, s1, half) {
  const left = [];
  const right = [];
  for (let s = s0; s <= s1; s += 1) {
    const { q, h } = sp[s];
    const w = half((s - s0) / (s1 - s0));
    left.push(place(1, toward(q, w, h - 90)));
    right.push(place(1, toward(q, w, h + 90)));
  }
  return poly([...left, ...right.reverse()]);
}
// the half-width of the bulb and sting: as narrow as a joint where it leaves the last segment, swelling round, then
// drawn out to a fine point
const telson = (t) => (t < 0.24 ? 12 + 13 * Math.sin((t / 0.24) * (Math.PI / 2))
  : t < 0.55 ? 25 - 13 * ((t - 0.24) / 0.31) ** 1.4 : 12 * ((1 - t) / 0.45) ** 1.1 + 0.6);

// the tail: five segments, the bulb and the sting. grow > 0 gives the same tail fattened, to cut the hairline of
// air round it where it passes over the legs and the back; `from` leaves out the first segments, which come
// out of the body and must not be parted from it.
const SEGMENTS = [[60, 21], [64, 21], [68, 21.5], [74, 22], [84, 22.5]];
const BULB = 64;
const STING = 56;

function tail(grow = 0, from = 0) {
  const total = SEGMENTS.reduce((a, [l]) => a + l, 0);
  const sp = spine(total + BULB + STING, STING);
  const shapes = [];
  const seams = [];
  let s = 0;
  SEGMENTS.forEach(([len, half], i) => {
    const a = sp[s].q;
    const b = sp[s + len].q;
    if (i >= from) {
      shapes.push(barrel(a, b, half + grow));
      shapes.push(circle(...place(1, b), S * (half * 0.56 + grow)));
    }
    // a hairline across each joint, so that the five segments read one by one
    const h = sp[s + len].h + 90;
    seams.push(cut(line([place(1, toward(b, half + 4, h)), place(1, toward(b, -half - 4, h))], 4)));
    s += len;
  });
  // the bulb swells out of the last segment and narrows into the hooked spike
  shapes.push(band(sp, s, s + BULB + STING, (t) => telson(t) + grow));
  return grow ? shapes : [shapes, seams];
}

export function draw() {
  const both = (fn) => [fn(1), fn(-1)];
  return [
    both((m) => [
      leg(m, [40, -60], [-24, -40, -52, -60], [52, 36, 34, 26], 11),
      leg(m, [46, -44], [-4, -20, -32, -40], [60, 38, 36, 28], 11),
      leg(m, [48, -28], [18, 34, 46, 56], [64, 40, 38, 28], 11),
      leg(m, [48, -12], [34, 50, 62, 70], [68, 42, 40, 30], 11),
    ]),
    both(palp),
    blob(halves(back).map((p) => place(1, p))),
    // the seams between the plates of the back, each cut a little past its edges so that the outline steps too
    plateSeams.map(([y, w]) => cut(line([place(1, [-w - 4, y - 4]), place(1, [0, y + 3]), place(1, [w + 4, y - 4])], 3.5))),
    // a hairline of air round the head-plate, so that the legs and claws come out from under it
    cut(blob(halves(headPlate).map(([x, y]) => place(1, [x * 1.08, y * 1.06 + 3])))),
    blob(halves(headPlate).map((p) => place(1, p))),
    // a hairline of air round the tail where it passes over the legs and the back, then the tail itself
    tail(6, 2).flat(Infinity).map(cut),
    tail(),
  ];
}
