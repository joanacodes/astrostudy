"""Draws the symbols of the twelve signs, the twelve celestial bodies and the five aspects for the picture kit in
tools/myths/styles/, from the site's own symbol font (static/fonts/noto-sans-symbols-astro.woff2, a cut of Noto Sans
Symbols under the OFL), so the pictures show exactly the symbols the site's headings show. Writes
tools/symbols/symbols.json: for each symbol, in the order of a chart, its name, glyph, description and family from its
encyclopaedia entry (content/en/astrology/<slug>.md) and its outline on the 1000 x 1000 canvas the figures are drawn on.

Every symbol is fitted to the same size and brought to the same stroke weight. The font's regular weight is too light
for designs that fill the strokes with dots, stones or stars, so each outline is drawn heavier by a stroke of its own
colour round it (`grow`), by as much as it takes to reach WEIGHT; fitting the symbols to one size scales their strokes
differently, and this evens them out again.

    python3 -I tools/symbols/outlines.py
"""

import json
import math
from pathlib import Path

import yaml
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
CELESTIALS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron',
              'black-moon-lilith']
SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn',
         'aquarius', 'pisces']
# the aspects in the order of their angles, from 0 to 180 degrees
ASPECTS = ['conjunction', 'semi-sextile', 'semi-square', 'sextile', 'quintile', 'square', 'trine', 'sesquiquadrate',
           'biquintile', 'quincunx', 'opposition']
# The minor aspects have pages in the site plan but no encyclopaedia entries yet, so their names and symbols are given
# here; once an entry is written, entry() reads it instead. The quintiles have no symbol in Unicode: astrologers write
# them Q and bQ, set here in the site's own sans.
UNWRITTEN = {
    'semi-sextile': ('Semi-sextile', '⚺', 'a V standing on a line', '30°'),
    'semi-square': ('Semi-square', '∠', 'a sharp angle, open to the right', '45°'),
    'quintile': ('Quintile', 'Q', 'the letter Q', '72°'),
    'sesquiquadrate': ('Sesquiquadrate', '⚼', 'a square over a hooked line', '135°'),
    'biquintile': ('Biquintile', 'bQ', 'the letters b and Q', '144°'),
    'quincunx': ('Quincunx', '⚻', 'an upturned V hanging from a line', '150°'),
}
SIZE = 700    # the longer side of every symbol on the canvas, about the height of a standing myth figure
WEIGHT = 78   # the stroke every symbol is brought to: broad enough for a mosaic's stones or a paper cut's stars
STEP = 3      # curves are drawn as straight runs this long (in font units), too short to see


