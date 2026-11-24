# build-kit.py — the writers' data: one line per page still to write (pages.jsonl: titles, slug, weight, glyph, the
# pages above and beside, and the computed facts for that page from plan/*.json), and the batches (batches.json).
# Usage: python3 plan/kit/build-kit.py  (from the repository root)
import json, os, re
R = "plan/"; K = "plan/kit/"
plan = json.load(open(R + "pages.json"))
F = lambda n: json.load(open(R + n))
SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
SG = dict(zip(SIGNS, "♈♉♊♋♌♍♎♏♐♑♒♓"))
BG = {"sun": "☉", "moon": "☽", "mercury": "☿", "venus": "♀", "mars": "♂", "jupiter": "♃", "saturn": "♄", "uranus": "♅", "neptune": "♆", "pluto": "♇", "chiron": "⚷", "black-moon-lilith": "⚸", "lilith": "⚸", "north-node": "☊", "ascendant": "AC", "midheaven": "MC"}
AG = {"conjunct": "☌", "sextile": "⚹", "square": "□", "trine": "△", "opposite": "☍"}
TYPE = {1: "angular", 4: "angular", 7: "angular", 10: "angular", 2: "succedent", 5: "succedent", 8: "succedent", 11: "succedent", 3: "cadent", 6: "cadent", 9: "cadent", 12: "cadent"}
HELD = {"are-horoscopes-written-by-ai", "giving-a-reading-as-a-gift", "how-my-readings-are-made", "ai-readings-versus-human-readings"}
done = lambda i: os.path.exists(f"content/en/astrology/{i}.md") and os.path.exists(f"content/fr/astrology/{i}.md")
fam = {}
for p in plan["pages"]: fam.setdefault(p["family"], []).append(p["id"])
kindpos = {}
for p in plan["pages"]: kindpos.setdefault(p["kind"], []).append(p["id"])
def line(p, facts=None, glyph=None, weight=None):
    o = {"id": p["id"], "kind": p["kind"], "tier": p["tier"], "family": p["family"], "en": p["en"], "fr": p["fr"],
         "slugFr": p["pathFr"].rstrip("/").split("/")[-1], "weight": weight or fam[p["family"]].index(p["id"]) + 1, "up": p["up"], "across": p["across"]}
    if glyph: o["glyph"] = glyph
    if facts is not None: o["facts"] = facts
    return o
pages = lambda k, tier=None: [p for p in plan["pages"] if p["kind"] == k and (tier is None or p["tier"] == tier)]
lines, batches = [], {}
# synastry aspects
syf = F("synastry-facts.json")["pages"]; ids = {p["id"] for p in plan["pages"]}
pairs = []
for n, p in enumerate(pages("synastry-aspect"), 1):
    a, w, b = re.match(r"^(.+)-(conjunct|sextile|square|trine|opposite)-(.+)-synastry$", p["id"]).groups()
    natal = f"{a}-{w}-{b}"
    o = line(p, syf[p["id"]], f"{BG[a]}{AG[w]}{BG[b]}", n); o["natalPage"] = natal if natal in ids else None
    if natal not in ids: o["onlyBetweenTwo"] = True
    lines.append(o)
    if not pairs or pairs[-1][0] != (a, b): pairs.append(((a, b), []))
    pairs[-1][1].append(p["id"])
batches["syn"] = [[i for _, l in pairs[k:k + 5] for i in l] for k in range(0, len(pairs), 5)]
# Sun and Moon, overlays, transits through a house, retrogrades, eclipses, progressed Moon
sm = F("sun-moon-facts.json")["pages"]
for n, p in enumerate(pages("sun-moon"), 1):
    s, m = re.match(r"sun-in-(.+)-moon-in-(.+)$", p["id"]).groups()
    lines.append(line(p, sm[p["id"]], f"☉{SG[s]}☽{SG[m]}", n))
x = kindpos["sun-moon"]; batches["sunmoon"] = [x[i:i + 24] for i in range(0, len(x), 24)]
for n, p in enumerate(pages("overlay"), 1):
    body, h = re.match(r"(.+)-in-(\d+)(?:st|nd|rd|th)-house-synastry$", p["id"]).groups(); h = int(h)
    lines.append(line(p, {"house": h, "type": TYPE[h], "naturalSign": SIGNS[h - 1]}, BG[body], n))
