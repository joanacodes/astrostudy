#!/usr/bin/env bash
# wip.sh: commit and push whatever the writers have on disk under content/, without the deploy check ([skip ci]),
# until the working tree's content is clean
cd /home/user/astrostudy
for k in 1 2 3 4; do
  git add -A content
  git diff --cached --quiet || git commit -q -m "[skip ci] Work in progress: pages the writers have under way (EN/FR)

Pages still being written; each batch is committed again, checked, when its writer finishes. Only finished
pages go to main.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LYuYY9b3F66UY1XDinLm1L"
  for i in 0 2 4 8; do [ $i -gt 0 ] && sleep $i; git push -q -u origin claude/astrostudy-website-tdhyzt 2>&1 && break; done
  [ "$(git status --short content | wc -l)" = "0" ] && break
done
git status --short | wc -l
