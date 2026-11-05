// Everything a writer needs before writing an encyclopaedia entry: its addresses and file names, its
// headings in both languages, and the pages its text must link to, section by section, with each page's
// title in English and French so the link text can be written in either language.
//
//   node tools/plan/links-for.mjs moon            → the Moon's entry
//   node tools/plan/links-for.mjs aries 1st-house → several
//
// Links are written with the English path in both languages ([Lune en Bélier](/astrology/moon-in-aries/)).
// A page that isn't published yet shows as plain text and becomes a link the day it is (planned.html).

import { entry, rulesFor, suggestionsFor, byPath, plan } from './rules.mjs';

const title = (path) => {
  const x = byPath.get(path);
  if (x) return `${x.en} · ${x.fr}`;
  return { '/synastry/': 'Synastry readings · Lectures de synastrie', '/how-i-read/': 'How I read · Ma méthode',
    '/birth-chart/': 'Birth chart reading · Lecture de thème natal' }[path] || path;
};

for (const id of process.argv.slice(2)) {
  const e = entry(id);
  if (!e) {
    console.log(`${id}: not in the plan (node tools/plan/find.mjs <words> finds the right id)\n`);
    continue;
  }
  const k = plan.kinds[e.kind];
  console.log(`# ${e.en} · ${e.fr} — ${e.kind}, family "${e.family}", tier ${e.tier}${e.batch ? `, batch ${e.batch}` : ''}`);
  console.log(`English: content/en/astrology/${id}.md → ${e.path}`);
  console.log(`French:  content/fr/astrology/${id}.md, slug "${e.pathFr.split('/').filter(Boolean).pop()}" → ${e.pathFr}`);
  console.log(`Sections: ${k.en.join(' · ')}`);
  console.log(`          ${k.fr.join(' · ')}`);
  console.log('          (the exact headings and anchors of each kind are in plan/writing-guide.md)');
  const rules = rulesFor(id);
  if (!rules) {
    console.log('No link rules for this kind yet.\n');
    continue;
  }
  console.log('\nMust link to, in the text (English paths in both languages):');
  for (const g of rules) {
    const all = g.need === g.pages.length;
    console.log(`\n  ${g.section} — ${all ? (g.pages.length === 1 ? 'this page' : `all ${g.pages.length}`) : `at least ${g.need} of these`}`);
    const shown = g.suggest ? [...g.suggest, ...g.pages.filter((x) => !g.suggest.includes(x))].slice(0, all ? g.pages.length : 12) : g.pages;
    for (const path of shown) console.log(`    ${path}  ${title(path)}`);
    if (shown.length < g.pages.length) console.log(`    … or any other of the ${g.pages.length} pillar pages`);
  }
  const extra = suggestionsFor(id);
  if (extra.length) {
    console.log('\nWorth linking where the text calls for it:');
    for (const path of extra) console.log(`    ${path}  ${title(path)}`);
  }
  console.log('');
}
