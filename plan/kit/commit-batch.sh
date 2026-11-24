#!/usr/bin/env bash
# commit-batch.sh "<title>" <ids…> — check a finished batch, commit only its pages (EN/FR) and push, without the
# deploy check ([skip ci]); the deploy check runs on main, where only finished pages go.
set -e
cd /home/user/astrostudy
title="$1"; shift
out=$(node tools/plan/check-entries.mjs "$@" 2>&1 | tail -1)
echo "$out"
case "$out" in *" 0 errors"*) ;; *) echo "not committed: the check found errors"; exit 1;; esac
for i in "$@"; do for l in en fr; do f="content/$l/astrology/$i.md"; [ -f "$f" ] && git add "$f"; done; done
if git diff --cached --quiet; then echo "already committed in full (work-in-progress commits)"; exit 0; fi
git commit -q -m "[skip ci] $title (EN/FR)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018jKMK9BPQVbgBpXXSDVL8J"
for i in 0 2 4 8 16; do [ $i -gt 0 ] && sleep $i; git push -q -u origin claude/astrostudy-website-tdhyzt && break; done
git log --oneline -1
