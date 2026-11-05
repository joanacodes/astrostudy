// The review page for a writing batch: every entry of the batch as it will look on the site, in English and
// French, with its search result preview, the questions only Joana can answer, and two buttons per
// language: approved, or needs changes. It is published as an artifact; the decisions are kept in the
// artifact's own database (collection "reviews", one document per entry), where Claude reads them to
// publish what's approved and rework the rest. Built from a draft build of the site, so the reviewer
// reads exactly what will go out.
//
//   hugo -D -d /tmp/review-build
//   node tools/plan/review-page.mjs --site /tmp/review-build --batch 1 [--notes notes.json] --out drafts.html
//
// notes.json: { "moon": ["Do you have a Moon example of your own for the tests section?"], … }

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { plan } from './rules.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const site = arg('site');
const batch = Number(arg('batch', '1'));
const out = arg('out', 'drafts.html');
const notes = arg('notes') ? JSON.parse(await readFile(arg('notes'), 'utf8')) : {};
if (!site) throw new Error('--site <draft build folder> is required');

const fam = { planets: 'Planets', angles: 'Angles and nodes', points: 'Liliths, lots and points', signs: 'Signs', houses: 'Houses', aspects: 'Aspects' };
const famOrder = Object.keys(fam);
const pages = plan.pages.filter((p) => p.batch === batch && p.path.startsWith('/astrology/'));
const byEn = new Map(pages.map((p) => [p.path, p.id]));
const byFr = new Map(pages.map((p) => [p.pathFr, p.id]));

// the element that opens at `start`, up to its matching close, counting nested tags of the same name
function element(html, start, tag) {
  const open = new RegExp(`<${tag}[\\s>]|</${tag}>`, 'g');
  open.lastIndex = start + 1;
  let depth = 1;
  for (let m; (m = open.exec(html)); ) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, m.index + m[0].length);
  }
  return '';
}
const inner = (el) => el.replace(/^<[^>]*>/, '').replace(/<\/[a-z0-9]+>$/i, '');
const attr = (s) => (s || '').replace(/^"|"$/g, '');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#x?[0-9a-f]+;|&[a-z]+;/gi, ' ');

// links to other entries of the batch open them on this page; the site's other pages are named, not
// linked (the page isn't on the site); pages not written yet keep their planned look
function relink(html) {
  return html
    .replace(/<a ([^>]*?)href=("[^"]*"|[^\s>]+)([^>]*)>([\s\S]*?)<\/a>/g, (all, pre, href, post, body) => {
      const h = attr(href);
      if (/^https?:/.test(h)) return `<a href="${h}" target="_blank" rel="noopener">${body}</a>`;
      const path = h.split('#')[0];
      const id = byEn.get(path) || byFr.get(path);
      if (id) return `<a href="#${id}" data-go="${id}">${body}</a>`;
      return `<span class="sitelink" title="On the site: ${path}">${body}</span>`;
    })
    .replace(/<span data-planned=("[^"]*"|[^\s>]+)>/g, (all, p) => `<span class="planned" title="Not written yet: ${attr(p)}/">`);
}

function read(file, urlPath) {
  if (!existsSync(file)) return null;
  return readFile(file, 'utf8').then((html) => {
    const main = html.slice(html.indexOf('<main'));
    const pick = (re) => (main.match(re) || [])[1] || '';
    const proseAt = main.search(/<div class=("prose"|prose)/);
    const prose = proseAt >= 0 ? inner(element(main, proseAt, 'div')) : '';
    const qAt = main.indexOf('id=questions');
    const faqAt = qAt >= 0 ? main.indexOf('<div class=faq', qAt) : -1;
    const sources = pick(/<ul class=sources>([\s\S]*?)<\/ul>/);
    return {
      url: urlPath,
      titleTag: (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '',
      description: attr((html.match(/<meta name=description content=("[^"]*"|[^\s>]+)/) || [])[1]),
      h1: pick(/<h1>([\s\S]*?)<\/h1>/),
      definition: pick(/class=short-answer__text>([\s\S]*?)<\/p>/),
      facts: pick(/<dl class=facts-grid[^>]*>([\s\S]*?)<\/dl>/),
      body: relink(prose),
      faq: faqAt >= 0 ? relink(inner(element(main, faqAt, 'div'))) : '',
      sources: relink(sources),
      words: (text(prose).match(/[\p{L}\p{N}][\p{L}\p{N}’'-]*/gu) || []).length,
      links: (prose.match(/<a |<span data-planned/g) || []).length,
      planned: (prose.match(/<span data-planned/g) || []).length,
    };
  });
}

const entries = [];
for (const p of pages) {
  const en = await read(`${site}${p.path}index.html`, p.path);
  const fr = await read(`${site}${p.pathFr}index.html`, p.pathFr);
  entries.push({ id: p.id, family: p.family, kind: p.kind, en: p.en, fr: p.fr, written: Boolean(en && fr), pages: { en, fr }, notes: notes[p.id] || [] });
}
entries.sort((a, b) => famOrder.indexOf(a.family) - famOrder.indexOf(b.family));

const template = await readFile(new URL('./review-page.html', import.meta.url), 'utf8');
const data = JSON.stringify({ batch, families: fam, entries }).replace(/</g, '\\u003c');
await writeFile(out, template.replace('/*DATA*/null', () => data));
const written = entries.filter((e) => e.written).length;
console.log(`${out}: ${entries.length} entries of batch ${batch}, ${written} written in both languages`);