x = kindpos["overlay"]; batches["overlay"] = [x[i:i + 24] for i in range(0, len(x), 24)]
hs = F("house-stay-facts.json")["places"]; sf = F("sign-facts.json")["pages"]
for n, p in enumerate(pages("transit-house"), 1):
    body, h = re.match(r"(.+)-transit-(\d+)(?:st|nd|rd|th)-house$", p["id"]).groups(); h = int(h)
    sky = sorted([a, b, s] for s in SIGNS for a, b in (sf.get(f"{body}-in-{s}", {}).get("periods") or []) if b >= "2026-01")
    stay = {pl: {"all": hs[pl]["bodies"][body]["years"], "thisHouse": hs[pl]["bodies"][body]["byHouse"][h - 1]} for pl in ("london", "newYork")}
    lines.append(line(p, {"house": h, "type": TYPE[h], "stayYears": stay, "inTheSkyFrom2026": sky}, BG[body], n))
x = kindpos["transit-house"]; batches["transit"] = [x[i:i + 24] for i in range(0, len(x), 24)]
rt = F("retrograde-facts.json")["pages"]; ec = F("eclipse-facts.json")["pages"]; pm = F("progressed-moon-facts.json")["pages"]
for n, p in enumerate(pages("retrograde-sign"), 1):
    body, s = re.match(r"(mercury|venus|mars)-retrograde-in-(.+)$", p["id"]).groups()
    lines.append(line(p, {"retrogrades2000to2040": rt[p["id"]]}, f"{BG[body]}℞{SG[s]}", n))
for n, p in enumerate(pages("eclipse-sign"), 1):
    lines.append(line(p, {"eclipses2000to2040": ec[p["id"]]}, f"●{SG[p['id'].split('-in-')[1]]}", n))
for n, p in enumerate(pages("progressed-moon"), 1):
    lines.append(line(p, pm[p["id"]], f"☽{SG[p['id'].split('-in-')[1]]}", n))
r = kindpos["retrograde-sign"]
batches["cycles"] = [r[0:12] + kindpos["progressed-moon"], r[12:24] + kindpos["eclipse-sign"], r[24:36]]
# tier-2 concepts, techniques, ethics, patterns, research, asteroids
cf = F("concept-facts.json"); pf = F("pattern-facts.json")["patterns"]
st = cf["stations"]["bodies"]; lt = cf["lifeTransits"]; ls = cf["lifeTransitsSummary"]
CF = {
  "jupiter-retrograde": {"stations": st["jupiter"]}, "saturn-retrograde": {"stations": st["saturn"]}, "uranus-retrograde": {"stations": st["uranus"]},
  "neptune-retrograde": {"stations": st["neptune"]}, "pluto-retrograde": {"stations": st["pluto"]},
  "planetary-ingresses": {"ingresses2026to2030": cf["ingresses"]["list"], "about": cf["ingresses"]["about"]},
  "jupiter-saturn-great-conjunctions": {"conjunctions1800to2100": cf["conjunctions"]["jupiterSaturn"]},
  "saturn-neptune-conjunction-of-2026": {"conjunctions1800to2100": cf["conjunctions"]["saturnNeptune"]},
  "pluto-in-aquarius-2024-2044": {"crossings": cf["longIngresses"]["plutoInAquarius"]},
  "neptune-in-aries-2026-2039": {"crossings": cf["longIngresses"]["neptuneInAries"]},
  "uranus-in-gemini-2026-2033": {"crossings": cf["longIngresses"]["uranusInGemini"]},
  "saturn-squares-and-opposition": {k: ls["summary"][k] for k in ("saturnSquareWaxing", "saturnOpposition", "saturnSquareWaning", "saturnReturn")},
  "uranus-opposition": {**{k: ls["summary"][k] for k in ("uranusSquare", "uranusOpposition")}, "byYear": {y: v["uranusOpposition"] for y, v in ls["byYear"].items()}},
  "neptune-square": {"neptuneSquare": ls["summary"]["neptuneSquare"], "byYear": {y: v["neptuneSquare"] for y, v in ls["byYear"].items()}},
  "pluto-square": {"plutoSquare": ls["summary"]["plutoSquare"], "byYear": {y: v["plutoSquare"] for y, v in ls["byYear"].items()}},
  "jupiter-return": {"jupiterReturns": ls["summary"]["jupiterReturns"], "example1965": lt["births"]["1965-07-01"]["jupiterReturns"]},
  "nodal-return": {"nodalReturns": ls["summary"]["nodalReturns"], "example1965": lt["births"]["1965-07-01"]["nodalReturns"]},
  "nodal-reversal": {"nodalReversals": ls["summary"]["nodalReversals"], "example1965": lt["births"]["1965-07-01"]["nodalReversals"]},
  "moon-out-of-bounds": {"moon": cf["outOfBounds"]["moon"], "about": cf["outOfBounds"]["about"]},
  "out-of-bounds-planets": {**{k: cf["outOfBounds"][k] for k in ("mercury", "venus", "mars")}, "about": cf["outOfBounds"]["about"]},
  "generational-placements-by-birth-year": {"file": "plan/concept-facts.json → generations (signs of Uranus, Neptune, Pluto and Chiron on 1 January and 1 July of each year 1930–2009)"},
  "eclipses-on-your-natal-planets": {"file": "plan/sky-facts.json → eclipses 2026–2030; plan/eclipse-facts.json for 2000–2040 by sign"},
}
PK = {"stellium": ["stellium3", "stellium4", "stellium5"], "grand-trine": ["grandTrine"], "grand-cross": ["grandCross"], "t-square": ["tSquare"], "yod-finger-of-god": ["yod"],
      "boomerang-yod": ["boomerangYod"], "kite": ["kite"], "mystic-rectangle": ["mysticRectangle"], "grand-sextile": ["grandSextile"], "thors-hammer": ["thorsHammer"], "cradle": ["cradle"],
      "minor-grand-trine": ["minorGrandTrine"], "bowl-chart": ["bowl"], "bucket-chart": ["bucket"], "bundle-chart": ["bundle"], "locomotive-chart": ["locomotive"]}
