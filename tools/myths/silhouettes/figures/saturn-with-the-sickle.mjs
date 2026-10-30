// Saturn, after the fresco from the House of the Dioscuri at Pompeii (Naples, National Archaeological Museum).
import { blob, chain, ellipse, line, poly } from '../lib.mjs';

export const slug = 'saturn-with-the-sickle';
export const myth = 'Saturn with the sickle';
export const astrology = 'Saturn';

const deg = (d) => (d * Math.PI) / 180;

// a curved blade: its back on a circle of radius r round (cx, cy), from angle a0 (at the handle) to a1
// (the point); it leaves the handle at the handle's width w0, swells to w, then thins to nothing, the
// cutting edge on the inside of the curve
function blade(cx, cy, r, a0, a1, w0, w) {
  const outer = [];
  const inner = [];
  const n = 40;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const a = deg(a0 + (a1 - a0) * t);
    const wt = Math.min(w * Math.pow(1 - t, 0.7), w0 + ((w - w0) * t) / 0.15);
    outer.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    inner.push([cx + (r - wt) * Math.cos(a), cy + (r - wt) * Math.sin(a)]);
  }
  return poly([...outer, ...inner.reverse()]);
}

export function draw() {
  return [
    // the old man's face in profile, turned to his right: brow, nose, and the long pointed beard
    blob([[514, 149], [508, 158], [510, 166], [498, 181], [489, 193], [503, 197], [499, 204], [495, 211], [488, 230],
      [487, 252], [493, 275], [504, 299], [533, 303], [550, 252], [550, 196], [536, 155]]),
    // the mantle drawn up over the head, its edge overhanging the brow, falling behind the neck to the shoulders
    blob([[503, 145], [505, 126], [519, 113], [551, 108], [583, 115], [602, 138], [609, 172], [605, 205], [613, 239],
      [634, 262], [649, 292], [602, 318], [546, 318], [518, 299], [535, 243], [536, 196], [525, 158], [514, 152]]),
    // the body: the mantle over a long tunic, its end falling from the left forearm in a cascade of folds
    blob([[505, 286], [567, 292], [637, 288], [669, 292], [687, 330], [701, 410], [705, 470], [711, 540], [719, 620],
      [727, 700], [733, 766], [715, 756], [705, 780], [687, 760], [667, 768], [657, 800], [659, 850],
      [669, 886], [607, 888], [547, 888], [483, 886], [489, 840], [491, 790], [493, 740], [477, 718], [473, 680],
      [473, 630], [467, 570], [475, 510], [483, 460], [479, 400], [475, 340], [473, 304]]),
    // the right arm, bare, raised to hold the sickle out from the body
    chain([[487, 304, 28], [412, 420, 20], [395, 308, 14]]),
    ellipse(392, 292, 15, 19),
    // the sickle: the handle through the fist and the blade curving up and over, away from the head
    line([[391, 342], [391, 236]], 13),
    blade(331.5, 236, 66, 0, -225, 13, 26),
    // the toes under the hem, and the ground
    blob([[507, 872], [510, 884], [461, 884], [467, 874]]),
    blob([[647, 872], [687, 874], [695, 884], [647, 884]]),
    poly([[443, 882], [711, 882], [721, 906], [433, 906]]),
  ];
}
