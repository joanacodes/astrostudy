// The page plan as one page to browse: viewer.html with plan/pages.json packed inside it, published as
// an artifact from the growth plan. Packed, not fetched, so the page shows the whole tree the moment it
// opens. Run build-plan.mjs first.
//
//   node tools/plan/build-viewer.mjs <out.html>

import { readFile, writeFile } from 'node:fs/promises';

const out = process.argv[2];
if (!out) throw new Error('Say where to write the page: node tools/plan/build-viewer.mjs <out.html>');
const plan = JSON.parse(await readFile(new URL('../../plan/pages.json', import.meta.url), 'utf8'));
const famKeys = Object.keys(plan.families);
const kindKeys = Object.keys(plan.kinds);
const groups = [];
const groupAt = new Map();
const rows = plan.pages.map((p) => {
  const key = `${p.family}|${p.group}`;
  if (!groupAt.has(key)) { groupAt.set(key, groups.length); groups.push([famKeys.indexOf(p.family), p.group, p.groupFr]); }
  return [p.id, famKeys.indexOf(p.family), groupAt.get(key), kindKeys.indexOf(p.kind), p.tier, p.batch ?? -1,
    p.status === 'published' ? 1 : 0, p.en, p.fr, p.path, p.pathFr, p.up.join(' '), p.across.join(' ')];
});
const data = {
  built: plan.built,
  batches: plan.batches,
  families: famKeys.map((k) => [k, ...plan.families[k]]),
  groups,
  kinds: kindKeys.map((k) => [k, plan.kinds[k].en, plan.kinds[k].fr]),
  rows,
};
// the viewer reads kinds and families by position
data.kinds = Object.fromEntries(data.kinds.map((k, i) => [i, k]));
data.families = Object.fromEntries(data.families.map((f, i) => [i, f]));
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const html = (await readFile(new URL('./viewer.html', import.meta.url), 'utf8')).replace('/*DATA*/', () => json);
await writeFile(out, html);
console.log(`${out}: ${rows.length} pages, ${(html.length / 1024).toFixed(0)} KB`);
