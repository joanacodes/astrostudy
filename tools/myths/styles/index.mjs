// The sets of drawing styles, each in the groups its comparison page shows them in (render.mjs draws them in this
// order): `colour`, twelve looks from vase painting to stained glass, and `mono`, twelve ways of drawing the figures
// themselves in black and white. A set's modules are in `folder`, its pictures go to media/myths/<out>/.
export const SETS = {
  colour: {
    folder: '',
    out: 'styles',
    type: 'jpeg',
    title: 'Myth drawing styles',
    heading: (n) => `${n} ways to draw the myths`,
    lede: (fig, n) => `${fig.myth} of ${fig.astrology}, drawn in ${n} styles, so the 25 figures can share one look.`,
    note: (fig) => `The stars on the atlas plate are placed for the look, not where the stars of ${fig.astrology} are.`,
    groups: [
      { title: 'Ancient art', styles: ['black-figure', 'red-figure', 'mosaic', 'coin'] },
      { title: 'Carved and engraved', styles: ['cameo', 'woodcut', 'star-atlas', 'stipple'] },
      { title: 'Printed, cut and drawn', styles: ['risograph', 'paper-cut', 'stained-glass', 'line-art'] },
    ],
  },
  mono: {
    folder: 'mono/',
    out: 'mono',
    type: 'png',
    title: 'Black and white designs',
    heading: (n) => `${n} black and white designs`,
    lede: (fig, n) => `${fig.myth} of ${fig.astrology}, kept in black and white like the silhouettes but drawn ${n} different ways, so the 25 figures can share one design. Each is white on black; the switch shows it black on white.`,
    invert: true,
    groups: [
      { title: 'Lines', styles: ['line', 'brush', 'topographic', 'op-art'] },
      { title: 'Dots and tiles', styles: ['stipple', 'halftone', 'mosaic', 'constellation'] },
      { title: 'Cut and carved', styles: ['scratchboard', 'woodcut', 'paper-cut', 'stencil'] },
    ],
  },
};

export const stylesOf = (set) => set.groups.flatMap((g) => g.styles);
