// A cameo cut in sardonyx, as the Romans cut them under Augustus: the figure carved in the stone's milky layer and
// the ground cut down to its brown one, the white thin enough at its edges for the brown to show through; set in a
// gold mount with a beaded rim, on velvet.
import { dropShadow, noise, placed, relief, svgDoc } from './common.mjs';

export const name = 'cameo';
export const title = 'Cameo';
export const about = 'A Roman cameo in sardonyx: the stone\'s white layer cut away round the figure down to the brown one, in a gold mount.';

const RX = 388;
const RY = 312;
const ring = (rx, ry) => `M${500 - rx} 500 a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

export function svg(fig) {
  const at = { s: 0.62, dy: 6 };
  const copy = (ids, fill) => placed(fig, { ...at, fill, ids });
  const white = copy('cm1', '#efe7da');
  const core = copy('cm2', '#fbf8f1');
  const lit = copy('cm3', '#000');
  const shine = copy('cm4', '#000');
  const beads = Array.from({ length: 84 }, (_, i) => {
    const a = (i / 84) * 2 * Math.PI;
    return `<circle cx="${(500 + (RX + 27) * Math.cos(a)).toFixed(1)}" cy="${(500 + (RY + 27) * Math.sin(a)).toFixed(1)}" r="9.5"/>`;
  }).join('');
  const mount = `<path d="${ring(RX + 50, RY + 50)} ${ring(RX + 4, RY + 4)}" fill-rule="evenodd"/>`;
  const defs = white.defs + core.defs + lit.defs + shine.defs
    + '<radialGradient id="cm-velvet" cx=".5" cy=".45" r=".72"><stop offset="0" stop-color="#2a3c45"/><stop offset="1" stop-color="#101a20"/></radialGradient>'
    + '<linearGradient id="cm-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b4915"/><stop offset=".22" stop-color="#e8c46a"/><stop offset=".42" stop-color="#9a7027"/><stop offset=".62" stop-color="#f2d88c"/><stop offset=".82" stop-color="#8b6420"/><stop offset="1" stop-color="#5a3d11"/></linearGradient>'
    + '<radialGradient id="cm-stone" cx=".38" cy=".34" r=".78"><stop offset="0" stop-color="#a5643c"/><stop offset=".55" stop-color="#743c21"/><stop offset="1" stop-color="#43200f"/></radialGradient>'
    + `<clipPath id="cm-in"><ellipse cx="500" cy="500" rx="${RX}" ry="${RY}"/></clipPath>`
    + `<clipPath id="cm-rim"><path d="${ring(RX + 50, RY + 50)} ${ring(RX + 4, RY + 4)}" clip-rule="evenodd"/></clipPath>`
    // the stone is banded; the bands run across it
    + '<filter id="cm-bands" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.0015 0.022" numOctaves="3" seed="6"/><feColorMatrix values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/></filter>'
    + noise('cm-nap', 0.5, 2, 13)
    // the thick middle of the white layer: the figure shrunk and softened
    + '<filter id="cm-core" x="0" y="0" width="1000" height="1000" filterUnits="userSpaceOnUse"><feMorphology operator="erode" radius="4"/><feGaussianBlur stdDeviation="3.5"/></filter>'
    + dropShadow('cm-shadow', 14, 12, 0.6)
    + relief('cm-diff', { blur: 3, height: 5 }) + relief('cm-spec', { blur: 3, height: 5, kind: 'specular', exponent: 26, constant: 0.6 })
    + relief('cm-gdiff', { blur: 2.5, height: 9 }) + relief('cm-gspec', { blur: 2.5, height: 9, kind: 'specular', exponent: 18, constant: 1 });
  return svgDoc(defs, [
    '<rect width="1000" height="1000" fill="url(#cm-velvet)"/>',
    '<rect width="1000" height="1000" filter="url(#cm-nap)" opacity=".1" style="mix-blend-mode:multiply"/>',
    `<g filter="url(#cm-shadow)"><path d="${ring(RX + 50, RY + 50)}" fill="#6b4915"/></g>`,
    // the gold mount, its rim beaded, lit from the upper left (a clipped group blends its layers only with one
    // another, so what they light goes inside it)
    '<g clip-path="url(#cm-rim)">',
    `<g fill="url(#cm-gold)">${mount}${beads}</g>`,
    `<g style="mix-blend-mode:overlay"><g filter="url(#cm-gdiff)">${mount}${beads}</g></g>`,
    `<g style="mix-blend-mode:screen"><g filter="url(#cm-gspec)">${mount}${beads}</g></g>`,
    '</g>',
    // the stone, and the figure carved in its white layer
    '<g clip-path="url(#cm-in)">',
    `<ellipse cx="500" cy="500" rx="${RX}" ry="${RY}" fill="url(#cm-stone)"/>`,
    '<rect width="1000" height="1000" filter="url(#cm-bands)" opacity=".22" style="mix-blend-mode:multiply"/>',
    `<g opacity=".72">${white.body}</g>`,
    `<g filter="url(#cm-core)">${core.body}</g>`,
    `<g style="mix-blend-mode:overlay"><g filter="url(#cm-diff)">${lit.body}</g></g>`,
    `<g style="mix-blend-mode:screen"><g filter="url(#cm-spec)">${shine.body}</g></g>`,
    // the polish of the stone
    `<ellipse cx="380" cy="330" rx="${RX * 0.55}" ry="${RY * 0.32}" fill="#fff" opacity=".06" transform="rotate(-18 380 330)"/>`,
    '</g>',
  ].join(''));
}
