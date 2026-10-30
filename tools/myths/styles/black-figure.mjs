// Athenian black-figure, as on the panels of amphorae of the sixth century BC: the figure painted in black glaze on
// the orange clay, a band of stopped meander above it, rays rising from the foot below, the vase glazed all round.
import { figureMask, noise, placed, svgDoc } from './common.mjs';

export const name = 'black-figure';
export const title = 'Black-figure vase';
export const about = 'Athenian vase painting of the sixth century BC: black glaze on the orange clay, a meander above, rays below.';

export const CLAY = '#c8713c';
export const GLAZE = '#19120e';

// a stopped meander from x0 to x1 in a band of height h: square spiral keys between two border lines; with
// `squares`, every so many keys a square with a saltire in it, as red-figure painters drew their ground lines
export function meander(y, h, x0, x1, ink, squares = 0) {
  const w = h * 0.11;
  const k = h * 0.56;
  const step = k * 1.36;
  const n = Math.floor((x1 - x0) / step);
  const start = x0 + (x1 - x0 - n * step) / 2 + (step - k) / 2;
  const top = y + (h - k) / 2;
  const keys = [];
  for (let i = 0; i < n; i += 1) {
    const x = start + i * step;
    const pts = squares && i % (squares + 1) === squares
      ? [[[0, 0], [0.86, 0], [0.86, 0.86], [0, 0.86], [0, 0]], [[0.16, 0.16], [0.7, 0.7]], [[0.7, 0.16], [0.16, 0.7]]]
      : [[[0, 1], [0, 0], [0.86, 0], [0.86, 0.8], [0.3, 0.8], [0.3, 0.38], [0.6, 0.38]]];
    for (const p of pts) keys.push(`M${p.map(([u, v]) => `${(x + u * k).toFixed(1)} ${(top + v * k).toFixed(1)}`).join(' L')}`);
  }
  return `<path d="${keys.join(' ')}" fill="none" stroke="${ink}" stroke-width="${w.toFixed(1)}" stroke-linecap="square" stroke-linejoin="miter"/>`
    + `<path d="M${x0} ${y + w / 2} H${x1} M${x0} ${y + h - w / 2} H${x1}" stroke="${ink}" stroke-width="${w.toFixed(1)}"/>`;
}

// black rays standing on a line, as round the foot of a vase
function rays(y, h, x0, x1, ink) {
  const n = Math.round((x1 - x0) / (h * 0.6));
  const wid = (x1 - x0) / n;
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const x = x0 + i * wid;
    d += `M${(x + wid * 0.1).toFixed(1)} ${y + h} L${(x + wid / 2).toFixed(1)} ${y} L${(x + wid * 0.9).toFixed(1)} ${y + h} Z`;
  }
  return `<path d="${d}" fill="${ink}"/>`;
}

export function svg(fig) {
  const at = { s: 0.84, dy: 23 };
  const f = placed(fig, { ...at, fill: GLAZE, ids: 'bf' });
  const defs = f.defs + noise('bf-mottle', 0.009, 4, 7) + noise('bf-grain', 0.7, 1, 3)
    + figureMask('bf-fig', fig, at)
    // the glaze shines where the light catches the curve of the pot
    + '<linearGradient id="bf-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".34" stop-color="#fff" stop-opacity=".09"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  return svgDoc(defs, [
    `<rect width="1000" height="1000" fill="${CLAY}"/>`,
    // the glazed body of the pot round the panel
    `<path d="M0 0 H1000 V1000 H0 Z M34 96 V934 H966 V96 Z" fill="${GLAZE}" fill-rule="evenodd"/>`,
    meander(108, 62, 34, 966, GLAZE),
    // the ground line, and the rays round the foot
    `<rect x="34" y="846" width="932" height="9" fill="${GLAZE}"/>`,
    rays(866, 58, 34, 966, GLAZE),
    f.body,
    '<rect width="1000" height="1000" fill="url(#bf-sheen)" mask="url(#bf-fig)"/>',
    // the clay fires unevenly: a broad mottle and a fine grain over everything
    '<rect width="1000" height="1000" filter="url(#bf-mottle)" opacity=".2" style="mix-blend-mode:multiply"/>',
    '<rect width="1000" height="1000" filter="url(#bf-grain)" opacity=".07" style="mix-blend-mode:multiply"/>',
  ].join(''));
}
