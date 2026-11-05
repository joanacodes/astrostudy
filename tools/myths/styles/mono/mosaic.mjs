// The Ostia mosaic turned over: the figure in white marble tesserae on a ground of black limestone, the rows still
// following the figure inside it and round it, dark mortar between the stones.
import { args as laid, paint as lay } from '../mosaic.mjs';

export const name = 'mosaic';
export const title = 'Mosaic';
export const about = 'White marble tesserae on black limestone, the rows following the figure inside it and round it.';

export function args(fig) {
  return laid(fig, {
    s: 0.88,
    type: 'image/png',
    stones: {
      figure: { main: [240, 238, 232], odd: [220, 216, 208], share: 0.18 },
      ground: { main: [24, 23, 22], odd: [44, 42, 40], share: 0.15 },
      mortar: [74, 72, 68],
    },
  });
}

export const paint = lay;
