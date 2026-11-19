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

## Publishing to main
Worktree from origin/main; git merge --no-ff --no-commit origin/claude/astrostudy-website-tdhyzt; git rm the files of
batches still being written; hugo build + node tools/check-links.mjs <out> + node tools/plan/check-entries.mjs --published;
commit without [skip ci]; git push origin HEAD:main. Files left out last time and changed since may conflict: take the
branch's version.
