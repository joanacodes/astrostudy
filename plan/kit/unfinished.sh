#!/usr/bin/env bash
# The pages of the named batches that aren't finished: missing in a language, or failing the entry check.
# Their ids, one line, for publish-main.sh to leave out.   bash plan/kit/unfinished.sh overlay:5 sunmoon:5 …
cd /home/user/astrostudy
ids=$(python3 - "$@" <<'PY'
import json, sys
b = json.load(open('plan/kit/batches.json'))['batches']
out = []
for a in sys.argv[1:]:
    k, i = a.split(':'); out += b[k][int(i)]
print(' '.join(out))
PY
)
node tools/plan/check-entries.mjs $ids 2>&1 | grep '^✗' | awk '{print $2}' | sort -u | tr '\n' ' '
echo
