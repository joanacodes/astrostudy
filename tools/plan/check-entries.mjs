// Holds every written encyclopaedia entry to the page plan and the rules of its kind, in both languages,
// before anything is built: the address and slug the plan fixed, the front matter Google and AI
// assistants read (a 40–60 word definition, a description that fits a results page, questions without
// links), one anchored heading per section of its kind, every page its kind must link to, links only to
// pages that exist or are planned, anchors that exist in the language they're written in, and French
// typography. Errors stop the run with exit code 1; warnings are for the writer to weigh.
//
//   node tools/plan/check-entries.mjs             → every entry the plan knows that has a file
//   node tools/plan/check-entries.mjs moon aries  → those
//   node tools/plan/check-entries.mjs --published → only the entries that aren't drafts (the deploy)
//
// The front matter is read with patterns for the shapes the entries use (one "key: value" per line,
// lists as "- { k: …, v: … }" or "- q: …" then "a: …"): an entry written another way is refused as
// unreadable rather than checked wrongly.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { entry, rulesFor, byPath, plan, SITE } from './rules.mjs';
import { frenchTypography } from '../fr-typography.mjs';

const root = new URL('../../', import.meta.url);
const file = (lang, path) => new URL(`content/${lang}/${path}`, root);
const MIN_WORDS = { pillar: 900, sign: 900, house: 900, 'aspect-type': 700, concept: 600 };

const unquote = (s) => s.replace(/\\"/g, '"');
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}’'-]*/gu) || []).length;

// the shapes a front matter line may take; anything else (a quote left unescaped, a value over two lines)
// would be read differently by Hugo than by this check, so it is refused
const STR = '"(?:[^"\\\\]|\\\\.)*"';
const LINE = [
  new RegExp(`^[a-z][a-z0-9_]*: ${STR}$`),
  /^[a-z][a-z0-9_]*: (?:true|false|-?\d+(?:\.\d+)?|\d{4}-\d{2}-\d{2})$/,
  new RegExp(`^[a-z][a-z0-9_]*: \\[(?:${STR}(?:, ${STR})*)?\\]$`),
  /^[a-z][a-z0-9_]*:$/,
  new RegExp(`^  - \\{ [a-z]+: ${STR}(?:, [a-z]+: ${STR})* \\}$`),
  new RegExp(`^  - q: ${STR}$`),
  new RegExp(`^    a: ${STR}$`),
];

