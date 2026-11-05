// A silver coin of a Greek city: struck, so the flan is not quite round; the figure in relief inside a beaded border,
// the legend running round the bottom, the high points rubbed bright by handling and the field toned darker.
import { blob } from '../silhouettes/lib.mjs';
import { noise, placed, random, relief, svgDoc } from './common.mjs';

export const name = 'coin';
export const title = 'Ancient coin';
export const about = 'A struck silver coin of a Greek city: the figure in relief in a beaded border, with the legend ΤΟΞΟΤΗΣ, the Greek name of the sign.';

export function svg(fig) {
  const rnd = random(5);
  const flan = blob(Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * 2 * Math.PI;
    const r = 432 + (rnd() - 0.5) * 14;
    return [500 + r * Math.cos(a), 500 + r * Math.sin(a)];
  })).d;
  const at = { s: 0.6, dy: -16 };
  const copy = (ids, fill) => placed(fig, { ...at, fill, ids });
  const lit = copy('co1', '#000');
  const shine = copy('co2', '#000');
  const worn = copy('co3', '#f4f1e8');
  const beads = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * 2 * Math.PI;
    return `<circle cx="${(500 + 388 * Math.cos(a)).toFixed(1)}" cy="${(500 + 388 * Math.sin(a)).toFixed(1)}" r="7"/>`;
  }).join('');
  const legend = '<text font-family="FreeSerif, DejaVu Serif, serif" font-size="60" font-weight="bold" letter-spacing="16" text-anchor="middle"><textPath href="#co-arc" startOffset="50%">ΤΟΞΟΤΗΣ</textPath></text>';
  const raised = (f) => `${beads}${legend}${f.body}`;
  const defs = lit.defs + shine.defs + worn.defs
    + '<path id="co-arc" d="M148 500 A352 352 0 0 0 852 500"/>'
    + `<clipPath id="co-flan"><path d="${flan}"/></clipPath>`
    + '<radialGradient id="co-metal" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="#e2ddd0"/><stop offset=".6" stop-color="#bdb6a6"/><stop offset="1" stop-color="#958d7c"/></radialGradient>'
    // silver tones from the edge inwards, golden brown and a little blue
    + '<radialGradient id="co-tone" cx=".5" cy=".5" r=".5"><stop offset=".5" stop-color="#8a6a3c" stop-opacity="0"/><stop offset=".88" stop-color="#8a6a3c" stop-opacity=".4"/><stop offset="1" stop-color="#4e4c62" stop-opacity=".55"/></radialGradient>'
    + '<radialGradient id="co-room" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#34312c"/><stop offset="1" stop-color="#151412"/></radialGradient>'
    + noise('co-patina', 0.05, 3, 31)
    + '<filter id="co-blur" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="16"/></filter>'
    + relief('co-diff', { blur: 3.4, height: 7 }) + relief('co-spec', { blur: 3.4, height: 7, kind: 'specular', exponent: 34, constant: 0.85 });
  return svgDoc(defs, [
    '<rect width="1000" height="1000" fill="url(#co-room)"/>',
    `<path d="${flan}" fill="#000" opacity=".65" filter="url(#co-blur)" transform="translate(12 18)"/>`,
    // a clipped group blends its layers only with one another, so the metal goes inside it, under them
    '<g clip-path="url(#co-flan)">',
    `<path d="${flan}" fill="url(#co-metal)"/>`,
    '<rect width="1000" height="1000" filter="url(#co-patina)" opacity=".16" style="mix-blend-mode:multiply"/>',
    '<rect width="1000" height="1000" fill="url(#co-tone)"/>',
    // the high points, rubbed bright
    `<g fill="#f4f1e8" opacity=".55">${beads}${legend}</g><g opacity=".55">${worn.body}</g>`,
    `<g style="mix-blend-mode:overlay"><g filter="url(#co-diff)">${raised(lit)}</g></g>`,
    `<g style="mix-blend-mode:screen"><g filter="url(#co-spec)">${raised(shine)}</g></g>`,
    '</g>',
    // the edge of the flan, catching the light on its upper left
    `<path d="${flan}" fill="none" stroke="#5e594f" stroke-width="3"/>`,
    `<path d="${flan}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.5" transform="translate(-1.5 -1.5)"/>`,
  ].join(''));
}
