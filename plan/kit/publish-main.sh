#!/usr/bin/env bash
# Publishes to main everything finished on the writing branch, leaving out the pages still being written.
# A page in a running batch may be half written in one language, so it stays on the branch until its
# writer has finished and commit-batch.sh has checked it; a link to it shows as plain text until then
# (layouts/_markup/render-link.html), so leaving it out breaks nothing.
#
#   bash plan/kit/publish-main.sh "<commit title>" <batch:index | page id>…
#   e.g. bash plan/kit/publish-main.sh "Dark mode and 220 new pages" syn:7 syn:8 overlay:0 sun-in-taurus-moon-in-sagittarius
#
# Add --dry-run as the first argument to build and check without committing or pushing.
set -euo pipefail
dry=0
if [ "${1:-}" = "--dry-run" ]; then dry=1; shift; fi
title="$1"; shift
repo=/home/user/astrostudy
branch=claude/astrostudy-website-tdhyzt
wt=/home/user/astrostudy-main-wt
out=/home/user/astrostudy-main-public
cd "$repo"
for i in 2 4 8 16; do git fetch -q origin main "$branch" && break || sleep $i; done

# Page ids left out: every page of the named batches, plus any id named directly.
leftout=$(python3 - "$@" <<'EOF'
import json, sys
b = json.load(open('plan/kit/batches.json'))['batches']
ids = []
for a in sys.argv[1:]:
    if ':' in a:
        k, i = a.split(':')
        ids += b[k][int(i)]
    else:
        ids.append(a)
print(' '.join(ids))
EOF
)

git worktree remove --force "$wt" 2>/dev/null || rm -rf "$wt"
git worktree prune
git worktree add -q --detach "$wt" origin/main
cd "$wt"
if ! git merge -q --no-ff --no-commit "origin/$branch" 2>/dev/null; then
  # Files left out of an earlier push and changed since: the branch's version is the newer one.
  for f in $(git diff --name-only --diff-filter=U); do git checkout -q --theirs -- "$f"; git add "$f"; done
fi

n=0
for id in $leftout; do
  for lang in en fr; do
    f="content/$lang/astrology/$id.md"
    if git cat-file -e "origin/main:$f" 2>/dev/null; then
      git checkout -q origin/main -- "$f"
    elif [ -e "$f" ]; then
      git rm -q -f "$f"; n=$((n+1))
    fi
  done
done
echo "left out: $n files of pages still being written"

rm -rf "$out"
/root/bin/hugo --gc --minify -d "$out" --quiet
node tools/check-links.mjs "$out" | tail -3
node tools/plan/check-entries.mjs --published | tail -1
added=$(git diff --cached --name-only --diff-filter=A origin/main -- content/en/astrology | wc -l)
echo "new English entries going live: $added"

if [ $dry = 1 ]; then echo "dry run: nothing committed"; exit 0; fi
git commit -q -m "$title

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018jKMK9BPQVbgBpXXSDVL8J"
for i in 2 4 8 16; do git push -q origin HEAD:main && break || sleep $i; done
git log --oneline -1
