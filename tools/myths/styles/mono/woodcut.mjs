// The woodcut in black and white: the same cutting, printed as pure white on a block that fills the picture.
import { svg as cut } from '../woodcut.mjs';

export const name = 'woodcut';
export const title = 'Woodcut';
export const about = 'Cut from a block: rough-edged, the shade left standing in black lines, rays cut into the black behind.';

export const svg = (fig) => cut(fig, { ink: '#000', paper: '#fff', margin: 0, grain: false });
