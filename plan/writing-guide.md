# Writing an encyclopaedia entry

How every entry of `/astrology/` is written, in English and French, so that 3,604 pages read as one site: one voice, one shape per kind of page, every page linked where the page plan puts it. The rules of each kind come from the "Site map and links" tab of the growth plan; the addresses and titles from `plan/pages.json`.

## Before writing

```
node tools/plan/links-for.mjs moon
```

prints the entry's two file names and addresses, its headings in both languages, and every page its text must link to, section by section, with each page's English and French title. Write from that list: never an address that looks right.

`node tools/plan/find.mjs moon square` finds any other page of the plan by its title.

## After writing

```
node tools/fr-typography.mjs content/fr/astrology/moon.md
node tools/plan/check-entries.mjs moon
```

The first sets the French spaces (before `: ; ? ! %`, inside `« »`) and apostrophes. The second holds both languages to everything below and must end with **0 errors**; read its warnings too (description length, length of the text, a percentage that isn't one of the notebook's).

## The files

- English: `content/en/astrology/{id}.md`, no `slug`: the file name is the address.
- French: `content/fr/astrology/{id}.md`, same file name, with `slug` set to the last part of the French address the plan gives (`lune` for `/fr/astrologie/lune/`).
- New entries go up as drafts: `draft: true`. They are published, about ten a week, once Joana has read and approved them in both languages.

## Front matter

One `key: value` per line, strings in double quotes, never across two lines; a double quote inside a string is written `\"`, but French uses `« »` and English uses curly quotes `“ ”` so it should never be needed. The checker refuses any other shape, because Hugo would read it differently.

```yaml
---
title: "Moon"                                  # the plan's title, in the page's language
slug: "lune"                                   # French only
h1: "The Moon in astrology"                    # "{The X} in astrology" · "{La X} en astrologie"
description: "…"                               # 110–160 characters
date: 2026-10-29
reviewed: 2026-10-29
draft: true
terms: ["Moon", "Moon sign"]                   # see Terms; leave out when it's just the title
family: "planets"                              # the plan's family
weight: 2                                      # its place in the family, see the table
glyph: "☽"
definition: "…"                                # 40–60 words
facts:
  - { k: "Symbol", v: "☽ — a crescent" }
related: ["/astrology/sun", "/astrology/cancer", "/blog/unknown-birth-time"]
faq:
  - q: "What is my Moon sign?"
    a: "…"
sources:
  - { title: "NASA — Moon facts", url: "https://science.nasa.gov/moon/facts/", note: "orbit and distance" }
  - { title: "Ptolemy, Tetrabiblos, book I", note: "the classical rulerships and exaltations" }
  - { title: "My testing notes", page: "/blog/i-tested-my-birth-chart", note: "how I counted what held" }
---
```

- **description** — the line under the title in search results: 110 to 160 characters, the entry's name first, what the page covers, and for a pillar the hook that only this site has (*and how often it held in my tests*).
- **definition** — the paragraph shown first, and the one Google and AI assistants quote: 40 to 60 words, answer first. Its first sentence says what the thing *is*; the next say what it means in a chart. No links, no "In this article".
- **facts** — 6 to 9 short pairs, each one checkable. Keys by kind are listed below.
- **related** — 3 to 5 pages: entries (planned ones are fine, they appear once published) and articles. Paths without the trailing slash.
- **faq** — 4 questions people actually type (*What is my Moon sign?*, *What does Aries rising mean?*), each answer 30 to 60 words, complete on its own, **no links** (answers are read as plain text by search engines). They make the Questions section; don't write a Questions heading.
- **sources** — 2 or 3. Outside sources only from the list below; a source with a `page` is a page of this site.

### Families, weights and glyphs of the first batch

| family | entries in order (weight) |
|---|---|
| planets | sun ☉ 1 · moon ☽ 2 · mercury ☿ 3 · venus ♀ 4 · mars ♂ 5 · jupiter ♃ 6 · (saturn 7) · uranus ♅ 8 · neptune ♆ 9 · pluto ♇ 10 |
| angles | ascendant "AC" 1 · descendant "DC" 2 · midheaven "MC" 3 · imum-coeli "IC" 4 · horizon-axis "AC/DC" 5 · meridian-axis "MC/IC" 6 · north-node ☊ 7 · south-node ☋ 8 · nodal-axis "☊/☋" 9 |
| points | (black-moon-lilith 12) · which-lilith-is-mine ⚸ 13 · part-of-fortune ⊗ 14 |
| signs | aries ♈ 1 · taurus ♉ 2 · gemini ♊ 3 · cancer ♋ 4 · leo ♌ 5 · virgo ♍ 6 · libra ♎ 7 · scorpio ♏ 8 · sagittarius ♐ 9 · capricorn ♑ 10 · aquarius ♒ 11 · pisces ♓ 12 |
| houses | 1st-house "I" 1 … 12th-house "XII" 12 |
| aspects | conjunction ☌ 1 · sextile ⚹ 2 · square □ 3 · trine △ 4 · opposition ☍ 5 |

### Terms

`terms` lists the names under which an article mentions the entry, matched as whole words with the capitals as written; the entry then appears under that article by itself. Leave it out when the title is enough (Mercury, Aries). Otherwise:

| entry | English | French |
|---|---|---|
| moon | "Moon", "Moon sign" | "Lune", "signe lunaire" |
| ascendant | "Ascendant", "rising sign" | "ascendant", "Ascendant" |
| descendant | "Descendant" | "descendant", "Descendant" |
| midheaven | "Midheaven", "MC" | "Milieu du Ciel", "milieu du ciel", "MC" |
| imum-coeli | "Imum Coeli", "IC" | "Fond du Ciel", "fond du ciel", "FC" |
| north-node | "North Node" | "Nœud Nord", "nœud Nord" |
| south-node | "South Node" | "Nœud Sud", "nœud Sud" |
| nodal-axis | "nodal axis", "lunar nodes" | "axe des nœuds", "nœuds lunaires" |
| horizon-axis | "horizon axis" | "axe de l’horizon" |
| meridian-axis | "meridian axis" | "axe du méridien" |
| part-of-fortune | "Part of Fortune", "Lot of Fortune" | "Part de Fortune", "part de Fortune" |
| houses | "1st house", "first house" | "maison 1", "maison I" |
| aspects | "conjunction", "conjunct" · "sextile" · "square" · "trine" · "opposition" | "conjonction" · "sextile" · "carré" · "trigone" · "opposition" |

## The text

A short opening paragraph (two or three sentences, no heading) that says plainly what the thing is, then one `##` section per heading of the kind, each with its anchor. English anchors are English, French anchors French (`{#dans-un-theme-natal}`), and they stay the same from one entry of a kind to the next, so the "In this entry" menus line up.

### Pillar: a planet, an angle, a node

| | English | French |
|---|---|---|
| 1 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |
| 2 | `## The Moon through the signs {#through-the-signs}` | `## La Lune dans les signes {#dans-les-signes}` |
| 3 | `## The Moon in the houses {#in-the-houses}` | `## La Lune dans les maisons {#dans-les-maisons}` |
| 4 | `## The Moon in synastry {#in-synastry}` | `## La Lune en synastrie {#en-synastrie}` |
| 5 | `## Transits and the lunar return {#lunar-return}` | `## Transits et révolution lunaire {#revolution-lunaire}` |
| 6 | `## What held in my tests {#what-held}` | `## Ce qui a tenu dans mes tests {#ce-qui-a-tenu}` |
| 7 | `## Common myths {#myths}` | `## Idées reçues {#idees-recues}` |

