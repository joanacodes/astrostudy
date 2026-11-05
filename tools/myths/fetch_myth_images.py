"""Collect the ancient images behind the astrology myths, each in three versions, named after its myth.

For every myth in targets.json it finds a picture that may be reused (public domain, CC0, or a Creative
Commons licence that allows commercial use, never NC or ND), downloads it, and writes into media/myths/:

    <slug>.jpg                    the picture, at most 2,400 px on its long side
    <slug>--black-and-white.jpg   in greys, with its contrast stretched
    <slug>--white-and-black.jpg   the same, inverted: white figure on black
    credits.json, CREDITS.md      what each picture shows, where it is, who took it, its licence

A statue or a relief is ancient and free, but a photograph of it can belong to its photographer: the
licence recorded is the photograph's, and CC BY or BY-SA pictures must be credited wherever they are used.

    python3 tools/myths/fetch_myth_images.py --list            the candidates for each myth, nothing saved
    python3 tools/myths/fetch_myth_images.py --fetch [slug…]   download and process (all myths, or those)

Sources: the Metropolitan Museum's Open Access API (public-domain objects) and Wikimedia Commons.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from html import unescape
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
TARGETS = Path(__file__).with_name('targets.json')
OUT = ROOT / 'media' / 'myths'
UA = 'TheAstroStudy-image-collector/1.0 (https://astrostudy.co.uk; ancient art for an astrology encyclopaedia)'
LONG_EDGE = 2400
MIN_WIDTH = 1000

COMMONS = 'https://commons.wikimedia.org/w/api.php'
MET = 'https://collectionapi.metmuseum.org/public/collection/v1'


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    time.sleep(0.4)  # both services ask callers to go gently
    return data if binary else json.loads(data)


def text(html):
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', html or ''))).strip()


# A licence is kept when it allows reuse on a commercial site: public domain, CC0, CC BY, CC BY-SA.
def reusable(licence):
    l = licence.lower()
    if 'nc' in re.findall(r'[a-z]+', l) or '-nc' in l or 'nd' in re.findall(r'[a-z]+', l) or '-nd' in l:
        return False
    return bool(re.search(r'public domain|^pd\b|pd-|cc0|cc[ -]by', l))


def commons_info(titles=None, search=None, limit=8):
    params = {'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata',
              'iiurlwidth': str(LONG_EDGE)}
    if titles:
        params['titles'] = '|'.join('File:' + t.removeprefix('File:') for t in titles)
    else:
        params.update({'generator': 'search', 'gsrsearch': search, 'gsrnamespace': '6', 'gsrlimit': str(limit)})
    data = get(COMMONS + '?' + urllib.parse.urlencode(params))
    pages = sorted((data.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    out = []
    for p in pages:
        info = (p.get('imageinfo') or [{}])[0]
        meta = info.get('extmetadata') or {}
        m = lambda k: text((meta.get(k) or {}).get('value'))
        if not info.get('url') or not str(info.get('mime', '')).startswith('image/'):
            continue
        out.append({
            'source': 'Wikimedia Commons', 'title': p['title'].removeprefix('File:'),
            'page': info.get('descriptionurl'), 'image': info.get('thumburl') or info['url'],
            'width': info.get('width', 0), 'height': info.get('height', 0),
            'licence': m('LicenseShortName') or m('UsageTerms'), 'licenceUrl': m('LicenseUrl'),
            'author': m('Artist'), 'credit': m('Credit'), 'description': m('ImageDescription')[:300],
            'object': m('ObjectName'),
        })
    return out


def met_object(oid):
    o = get(f'{MET}/objects/{oid}')
    if not o.get('primaryImage'):
        return None
    return {
        'source': 'The Metropolitan Museum of Art', 'title': o.get('title'), 'page': o.get('objectURL'),
        'image': o.get('primaryImage'), 'width': None, 'height': None,
        'licence': 'Public domain (The Met Open Access, CC0)' if o.get('isPublicDomain') else 'Not public domain',
        'licenceUrl': 'https://creativecommons.org/publicdomain/zero/1.0/' if o.get('isPublicDomain') else '',
        'author': 'The Metropolitan Museum of Art', 'credit': o.get('creditLine'),
        'description': ', '.join(x for x in [o.get('objectDate'), o.get('culture'), o.get('period'), o.get('medium')] if x),
        'object': f"{o.get('title')} — The Met, {o.get('accessionNumber')}", 'publicDomain': bool(o.get('isPublicDomain')),
    }


def met_search(q, limit=6):
    data = get(f'{MET}/search?' + urllib.parse.urlencode({'q': q, 'hasImages': 'true'}))
    found = []
    for oid in (data.get('objectIDs') or [])[:40]:
        try:
            o = met_object(oid)
        except Exception:
            continue
        if o and o['publicDomain']:
            found.append(o)
        if len(found) >= limit:
            break
    return found


def candidates(t):
    """Every candidate for a myth, in the order the target lists its sources."""
    out = []
    for key in t:
        try:
            if key == 'file':
                out += commons_info(titles=[t['file']])
            elif key == 'met':
                o = met_object(t['met'])
                out += [o] if o else []
            elif key == 'metSearch':
                out += met_search(t['metSearch'])
            elif key == 'commons':
                out += commons_info(search=t['commons'])
        except Exception as e:  # a source that fails leaves the others to try
            print(f'  ! {key}: {e}', file=sys.stderr)
    return out


def acceptable(c):
    if c['source'].startswith('The Met'):
        return c.get('publicDomain')
    return reusable(c['licence']) and (c['width'] or 0) >= MIN_WIDTH


def save_versions(slug, data):
    img = Image.open(BytesIO(data))
    img = ImageOps.exif_transpose(img).convert('RGB')
    img.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
    opts = {'quality': 90, 'optimize': True, 'progressive': True}
    img.save(OUT / f'{slug}.jpg', **opts)
    grey = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=0.5)
    grey.save(OUT / f'{slug}--black-and-white.jpg', **opts)
    ImageOps.invert(grey).save(OUT / f'{slug}--white-and-black.jpg', **opts)
    return img.size


def main():
    args = sys.argv[1:]
    targets = json.loads(TARGETS.read_text())['myths']
    wanted = [a for a in args if not a.startswith('--')]
    if wanted:
        targets = [t for t in targets if t['slug'] in wanted]
    if '--list' in args:
        for t in targets:
            print(f"\n## {t['slug']} — {t['myth']}")
            for c in candidates(t):
                ok = 'OK ' if acceptable(c) else 'no '
                print(f"  {ok}{c['source'][:9]:9} {str(c['width'] or ''):>5} {c['licence'][:32]:32} {c['title'][:70]}  {c['page']}")
        return
    if '--fetch' not in args:
        print(__doc__)
        return
    OUT.mkdir(parents=True, exist_ok=True)
    credits_path = OUT / 'credits.json'
    credits = json.loads(credits_path.read_text()) if credits_path.exists() else {}
    for t in targets:
        pick = next((c for c in candidates(t) if acceptable(c)), None)
        if not pick:
            print(f"✗ {t['slug']}: no freely reusable picture found — pin a file or another search in targets.json")
            continue
        size = save_versions(t['slug'], get(pick['image'], binary=True))
        credits[t['slug']] = {**{k: t[k] for k in ('myth', 'figure', 'astrology')}, **pick,
                              'files': [f"{t['slug']}.jpg", f"{t['slug']}--black-and-white.jpg", f"{t['slug']}--white-and-black.jpg"],
                              'size': list(size)}
        print(f"✓ {t['slug']}: {pick['title'][:60]} ({pick['licence']})")
    credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=1))
    lines = ['# Myth images: sources and licences', '',
             'Every picture here may be reused on the site. Public domain and CC0 need no credit (giving one is still good',
             'practice); CC BY and CC BY-SA pictures must be credited, with the licence, wherever they are used.', '']
    for slug, c in credits.items():
        lines += [f"## {c['myth']}", '', f"- Files: {', '.join('`' + f + '`' for f in c['files'])}",
                  f"- Astrology: {c['astrology']} · figure: {c['figure']}",
                  f"- Shows: {c.get('object') or c['title']}{' — ' + c['description'] if c.get('description') else ''}",
                  f"- Source: [{c['source']}]({c['page']})", f"- Licence: {c['licence']}{' (' + c['licenceUrl'] + ')' if c.get('licenceUrl') else ''}",
                  f"- Credit: {c.get('author') or '—'}{' · ' + c['credit'] if c.get('credit') else ''}", '']
    (OUT / 'CREDITS.md').write_text('\n'.join(lines))


if __name__ == '__main__':
    main()
