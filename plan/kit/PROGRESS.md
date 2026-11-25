# Writing the page plan — progress (kit rebuilt in the repo on 2026-11-19 after the scratchpad was cleared)

Kit: plan/kit/ (COMMON.md + BRIEF-*.md for writers; pages.jsonl = page data; batches.json = batches and what is left;
build-kit.py rebuilds both; commit-batch.sh "<title>" <ids…> checks, commits and pushes a finished batch; wip.sh pushes
work in progress under content/; wiki.sh "Title" reads English Wikipedia, the only site the network lets through).

Owner, 2026-11-19 22:40 Paris: "restart, finish dark mode first then push to main, then write all the articles you can
until 3:50 am Paris Friday 20th November" (= 02:50 UTC).

## State at restart
- 1,114 pages written in EN+FR (921 live on main); 2,115 left; 370 held (360 Sabian, 6 sky-calendar, 4 about the owner's
  practice); the 17 country pages wait for network access to official sites.
- Dark mode: agent aaf1d65d39460ffb0 (commits its own files on the branch with [skip ci]).

## State on 20 November, 02:40 UTC (end of the night's run)
- Nothing running. Since the restart on 19 November: 662 pages written in EN+FR (all synastry aspects; 139 of 144 Sun–Moon
  pairs; 164 of 168 house overlays; 77 of 84 transits through a house; Mercury, Venus and Mars retrograde and the progressed
  Moon in each sign; the eclipses by sign; the 21 chart patterns; 16 concept pages), dark mode, and fixes (the Moon page's
  birth-time sentence, Saturn's stay in a house, the four hybrid eclipses).
- Written in both languages: 1,776 of the plan's 3,604 pages; on main: all of them (25d4e7e).
- Left, by batch kind (1,453): transitnatal 415, composite 312, rulerhouse 144, signcusp 132, t3concepts 104, t2concepts 86,
  stars 54, t3people 38, decan 36, starcontact 30, t2research 23, t2tech 18, t3tech 18, countries 17 (network), transit 7
  (chiron-transit-6th to 12th), t3other 6, sunmoon 5 (sun-in-pisces-moon-in-scorpio to pisces), overlay 4
  (lilith-in-9th to 12th-house-synastry), t2asteroids 4. Held: 360 Sabian, 6 sky-calendar, 4 owner pages.
- Tools: commit-batch.sh, wip.sh, publish-main.sh, unfinished.sh, overlap.py (see their headers).

## State on 25 November (end of the writing run)
- Owner, 24 November: "Write them all until you're done", "Push the articles once batches are done", "Keep going until
  all the articles are finished". Done: of the 2,308 pages in pages.jsonl, 2,277 are written in EN+FR. Since 24 November,
  1,387 new pages went live on main (each batch checked, committed and published as it finished): all composites, house
  rulers, signs on cusps, decans, fixed stars and star contacts, people and texts, tier-2 and tier-3 concepts, techniques,
  research, the 7 last Chiron house transits, and the 415 transits to natal points.
- Not written: 17 country pages (the network lets through English Wikipedia only); 14 concepts with no source to check
  them (co-ascendant, polar-ascendant, priapus, transpluto-isis, krusinski, translation-of-light, collection-of-light,
  prohibition, frustration, refranation, almuten, besieging, feral-planets, venus-star-point).
- Written but held off main, their rules unconfirmed (run/held.txt): vernon-clarks-matching-tests, part-of-marriage,
  part-of-children, part-of-the-father, part-of-the-mother, part-of-siblings, part-of-friends, part-of-travel,
  part-of-commerce, decennials, circumambulations.
- Set aside by the owner (25 November): the 360 Sabian symbols. Still held: 6 sky calendars (this-week, year-ahead,
  mercury-retrograde-dates, eclipse-dates, moon-calendar, ingress-calendar: they must stay current, so they need building
  as pages that update themselves) and 4 pages about the owner's practice (her words).
- Transit pages fact-checked against the ephemeris (astronomy-engine, geocentric, true ecliptic of date): 26 figures
  corrected, mostly ages of later hits, a few sign stays and birth spans the writers had worked out themselves.
- Repeated sentences: overlap.py found 92 (EN) and 109 (FR) sentences on two pages or more (679 rewrites); reworded on
  25 November.

## Facts learned on the way
- The data's firstHitAge is the age on the first day within orb (1½° applying), for births every fifth day from
  1 January 1930 at 12:00 UT, so "1945" is a birth on 2 January 1945; the first exact hit comes up to a year later. A page
  quoting other ages says which it uses.
- Joana's forecast (AGS, src/forecast/transits.ts) counts the North Node only by conjunction and opposition: the node's
  sextile, square and trine pages say it doesn't count them. The true node's three-hit passes come from it stepping
  forward: "With a loop", never "retrograde loop".
- The Uranus opposition stays "about 39 to 44½" on every page (uranus-opposition, from 160 births). A finer count, births
  every fifth day, gives 38.0 to 44.5 for the first exact hit: changing it means changing uranus-opposition,
  uranus-return, neptune-square, transits, generational-placements-by-birth-year, the Jupiter and Saturn opposition pages
  and the three Uranus transit pages together.
- Jupiter, Saturn and Uranus sometimes step back into the previous sign for a few months: a span of births "with Jupiter
  in Taurus" that crosses such a gap says "most births from …".

## Data to check
- plan/kit/overlap.py lists sentences two pages share: on 20 November most were the brief's formulas, a few real echoes (the 11th house's one-line definition in four new pages, a 4th-house line in two overlays) to reword later.
- plan/retrograde-facts.json files the 2040 Mercury retrograde under Gemini (both stations in Cancer, 9°32′ to 0°31′) and the 2015 one under Virgo (both in Libra, 15°55′ to 0°53′). The sign pages describe them by their stations.

- trapeze and envelope (patterns): no checkable source defines them, so the envelope page gives no geometry and the trapeze only its outline.

## Publishing to main
Worktree from origin/main; git merge --no-ff --no-commit origin/claude/astrostudy-website-tdhyzt; git rm the files of
batches still being written; hugo build + node tools/check-links.mjs <out> + node tools/plan/check-entries.mjs --published;
commit without [skip ci]; git push origin HEAD:main. Files left out last time and changed since may conflict: take the
branch's version. All of it in one command: bash plan/kit/publish-main.sh [--dry-run] "<title>" <batch:index | id>… (the
running batches, left out).