Section 5 names the cycle that matters for that body: the solar return (Sun), the lunar return (Moon), Mercury, Venus and Mars retrograde (their retrograde pages are planned: `mercury-retrograde`, `venus-retrograde`, `mars-retrograde`), the Jupiter return, the Uranus opposition at about 42, the Neptune square at about 41, the Pluto square (its age depends on the birth year: don't give one), the nodal return every 18.6 years. Its anchor follows suit: `{#mercury-retrograde}` · `{#mercure-retrograde}`. The angles have no return: `## Transits to the Ascendant {#transits}` · `## Les transits sur l’ascendant {#transits}`.

- **In a birth chart** — how to read it (a sentence or two in Joana's voice), three bullets (its sign, its house, its aspects), the pillars it works with (linked), and a paragraph on its aspects linking 3 or 4 aspect pages of the plan (`node tools/plan/find.mjs moon square`).
- **Through the signs** — one sentence on how long it stays in a sign and what that means for who shares it, then 12 bullets, one line each, specific and plain:
  `- **[Moon in Aries](/astrology/moon-in-aries/):** …` · `- **[Lune en Bélier](/astrology/moon-in-aries/) :** …`
- **In the houses** — 12 numbered lines:
  `1. **[1st house](/astrology/moon-in-1st-house/):** …` · `1. **[Maison I](/astrology/moon-in-1st-house/) :** …` (Roman numerals in these French lists)
- **In synastry** — a paragraph: what it does between two people, read in both directions, linking `/synastry/` and one or two synastry pages of the plan (`… in synastry`, `Their Moon in your 7th house`).
- **Transits and the return** — the cycle in plain numbers, what a transit of it feels like, *weather, not a forecast*; link its return or retrograde page, and for the slow planets one or two "transiting the 7th house" pages.
- **What held in my tests** — see *Facts* below: only what the notebook says.
- **Common myths** — 3 or 4: `- **“Myth.”** The correction.` · `- **« Idée reçue. »** La correction.`

The angles take the same sections with their own pages: the Ascendant's signs are the 12 rising signs (`aries-rising`), the Descendant's, Midheaven's and IC's are the signs on the 7th, 10th and 4th house cusps (`aries-on-10th-house-cusp`); their "houses" are the house of their ruler (`1st-house-ruler-in-7th-house`, *where your chart ruler sits*): `## Its ruler in the houses {#in-the-houses}` · `## Son maître dans les maisons {#dans-les-maisons}`. The South Node has no pages of its own: each line names its sign or house and links the North Node page opposite (`- **South Node in Aries**, with the [North Node in Libra](/astrology/north-node-in-libra/): …`).

### Sign

| | English | French |
|---|---|---|
| 1 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |
| 2 | `## Its ruler: Mars {#ruler}` (Scorpio: `Its rulers: Pluto and Mars`) | `## Son maître : Mars {#maitre}` (`Ses maîtres : Pluton et Mars`) |
| 3 | `## Planets in Aries {#planets-in-the-sign}` | `## Les planètes en Bélier {#planetes-dans-le-signe}` |
| 4 | `## Aries on a house cusp {#on-a-house-cusp}` | `## Le Bélier sur une cuspide {#sur-une-cuspide}` |
| 5 | `## Aries in synastry {#in-synastry}` | `## Le Bélier en synastrie {#en-synastrie}` |
| 6 | `## Common myths {#myths}` | `## Idées reçues {#idees-recues}` |

- **In a birth chart** — what the sign colours wherever it falls, then the three placements people ask about: `**[Sun in Aries](/astrology/sun-in-aries/)**`, `**[Moon in Aries](…)**`, `**[Aries rising](/astrology/aries-rising/)**` (French: `Soleil en Bélier`, `Lune en Bélier`, `Ascendant Bélier`), one short paragraph or bullet each.
- **Its ruler** — what rulership means in one sentence; where its ruler sits shows where the sign's energy goes; the planets exalted and weakened in it (linked when they're entries).
- **Planets in the sign** — 10 bullets, Sun to Pluto, the page title as the link text: `- **[Mercury in Aries](/astrology/mercury-in-aries/):** …`. For Uranus, Neptune and Pluto, say it's shared by everyone born over several years and the house makes it personal; **no year ranges**.
- **On a house cusp** — every chart has the sign on some cusp: one sentence on what that means, then 12 numbered lines with short labels; the 1st is the rising sign:
  `1. **[1st house](/astrology/aries-rising/):** Aries rising — …` then `2. **[2nd house](/astrology/aries-on-2nd-house-cusp/):** …` · `1. **[Maison I](/astrology/aries-rising/) :** l’ascendant Bélier — …`
- **In synastry** — what the sign brings between two people, the pull of the opposite sign, link `/synastry/`. Sun-sign compatibility is the least reliable kind: say so, gently.
- **Common myths** — 3 or 4.
- Facts keys: Symbol · Dates (the Sun's, with *about*: *About 21 March – 19 April*) · Element · Modality · Ruler · Exalted here · Weakened here · Opposite sign · Natural house. French: Symbole · Dates (Soleil) · Élément · Mode · Maître · Exaltation · Exil et chute · Signe opposé · Maison naturelle.

### House

| | English | French |
|---|---|---|
| 1 | `## What it covers {#what-it-covers}` | `## Ce qu’elle couvre {#ce-qu-elle-couvre}` |
| 2 | `## Planets in the 1st house {#planets}` | `## Les planètes en maison 1 {#planetes}` |
| 3 | `## The sign on its cusp {#sign-on-the-cusp}` | `## Le signe sur sa cuspide {#signe-sur-la-cuspide}` |
| 4 | `## Its ruler {#ruler}` | `## Son maître {#maitre}` |
| 5 | `## Transits through the 1st house {#transits}` | `## Les transits en maison 1 {#transits}` |

- Titles: `title: "The 1st house"`, `h1: "The 1st house in astrology"` · `title: "Maison 1"`, `h1: "La maison 1 en astrologie"`. In French running text write *la maison 1*; the 12-line lists use Roman numerals.
- **What it covers** — the life it describes in plain words, then: angular, succedent or cadent; its natural sign and planet; for the 1st, 4th, 7th and 10th the angle on its cusp (linked); the houses before and after (linked: a house is read with its neighbours); a birth time is what places the houses ([unknown birth time](/blog/unknown-birth-time/)).
- **Planets in the house** — 10 bullets, Sun to Pluto, the page title as the link text: `- **[Sun in the 1st house](/astrology/sun-in-1st-house/):** …` · `- **[Soleil en maison 1](/astrology/sun-in-1st-house/) :** …`; then a line on an empty house (planned page `empty-houses`).
- **The sign on its cusp** — what the sign on the cusp does to the house, then 12 lines with the page title as the link text (`Aries on the 2nd house cusp` · `Bélier sur la cuspide de la maison 2`); for the 1st house these are the rising signs (`Aries rising` · `Ascendant Bélier`).
- **Its ruler** — the ruler of the sign on the cusp, and why where it sits tells where the house's story plays out (for the 1st: the chart ruler, planned page `chart-ruler`), then 12 numbered lines with short labels: `1. **[In the 1st house](/astrology/7th-house-ruler-in-1st-house/):** …` · `1. **[En maison I](…) :** …`.
- **Transits** — the fast planets cross it every month or year, the slow ones for years: link the 7 "transiting" pages (Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, the North Node) with their titles as link text.
- Facts keys: Type (angular · succedent · cadent) · Its angle (1, 4, 7, 10) · Natural sign · Natural ruler · Opposite house (“The 7th house”) · and where tradition gives one, its old name (“Old name”) or the planet that has its joy there (“Joy of”). French: Type · Son angle · Signe naturel · Maître naturel · Maison opposée (« La maison 7 ») · Nom ancien · Joie de.

### Aspect

| | English | French |
|---|---|---|
| 1 | `## What it means {#what-it-means}` | `## Ce que cela veut dire {#ce-que-cela-veut-dire}` |
| 2 | `## Between which planets {#between-which-planets}` | `## Entre quelles planètes {#entre-quelles-planetes}` |
| 3 | `## The square in synastry {#in-synastry}` | `## Le carré en synastrie {#en-synastrie}` |
| 4 | `## The square in transits {#in-transits}` | `## Le carré en transit {#en-transit}` |

- **What it means** — the angle, the distance in signs, how it feels, how wide astrologers let it be (*a few degrees, more with the Sun and Moon*), where it sits among the other four (all linked).
- **Between which planets** — at least 6 natal aspect pages, one line each: `- **[Moon square Saturn](/astrology/moon-square-saturn/):** …`. Only pairs the plan has: Mercury is never more than 28° from the Sun and Venus never more than 47°, so with the Sun they only make the conjunction.
- **In synastry** — what it does between two charts, 2 or more `… in synastry` pages, and `/synastry/`.
- **In transits** — 2 or more "Transiting Saturn square natal Sun" pages; *weather, not a forecast*.
- Facts keys: Angle · Symbol · Signs apart · Orb · Nature · Ptolemaic (yes/no; the conjunction is a meeting rather than one of Ptolemy's four aspects).

### Minor aspect

The same four sections, headings and anchors as a major aspect (the Aspect table above, *Ce que cela veut dire* in French), shorter: 500 to 800 words, never padded.

- **What it means** — the angle and the share of the circle it is, how tight astrologers keep it (*a degree or two*), and what the AGS library says it does (`semisextile`, `quincunx`, `quintile`… in the library; its definition and what it is not). Link the five major aspects and [Orbs](/astrology/orbs/).
- **Between which planets** — there are no pages for a minor aspect between two planets: say how it is read between fast and slow bodies, in general, and link its neighbours among the minor aspects.
- **In synastry** — what it adds between two charts, if anything; `/synastry/`.
- **In transits** — how briefly it is in orb; *weather, not a forecast*.
- History only as sourced: Johannes Kepler added the quintile (72°), the biquintile (144°) and the sesquiquadrate (135°) to Ptolemy's aspects (*Harmonices Mundi*, Linz, 1619). The aspects that divide the circle by 5, 7, 9 or 11 are the ones [harmonic charts](/astrology/harmonic-charts/) are built on: link it on those pages. No other origin story.
- Facts keys: Angle · Symbol (only a symbol in common use; otherwise leave the key out) · Share of the circle · Orb · Nature.

### Natal aspect (two bodies)

| | English | French |
|---|---|---|
| 1 | `## What it means {#what-it-means}` | `## Ce qu’il veut dire {#ce-qu-il-veut-dire}` |
| 2 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |
| 3 | `## In transits {#in-transits}` | `## En transit {#en-transit}` |

Title: the plan's (*Sun square Moon* · *Soleil carré Lune*); h1: *Sun square Moon in a birth chart* · *Soleil carré Lune dans un thème natal*; `family: "combinations"`; glyph: the two bodies' symbols around the aspect's (*☉□☽*; Chiron ⚷, Lilith ⚸, North Node ☊); no `terms`: articles find the page by its title, and the match is case-sensitive.

- **What it means** — the two functions, as the AGS library defines them, and how this aspect relates them (the library's entry for the aspect: what it does, and what it is never written as: a square is *friction*, never *failure*). Plain words, then what that is like to live with. Link the two bodies and the aspect.
- **In a birth chart** — how it tends to show; that the signs and houses of the two bodies change it, and the orb how strongly; which of the two moves faster, when that matters. **How common it is**, from `plan/aspect-facts.json`: *about 1 person in 11 is born with it (within 8°)*, said once, with the orb. For two slow bodies, **who has it**: the years from the same file (*born between August 1963 and December 1967*), and that it is then a generation's aspect more than a personal one, read through the houses. Link the same pair's other aspects, one line each, and the same aspect in synastry when the plan has it.
- **In transits** — the moment a moving body makes this aspect to the other in a birth chart (*transiting Saturn square natal Moon*), linked where the plan has the page; how long it lasts, from the slower body (the *Time in each sign* list below); *weather, not a forecast*.
- Facts keys: Bodies · Aspect (with its angle) · Nature · How common (the count above) · and for two slow bodies, Born with it (the years). French: Corps · Aspect · Nature · Fréquence · Années de naissance.
- Sources: the AGS library is not cited by name; cite *Ptolemy, Tetrabiblos, book I* for the five aspects, and *The Astro Study's count from the planets' positions, 1930–2009* (French: *Le décompte de The Astro Study d’après la position des planètes, 1930–2009*) for the count, without an address.

**Not junk, page by page.** Each page answers the question in its title on its own, and holds at least one thing a competitor couldn't have written: the count above, and the library's reading of these two functions. Two pages of the same pair, or of the same aspect, never share a sentence: say what this pair does that another pair wouldn't, and what this aspect does to this pair that another aspect wouldn't. No sentence that would fit any pair with the names swapped.

### Synastry aspect (one person's body, the other's)

| | English | French |
|---|---|---|
| 1 | `## What flows {#what-flows}` | `## Ce qui circule {#ce-qui-circule}` |
| 2 | `## Where it rubs {#where-it-rubs}` | `## Là où ça frotte {#la-ou-ca-frotte}` |
| 3 | `## How to meet it {#how-to-meet-it}` | `## Comment le vivre {#comment-le-vivre}` |

Title: the plan's (*Sun square Moon in synastry* · *Soleil carré Lune en synastrie*); h1: *Sun square Moon between two charts* · *Soleil carré Lune entre deux thèmes*; `family: "combinations"`; glyph: the natal aspect's (*☉□☽*); no `terms`.

- **The grammar.** One person's body meets the other's: the two functions of the AGS library, carried by two people, related by the aspect. The page reads it **both ways round**: what it is like to be the one with the Sun, and the one with the Moon. That difference is what makes the page particular: say who tends to feel what, never who is to blame.
- **What flows**: what the contact gives the pair, in plain words, then what that is like to live with. For a hard aspect, what the friction makes possible; for a soft one, what comes easily.
- **Where it rubs**: for a square or an opposition, the friction itself (a square is *friction*, never *failure*; an opposition is a *seesaw*, never *enmity*); for a trine or sextile, what the ease can hide; for a conjunction, where two things this close blur.
- **How to meet it**: what helps, for any adult pair: a couple, friends, family, coworkers (the four synastry readings). One line on consent where it fits, linked: [why I won't read a synastry behind someone's back](/blog/synastry-behind-their-back/).
- **How common**, from `plan/synastry-facts.json`, said once with the orb:
  - When one of the two is the Sun, Moon, Mercury, Venus or Mars: *about 1 pair of people in 7 has it, one way round or the other, within 6.8°*. The orbs are the ones my synastry readings use (the wider of the two bodies: Sun and Moon 8°, Mercury, Venus and Mars 6°, Jupiter and Saturn 5°, Uranus, Neptune and Pluto 4°, Chiron, Lilith and the North Node 3°; the full orb for a conjunction or an opposition, 85% of it for a trine or a square, 60% for a sextile).
  - For the Sun, Mercury and Venus with each other, how far apart the two birthdays usually are, any year (`birthdayGapDays`), because Mercury and Venus stay close to the Sun. When the same aspect can't exist inside one chart (the plan has no natal page for it: Mercury is never more than about 28° from the Sun, Venus about 47°, and the two never more than about 75° apart), say so: this contact only exists between two people.
  - When **neither** is personal (two of Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, Lilith, the North Node): no count, because it depends on the two birth years. Say **who has it**, from `examples`: *someone born in mid-1965 and someone born between October 1960 and August 1965*. Everyone born in the same few years shares these contacts, so in my synastry readings I count only contacts with at least one personal body: the Sun, the Moon, Mercury, Venus, Mars, the Ascendant or the Midheaven. A contact between two slow bodies I read through the houses it falls in, as a difference between two eras more than between two people.
- **The birth time**: both charts need one (no reading without it). Say where it decides the contact: the Moon moves about 13° a day, so with the Moon the time can make or unmake it; the houses each body falls into always need it.
- Link the same aspect in one birth chart when the plan has the page (*[Sun square Moon](/astrology/sun-square-moon/)*), as one line.
- Facts keys: Bodies (*One person's Sun ☉, the other's Moon ☽*) · Aspect (with its angle) · Nature · Orb (*6.8°, the orb I use in synastry*) · How common (*About 1 pair in 7, either way round*) or, for two slow bodies, Who has it (one example). French: Corps · Aspect · Nature · Orbe · Fréquence (or Qui l’a).
- Sources: *Ptolemy, Tetrabiblos, book I* for the five aspects, and *The Astro Study's count from the planets' positions, 1930–2009* (French: *Le décompte de The Astro Study d’après la position des planètes, 1930–2009*) for the count.

**Not junk, page by page.** Each page answers its title on its own and holds what a competitor couldn't have written: the count or the birth years, the both-ways reading, and the library's two functions. Two pages of the same pair, or of the same aspect, never share a sentence; no sentence would fit another pair with the names swapped.

### A body in a sign, a body in a house

| | English | French |
|---|---|---|
| 1 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |
| 2 | `## In close relationships {#in-close-relationships}` | `## Dans les relations proches {#dans-les-relations-proches}` |
| 3 | `## At work {#at-work}` | `## Au travail {#au-travail}` |
| 4 | `## The hard part {#the-hard-part}` | `## Le plus difficile {#le-plus-difficile}` |
| 5 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

Title: the plan's (*Saturn in Aries*, *Chiron in the 7th house*); h1: *… in a birth chart* · *… dans un thème natal*; `family: "combinations"`; glyph: the body's symbol (Chiron ⚷, Lilith ⚸, North Node ☊) then the sign's (♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓) or, for a house, the body's symbol alone.

- **The grammar** (the AGS library): the body is the function, the sign is the manner, the house is the context. A sign changes *how* the body works, never *what* it is; a house says *where in life* it works. Say it with this body and this sign or house, not in general.
- **A sign** — its element and modality, its ruler (both, for Scorpio, Aquarius and Pisces), and the body's dignity there from the Facts list below (domicile, exaltation, detriment, fall; none for the outer bodies' exaltations). From `plan/sign-facts.json`: for a fast body, how long a stay in the sign usually lasts (*about 44 days for Mars, longer when it turns retrograde there*); for a slow one, the years it was there (*April 1937 to March 1940, March 1967 to April 1969…*), so that the page says plainly whether this is a personal placement or a generation's, read through the house.
- **A house** — angular, succedent or cadent, its natural sign, the body's joy if it has it there (Facts list), and that houses need the birth time: *In Placidus, the house system I use*, with a link to the birth-time article. The 5th, 6th, 8th and 12th never predict children, illness, death or confinement: link the ethics page the Voice section names.
- **What held in my tests** belongs here only as the notebook says it: Saturn, Chiron and Lilith *held 75 to 90% of the time*; any other body was *checked like every placement and not one of the three*, while overall *about a third* held.
- Facts keys (sign): Body · Sign · Element and modality · Dignity · Time in the sign (or Years) · How common (*about 1 person in 12*, from the file). French: Corps · Signe · Élément et mode · Dignité · Durée dans le signe (or Années) · Fréquence. House: Body · House · Type · Natural sign · Joy (when it is this body's) · Needs (*the birth time*). French: Corps · Maison · Type · Signe naturel · Joie · Il faut (*l’heure de naissance*).
- Sources: *Ptolemy, Tetrabiblos, book I* (rulerships, exaltations), *Vettius Valens, Anthology* (houses), *The Astro Study's count from the planets' positions* for the time in the sign, *My testing notes* where the notebook is cited.

### Rising sign

| | English | French |
|---|---|---|
| 1 | `## What it shows {#what-it-shows}` | `## Ce qu’il montre {#ce-qu-il-montre}` |
| 2 | `## First impressions {#first-impressions}` | `## La première impression {#la-premiere-impression}` |
| 3 | `## Its ruler {#its-ruler}` | `## Son maître {#son-maitre}` |
| 4 | `## In close relationships {#in-close-relationships}` | `## Dans les relations proches {#dans-les-relations-proches}` |

h1: *Aries rising* · *Ascendant Bélier*; glyph: *↑* then the sign's symbol. The rising sign needs the birth time (link the birth-time article). From `plan/rising-facts.json`, **how long the sign takes to rise** at London, Paris and New York (*Aries rises in about 52 minutes at London; Libra takes nearly three hours*), and what follows: a sign that rises fast is rising for fewer births, so a time rounded to the hour can miss it. The ruler is the chart ruler (both for Scorpio, Aquarius and Pisces). The Descendant is the opposite sign: one line, linked.
- Facts keys: Sign · Ruler (the chart ruler) · Element and modality · Rising time (London) · Opposite sign (the Descendant). French: Signe · Maître (maître du thème) · Élément et mode · Durée de lever (Londres) · Signe opposé (le Descendant).

### Sun and Moon signs together

| | English | French |
|---|---|---|
| 1 | `## How they get along {#how-they-get-along}` | `## Comment ils s’accordent {#comment-ils-s-accordent}` |
| 2 | `## In close relationships {#in-close-relationships}` | `## Dans les relations proches {#dans-les-relations-proches}` |
| 3 | `## At work {#at-work}` | `## Au travail {#au-travail}` |
| 4 | `## The hard part {#the-hard-part}` | `## Le plus difficile {#le-plus-difficile}` |

Title: the plan's (*Sun in Aries, Moon in Taurus* · *Soleil en Bélier, Lune en Taureau*); h1: *… in a birth chart* · *… dans un thème natal*; `family: "combinations"`; glyph: *☉♈☽♉*.

- **The grammar** (the AGS library): the Sun organises identity and direction, the Moon regulates feeling and need; each sign gives its own manner. The page is about the two manners meeting: what the Sun's sign aims for and how the Moon's sign looks after itself, and whether those agree.
- **How they get along**: the two elements and modalities, and the signs' relation counted from the Sun's sign: same sign, one or two apart (neighbours, or a sextile by sign), three (a square by sign), four (a trine), five (a quincunx), six (opposite). The rulers (both, for Scorpio, Aquarius and Pisces), and any dignity: the Sun in Leo (domicile), Aries (exaltation), Aquarius (detriment), Libra (fall); the Moon in Cancer, Taurus, Capricorn, Scorpio in the same order.
- **The phase at birth**, from `plan/sun-moon-facts.json`: the pair fixes how far ahead of the Sun the Moon was, so *you were born within about 2½ days of a new moon* (same sign), *5 to 10 days after a new moon, between the crescent and the first quarter* (three signs ahead), *near a full moon* (opposite signs). Link the phase pages (*new moon*, *first quarter moon*, *full moon*, *last quarter moon*, *balsamic moon*…) and *your birth lunar phase*.
- **How common**: *about 1 person in 144*, from the same file, once.
- **The birth time**: the Moon changes sign about every 2½ days, so on such a day the time decides the Moon's sign; link the birth-time article. With the rising sign, the two lights make the chart's first sketch, and none of the three is the whole chart.
- In close relationships, at work: how the combination tends to show, never a sun-sign stereotype passed off as fact. The hard part: the friction between the two manners, gently, with what helps.
- Facts keys: Sun sign · Moon sign · Elements · Modalities · Born near (the phase) · How common. French: Signe solaire · Signe lunaire · Éléments · Modes · Phase de naissance · Fréquence.
- Sources: *Ptolemy, Tetrabiblos, book I* (signs, rulers, exaltations), *The Astro Study's count from the planets' positions, 1930–2009*, *Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)* (the phases).

**Not junk, page by page.** The twelve pages of one Sun sign share none of their sentences, and neither do the twelve of one Moon sign. Say what these two signs do together that neither does with another.

### House overlay (their body in your house)

| | English | French |
|---|---|---|
| 1 | `## What it brings {#what-it-brings}` | `## Ce que ça apporte {#ce-que-ca-apporte}` |
| 2 | `## Where it rubs {#where-it-rubs}` | `## Là où ça frotte {#la-ou-ca-frotte}` |
| 3 | `## How to meet it {#how-to-meet-it}` | `## Comment le vivre {#comment-le-vivre}` |

Title: the plan's (*Their Sun in your 1st house* · *Le Soleil de l’autre dans votre maison 1*); h1: *… in synastry* · *… en synastrie*; `family: "combinations"`; glyph: the body's symbol.

- **The grammar**: the other person's body (its function, from the AGS library) lands in one of your houses (the area of life, from the house's page), and you tend to feel that part of your life lit or stirred by them. Read it **both ways round**: what you feel when their Sun is in your 1st, and what they feel there.
- The house needs **your** birth time; their body needs only their birth date, except the Moon (about 13° a day) and anything near a cusp, where their time decides it too. *In Placidus, the house system I use*; link the birth-time article.
- The house's type (angular, succedent, cadent) and natural sign; near an angle, the body also meets your Ascendant, IC, Descendant or Midheaven: one line.
- A synastry reads every overlay in both directions: their planets in your houses, and yours in theirs. Read from the other side, this page is *your Sun in their 1st house*: say so once. Link the same body's neighbouring houses the plan lists.
- The 5th, 6th, 8th and 12th never predict children, illness, death or confinement, in synastry either: link the ethics page the Voice section names. Consent: link *why I won't read a synastry behind someone's back* where it fits.
- Facts keys: Their body · Your house · Type · Natural sign · Needs (*your birth time, and theirs for the Moon*). French: Corps de l’autre · Votre maison · Type · Signe naturel · Il faut.
- Sources: *Vettius Valens, Anthology* (houses), *Ptolemy, Tetrabiblos, book I*.

**Not junk, page by page.** No sentence fits another body or another house with the names swapped: this body's function in this house's area, felt from both sides.

### Transit through a house

| | English | French |
|---|---|---|
| 1 | `## What changes {#what-changes}` | `## Ce qui change {#ce-qui-change}` |
| 2 | `## How long it lasts {#how-long-it-lasts}` | `## Combien de temps {#combien-de-temps}` |
| 3 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

Title: the plan's (*Saturn transiting the 7th house* · *Saturne en transit en maison 7*); h1: *Saturn transiting your 7th house* · *Saturne en transit dans votre maison 7*; `family: "combinations"`; glyph: the body's symbol.

- **The grammar** (the AGS library's *transits*): the body in the sky now, moving through one of your natal houses, activates what is already in the chart; it doesn't create events. *Weather, not a forecast.*
- **What changes**: the body's function at work in the house's area, for the length of the stay, and what it asks of you. Planets in that house when you were born are the first it meets: one line.
- **How long it lasts**, from `plan/house-stay-facts.json`: how long the stay lasts in charts drawn at London's latitude (Placidus), the usual length and the range (*usually about 3 years, between about 2 and 4*); the house's own median when it differs; New York's figures when they add something. It depends on how big the house is in your chart, which depends on your birth time and latitude: link the birth-time article.
- **In the sky now**: the signs it crosses from 2026 on, from `plan/sign-facts.json` (*Saturn is in Aries from February 2026 to April 2028*), so a reader with that sign on that house knows when it is theirs.
- The North Node moves backwards: it reaches the 12th house after the 1st. I look at both nodes, mean and true. Chiron's stays vary most: its orbit is stretched.
- The 5th, 6th, 8th and 12th never predict children, illness, death or confinement; money and legal outcomes are never predicted.
- Facts keys: Body · House · Stay (*usually about …*) · In the sky (the current sign and its dates) · Needs (*your birth time*). French: Corps · Maison · Durée · Dans le ciel · Il faut.
- Sources: *The Astro Study's count from the planets' positions* (the stays), *Vettius Valens, Anthology* (houses).

### Retrograde in a sign

| | English | French |
|---|---|---|
| 1 | `## What slows down {#what-slows-down}` | `## Ce qui ralentit {#ce-qui-ralentit}` |
| 2 | `## House by house {#house-by-house}` | `## Maison par maison {#maison-par-maison}` |
| 3 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

Title: the plan's (*Mercury retrograde in Aries* · *Mercure rétrograde en Bélier*); h1: *When Mercury turns retrograde in Aries* · *Quand Mercure rétrograde en Bélier*; `family: "combinations"`; glyph: the planet's symbol, ℞ and the sign's (*☿℞♈*).

- Retrograde is apparent motion: seen from Earth, the planet seems to back up through the zodiac (Mercury 3 or 4 times a year for about 3 weeks, Venus about every 18 months for about 6 weeks, Mars about every 2 years for about 2½ months). The function slows and turns back on itself, in this sign's manner.
- **The dates**, from `plan/retrograde-facts.json`: the retrogrades from 2000 to 2040 that cover this sign, with the stations; the most recent and the next, and whether they stay in this sign or cross into the next one (*wholly*). Venus's retrogrades come back to nearly the same degrees every 8 years: say so when the list shows it.
- **House by house**: one line per house, where it slows things for someone with this sign on that house. It needs the birth time (Placidus): link the birth-time article.
- A planet born retrograde is a different matter: link *natal retrograde planets*.
- Weather, not a forecast: no advice dressed up as rule (*never sign a contract*); never money or legal outcomes.
- Facts keys: Planet · Sign · How often · Lasts · Most recent · Next. French: Planète · Signe · Fréquence · Durée · La plus récente · La prochaine.
- Sources: *The Astro Study's dates from the planets' positions* (French: *Les dates de The Astro Study d’après la position des planètes*), *Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)*.

### Eclipse in a sign

| | English | French |
|---|---|---|
| 1 | `## What it stirs {#what-it-stirs}` | `## Ce qu’elle remue {#ce-qu-elle-remue}` |
| 2 | `## House by house {#house-by-house}` | `## Maison par maison {#maison-par-maison}` |

Title: the plan's (*Eclipse in Aries* · *Éclipse en Bélier*); h1: *Eclipses in Aries* · *Les éclipses en Bélier*; `family: "combinations"`; glyph: *●* then the sign's symbol.

- An eclipse is a new or full moon close to the Moon's nodes. A solar eclipse in Aries has the Sun and Moon together in Aries; a lunar eclipse in Aries has the Moon in Aries and the Sun opposite, in Libra. Eclipses come in seasons along the nodes' axis, so this sign's eclipses alternate with its opposite's: name the axis.
- The AGS library (*eclipses*): an eclipse counts only within about 3° of a natal point, at either end of its axis, read through that point and its house; a penumbral lunar eclipse weighs less; symbolic emphasis, never an omen.
- **The dates**, from `plan/eclipse-facts.json`: the eclipses in this sign from 2000 to 2040, with their type; the most recent and the next.
- **House by house**: one line per house. It needs the birth time (Placidus): link the birth-time article.
- Weather, not a forecast; never health, death, money or legal outcomes.
- Facts keys: Sign · Axis · Most recent · Next · From 2000 to 2040 (how many, solar and lunar). French: Signe · Axe · La plus récente · La prochaine · De 2000 à 2040.
- Sources: *The Astro Study's dates from the planets' positions*, *Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)*.

### Progressed Moon in a sign

| | English | French |
|---|---|---|
| 1 | `## What it brings {#what-it-brings}` | `## Ce qu’elle apporte {#ce-qu-elle-apporte}` |
| 2 | `## How long it lasts {#how-long-it-lasts}` | `## Combien de temps {#combien-de-temps}` |
| 3 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

Title: the plan's (*Progressed Moon in Aries* · *Lune progressée en Bélier*); h1: *The progressed Moon in Aries* · *La Lune progressée en Bélier*; `family: "combinations"`; glyph: *☽* then the sign's symbol.

- Secondary progressions take one day of the sky after birth for one year of life (the AGS library's *secondary progressions*: symbolic time, inner development, never literal motion or guaranteed events). The progressed Moon is the fastest moving point in them: it marks the mood of a chapter.
- **How long it lasts**, from `plan/progressed-moon-facts.json`: as many years as the Moon took days to cross the sign after your birth (*between 2 and 2½ years, usually about 2 years and 4 months*). Once round the zodiac takes about 27 years.
- What it brings: the Moon's function (needs, comfort, feeling) in this sign's manner, for those years. Which house it crosses at the same time needs the birth time: link the birth-time article.
- Facts keys: Point · Sign · Lasts · Round the zodiac (*about 27 years*). French: Point · Signe · Durée · Tour du zodiaque.
- Sources: *The Astro Study's count from the planets' positions*; *Steven Forrest, The Changing Sky (1986)* (secondary progressions).

### Concept

| | English | French |
|---|---|---|
| 1 | `## What it is {#what-it-is}` | `## Ce que c’est {#ce-que-c-est}` |
| 2 | `## How it works {#how-it-works}` | `## Comment ça marche {#comment-ca-marche}` |
| 3 | `## In a reading {#in-a-reading}` | `## Dans une lecture {#dans-une-lecture}` |
| 4 | `## Common myths {#myths}` | `## Idées reçues {#idees-recues}` |

Link every page `links-for.mjs` lists, and at least one article or How I read.

### Tested (what the research found)

| | English | French |
|---|---|---|
| 1 | `## The short answer {#the-short-answer}` | `## La réponse courte {#la-reponse-courte}` |
| 2 | `## What the research found {#what-the-research-found}` | `## Ce que la recherche a trouvé {#ce-que-la-recherche-a-trouve}` |
| 3 | `## What I found {#what-i-found}` | `## Ce que j’ai trouvé {#ce-que-j-ai-trouve}` |

`family`: the plan's (`links-for.mjs` shows it); glyph *✦*.

- **The short answer**: honest and plain. When the research found no effect, say so, without hedging and without mockery, of science or of readers.
- **What the research found**: who tested what, how, and what came out, from the study itself or a scholarly account of it, each with its exact reference (authors, title, journal, volume, pages, year; or book, publisher, year). The main criticism, when there is a published one, with its reference. Numbers only as the source gives them, checked; never a number from memory. A finding you can't confirm stays out.
- **What I found**: Joana's notebook, exactly as the Facts section states it, and nothing more: *a notebook, not a study; it proves nothing about astrology in general*.
- Facts keys: Question · Short answer · Key study (*author, year*) · My notebook. French: Question · Réponse courte · Étude clé · Mon carnet.
- Sources: the studies and books, with an address only when you opened it and it says what you cite (a DOI, the journal's page, an official page); *My testing notes* where the notebook is cited.

### Guide (how-to)

| | English | French |
|---|---|---|
| 1 | `## Step by step {#step-by-step}` | `## Pas à pas {#pas-a-pas}` |
| 2 | `## Common mistakes {#common-mistakes}` | `## Erreurs fréquentes {#erreurs-frequentes}` |

`family`: the plan's (`links-for.mjs` shows it); glyph *✦*.

- Numbered steps, each one doing one thing, then the mistakes people actually make. Link every page a step relies on.
- Joana's practice where it applies: no reading without a birth time; Placidus; both rulers, both nodes; consent for a synastry; adults only; never health, death, pregnancy, money or legal outcomes. What she offers and how is on `/how-i-read/`, `/birth-chart/` and `/synastry/`: say only what those pages say.
- Facts keys: For (*who it is for*) · You need · Steps (*how many*). French: Pour · Il vous faut · Étapes.

### Country (where to find a birth time)

| | English | French |
|---|---|---|
| 1 | `## Where the time is written {#where-the-time-is-written}` | `## Où l’heure est écrite {#ou-l-heure-est-ecrite}` |
| 2 | `## How to ask for it {#how-to-ask-for-it}` | `## Comment la demander {#comment-la-demander}` |
| 3 | `## If it isn't there {#if-it-isnt-there}` | `## Si elle n’y est pas {#si-elle-n-y-est-pas}` |

`family`: the plan's (`links-for.mjs` shows it); glyph *✦*.

- Every administrative fact from the official source (the registry, the government's own pages), opened and read, cited with its address and *checked on 4 November 2026*. When the rules differ by state, province, region or year of birth, say so and don't generalise. No fee or delay unless the official page states it.
- **If it isn't there**: other records that may hold the time (hospital, family, baptism), what to ask and whom. There's no reading without a time; Joana's own words for this, from the order form: *I'm working on a project to find people's birth data accurately; for now I can only read with the time and place of birth.*
- Facts keys: Country · On the birth certificate (*yes*, *no*, or *it depends*: say on what) · Where to ask · Official page. French: Pays · Sur l’acte de naissance · Où demander · Page officielle.

### Pattern

| | English | French |
|---|---|---|
| 1 | `## What it looks like {#what-it-looks-like}` | `## À quoi elle ressemble {#a-quoi-elle-ressemble}` |
| 2 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |
| 3 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

`family`: the plan's; glyph: a fitting symbol (*△* for a grand trine, *□* for a T-square) or *✦*.

- **What it looks like**: the geometry: which aspects, between how many planets, in which signs or elements it tends to fall.
- **How common**, from `plan/pattern-facts.json`, with its orbs said once (*about 1 person in 10 born 1930–2009 has a grand trine among the ten planets, with orbs of 8° for the Sun and Moon and 6° otherwise*). Say what the count leaves out (the angles, Chiron, the nodes) and that a wider or tighter orb changes it a great deal.
- The AGS library's rules for patterns: *patterns emerge from repetition, not isolated factors; no single factor determines dominance; clusters describe emphasis, not fixed identity*. A pattern is read through the planets, signs and houses it joins, never as a verdict.
- Chart shapes (bowl, bucket, bundle, locomotive, seesaw, splash, splay) come from *Marc Edmund Jones, The Guide to Horoscope Interpretation* (check the edition and year before citing).
- Facts keys: Shape · Aspects · How common · Orbs. French: Forme · Aspects · Fréquence · Orbes.

### History

| | English | French |
|---|---|---|
| 1 | `## What it was {#what-it-was}` | `## Ce que c’était {#ce-que-c-etait}` |
| 2 | `## What it gave astrology {#what-it-gave-astrology}` | `## Ce qu’elle a apporté {#ce-qu-elle-a-apporte}` |

`family`: the plan's (`links-for.mjs` shows it); glyph *✦*.

- Dates, names, places and texts only from scholarly sources you have checked (author, title, publisher, year; chapter or page where it helps), never from memory or from astrology websites that cite nothing. Where historians disagree, say so.
- What it gave the astrology Joana practises (modern tropical astrology with traditional techniques), linked to the pages of those techniques.
- Facts keys: Period · Where · Key texts · Gave us. French: Période · Où · Textes clés · Ce qu’elle a apporté.

### Transit to a natal point

| | English | French |
|---|---|---|
| 1 | `## What changes {#what-changes}` | `## Ce qui change {#ce-qui-change}` |
| 2 | `## How long it lasts {#how-long-it-lasts}` | `## Combien de temps {#combien-de-temps}` |
| 3 | `## What helps {#what-helps}` | `## Ce qui aide {#ce-qui-aide}` |

Title: the plan's (*Transiting Saturn square natal Sun* · *Saturne en transit carré Soleil du thème natal*); h1: *Transiting Saturn square your natal Sun* · *Saturne en transit carré votre Soleil natal*; `family`: the plan's; glyph: the transiting body's symbol, the aspect's, the natal point's (*♄□☉*; Ascendant *AC*, Midheaven *MC*).

- **The grammar** (the AGS library's *transits*): the moving body's function meets the natal point's, related by the aspect; it activates what is in the chart, never creates events. *Weather, not a forecast.*
- **How long it lasts**, from `plan/transit-facts.json`, with the orbs Joana's forecast uses, said once (*from 1½° before exact to 1° after*): `series` for the body (how long one pass lasts, and with a retrograde loop of three exact hits), and the page's `byAge80` (how many times people meet it by 80; the share who never do). For a slow natal planet, or a body's aspect to itself, `firstHitAge`: the ages it comes at, with a birth-year example.
- The natal Ascendant and Midheaven need the birth time; so does the natal Moon's exact degree. Link the birth-time article where it matters.
- Never health, death, pregnancy, money, legal outcomes or break-ups. Link the same aspect in a birth chart (`aspect` page of the pair) when the plan has it.
- Facts keys: Transiting · Natal point · Aspect · One pass (*about …*) · With a retrograde loop (*about …*) · By 80 (*about N times*). French: En transit · Point natal · Aspect · Un passage · Avec une boucle rétrograde · Avant 80 ans.
- Sources: *The Astro Study's count from the planets' positions*; *Robert Hand, Planets in Transit (1976)* (transits).

### Composite placement

| | English | French |
|---|---|---|
| 1 | `## What it says about the two of you {#what-it-says}` | `## Ce que ça dit de vous deux {#ce-que-ca-dit}` |

Title: the plan's (*Composite Sun in Aries* · *Soleil composite en Bélier*); h1: *Composite Sun in Aries: the relationship's chart* · *Soleil composite en Bélier : le thème de la relation*; `family`: the plan's; glyph: the body's symbol then the sign's, or the body's alone for a house.

- **The composite** (the AGS library's *composite*): one chart for the relationship, each body at the nearer midpoint of the two natal positions. It describes the relationship as a whole, never its length or success; it is read with both natal charts and the synastry, never alone. AGS doesn't draw composites: say plainly that it is a technique Joana describes here, without claiming she uses it in her readings.
- **How common**, from `plan/composite-facts.json`: *about 1 pair in 12* for a fast body; for a slow body, say that two people of the same age get the sign their generation has, that a gap in age moves it to the midpoint, and when the file says *none*, that no two people born 1930–2009 have it. The file's `oddities`: in a composite, Mercury can land far from the Sun, even opposite it, and Venus too, which no birth chart allows: say it on the Mercury and Venus pages.
- **A house**: composite houses need both birth times, and there is more than one way to draw them (from the midpoints of the two charts' cusps, or from the composite Midheaven at the place where the pair lives): say so, without choosing.
- One section of 450 to 650 words, then the FAQ. Facts keys: Body · Sign (or House) · How common · Needs (*both birth times* for a house, or the Moon). French: Corps · Signe (ou Maison) · Fréquence · Il faut.
- Sources: *The Astro Study's count from the planets' positions*; *Robert Hand, Planets in Composite (1975)*, after checking the year.

### Ruler of a house in a house

| | English | French |
|---|---|---|
| 1 | `## What it means {#what-it-means}` | `## Ce que ça veut dire {#ce-que-ca-veut-dire}` |

Title: the plan's (*Ruler of the 1st in the 7th house* · *Maître de la maison 1 en maison 7*); h1: the same plus *in a birth chart* · *dans un thème natal*; `family`: the plan's; glyph *✦*.

- The planet that rules the sign on the first house's cusp (both rulers for Scorpio, Aquarius and Pisces, *I read both*) sits in the second house: it carries the first house's matters into the second's. Say what that joins, in this pair of houses, from the two house pages, and that the planet and its sign colour it.
- Needs the birth time (Placidus): link the birth-time article. The 5th, 6th, 8th and 12th never predict children, illness, death or confinement.
- One section of 450 to 650 words, then the FAQ. Facts keys: Ruler of · Placed in · Houses (*angular, succedent, cadent* for each) · Needs. French: Maître de · Placé en · Maisons · Il faut.
- Sources: *Vettius Valens, Anthology*; *William Lilly, Christian Astrology (1647)* (rulers of houses), after checking.

### A sign on a house cusp

| | English | French |
|---|---|---|
| 1 | `## What it means {#what-it-means}` | `## Ce que ça veut dire {#ce-que-ca-veut-dire}` |

Title: the plan's (*Aries on the 2nd house cusp* · *Bélier sur la cuspide de la maison 2*); h1: the same plus *in a birth chart* · *dans un thème natal*; `family`: the plan's; glyph: the sign's symbol.

- The sign on the cusp sets the manner of the house's matters, and its ruler (both, for Scorpio, Aquarius and Pisces) where they are acted on: link the page of that ruler in each house (*ruler of the 2nd in …*) as a short list or a sentence.
- **How common**, from `plan/cusp-facts.json`: *at London's latitude, about 1 birth in 20 has Aries on the 2nd house cusp; at New York, about 1 in 15*; why it differs (signs of short and long ascension, and latitude), and that a sign can be intercepted, on no cusp at all (`intercepted`). In Placidus, the house system Joana uses; needs the birth time.
- One section of 450 to 650 words, then the FAQ. Facts keys: Sign · Cusp · Ruler · How common (London, New York). French: Signe · Cuspide · Maître · Fréquence (Londres, New York).
- Sources: *The Astro Study's count from the planets' positions* (here, the cusps); *Ptolemy, Tetrabiblos, book I* (rulerships).

### Decan

| | English | French |
|---|---|---|
| 1 | `## Its rulers {#its-rulers}` | `## Ses maîtres {#ses-maitres}` |
| 2 | `## Its image {#its-image}` | `## Son image {#son-image}` |
| 3 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |

Title: the plan's (*Aries, first decan* · *Bélier, premier décan*); h1: *The first decan of Aries (0°–10°)* · *Le premier décan du Bélier (0°–10°)*; `family`: the plan's; glyph: the sign's symbol.

- **Its rulers**: the Chaldean face (Mars, Sun, Venus for Aries, in the Chaldean order from there) and, where astrologers also use it, the ruler by triplicity of the sign of the same element (Aries: Aries, Leo, Sagittarius), each named with its source. Check both lists before writing.
- **Its image**: the traditional images of the decans (the Egyptian decans, *Picatrix*, Agrippa) only as a checked source gives them, quoted briefly or described, never invented.
- **In a birth chart**: a planet or angle in those ten degrees. The Sun's dates in the decan from `plan/decan-facts.json` (*about 21 to 30 March*, shifting by a day from year to year).
- Facts keys: Degrees · Face (Chaldean) · By triplicity · The Sun there (*about …*). French: Degrés · Face (chaldéenne) · Par triplicité · Le Soleil y passe.

### Fixed star

| | English | French |
|---|---|---|
| 1 | `## Where it is {#where-it-is}` | `## Où elle se trouve {#ou-elle-se-trouve}` |
| 2 | `## Its tradition {#its-tradition}` | `## Sa tradition {#sa-tradition}` |
| 3 | `## In a birth chart {#in-a-birth-chart}` | `## Dans un thème natal {#dans-un-theme-natal}` |

Title: the plan's (*Regulus* · *Régulus*); h1: *Regulus, the fixed star* · *Régulus, l’étoile fixe*; `family`: the plan's; glyph *★*.

- **Where it is**, from `plan/star-facts.json`: the constellation and Bayer name, the brightness (visual magnitude, lower is brighter), the tropical position in 2026 and in 2000 (precession moves it about 1° in 72 years: say when it changes sign if it does), and its ecliptic latitude: a star far from the ecliptic never meets a planet in the sky, only in longitude. A cluster (Praesepe and the three in Scorpio and Sagittarius) has no entry in the file: give its position only from a checked source.
- **Its tradition**: Ptolemy's nature for it (*Tetrabiblos, book I, chapter 9*: *of the nature of Mars and Jupiter*), and later authors (Vivian Robson, *The Fixed Stars and Constellations in Astrology*, 1923), each checked. No doom: an *unlucky* star is a tradition's word, said as such.
- **In a birth chart**: a conjunction within about 1° in longitude; AGS doesn't compute stars, so a star is something Joana describes here; for the planets that make one, link the star-contact pages the plan has.
- Facts keys: Constellation · Brightness · Position (2026) · Latitude · Nature (Ptolemy). French: Constellation · Éclat · Position (2026) · Latitude · Nature (Ptolémée).
- Sources: *Yale Bright Star Catalogue, 5th ed. (Hoffleit and Warren, 1991)* for the coordinates; *Ptolemy, Tetrabiblos, book I*; the others as checked.

### Planet conjunct a fixed star

| | English | French |
|---|---|---|
| 1 | `## What it means {#what-it-means}` | `## Ce que ça veut dire {#ce-que-ca-veut-dire}` |

Title: the plan's (*Sun conjunct Regulus* · *Soleil conjonction Régulus*); h1: the same plus *in a birth chart* · *dans un thème natal*; `family`: the plan's; glyph: the planet's symbol, *☌*, *★*.

- The planet's function (AGS library) with the star's tradition, as the star's page states it. From `plan/star-facts.json` (`contacts`): *about 1 person in 176 born 1930–2009 has it, within 1°*; for the Sun, the birthdays (*about 22–23 August*); for Saturn, the months it was there. The star's latitude: when it is far from the ecliptic, say that the planet and the star never meet in the sky, only in longitude.
- No verdicts: royalty, fame, ruin and violence are what old books say, said as such and never promised.
- One section of 450 to 650 words, then the FAQ. Facts keys: Planet · Star · Orb (*1°*) · How common · Born (for the Sun: the dates; for Saturn: the years). French: Planète · Étoile · Orbe · Fréquence · Naissances.

### Person and text (people and books of astrology)

| | English | French |
|---|---|---|
| 1 | `## Who {#who}` | `## Qui {#qui}` |
| 2 | `## What they changed {#what-they-changed}` | `## Son apport {#son-apport}` |

and for a text: `## What it is {#what-it-is}` · `## What it says {#what-it-says}` (French `## Ce que c’est {#ce-que-c-est}` · `## Ce qu’il dit {#ce-qu-il-dit}`).

- Historical figures and books only: dates, places, works and what they changed, each from a checked scholarly source (author, title, publisher, year), never from astrology sites that cite nothing. Where historians disagree, say so. No birth chart of the person (the site doesn't read the charts of real people, and a historical birth time is rarely known).
- Living authors: their published work only, with titles and years; nothing about their life beyond what their own published biography says.
- Facts keys (person): Lived · Where · Known for · Key work. French: Vie · Où · Connu pour · Œuvre clé. (Text): Author · Written · Language · Translations used. French: Auteur · Écrit · Langue · Traductions.

## Links

- Write the **English path in both languages**: `[Lune en Bélier](/astrology/moon-in-aries/)` opens the French page on the French site. Only anchors change: a French page links French anchors (`/blog/saturn-chiron-lilith/#pourquoi-pas-le-soleil`, not `#why-not-the-sun`).
- A page of the plan that isn't published yet shows as plain text and becomes a link the day it is. So link everything the rules ask for, written or not; the checker refuses an address the plan doesn't have.
- The link text is the page's title in the page's language (or the short label shown above in the long lists). Never "click here".
- Every link the rules ask for, plus the ones the text calls for: a pillar names other pillars, an entry that talks about birth time links the birth-time article, one that talks about consent links [why I won't read a synastry behind someone's back](/blog/synastry-behind-their-back/). At most one link to a reading page (`/birth-chart/` or `/synastry/`).
- The two languages link the same pages.
- No links in `definition`, `description` or the answers of `faq`.

## Voice

Joana's, as on the rest of the site (read `content/en/astrology/sun.md` and `saturn.md`, and their French twins, before writing):

- First person, plain words, short sentences, warm and exact. *I read the Moon as…*, not *The Moon governs…*. No jargon left unexplained.
- Gentle with hard placements: no doomed placements, no verdicts, *a timetable, not a wall*. Transits are *weather, not a forecast*: never predict events.
- English: British spelling (*centre*, *recognise*, *colour*). French: *vous*; Joana writes in the feminine (*je suis venue*); never assume the reader's gender (*si votre naissance tombe…*, not *si vous êtes né*).
- No famous people as examples, no sun-sign stereotypes passed off as fact, no "the stars say".
- Health, death, pregnancy, money and legal outcomes are never predicted. Where a house or planet traditionally covers them (6th: illness, 8th: death, 5th: children, 12th: confinement), say what tradition gave it, read it in an adult's life, and link the planned ethics page: `can-astrology-predict-health-problems`, `can-astrology-predict-death`, `can-astrology-predict-pregnancy`, `childrens-charts`, `astrology-and-mental-health`.
- Readers are adults; the site never reads children's charts.

What Joana has said about her own practice, to state in her voice where it matters:

- **Houses: Placidus.** Where the house system changes what a page says (the angles, the 1st house, the cusps), name it: *In Placidus, the house system I use, …*; the other systems are described, not dismissed.
- **Rulers: both.** Scorpio, Aquarius and Pisces have a modern ruler (Pluto, Uranus, Neptune) and a traditional one (Mars, Saturn, Jupiter): talk about both, and *I read both*.
- **Nodes: both.** Mean and true node: talk about both; *I look at both*, and near the edge of a sign she says when they disagree.

## French

- **No gender for the planets whose gender varies between writers:** Mercure, Mars, Jupiter, Saturne, Uranus, Neptune, Pluton. No gendered determiner before them (*le, la, un, une, du, au, son, sa, ce, cette*: write *Saturne, dans le thème de l’autre*, never *la Saturne de l’un* or *son Saturne*), no pronoun for them (*il, elle*, the *-t-il / -t-elle* of a question: repeat the name or turn the sentence round), no agreeing adjective or participle (*Mars a son exaltation en Capricorne*, *Herschel découvre Uranus en 1781*). Invariable words are fine (*rétrograde, maléfique, rapide*), and so is *cette planète*, used sparingly. Le Soleil, la Lune, Vénus, la Terre, Chiron, Lilith and the nodes keep their usual gender.
- **Planet facts keys** in French are nouns, the same on every planet page: *Exaltation* and *Exil et chute*, not *Exalté(e) en* / *Affaibli(e) en*.
- **The old names of the houses:** 3rd *la Déesse*, 5th *la Fortune favorable*, 6th *la Fortune défavorable*, 9th *le Dieu*, 11th *le Génie favorable*, 12th *le Génie défavorable* (English: the Goddess, Good Fortune, Bad Fortune, the God, Good Spirit, Bad Spirit).
- Typography by `tools/fr-typography.mjs`; *vous*; Joana writes in the feminine; never assume the reader's gender.

## Facts

Nothing invented. Every fact on a page is either astronomy, the astrological tradition as books state it, or Joana's notebook as published.

**The notebook** (`/blog/i-tested-my-birth-chart/`) says exactly this, and nothing more:

- She checked every placement of her chart — Sun, Moon, rising, each planet in its sign and house — a tick or a cross, then the same for family, friends and strangers, with their consent.
- Overall about a third held: **30 to 40%**. The Sun sign, the rising sign, Venus and Mercury, *the placements everyone reads first*, are named among those.
- **Saturn, Lilith and Chiron held 75 to 90%** of the time.
- It's a notebook, not a study; it proves nothing about astrology in general. When something rests on a placement that held less often, she says so in a reading.

So "What held in my tests" may say, for the Sun, the rising sign, Venus or Mercury, that it held about a third of the time; for the Moon, Mars, Jupiter, Uranus, Neptune and Pluto, that it was checked like every placement and was **not one of the three** that held far more often, while overall about a third held — never a figure of its own; for the Descendant, Midheaven, IC and the nodes, that the angle the notebook reports is the rising sign (about a third) and that the three that stood out were Saturn, Chiron and Lilith. No other number, no "in my experience X always…".

**Astronomy and tradition you can use** (when in doubt, leave it out):

- Time in each sign: Moon about 2½ days · Mercury usually 2 to 3 weeks · Venus usually 3 to 4 weeks (about 25 days) · Mars about 6 to 7 weeks · Jupiter about a year · Saturn about 2½ years · Uranus about 7 years · Neptune about 14 years · Pluto 12 to 31 years · the nodes about 18 months · mean Lilith about 9 months. Retrograde, any of these can stay longer.
- Cycles: Moon 27⅓ days round the zodiac, 29½ days new moon to new moon · Mercury retrograde 3 or 4 times a year, about 3 weeks · Venus retrograde about every 18 months, about 6 weeks · Mars retrograde about every 2 years, about 2½ months · Jupiter about 12 years round (return at about 12, 24, 36…) and retrograde about 4 months a year · Saturn about 29½ years · Uranus about 84 years (opposition at about 42), discovered by William Herschel in 1781 · Neptune about 165 years (square at about 41), discovered in 1846 · Pluto about 248 years, discovered in 1930, classed a dwarf planet in 2006 · the nodes move backwards, round in about 18.6 years · the Sun and Moon are never retrograde, the mean nodes always are.
- Mercury is never more than about 28° from the Sun, Venus never more than about 47°.
- Domiciles: Sun Leo · Moon Cancer · Mercury Gemini and Virgo · Venus Taurus and Libra · Mars Aries (traditionally also Scorpio) · Jupiter Sagittarius (traditionally also Pisces) · Saturn Capricorn (traditionally also Aquarius) · modern: Uranus Aquarius, Neptune Pisces, Pluto Scorpio.
- Exaltation / fall: Sun Aries / Libra · Moon Taurus / Scorpio · Mercury Virgo / Pisces · Venus Pisces / Virgo · Mars Capricorn / Cancer · Jupiter Cancer / Capricorn · Saturn Libra / Aries. Detriment is the sign opposite a domicile. The outer planets have no traditional exaltation: don't give one.
- Elements and modalities: fire Aries, Leo, Sagittarius · earth Taurus, Virgo, Capricorn · air Gemini, Libra, Aquarius · water Cancer, Scorpio, Pisces; cardinal Aries, Cancer, Libra, Capricorn · fixed Taurus, Leo, Scorpio, Aquarius · mutable Gemini, Virgo, Sagittarius, Pisces.
- Sun sign dates (tropical, they shift by a day from year to year, so always *about*): Aries 21 Mar–19 Apr · Taurus 20 Apr–20 May · Gemini 21 May–20 Jun · Cancer 21 Jun–22 Jul · Leo 23 Jul–22 Aug · Virgo 23 Aug–22 Sep · Libra 23 Sep–22 Oct · Scorpio 23 Oct–21 Nov · Sagittarius 22 Nov–21 Dec · Capricorn 22 Dec–19 Jan · Aquarius 20 Jan–18 Feb · Pisces 19 Feb–20 Mar.
- Houses: angular 1, 4, 7, 10 · succedent 2, 5, 8, 11 · cadent 3, 6, 9, 12. Natural signs Aries to Pisces in order. Joys: Mercury 1st, Moon 3rd, Venus 5th, Mars 6th, Sun 9th, Jupiter 11th, Saturn 12th. Old names: 3rd the Goddess, 5th Good Fortune, 6th Bad Fortune, 9th the God, 11th Good Spirit, 12th Bad Spirit.
- The angles: the Ascendant is the degree rising on the eastern horizon at birth and changes sign about every two hours on average (faster or slower with the sign and the latitude); the Midheaven is where the zodiac crosses the meridian, not the point overhead; in Placidus and the other quadrant systems they are the cusps of the 1st, 10th, 7th and 4th houses. They need a birth time.
- Aspects: conjunction 0°, sextile 60°, square 90°, trine 120°, opposition 180°.
- The Part of Fortune by day is the Ascendant plus the Moon minus the Sun (as far from the Ascendant as the Moon is from the Sun); by night many astrologers reverse it. Software doesn't all do the same: say so.
- The nodes: where the Moon's path crosses the Sun's; eclipses happen when a new or full moon falls near them. Mean and true node differ by a degree or two at most.

**Sources** — outside addresses only from this list, checked:
NASA facts: Sun `https://science.nasa.gov/sun/facts/` · Moon `https://science.nasa.gov/moon/facts/` · Mercury `https://science.nasa.gov/mercury/facts/` · Venus `https://science.nasa.gov/venus/venus-facts/` · Mars `https://science.nasa.gov/mars/facts/` · Jupiter `https://science.nasa.gov/jupiter/jupiter-facts/` · Saturn `https://science.nasa.gov/saturn/facts/` · Uranus `https://science.nasa.gov/uranus/facts/` · Neptune `https://science.nasa.gov/neptune/neptune-facts/` · Pluto `https://science.nasa.gov/dwarf-planets/pluto/facts/`.
Books, without an address: *Ptolemy, Tetrabiblos, book I* (rulerships, exaltations, aspects, the signs) · *Johannes Kepler, Harmonices Mundi (Linz, 1619)* (the quintile, biquintile and sesquiquadrate) · *Vettius Valens, Anthology* (houses, lots) · *Dorotheus of Sidon, Carmen Astrologicum* (houses, lots) · *Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)* (the Moon's nodes and apogee, the angles) · and on this site *My testing notes* (`page: "/blog/i-tested-my-birth-chart"`) wherever the page talks about the tests. French titles: *Ptolémée, Tétrabible, livre I* · *Vettius Valens, Anthologies* · *Dorothée de Sidon, Carmen Astrologicum* · *Mes notes de test*.

## Length

Pillars, signs and houses: 900 words of text or more (1,000 to 1,500 is right); aspects 700 or more; concepts 600 or more. Length comes from substance — a line per sign or house that says something particular — never from repetition.
