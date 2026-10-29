// Find pages in the page plan by their English or French title, so a writer links to the address the
// plan fixed rather than one that looks right. Every word must appear in the title (any case, accents
// ignored); quotes keep words together.
//
//   node tools/plan/find.mjs "Sun in"              → every "Sun in …" page
//   node tools/plan/find.mjs "Moon square"         → Moon square Mercury, Moon square Venus…
//   node tools/plan/find.mjs aries rising
//
// One line per page: English path · French path · English title · French title · kind · tier/batch

import { readFile } from 'node:fs/promises';

const plan = JSON.parse(await readFile(new URL('../../plan/pages.json', import.meta.url), 'utf8'));
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = process.argv.slice(2).map(fold).filter(Boolean);
if (!words.length) {
  console.error('usage: node tools/plan/find.mjs <words of the title>');
  process.exit(1);
}
const hits = plan.pages.filter((p) => words.every((w) => fold(`${p.en} ${p.fr}`).includes(w)));
for (const p of hits.slice(0, 200)) {
  console.log([p.path, p.pathFr, p.en, p.fr, p.kind, `tier ${p.tier}${p.batch ? ` batch ${p.batch}` : ''}`, p.status].join(' · '));
}
if (hits.length > 200) console.log(`… and ${hits.length - 200} more: add a word`);
if (!hits.length) console.log('nothing in the plan: check the title, or ask before linking anywhere else');