for p in pages("concept", 2): lines.append(line(p, CF.get(p["id"])))
for p in pages("technique", 2) + pages("ethics", 2): lines.append(line(p))
for p in pages("pattern", 2):
    f = {k: pf[k] for k in PK.get(p["id"], [])}
    lines.append(line(p, {"counts": f, "orbsAndDefinitions": "plan/pattern-facts.json → about"} if f else {"counts": None, "note": "no count: the definition varies too much between authors"}))
for p in pages("history", 2) + pages("guide", 2) + pages("tested", 2): lines.append(line(p, None, "✦"))
c2 = [p["id"] for p in pages("concept", 2)]
batches["t2concepts"] = [c2[0:21], c2[21:42], c2[42:62], c2[62:82], c2[82:]]
batches["t2tech"] = [[p["id"] for p in pages("technique", 2) + pages("ethics", 2)]]
batches["t2patterns"] = [[p["id"] for p in pages("pattern", 2)]]
h = [p["id"] for p in pages("history", 2)]
batches["t2research"] = [h[0:7], h[7:13], h[13:] + [p["id"] for p in pages("guide", 2) + pages("tested", 2)]]
AST = {"ceres": "⚳", "pallas": "⚴", "juno": "⚵", "vesta": "⚶"}
for p in pages("pillar", 2): lines.append(line(p, None, AST.get(p["id"], "✦")))
batches["t2asteroids"] = [[p["id"] for p in pages("pillar", 2)]]
# tier 1: countries (waiting on the network)
for p in pages("country", 1): lines.append(line(p, None, "✦"))
batches["countries"] = [[p["id"] for p in pages("country", 1)]]
# tier 3
comp = F("composite-facts.json")
for p in pages("composite", 3):
    body, where = re.match(r"composite-(.+)-in-(.+)$", p["id"]).groups()
    if where in SIGNS:
        f = {"composite": comp["pages"][p["id"]]}
        natal = sf.get(f"{body}-in-{where}")
        if natal and natal.get("periods") is not None: f["sameAgePairsBornIn"] = natal["periods"]
        if body in ("mercury", "venus"): f["oddities"] = comp["oddities"]
        lines.append(line(p, f, BG[body] + SG[where]))
    else:
        f = {"house": int(re.match(r"(\d+)", where)[1])}
        if body in ("mercury", "venus"): f["oddities"] = comp["oddities"]
        lines.append(line(p, f, BG[body]))
