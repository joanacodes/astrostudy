# Brief: concept, technique, ethics, pattern and asteroid pages (The Astro Study)

You write encyclopaedia pages for The Astro Study, a bilingual (English/French) Hugo astrology site written in the voice of its owner, Joana. Repository: `/home/user/astrostudy`. Each page exists in English AND French. Read `/home/user/astrostudy/plan/kit/COMMON.md` first: its rules apply to every page.

## Read once, before writing
1. `plan/writing-guide.md`: **Concept**, **Pattern** (for pattern pages), **Pillar: a planet, an angle, a node** (for the asteroid pages), then **Links**, **Voice**, **French**, **Facts** and **Length**.
2. Published models, each with its French twin: `content/en/astrology/part-of-fortune.md`, `horizon-axis.md`, `which-lilith-is-mine.md`, `retrograde-explained.md`, `transits.md`, `can-astrology-predict-death.md`. Copy the front-matter shape exactly.
3. The owner's AGS library: `plan/kit/library-compact.md` and `plan/kit/library-techniques.md` (for any technique: its canonical function, notInherent and constraints). Meanings must agree with them.
4. Your pages' data: the lines of `plan/kit/pages.jsonl` whose `id` is one of yours. Some carry `facts` computed from the ephemeris (stations, ingresses, conjunctions, ages at the life transits, out-of-bounds dates, pattern counts): use them exactly; others point to a file in `plan/`.

## Headings of each kind (French headings from `node tools/plan/links-for.mjs <id>`, which prints both languages)
| Kind | English headings | Anchors |
|---|---|---|
| concept | What it is · How it works · In a reading · Common myths | `{#what-it-is}`, `{#how-it-works}`, `{#in-a-reading}`, `{#myths}` |
| technique | What it is · How it is done · What it shows · Its limits | `{#what-it-is}`, `{#how-it-is-done}`, `{#what-it-shows}`, `{#its-limits}` |
| ethics | The short answer · Why it matters · What to do instead | `{#the-short-answer}`, `{#why-it-matters}`, `{#what-to-do-instead}` |
| pattern | What it looks like · In a birth chart · What helps | `{#what-it-looks-like}`, `{#in-a-birth-chart}`, `{#what-helps}` |
| pillar (asteroids) | the guide's pillar headings | as the guide gives them |

French anchors are the French heading in lower case, without accents, words joined by hyphens: *Ce que c’est* → `{#ce-que-c-est}`. Questions come from the `faq` front matter.

## Notes
- 600 to 900 words of text per language for concepts, techniques, ethics and patterns; pillars 900 or more. Never padded.
- Traditional rules (terms or bounds, faces, triplicity rulers, combustion orbs, planetary hours, sect, the lots) are checked against a source before writing, through wiki.sh, and cited.
- What Joana does: her forecast (AGS) uses transits of Jupiter to Pluto, Chiron and the true node, secondary progressions, solar arcs, the solar return, profections and zodiacal releasing. AGS draws no composite, Davison, asteroid, fixed-star or harmonic charts: describe those as techniques without saying she uses them. Her synastry counts only contacts with at least one personal body.
- Asteroids (Ceres, Pallas, Juno, Vesta): no ephemeris here, so no sign periods; orbital period and discovery only from a checked source. "What held in my tests": the notebook covered the Sun, Moon, rising sign, each planet, Chiron and Lilith; the asteroid wasn't in it.
- Ethics pages state Joana's practice as the guide's Voice section gives it, and point to real help (a doctor, a lawyer, a qualified professional); no legal or medical claim without an exact official source; helplines only as the site's Disclaimers page lists them.
