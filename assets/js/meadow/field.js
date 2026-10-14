import { mulberry32 } from './math.js';

// The meadow is generated, not modelled: a seeded scatter of blades around a camera that sits
// about a centimetre above the soil, in a small clearing. Distances are in metres.
//
// Blade instance (12 floats): x, z, height, halfWidth | leanAzimuth, leanAngle, twist, bendPower | hue, dryness, phase, flex
// Droplet instance (16 floats): the 12 floats of its blade, then t, across, radius, kind
//   kind 0 = bead on the face, 1 = pendant under a tip, 2 = mote of pollen (blade floats reused)

export const BLADE_FLOATS = 12;
export const DROP_FLOATS = 16;

// Draw order is far to near. Each bin is drawn blades-then-droplets so a bead never paints over a
// blade standing in front of it, without sorting thousands of instances every frame.
export const BIN_EDGES = [99, 1.6, 1.0, 0.7, 0.45, 0.32, 0.22, 0.14, 0];
export const LOD_SPLIT = 0.45; // blades closer than this get the long, smooth strip

export function buildField({ seed = 7, density = 1 } = {}) {
  const rnd = mulberry32(seed);
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const blades = [];

  const blade = (r, az, o = {}) => {
    const x = Math.sin(az) * r, z = -Math.cos(az) * r;
    let height = o.height ?? 0.12 + Math.pow(rnd(), 1.5) * 0.3;
    let halfWidth = o.halfWidth ?? 0.0019 + Math.pow(rnd(), 2) * 0.0028;
    if (o.halfWidth === undefined && rnd() < 0.06) halfWidth *= 1.6;
    // most blades lean away from where they grew; a few cross the frame
    const leanAzimuth = o.leanAzimuth ?? rnd() * Math.PI * 2;
    let leanAngle = o.leanAngle ?? 0.1 + Math.pow(rnd(), 1.4) * 0.85;
    if (o.leanAngle === undefined && height > 0.3) leanAngle += 0.25 + rnd() * 0.5;
    const twist = gauss() * 0.6;
    const bendPower = 1.3 + rnd() * 1.2;
    const hue = rnd();
    const dryness = rnd() < 0.12 ? 0.35 + rnd() * 0.65 : rnd() * 0.15;
    const phase = rnd() * Math.PI * 2;
    const flex = (0.55 + rnd() * 0.6) * (0.6 + height * 1.6);
    blades.push({ r, data: [x, z, height, halfWidth, leanAzimuth, leanAngle, twist, bendPower, hue, dryness, phase, flex] });
  };

  // A. A handful of blades right by the lens, out at the edges: big, soft, framing.
  const frame = [
    [-1, 0.62, 0.075], [-1, 0.95, 0.055], [-1, 0.78, 0.11], [1, 0.7, 0.068], [1, 1.02, 0.09], [1, 0.58, 0.12], [-1, 1.15, 0.13], [1, 1.2, 0.1],
  ];
  for (const [side, a, r] of frame) {
    const az = side * (a + (rnd() - 0.5) * 0.08);
    // lean toward the middle of the frame so they arch into view instead of out of it
    blade(r, az, {
      height: 0.26 + rnd() * 0.16,
      halfWidth: 0.0018 + rnd() * 0.0016,
      leanAzimuth: Math.atan2(-Math.cos(az) * 0.3, -side) + (rnd() - 0.5) * 0.5,
      leanAngle: 0.35 + rnd() * 0.45,
    });
  }

  // B. The blades in focus: they stand around the clearing, thinning toward the middle.
  const nB = Math.round(78 * Math.max(density, 0.7));
  for (let i = 0, guard = 0; i < nB && guard < 5000; guard++) {
    const r = 0.15 + Math.pow(rnd(), 0.85) * 0.3;
    const az = (rnd() * 2 - 1) * 1.15;
    const open = Math.abs(az) < 0.38 && r < 0.36;
    if (open && rnd() < 0.82) continue;
    blade(r, az);
    i++;
  }

  // C and D. The meadow beyond: denser and lower on screen with distance, closing the horizon.
  const nC = Math.round(1100 * density);
  for (let i = 0; i < nC; i++) {
    const r = 0.45 + Math.sqrt(rnd()) * 0.75;
    blade(r, (rnd() * 2 - 1) * 1.05, { height: 0.16 + Math.pow(rnd(), 1.3) * 0.32 });
  }
  const nD = Math.round(3200 * density);
  for (let i = 0; i < nD; i++) {
    const r = 1.2 + Math.sqrt(rnd()) * 1.5;
    blade(r, (rnd() * 2 - 1) * 0.98, {
      height: 0.24 + Math.pow(rnd(), 1.2) * 0.34,
      halfWidth: (0.0022 + Math.pow(rnd(), 2) * 0.003) * 1.4,
    });
  }

  blades.sort((a, b) => b.r - a.r);

  // Droplets: beads on the faces of the blades in focus, a few lenses of light on the near ones,
  // pendants under drooping tips, and motes of pollen in the air.
  const drops = [];
  for (const b of blades) {
    const [, , height, halfWidth, , leanAngle] = b.data;
    if (b.r > 0.8) continue;
    const near = b.r < 0.14, focus = b.r >= 0.14 && b.r < 0.45;
    const mean = near ? 1.5 : focus ? 2.4 : 0.14;
    let n = 0;
    let p = Math.exp(-mean), s = p;
    const x = rnd();
    while (x > s && n < 12) { n++; p *= mean / n; s += p; }
    for (let i = 0; i < n; i++) {
      const t = 0.15 + rnd() * 0.78;
      const radius = Math.min(0.00045 + Math.pow(rnd(), 2.2) * 0.0017, halfWidth * 1.2 + 0.0004);
      const across = (rnd() * 2 - 1) * 0.55;
      drops.push({ r: b.r, data: [...b.data, t, across, radius, 0] });
    }
    if (focus && rnd() < 0.1) {
      // a short, uneven run of tiny beads along an edge, the way dew lines up
      const side = rnd() < 0.5 ? -1 : 1, k = 3 + Math.floor(rnd() * 3);
      let t = 0.3 + rnd() * 0.4;
      for (let j = 0; j < k; j++) {
        t += 0.02 + rnd() * 0.05;
        drops.push({ r: b.r, data: [...b.data, t, side * (0.7 + rnd() * 0.2), 0.00025 + Math.pow(rnd(), 2) * 0.0004, 0] });
      }
    }
    if (leanAngle > 0.7 && height > 0.15 && rnd() < 0.4) {
      drops.push({ r: b.r, data: [...b.data, 1, 0, 0.0013 + rnd() * 0.0011, 1] });
    }
  }

  const motes = Math.round(60 * Math.max(density, 0.6));
  for (let i = 0; i < motes; i++) {
    const r = 0.05 + Math.pow(rnd(), 1.2) * 0.6;
    const az = (rnd() * 2 - 1) * 0.9;
    const y = 0.03 + rnd() * 0.3;
    drops.push({
      r,
      data: [Math.sin(az) * r, -Math.cos(az) * r, y, 0, 0, 0, 0, 0, rnd(), rnd(), rnd() * Math.PI * 2, rnd(), 0, 0, 0.00009 + rnd() * 0.00012, 2],
    });
  }

  drops.sort((a, b) => b.r - a.r);

  const bladeArr = new Float32Array(blades.length * BLADE_FLOATS);
  blades.forEach((b, i) => bladeArr.set(b.data, i * BLADE_FLOATS));
  const dropArr = new Float32Array(drops.length * DROP_FLOATS);
  drops.forEach((d, i) => dropArr.set(d.data, i * DROP_FLOATS));

  const rangeOf = (list, lo, hi) => {
    let start = -1, end = -1;
    for (let i = 0; i < list.length; i++) {
      const r = list[i].r;
      if (r < hi && r >= lo) {
        if (start < 0) start = i;
        end = i + 1;
      }
    }
    return start < 0 ? [0, 0] : [start, end - start];
  };

  const bins = [];
  for (let i = 0; i < BIN_EDGES.length - 1; i++) {
    const hi = BIN_EDGES[i], lo = BIN_EDGES[i + 1];
    const [bStart, bCount] = rangeOf(blades, lo, hi);
    const [dStart, dCount] = rangeOf(drops, lo, hi);
    bins.push({ bStart, bCount, dStart, dCount, near: lo < LOD_SPLIT });
  }

  return { blades: bladeArr, bladeCount: blades.length, drops: dropArr, dropCount: drops.length, bins };
}
