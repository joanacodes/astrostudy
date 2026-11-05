"""Rewrites PNGs in place as optimised greyscale: the feed's pictures are black and white, and one grey channel holds
them in about a third of the space of the RGBA a browser writes.

    python3 -I tools/myths/styles/grey.py <png>...
"""

import sys

from PIL import Image

for path in sys.argv[1:]:
    Image.open(path).convert('L').save(path, optimize=True)
