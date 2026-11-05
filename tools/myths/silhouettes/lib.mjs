// The drawing kit for the myth silhouettes: every figure is built on a 1000 × 1000 canvas from a few
// kinds of solid shapes, all in one colour, so a silhouette reads at a glance and can be recoloured.
//
//   limb(x1, y1, r1, x2, y2, r2)   a tapered limb: the hull of two circles (an arm, a leg, a neck, a horn)
//   chain([[x, y, r], …])          several limbs end to end (an arm bent at the elbow, a tail)
//   blob([[x, y], …])              a smooth closed outline through points (a torso, drapery, an animal's body)
//   circle(x, y, r) · ellipse(x, y, rx, ry, deg)
//   poly([[x, y], …])              a hard-edged outline (a thunderbolt, a spearhead, a throne)
//   line([[x, y], …], width)       a rod of even width (a spear, a sceptre, a string)
//   cut(shape)                     the shape taken out of everything drawn before it (negative space)
//   { d, grow }                    an outline drawn `grow` heavier all round (a symbol set bolder than its font)
//
// A figure module exports { slug, myth, astrology, draw }, where draw() returns a list of these.

const f = (n) => Math.round(n * 10) / 10;
const pt = ([x, y]) => `${f(x)} ${f(y)}`;

// points around a circle from angle a to angle b (radians), clockwise on screen
function arc(cx, cy, r, a, b, steps) {
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = a + ((b - a) * i) / steps;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

export function limb(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  if (d <= Math.abs(r1 - r2) + 0.01) return circle(r1 > r2 ? x1 : x2, r1 > r2 ? y1 : y2, Math.max(r1, r2));
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)));
  const steps = 18;
  const far = arc(x2, y2, r2, a - b, a + b, steps); // round end of the second circle
  const near = arc(x1, y1, r1, a + b, a - b + 2 * Math.PI, steps); // and of the first
  return { d: `M${[...far, ...near].map(pt).join(' L')} Z` };
}

export function chain(joints) {
  const shapes = [];
  for (let i = 0; i < joints.length - 1; i += 1) {
    const [x1, y1, r1] = joints[i];
    const [x2, y2, r2] = joints[i + 1];
    shapes.push(limb(x1, y1, r1, x2, y2, r2));
  }
  return shapes;
}

// a smooth closed curve through the points (Catmull-Rom turned into cubic Béziers)
export function blob(points, tension = 1) {
  const n = points.length;
  const p = (i) => points[(i + n) % n];
  let d = `M${pt(p(0))}`;
  for (let i = 0; i < n; i += 1) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1 = [x1 + ((x2 - x0) / 6) * tension, y1 + ((y2 - y0) / 6) * tension];
    const c2 = [x2 - ((x3 - x1) / 6) * tension, y2 - ((y3 - y1) / 6) * tension];
    d += ` C${pt(c1)} ${pt(c2)} ${pt([x2, y2])}`;
  }
  return { d: `${d} Z` };
}

export const circle = (x, y, r) => ({ d: `M${f(x - r)} ${f(y)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z` });

export function ellipse(x, y, rx, ry, deg = 0) {
  const t = (deg * Math.PI) / 180;
  const pts = arc(0, 0, 1, 0, 2 * Math.PI, 48).map(([u, v]) => [x + rx * u * Math.cos(t) - ry * v * Math.sin(t), y + rx * u * Math.sin(t) + ry * v * Math.cos(t)]);
  return { d: `M${pts.map(pt).join(' L')} Z` };
}

export const poly = (points) => ({ d: `M${points.map(pt).join(' L')} Z` });

// a rod of even width along a polyline, with round ends
export const line = (points, width) => ({ stroke: `M${points.map(pt).join(' L')}`, width });

export const cut = (shape) => ({ ...shape, cut: true });

// the figure as SVG markup to set into a page of one's own: `body` draws it in `fg`, `defs` holds the masks its
// cut-outs need. Cut-outs are a mask over what came before; `ids` prefixes the masks' ids, so several figures can
// share one page.
export function toParts(shapes, { fg = '#fff', ids = 'm' } = {}) {
  const flat = shapes.flat(Infinity).filter(Boolean);
  let group = [];
  let masks = 0;
  const defs = [];
  const el = (s, colour) => (s.stroke
    ? `<path d="${s.stroke}" fill="none" stroke="${colour}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${s.d}" fill="${colour}"${s.grow ? ` stroke="${colour}" stroke-width="${s.grow}" stroke-linejoin="round"` : ''}/>`);
  for (const s of flat) {
    if (s.cut) {
      masks += 1;
      defs.push(`<mask id="${ids}${masks}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/>${el(s, '#000')}</mask>`);
      group = [`<g mask="url(#${ids}${masks})">${group.join('')}</g>`];
    } else {
      group.push(el(s, fg));
    }
  }
  return { defs: defs.join(''), body: group.join('') };
}

// the figure as an SVG, in `fg` on `bg` (bg null: transparent)
export function toSvg(shapes, { fg = '#fff', bg = '#000', size = 1000, ids = 'm' } = {}) {
  const { defs, body } = toParts(shapes, { fg, ids });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${size}" height="${size}">`
    + (defs ? `<defs>${defs}</defs>` : '')
    + (bg ? `<rect width="1000" height="1000" fill="${bg}"/>` : '')
    + body + '</svg>';
}
