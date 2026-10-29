// French typography for the French pages: a non-breaking space before a colon and inside « », a narrow
// one before ; ? ! and %, curly apostrophes. Run it on a French Markdown file after writing it; it changes
// nothing that is already right. What isn't prose is left alone: link targets, anchors, code, tags and
// addresses in the text, and in the front matter everything outside the quoted strings (the keys).
//
//   node tools/fr-typography.mjs content/fr/astrology/sun.md [more files…]
//
// check-entries.mjs imports frenchTypography() to refuse a French entry the fixer would still change.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const NBSP = '\u00a0';
const NNBSP = '\u202f';
const GAP = '[ \\u00a0\\u202f]*';

const prose = (t) =>
  t
    .replace(new RegExp(`([^\\s:])${GAP}:(?=[\\s*_»)\uE000]|$)`, 'g'), `$1${NBSP}:`)
    .replace(new RegExp(`([^\\s;?!])${GAP}([;?!])(?=[\\s*_»)"\uE000]|$)`, 'g'), `$1${NNBSP}$2`)
    .replace(new RegExp(`«${GAP}`, 'g'), `«${NBSP}`)
    .replace(new RegExp(`${GAP}»`, 'g'), `${NBSP}»`)
    .replace(/(\d)[ \u00a0\u202f]?%/g, `$1${NNBSP}%`)
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2');

// The parts to keep are set aside behind a marker, the rest is fixed, and they are put back: a colon
// right after a link, as in "[Soleil](/astrology/sun/) :", is still seen as following a word, and a
// question mark that ends a link's text, as in "[Quelle Lilith est la mienne ?](…)", as ending a word.
const KEEP = /\]\([^)]*\)|\{#[^}]*\}|`[^`]*`|<[^>]+>|https?:\/\/[^\s")\]]+/g;
const fix = (s) => {
  const kept = [];
  const masked = s.replace(KEEP, (m) => `\uE000${kept.push(m) - 1}\uE001`);
  return prose(masked).replace(/\uE000(\d+)\uE001/g, (_, i) => kept[Number(i)]);
};

const QUOTED = /"((?:[^"\\]|\\.)*)"/g;

export function frenchTypography(src) {
  let fence = 0;
  return src
    .split('\n')
    .map((line) => {
      if (line.trim() === '---' && fence < 2) {
        fence += 1;
        return line;
      }
      return fence === 1 ? line.replace(QUOTED, (_, inner) => `"${fix(inner)}"`) : fix(line);
    })
    .join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const file of process.argv.slice(2)) {
    const src = await readFile(file, 'utf8');
    const next = frenchTypography(src);
    if (next !== src) {
      await writeFile(file, next);
      console.log(`fixed ${file}`);
    }
  }
}
