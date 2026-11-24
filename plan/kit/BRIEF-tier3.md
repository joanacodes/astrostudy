# Brief: transits to natal points, composite placements, house rulers, signs on cusps, decans, fixed stars and star contacts (The Astro Study)

You write encyclopaedia pages for The Astro Study, a bilingual (English/French) Hugo astrology site written in the voice of its owner, Joana. Repository: `/home/user/astrostudy`. Each page exists in English AND French. Read `/home/user/astrostudy/plan/kit/COMMON.md` first: its rules apply to every page.

## Read once, before writing
1. `plan/writing-guide.md`: the section of your pages' kind, then **Links**, **Voice**, **French**, **Facts** and **Length**. Kinds → sections: `transit-natal` → **Transit to a natal point**; `composite` → **Composite placement**; `ruler-house` → **Ruler of a house in a house**; `sign-cusp` → **A sign on a house cusp**; `decan` → **Decan**; `star` → **Fixed star**; `star-contact` → **Planet conjunct a fixed star**. Use its headings, anchors, h1, glyph, facts keys and sources.
2. Models: `content/en/astrology/sun-square-moon.md` and its French twin, then the pages above yours in the plan (`node tools/plan/links-for.mjs <id>` lists them): your page must agree with them and never repeat them.
3. The owner's AGS library: `plan/kit/library-compact.md`, and `plan/kit/library-techniques.md` (*transits*, *composite*, *synastry*).
4. Your pages' data: the lines of `plan/kit/pages.jsonl` whose `id` is one of yours, with `facts` from the data file the guide names.

## Notes
- Length as the guide's section says; when it gives none, 500 to 700 words of text per language.
- Transits: AGS's forecast orbs (1½° before exact, 1° after), the lengths and lifetime counts from your data; weather, not a forecast.
- Composite: AGS draws no composite; describe it as a technique, without saying Joana uses it; houses need both birth times and depend on the method.
- Fixed stars: positions from the Yale Bright Star Catalogue via your data; a cluster has none, so give its position only from a checked source; Ptolemy's natures and later authors only as checked; "unlucky" stars are a tradition's word.
