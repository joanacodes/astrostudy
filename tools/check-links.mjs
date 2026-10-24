// The links of the built site, checked before it goes out. Internal links are how readers and search
// engines travel through the site: a broken one is a dead end, and an article that links nowhere leaves
// its reader, and Google, with nowhere to go next. So, over every page of the build:
//
//   - every internal link, picture and #anchor must lead somewhere: a broken one stops the deploy;
//   - every blog article must link to at least 3 other pages from its own text (5 or more is the aim):
//     fewer stops the deploy;
//   - warnings, which don't stop it: an article under 5 links or an entry under 3, an article or entry
//     that no text links to, and an article that names an encyclopaedia entry without linking it.
//
// It also writes the link map: every article, entry and page, in each language, with its headings, the
// pages its text links to and the texts that link to it. The map is read off the build, so it is never
// out of date; in the deploy it goes on the run's summary page.
//
// "Its own text" is the element the templates mark with data-body: the cards and lists around it are
// built automatically, so they don't count. The site's address comes from the home page's canonical link,
// so the same check works on the GitHub Pages preview (under /astrostudy/) and on astrostudy.co.uk.
//
//   node tools/check-links.mjs public [--map link-map.md]

import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const mapAt = args.indexOf('--map');
const mapFile = mapAt >= 0 ? args[mapAt + 1] : null;
const root = args.find((a, i) => !a.startsWith('--') && (mapAt < 0 || i !== mapAt + 1)) || 'public';
const errors = [];
const warnings = [];

async function walk(dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    : entities[e.toLowerCase()] ?? m);
// the words of a bit of HTML, without the planet and sign symbols drawn before headings
const words = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/[←-⇿☀-➿︎]/g, '')
  .replace(/\s+/g, ' ').replace(/^[\s/]+/, '').trim();

// attribute values, quoted or not (the minified HTML drops quotes where it can)
const attrRe = (names) => new RegExp(`\\s(${names})=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
const valueOf = (m) => decode(m[2] ?? m[3] ?? m[4] ?? '');

const files = await walk(root);
const fileSet = new Set(files.map((f) => relative(root, f).split(sep).join('/')));

const homeHtml = await readFile(join(root, 'index.html'), 'utf8');
const canonTag = homeHtml.match(/<link\b[^>]*\brel=["']?canonical\b[^>]*>/i);
const canonHref = canonTag && [...canonTag[0].matchAll(attrRe('href'))][0];
if (!canonHref) {
  console.log(`::error::No canonical link on ${root}/index.html: can't tell the site's address.`);
  process.exit(1);
}
const site = new URL(valueOf(canonHref));
const base = site.pathname.endsWith('/') ? site.pathname : `${site.pathname}/`;

// a file of the build → the address it's served at, and back
const pathOf = (rel) => base + rel.replace(/(^|\/)index\.html$/, '$1');
function fileFor(path) {
  if (!path.startsWith(base)) return null; // e.g. "/blog/…" on the preview, which lives under /astrostudy/
  let rel = path.slice(base.length);
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  if (fileSet.has(rel)) return rel;
  if (fileSet.has(`${rel}/index.html`)) return `${rel}/index.html`;
  return null;
}
function resolve(raw, from) {
  const u = raw.trim();
  if (!u || /^(mailto|tel|javascript|data|blob):/i.test(u)) return null;
  let url;
  try {
    url = new URL(u, new URL(from, site));
  } catch {
    return { raw: u, path: null };
  }
  if (url.host !== site.host) return null; // other sites aren't ours to check
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch { /* keep it as written */ }
  return { raw: u, path, frag: decodeURIComponent(url.hash.slice(1)) };
}

// the element marked data-body, up to its own closing tag
function bodyOf(html) {
  const open = html.match(/<div\b[^>]*\bdata-body=["']?(article|entry|page)\b[^>]*>/i);
  if (!open) return null;
  const start = open.index + open[0].length;
  const tags = /<(\/?)div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 1;
  let end = html.length;
  for (let m; (m = tags.exec(html)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) {
      end = m.index;
      break;
    }
  }
  const terms = [...open[0].matchAll(attrRe('data-terms'))].map(valueOf)[0];
  return { kind: open[1], html: html.slice(start, end), terms: terms ? terms.split('|').filter(Boolean) : [] };
}

const pages = new Map();
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const rel = relative(root, file).split(sep).join('/');
  const html = await readFile(file, 'utf8');
  const ids = new Set([...html.matchAll(attrRe('id'))].map(valueOf));
  const lang = (html.match(/<html\b[^>]*\blang=["']?([\w-]+)/i) || [])[1] || '';
  // the page's own name, as its <title> gives it, without the site's name after it
  const title = words((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || rel).replace(/\s+·\s+[^·]+$/, '');
  pages.set(pathOf(rel), { path: pathOf(rel), rel, html, ids, lang, title, body: bodyOf(html) });
}

// 1. every link, picture and anchor leads somewhere
let checked = 0;
for (const page of pages.values()) {
  const urls = [...page.html.matchAll(attrRe('href|src|poster'))].map(valueOf);
  for (const m of page.html.matchAll(attrRe('srcset'))) urls.push(...valueOf(m).split(',').map((s) => s.trim().split(/\s+/)[0]));
  for (const m of page.html.matchAll(/<meta\b[^>]*\bproperty=["']?(?:og:image|og:url|twitter:image)(?=["'\s>])[^>]*>/gi)) {
    urls.push(...[...m[0].matchAll(attrRe('content'))].map(valueOf));
  }
  for (const raw of urls) {
    const r = resolve(raw, page.path);
    if (!r) continue;
    checked++;
    const target = r.path && fileFor(r.path);
    if (!target) {
      errors.push(`${page.path} links to ${r.raw}, which doesn't exist`);
      continue;
    }
    if (r.frag && target.endsWith('.html')) {
      const to = pages.get(pathOf(target));
      if (to && !to.ids.has(r.frag)) errors.push(`${page.path} links to ${r.raw}: no #${r.frag} on that page`);
    }
  }
}