function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const [, head, body] = m;
  const unreadable = head.split('\n').map((l, i) => [l, i + 2]).filter(([l]) => !LINE.some((r) => r.test(l)));
  const scalar = (key) => {
    const x = head.match(new RegExp(`^${key}: (?:"((?:[^"\\\\]|\\\\.)*)"|([^\\s"].*))$`, 'm'));
    return x ? unquote(x[1] ?? x[2]) : undefined;
  };
  const block = (key) => {
    const x = head.match(new RegExp(`^${key}:\\n((?:[ ].*\\n?)*)`, 'm'));
    return x ? x[1] : '';
  };
  const strings = (s) => [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => unquote(x[1]));
  const related = head.match(/^related: \[(.*)\]$/m);
  const faq = [...block('faq').matchAll(/- q: "((?:[^"\\]|\\.)*)"\n\s+a: "((?:[^"\\]|\\.)*)"/g)].map((x) => ({ q: unquote(x[1]), a: unquote(x[2]) }));
  const sources = block('sources').split('\n').filter((l) => l.trim().startsWith('- {')).map((l) => ({
    title: l.match(/title: "((?:[^"\\]|\\.)*)"/)?.[1], url: l.match(/url: "([^"]*)"/)?.[1], page: l.match(/page: "([^"]*)"/)?.[1] }));
  const facts = block('facts').split('\n').filter((l) => l.trim().startsWith('- {')).length;
  return {
    body, head,
    title: scalar('title'), h1: scalar('h1'), slug: scalar('slug'), description: scalar('description'),
    date: scalar('date'), reviewed: scalar('reviewed'), draft: scalar('draft'), family: scalar('family'),
    weight: scalar('weight'), glyph: scalar('glyph'), definition: scalar('definition'),
    terms: head.match(/^terms: \[(.*)\]$/m) ? strings(head.match(/^terms: \[(.*)\]$/m)[1]) : [],
    related: related ? strings(related[1]) : [], faq, faqItems: (block('faq').match(/^\s*- q:/gm) || []).length,
    sources, facts, unreadable,
  };
}

// the anchors a page of the site has in one language: its own {#…} headings
const anchorCache = new Map();
async function anchors(lang, path) {
  const key = `${lang}${path}`;
  if (!anchorCache.has(key)) {
    const name = path.replace(/^\/|\/$/g, '');
    const f = file(lang, `${name}.md`);
    anchorCache.set(key, existsSync(f) ? [...(await readFile(f, 'utf8')).matchAll(/\{#([^}\s]+)\}/g)].map((x) => x[1]) : null);
  }
  return anchorCache.get(key);
}

const norm = (d) => {
  const path = d.split(/[#?]/)[0];
  return path.endsWith('/') ? path : `${path}/`;
};

async function check(id, lang, problems) {
  const say = (level, text) => problems.push({ id, lang, level, text });
  const e = entry(id);
  const f = file(lang, `astrology/${id}.md`);
  if (!existsSync(f)) { say('error', 'no file'); return null; }
  const src = await readFile(f, 'utf8');
  const fm = frontMatter(src);
  if (!fm) { say('error', 'no front matter between --- lines'); return null; }
  for (const [l, n] of fm.unreadable) say('error', `front matter line ${n} isn't in a shape the entries use: ${l.slice(0, 70)}`);

  for (const key of ['title', 'h1', 'description', 'date', 'reviewed', 'family', 'weight', 'glyph', 'definition']) {
    if (!fm[key]) say('error', `front matter: no ${key} (or not on one line as key: "value")`);
  }
  if (lang === 'fr') {
    const slug = e.pathFr.split('/').filter(Boolean).pop();
    if (fm.slug !== slug) say('error', `slug is "${fm.slug ?? ''}", the plan says "${slug}"`);
  } else if (fm.slug) say('error', 'an English entry takes its address from its file name: no slug');
  if (fm.family && fm.family !== e.family) say('error', `family is "${fm.family}", the plan says "${e.family}"`);
  if (fm.definition) {
    const n = words(fm.definition);
    if (n < 40 || n > 60) say('error', `definition is ${n} words: 40 to 60`);
  }
  if (fm.description && (fm.description.length > 160 || fm.description.length < 110)) {
    say('warning', `description is ${fm.description.length} characters: 110 to 160 shows whole in search results`);
  }
  if (fm.faqItems !== fm.faq.length) say('error', 'a question without its answer on the next line ("a: …")');
  if (fm.faq.length < 3) say('error', `${fm.faq.length} questions: at least 3`);
  for (const { q, a } of fm.faq) {
    if (/\]\(|https?:/.test(a)) say('error', `the answer to "${q}" has a link: answers are read as plain text`);
    if (!/\?$/.test(q)) say('warning', `"${q}" doesn't end with a question mark`);
  }
  if (!fm.sources.length) say('error', 'no sources');
  for (const s of fm.sources) if (!s.title) say('error', 'a source without a title');
  if (fm.facts < 4) say('warning', `${fm.facts} quick facts: 4 or more`);
  for (const r of fm.related) {
    const p = norm(r);
    if (!byPath.has(p) && !SITE.has(p)) say('error', `related: ${r} is neither a page of the plan nor of the site`);
  }

  // the sections: one ## heading each, with an anchor, Questions coming from the faq
  const kind = plan.kinds[e.kind];
  const heads = [...fm.body.matchAll(/^## (.*)$/gm)].map((x) => x[1]);
  const ids = [];
  for (const h of heads) {
    const a = h.match(/\{#([a-z0-9-]+)\}\s*$/);
    if (!a) say('error', `heading "${h}" has no {#anchor}`);
    else ids.push(a[1]);
  }
  if (new Set(ids).size !== ids.length) say('error', 'two headings share an anchor');
  if (kind && heads.length !== kind.en.length - 1) {
    say('error', `${heads.length} sections, the ${e.kind} kind has ${kind.en.length - 1} before the questions: ${kind[lang].slice(0, -1).join(' · ')}`);
  }
  if (/^# /m.test(fm.body)) say('error', 'a # heading in the text: the page title is the h1, sections are ##');

  // the links of the text (the related list and the sources don't count)
  const dests = [...fm.body.matchAll(/\]\(([^)\s]+)\)/g)].map((x) => x[1]);
  const linked = new Set();
  for (const d of dests) {
    if (/^(https?:|mailto:|#)/.test(d)) continue;
    const p = norm(d);
    linked.add(p);
    if (p === e.path) say('error', `links to itself: ${d}`);
    const known = byPath.has(p) || SITE.has(p);
    if (!known) say('error', `links to ${d}, which is neither a page of the plan nor of the site`);
    const anchor = d.split('#')[1];
    if (anchor) {
      const list = await anchors(lang, p);
      if (!list) say('warning', `links to the anchor #${anchor} of a page not written yet: check it once it is`);
      else if (!list.includes(anchor)) say('error', `#${anchor} isn't an anchor of ${p} in this language${lang === 'fr' ? ' (French pages have French anchors)' : ''}`);
    }
  }
  const rules = rulesFor(id) || [];
  for (const g of rules) {
    const have = g.pages.filter((p) => linked.has(p));
    if (have.length < g.need) {
      const missing = g.pages.filter((p) => !linked.has(p));
      say('error', `${g.section}: ${have.length} of ${g.need} linked${g.need === g.pages.length ? ` — missing ${missing.join(' ')}` : ''}`);
    }
  }

  const n = words(fm.body.replace(/\]\([^)]*\)|\{#[^}]*\}/g, ''));
  if (n < (MIN_WORDS[e.kind] ?? 500)) say('warning', `${n} words of text: ${MIN_WORDS[e.kind] ?? 500} or more for a ${e.kind} entry`);
  for (const pct of fm.body.matchAll(/(\d+)\s?[%]|(\d+)\u202f%/g)) {
    const v = pct[1] ?? pct[2];
    if (!['30', '40', '75', '90'].includes(v)) say('warning', `${v}%: the notebook's figures are 30 to 40% and 75 to 90% — check this one`);
  }
  if (lang === 'fr' && frenchTypography(src) !== src) say('error', `French typography: run node tools/fr-typography.mjs content/fr/astrology/${id}.md`);
  return { heads: heads.length, linked };
}

const published = process.argv.includes('--published');
const named = process.argv.slice(2).filter((a) => !a.startsWith('--'));
let ids = named.length
  ? named
  : (await readdir(new URL('content/en/astrology/', root))).filter((f) => f.endsWith('.md') && f !== '_index.md').map((f) => f.slice(0, -3)).filter((id) => entry(id));
if (published) {
  const live = [];
  for (const id of ids) if (!/^draft: true$/m.test(await readFile(file('en', `astrology/${id}.md`), 'utf8'))) live.push(id);
  ids = live;
}

const problems = [];
let clean = 0;
for (const id of ids) {
  if (!entry(id)) {
    problems.push({ id, lang: '—', level: 'error', text: 'not in the plan' });
    continue;
  }
  const before = problems.length;
  const en = await check(id, 'en', problems);
  const fr = await check(id, 'fr', problems);
  if (en && fr) {
    const onlyEn = [...en.linked].filter((p) => !fr.linked.has(p));
    const onlyFr = [...fr.linked].filter((p) => !en.linked.has(p));
    if (onlyEn.length || onlyFr.length) {
      problems.push({ id, lang: 'en/fr', level: 'warning', text: `the two languages link differently: ${onlyEn.map((p) => `${p} (English only)`).concat(onlyFr.map((p) => `${p} (French only)`)).join(', ')}` });
    }
  }
  if (problems.length === before) clean += 1;
}

for (const p of problems) console.log(`${p.level === 'error' ? '✗' : '!'} ${p.id} [${p.lang}] ${p.text}`);
const errors = problems.filter((p) => p.level === 'error').length;
console.log(`\n${ids.length} entries checked: ${clean} clean, ${errors} errors, ${problems.length - errors} warnings`);
process.exit(errors ? 1 : 0);
