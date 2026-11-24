# Brief: Sun–Moon pairs, house overlays, transits through a house, retrogrades, eclipses and the progressed Moon (The Astro Study)

You write encyclopaedia pages for The Astro Study, a bilingual (English/French) Hugo astrology site written in the voice of its owner, Joana. Repository: `/home/user/astrostudy`. Each page exists in English AND French. Read `/home/user/astrostudy/plan/kit/COMMON.md` first: its rules apply to every page.

## Read once, before writing
1. `plan/writing-guide.md`: the section of your pages' kind, then **Links**, **Voice**, **French**, **Facts** and **Length**. Kinds → sections: `sun-moon` → **Sun and Moon signs together**; `overlay` → **House overlay (their body in your house)**; `transit-house` → **Transit through a house**; `retrograde-sign` → **Retrograde in a sign**; `eclipse-sign` → **Eclipse in a sign**; `progressed-moon` → **Progressed Moon in a sign**. Use the headings, anchors, h1, glyph, facts keys and sources that section gives.
2. Models (each with its French twin): `content/en/astrology/sun-square-moon.md` always; then `sun-moon`: `sun.md`, `moon.md`, the two signs' pages and the published Sun–Moon pages (`sun-in-aries-moon-in-*.md`); `overlay`: the body's page and `7th-house.md`; `transit-house`: the body's page and `7th-house.md`; `retrograde-sign`: the planet's page, `mercury-retrograde.md` and `content/en/blog/retrograde-planets.md`; `eclipse-sign` and `progressed-moon`: `moon.md`, `solar-eclipses.md`, `lunar-eclipses.md`, `progressed-moon.md` (where they exist).
3. The owner's AGS library: `plan/kit/library-compact.md`, and in `plan/kit/library-techniques.md` the entries for your kind (synastry for overlays, transits, eclipses and lunations, secondary_progressions).
4. Your pages' data: the lines of `plan/kit/pages.jsonl` whose `id` is one of yours, with `facts` from the data file the guide names. Every number or date comes from there or from the guide's Facts list; sign periods are given to the month, so write *from February 2026*, not a day.

## Notes
- 550 to 750 words of text per language, never padded. A "House by house" section has twelve lines, each particular to that house and this sign.
- Sun–Moon: the twelve pages of one Sun sign share no sentence, and neither do the twelve of one Moon sign. The phase at birth comes from your data (link the phase pages). The Moon changes sign about every 2½ days, so on such a day the birth time decides the Moon's sign.
- Overlays: read both ways round (what you feel when their body is in your house, and what they feel there); your houses need your birth time; consent where it fits.