// 2. what each text links to, and what links to it
const texts = [...pages.values()].filter((p) => p.body);
for (const p of texts) {
  p.links = new Set();
  for (const m of p.body.html.matchAll(/<a\b[^>]*>/gi)) {
    const href = [...m[0].matchAll(attrRe('href'))].map(valueOf)[0];
    const r = href && resolve(href, p.path);
    const target = r && r.path && fileFor(r.path);
    if (target && target.endsWith('.html') && pathOf(target) !== p.path) p.links.add(pathOf(target));
  }
  p.text = words(p.body.html);
  p.headings = [...p.body.html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => words(m[1]));
}
const inbound = new Map();
for (const p of texts) for (const t of p.links) inbound.set(t, [...(inbound.get(t) || []), p.path]);
const articles = texts.filter((p) => p.body.kind === 'article');
const entries = texts.filter((p) => p.body.kind === 'entry');

for (const a of articles) {
  const n = a.links.size;
  if (n < 3) errors.push(`${a.path} links to only ${n} other page${n === 1 ? '' : 's'} from its text: every article needs at least 3, and 5 or more is the aim`);
  else if (n < 5) warnings.push(`${a.path} links to ${n} other pages from its text; 5 or more is the aim`);
}
for (const e of entries) {
  if (e.links.size < 3) warnings.push(`${e.path} links to ${e.links.size} other pages from its text; 3 or more is the aim`);
}
for (const p of [...articles, ...entries]) {
  if (!inbound.get(p.path)) warnings.push(`${p.path}: no text links to it yet`);
}
for (const a of articles) {
  for (const e of entries) {
    if (e.lang !== a.lang || a.links.has(e.path)) continue;
    const term = e.body.terms.find((t) => a.text.includes(t));
    if (term) warnings.push(`${a.path} names “${term}” without linking ${e.path}`);
  }
}

// 3. the link map, language by language: articles, then entries, then the other pages with a text
const short = (path) => `/${path.slice(base.length)}`;
const cell = (s) => s.replace(/\|/g, '\\|');
const named = (path) => (pages.get(path)?.title || short(path));
const order = { article: 0, entry: 1, page: 2 };
let map = `# Link map\n\n${site.href} · ${new Date().toISOString().slice(0, 10)}. Each text: its headings, the pages it links to, and the texts that link to it.\n`;
for (const lang of [...new Set(texts.map((p) => p.lang))].sort()) {
  map += `\n## ${lang || '?'}\n\n| Page | Headings | Links to | Linked from |\n|---|---|---|---|\n`;
  const rows = texts.filter((p) => p.lang === lang).sort((x, y) => order[x.body.kind] - order[y.body.kind] || x.path.localeCompare(y.path));
  for (const p of rows) {
    const from = inbound.get(p.path) || [];
    map += `| ${cell(p.title)} (${short(p.path)}) | ${cell(p.headings.join(' · ') || '—')} | ${cell([...p.links].map(named).join(' · ') || '—')} | ${cell(from.map(named).join(' · ') || 'nothing yet')} |\n`;
  }
}
if (mapFile) await writeFile(mapFile, map);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, map);

const inCI = !!process.env.GITHUB_ACTIONS;
for (const m of warnings) console.log(inCI ? `::warning::${m}` : `warning: ${m}`);
for (const m of errors) console.log(inCI ? `::error::${m}` : `ERROR: ${m}`);
const fewest = articles.length ? Math.min(...articles.map((a) => a.links.size)) : 0;
console.log(`${checked} internal links on ${pages.size} pages, ${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}. ` +
  `${articles.length} articles (the fewest links in an article's text: ${fewest}), ${entries.length} encyclopaedia entries.`);
process.exit(errors.length ? 1 : 0);
