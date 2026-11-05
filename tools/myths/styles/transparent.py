"""Makes transparent versions of the feed's pictures, to lay over a background of one's own: from each
<slug>--white-on-black.png it writes <slug>--white-transparent.png (white ink) and <slug>--black-transparent.png
(black ink), 2000 px, greyscale with an alpha channel.

The ink's coverage is the picture's lightness, so soft edges and faint stars keep their softness. The mosaic is the
exception: its black ground and grey mortar are stones too, not bare paper, so only the light stones (the figure and
the border) are kept, and the mortar between them falls away.

    python3 -I tools/myths/styles/transparent.py media/myths/feed/<design>/<slug>--white-on-black.png ...
"""

import sys
from pathlib import Path

from PIL import Image

for arg in sys.argv[1:]:
    src = Path(arg)
    light = Image.open(src).convert('L')
    if src.parent.name == 'mosaic':
        # the black ground stones stay under 50 and the mortar at 74; the white stones, shaded at their edges, from 190
        alpha = light.point(lambda v: max(0, min(255, round((v - 90) * 255 / 110))))
    else:
        alpha = light
    base = src.name.removesuffix('--white-on-black.png')
    for ink, value in (('white', 255), ('black', 0)):
        picture = Image.merge('LA', (Image.new('L', light.size, value), alpha))
        picture.save(src.with_name(f'{base}--{ink}-transparent.png'), optimize=True)
