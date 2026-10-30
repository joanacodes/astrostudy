// The symbols of the twelve signs and of the twelve celestial bodies, as figures for the picture kit in
// tools/myths/styles/, in the order of a chart: each { slug, name, glyph, about, astrology, draw }. Their outlines are
// in symbols.json, which outlines.py makes from the site's own symbol font and encyclopaedia entries.
import { readFileSync } from 'node:fs';

const symbols = JSON.parse(readFileSync(new URL('./symbols.json', import.meta.url), 'utf8'));

// A symbol stands on nothing, so a design that sets its figures on the ground (the woodcut) sets it in the middle with
// no ground under it; and its rings and loops stay shut, so a design that clears a halo round the figure clears it round
// `solid`, the symbol with its counters filled, and never cuts into them.
export const SYMBOLS = symbols.map(({ d, solid, grow, ...s }) => ({
  ...s,
  astrology: s.name,
  floating: true,
  draw: () => [{ d, grow }],
  solid: () => [{ d: solid, grow }],
}));
