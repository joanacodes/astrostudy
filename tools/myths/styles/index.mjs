// The drawing styles, in the groups the comparison page shows them in; render.mjs draws them in this order.
export const GROUPS = [
  { title: 'Ancient art', styles: ['black-figure', 'red-figure', 'mosaic', 'coin'] },
  { title: 'Carved and engraved', styles: ['cameo', 'woodcut', 'star-atlas', 'stipple'] },
  { title: 'Printed, cut and drawn', styles: ['risograph', 'paper-cut', 'stained-glass', 'line-art'] },
];

export const STYLES = GROUPS.flatMap((g) => g.styles);
