# Plain text of a saved English Wikipedia page: the article's headings, paragraphs and list items, then its
# numbered references. Usage: python3 -I wikitext.py <page.html>
import sys
from html.parser import HTMLParser

VOID = {"br", "img", "meta", "link", "input", "hr", "wbr", "source", "area", "col", "base", "track", "embed", "param"}
SKIP_CLASSES = ("mw-editsection", "navbox", "mw-cite-backlink", "infobox", "sidebar", "hatnote", "metadata", "noprint", "mw-jump-link", "printfooter", "catlinks")

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.skip_at, self.on, self.done = [], None, False, False
        self.out, self.buf = [], []
        self.ref_at, self.refs, self.ref = None, [], None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls, ident = a.get("class") or "", a.get("id") or ""
        if ident == "mw-content-text": self.on = True
        if ident in ("catlinks", "footer"): self.done = True
        if tag in VOID: return
        self.stack.append(tag)
        d = len(self.stack)
        if self.skip_at is None and (tag in ("style", "script") or (tag == "sup" and "reference" in cls) or any(c in cls.split() for c in SKIP_CLASSES)):
            self.skip_at = d
        if tag == "ol" and "references" in cls: self.ref_at = d
        if self.ref_at and tag == "li" and d == self.ref_at + 1: self.ref = []
    def handle_endtag(self, tag):
        if tag in VOID or not self.stack: return
        d = len(self.stack)
        if self.ref_at and tag == "li" and d == self.ref_at + 1 and self.ref is not None:
            self.refs.append(" ".join("".join(self.ref).split())); self.ref = None
        if self.ref_at and d == self.ref_at and tag == "ol": self.ref_at = None
        if tag in ("p", "li", "h2", "h3", "h4", "dd") and self.ref_at is None and self.on and not self.done:
            t = " ".join("".join(self.buf).split())
            if t: self.out.append(("\n## " + t) if tag.startswith("h") else t)
            self.buf = []
        if self.skip_at is not None and d == self.skip_at: self.skip_at = None
        while self.stack:
            if self.stack.pop() == tag: break
    def handle_data(self, data):
        if self.skip_at is not None or not self.on or self.done: return
        if self.ref is not None: self.ref.append(data)
        elif self.ref_at is None: self.buf.append(data)

p = P()
p.feed(open(sys.argv[1], encoding="utf8", errors="replace").read())
print("\n".join(p.out))
print("\n## References")
for i, r in enumerate(p.refs, 1):
    print(f"[{i}] {r}")
