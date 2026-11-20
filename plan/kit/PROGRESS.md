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

## Running (agent ids, for SendMessage after a container restart)
- sunmoon[4] aff2962e669e99998 · sunmoon[5] a144dd7551aaea9c7 · overlay[3] adb352598fde05a58 · transit[1] a795db51273c912d3
- overlay[4] a9f3825b0211a6b0b · cycles[1] aca101aad54363d35
- sunmoon[3] a9e788466d03660fa · overlay[5] ab899a66c2c276479
- done since restart: dark mode (4fdde73, 90b6ec6, 0f17d53) · syn[4] leftovers + syn[11] (4d6c424) · syn[8] (in WIP commits) · syn[10] (2707169) · overlay[0] (36d02aa) · syn[7] (1dabb0b) · syn[9] (50d2eaa) · sunmoon[0] leftovers + sunmoon[1] (5bf0895) · syn[13] (b529af0) · syn[15] (in WIP commits) · sunmoon[2] (bcf9d8a) · syn[12] (8790fcd) · overlay[1] (in WIP commits) · overlay[2] (3078909) · syn[14] (6adbed9): every synastry batch done · transit[0] (6cdd612) · cycles[0] (in WIP commits) · t2patterns (3d7dc58) · Saturn house stay 'about three years' on the house pages (ccea722) · moon.md birth-time fix (37600e8)
- on main: 46e7daf (dark mode + 270 pages), deployed 23:03 UTC
- next: overlay[6], transit[2..3], cycles[2], t2concepts[0..4], t2tech, t2research[0..2], t2asteroids, stars, then tier 3

## Data to check
- plan/retrograde-facts.json files the 2040 Mercury retrograde under Gemini (both stations in Cancer, 9°32′ to 0°31′) and the 2015 one under Virgo (both in Libra, 15°55′ to 0°53′). The sign pages describe them by their stations.

- trapeze and envelope (patterns): no checkable source defines them, so the envelope page gives no geometry and the trapeze only its outline.

## Publishing to main
Worktree from origin/main; git merge --no-ff --no-commit origin/claude/astrostudy-website-tdhyzt; git rm the files of
batches still being written; hugo build + node tools/check-links.mjs <out> + node tools/plan/check-entries.mjs --published;
commit without [skip ci]; git push origin HEAD:main. Files left out last time and changed since may conflict: take the
branch's version. All of it in one command: bash plan/kit/publish-main.sh [--dry-run] "<title>" <batch:index | id>… (the
running batches, left out).
