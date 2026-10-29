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

### Concept

| | English | French |
|---|---|---|
| 1 | `## What it is {#what-it-is}` | `## Ce que c’est {#ce-que-c-est}` |
| 2 | `## How it works {#how-it-works}` | `## Comment ça marche {#comment-ca-marche}` |
| 3 | `## In a reading {#in-a-reading}` | `## Dans une lecture {#dans-une-lecture}` |
| 4 | `## Common myths {#myths}` | `## Idées reçues {#idees-recues}` |

Link every page `links-for.mjs` lists, and at least one article or How I read.

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

- Time in each sign: Moon about 2½ days · Mercury usually 2 to 3 weeks · Venus about 4 to 5 weeks · Mars about 6 to 7 weeks · Jupiter about a year · Saturn about 2½ years · Uranus about 7 years · Neptune about 14 years · Pluto 12 to 31 years · the nodes about 18 months · mean Lilith about 9 months. Retrograde, any of these can stay longer.
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
Books, without an address: *Ptolemy, Tetrabiblos, book I* (rulerships, exaltations, aspects, the signs) · *Vettius Valens, Anthology* (houses, lots) · *Dorotheus of Sidon, Carmen Astrologicum* (houses, lots) · *Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)* (the Moon's nodes and apogee, the angles) · and on this site *My testing notes* (`page: "/blog/i-tested-my-birth-chart"`) wherever the page talks about the tests. French titles: *Ptolémée, Tétrabible, livre I* · *Vettius Valens, Anthologies* · *Dorothée de Sidon, Carmen Astrologicum* · *Mes notes de test*.

## Length

Pillars, signs and houses: 900 words of text or more (1,000 to 1,500 is right); aspects 700 or more; concepts 600 or more. Length comes from substance — a line per sign or house that says something particular — never from repetition.
