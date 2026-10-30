"""Small copies of the feed's pictures, for a page that shows hundreds of them at once: from each
media/<set>/feed/<design>/<slug>--white-on-black.png it writes <out>/<set>/<design>/<slug>.webp, 512 px. Only the
white-on-black pictures are copied: the page shows the black-on-white ones by inverting them, the way feed.mjs made
them, which halves the files a page has to carry.

    python3 -I tools/myths/styles/thumbs.py <out> media/<set>/feed/<design>/<slug>--white-on-black.png ...
"""

import sys
from pathlib import Path

from PIL import Image

SIZE = 512  # three across a 760 px column, at twice the screen's pixels

out = Path(sys.argv[1])
for arg in sys.argv[2:]:
    src = Path(arg)
    # media/<set>/feed/<design>/<file>
    dest = out / src.parents[2].name / src.parent.name / src.name.replace('--white-on-black.png', '.webp')
    dest.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src).convert('L').resize((SIZE, SIZE), Image.LANCZOS).save(dest, 'WEBP', quality=82, method=6)