class Flatten(BasePen):
    """The contours of a glyph as lists of points, its curves cut into short straight runs."""

    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.contours = []
        self.points = None

    def _moveTo(self, p):
        self.points = [p]

    def _lineTo(self, p):
        self.points.append(p)

    def _run(self, length, at):
        n = max(2, math.ceil(length / STEP))
        self.points.extend(at(i / n) for i in range(1, n + 1))

    def _qCurveToOne(self, p1, p2):
        p0 = self.points[-1]
        self._run(math.dist(p0, p1) + math.dist(p1, p2), lambda t: tuple(
            (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c for a, b, c in zip(p0, p1, p2)))

    def _curveToOne(self, p1, p2, p3):
        p0 = self.points[-1]
        self._run(math.dist(p0, p1) + math.dist(p1, p2) + math.dist(p2, p3), lambda t: tuple(
            (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d
            for a, b, c, d in zip(p0, p1, p2, p3)))

    def _closePath(self):
        if len(self.points) > 1 and math.dist(self.points[0], self.points[-1]) < 1e-6:
            self.points.pop()
        self.contours.append(self.points)
        self.points = None

    _endPath = _closePath


def circle(cx, cy, r, clockwise):
    n = 360
    turn = -1 if clockwise else 1
    return [(cx + r * math.cos(turn * 2 * math.pi * i / n), cy + r * math.sin(turn * 2 * math.pi * i / n)) for i in range(n)]


def polygon(n, r, first, clockwise):
    """A regular n-gon round the origin, r to each corner, the first corner at `first` degrees (y upwards)."""
    turn = -1 if clockwise else 1
    return [(r * math.cos(math.radians(first + turn * 360 * i / n)), r * math.sin(math.radians(first + turn * 360 * i / n)))
            for i in range(n)]


def stroke(*points):
    """A stroke WEIGHT wide along the points, square-ended and mitred at its corners, which keeps them sharp, as the
    font's are. Each corner's point lies the half-weight from both edges that meet there."""
    normals = []
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        d = math.dist((x0, y0), (x1, y1))
        normals.append(((y0 - y1) / d, (x1 - x0) / d))  # to the left of the way it runs, y upwards

    def side(k):
        edge = []
        for i, (x, y) in enumerate(points):
            a, b = normals[max(0, i - 1)], normals[min(i, len(normals) - 1)]
            f = k * WEIGHT / 2 / (1 + a[0] * b[0] + a[1] * b[1])
            edge.append((x + (a[0] + b[0]) * f, y + (a[1] + b[1]) * f))
        return edge

    # along its left edge and back along its right: clockwise, like an outline of the font
    return side(1) + side(-1)[::-1]


def bar(length, angle):
    """A straight stroke WEIGHT wide with square ends, through the origin at `angle` degrees."""
    c, s = math.cos(math.radians(angle)), math.sin(math.radians(angle))
    corners = [(-length / 2, -WEIGHT / 2), (-length / 2, WEIGHT / 2), (length / 2, WEIGHT / 2), (length / 2, -WEIGHT / 2)]
    return [(x * c - y * s, x * s + y * c) for x, y in corners]


# The symbols the font lacks (the site shows them in the reader's own fonts), drawn here at the weight of the rest and at
# the canvas's scale. A closed shape looks larger than an open symbol of the same width, so these are drawn smaller than
# SIZE: the ring of the Sun about as wide as the ring and horns of Taurus, the square no wider than the Sun.
TRINE = 358   # from the middle of the triangle to a corner: about as wide as the Sun, a little lower
DRAWN = {
    '☉': lambda: [circle(0, 0, 300, True), circle(0, 0, 300 - WEIGHT, False), circle(0, 0, WEIGHT * 0.82, True)],
    '□': lambda: [polygon(4, 270 * math.sqrt(2), 45, True), polygon(4, (270 - WEIGHT) * math.sqrt(2), 45, False)],
    # the inner triangle is inset by the weight on every side, which takes twice the weight off its corners' distance
    '△': lambda: [polygon(3, TRINE, 90, True), polygon(3, TRINE - 2 * WEIGHT, 90, False)],
    # upright and at sixty degrees either side, square-ended like the font's strokes
    '⚹': lambda: [bar(640, 90), bar(640, 30), bar(640, 150)],
    # a V standing on a line; the quincunx is the same turned over
    '⚺': lambda: [stroke((-210, 280), (0, -250)), stroke((210, 280), (0, -250)), stroke((-270, -250), (270, -250))],
    '⚻': lambda: [stroke((-210, -280), (0, 250)), stroke((210, -280), (0, 250)), stroke((-270, 250), (270, 250))],
    # forty-five degrees, with a sharp corner; an open shape, so as wide as the font's symbols
    '∠': lambda: [stroke((300, -200), (-300, -200), (150, 250))],
    # a square, and a line rising into it from a foot below, as the sesquiquadrate is usually drawn
    '⚼': lambda: [[(-210, -60), (-210, 360), (210, 360), (210, -60)], [(-132, 18), (132, 18), (132, 282), (-132, 282)],
                  stroke((0, 150), (0, -200), (210, -200))],
}
# The quintiles' letters, in the site's own sans (Inter): Q about as large as the ring of the Sun; bQ, two letters side
# by side, wider than the other symbols and lighter, or the bowls of the b and the Q would close up at that size.
LETTERS = TTFont(ROOT / 'static/fonts/inter-normal-latin.woff2')
LETTERED = {'Q': (640, WEIGHT), 'bQ': (760, 64)}


def lettered(text):
    """The contours of the text in Inter, its letters set side by side by their widths."""
    glyph_set, letters = LETTERS.getGlyphSet(), LETTERS.getBestCmap()
    x, contours = 0, []
    for ch in text:
        g = glyph_set[letters[ord(ch)]]
        pen = Flatten(glyph_set)
        g.draw(pen)
        contours += [[(px + x, py) for px, py in c] for c in pen.contours]
        x += g.width
    return contours


def entry(slug):
    """The symbol's name, glyph, description and family (signs, planets, …), and an aspect's angle, as its encyclopaedia
    entry gives them."""
    source = ROOT / 'content/en/astrology' / f'{slug}.md'
    if not source.exists():
        name, glyph, about, angle = UNWRITTEN[slug]
        return {'name': name, 'glyph': glyph, 'about': about, 'family': 'aspects', 'angle': angle}
    text = source.read_text(encoding='utf-8')
    front = yaml.safe_load(text.split('---')[1])
    facts = {f['k']: f['v'] for f in front['facts']}
    found = {'name': front['title'], 'glyph': front['glyph'], 'about': facts['Symbol'].split(' — ', 1)[1], 'family': front['family']}
    return {**found, 'angle': facts['Angle']} if 'Angle' in facts else found


def outline(contours, size, weight=WEIGHT):
    """The contours fitted to `size` and centred on the canvas, as path data; the same with the counters (the holes in
    rings and loops) filled, for a design that sets a halo round the symbol; and the grow that brings their strokes to
    `weight`. The stroke they have is measured as twice their area over their perimeter: a stroke w wide and L long has
    an area of wL and a perimeter of about 2L."""
    xs = [x for c in contours for x, _ in c]
    ys = [y for c in contours for _, y in c]
    scale = size / max(max(xs) - min(xs), max(ys) - min(ys))
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    areas = [sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(c, c[1:] + c[:1])) / 2 for c in contours]
    area = sum(areas)
    perimeter = sum(sum(math.dist(a, b) for a, b in zip(c, c[1:] + c[:1])) for c in contours)
    stroke = 2 * abs(area) / perimeter * scale
    # the font draws y upwards, the canvas downwards
    at = lambda p: f'{500 + (p[0] - cx) * scale:.1f} {500 - (p[1] - cy) * scale:.1f}'
    path = lambda cs: ''.join(f'M{at(c[0])}' + ''.join(f' L{at(p)}' for p in c[1:]) + ' Z' for c in cs)
    # a counter runs the other way round from the outline it sits in, and the largest contour is always an outline
    outer = math.copysign(1, max(areas, key=abs))
    solid = [c for c, a in zip(contours, areas) if math.copysign(1, a) == outer]
    return path(contours), path(solid), round(max(0.0, weight - stroke), 1)


font = TTFont(ROOT / 'static/fonts/noto-sans-symbols-astro.woff2')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
symbols = []
for slug in CELESTIALS + SIGNS + ASPECTS:
    s = {'slug': slug, **entry(slug)}
    code = ord(s['glyph'][0])
    if code in cmap:
        pen = Flatten(glyphs)
        glyphs[cmap[code]].draw(pen)
        s['d'], s['solid'], s['grow'] = outline(pen.contours, SIZE)
    elif s['glyph'] in DRAWN:
        contours = DRAWN[s['glyph']]()
        # already at the canvas's scale and at WEIGHT: centred, not scaled, not grown
        span = max(max(x for c in contours for x, _ in c) - min(x for c in contours for x, _ in c),
                   max(y for c in contours for _, y in c) - min(y for c in contours for _, y in c))
        s['d'], s['solid'], _ = outline(contours, span)
        s['grow'] = 0
    elif s['glyph'] in LETTERED:
        size, weight = LETTERED[s['glyph']]
        s['d'], s['solid'], s['grow'] = outline(lettered(s['glyph']), size, weight)
    else:
        raise SystemExit(f'{slug}: {s["glyph"]} is not in the symbol font')
    symbols.append(s)

out = Path(__file__).with_name('symbols.json')
out.write_text(json.dumps(symbols, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{out.relative_to(ROOT)}: {len(symbols)} symbols')
for s in symbols:
    print(f"  {s['slug']:18} {s['glyph']}  grow {s['grow']:5}  {s['about']}")