x = kindpos["composite"]; batches["composite"] = [x[i:i + 24] for i in range(0, len(x), 24)]
for p in pages("ruler-house", 3): lines.append(line(p, None, "✦"))
x = kindpos["ruler-house"]; batches["rulerhouse"] = [x[i:i + 24] for i in range(0, len(x), 24)]
cu = F("cusp-facts.json")["places"]
for p in pages("sign-cusp", 3):
    s, hh = re.match(r"(.+)-on-(\d+)(?:st|nd|rd|th)-house-cusp$", p["id"]).groups()
    key = {"1": "1st", "2": "2nd", "3": "3rd"}.get(hh, f"{hh}th")
    lines.append(line(p, {pl: {"oneIn": cu[pl]["onCusp"][s][key], "interceptedOneIn": cu[pl]["intercepted"][s]} for pl in ("london", "newYork")}, SG[s]))
x = kindpos["sign-cusp"]; batches["signcusp"] = [x[i:i + 22] for i in range(0, len(x), 22)]
de = F("decan-facts.json")["pages"]
for p in pages("decan", 3): lines.append(line(p, de[p["id"]], SG[p["id"].split("-")[0]]))
x = kindpos["decan"]; batches["decan"] = [x[:18], x[18:]]
stf = F("star-facts.json")
def starfacts(i):
    if i == "orions-belt": return {k.split(":")[1]: v for k, v in stf["stars"].items() if k.startswith("orions-belt:")}
    return stf["stars"].get(i) or {"note": "a star cluster: not in the Yale Bright Star Catalogue; give its position only from a checked source"}
s23 = pages("star", 2) + pages("star", 3)
for p in s23: lines.append(line(p, starfacts(p["id"]), "★"))
for p in pages("star-contact", 3):
    body, star = p["id"].split("-conjunct-")
    lines.append(line(p, {"contact": stf["contacts"].get(p["id"]), "star": stf["stars"].get(star)}, BG[body] + "☌★"))
s3 = [p["id"] for p in s23]; batches["stars"] = [s3[0:14], s3[14:28], s3[28:42], s3[42:]]
batches["starcontact"] = [kindpos["star-contact"]]
tf = F("transit-facts.json")
for p in pages("transit-natal"):
    m = re.match(r"transiting-(.+)-(conjunct|sextile|square|trine|opposite)-natal-(.+)$", p["id"])
    lines.append(line(p, {"onePass": tf["series"][m[1]], "page": tf["pages"][p["id"]]}, BG[m[1]] + AG[m[2]] + BG[m[3]]))
x = kindpos["transit-natal"]; batches["transitnatal"] = [x[i:i + 24] for i in range(0, len(x), 24)]
for k in ("person", "text", "technique", "concept", "pattern", "guide", "tested"):
    for p in pages(k, 3): lines.append(line(p, None, "✦"))
pe = [p["id"] for p in pages("person", 3)]; tx = [p["id"] for p in pages("text", 3)]
te = [p["id"] for p in pages("technique", 3)]; co = [p["id"] for p in pages("concept", 3)]
batches["t3people"] = [pe[0:8], pe[8:16], pe[16:23], pe[23:] + tx[:3], tx[3:]]
batches["t3tech"] = [te[0:9], te[9:]]
batches["t3concepts"] = [co[i:i + 18] for i in range(0, len(co), 18)]
batches["t3other"] = [[p["id"] for p in pages("pattern", 3) + pages("guide", 3) + pages("tested", 3)]]
with open(K + "pages.jsonl", "w", encoding="utf8") as f:
    for o in lines: f.write(json.dumps(o, ensure_ascii=False) + "\n")
# what is left in each batch: the pages not yet written in both languages
left = {k: [[i for i in b if not done(i)] for b in v] for k, v in batches.items()}
json.dump({"batches": batches, "left": left}, open(K + "batches.json", "w"), ensure_ascii=False, indent=1)
print(len(lines), "lines;", sum(len(b) for v in left.values() for b in v), "pages left;", {k: [len(b) for b in v] for k, v in left.items()})
