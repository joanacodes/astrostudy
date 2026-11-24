// The categories and tags of every encyclopaedia entry, worked out from the page plan, in English and
// French. The category is the shelf the entry sits on, and shares the blog's names where they meet
// (Placements, Synastry, Astrology tested, Readings). The tags say what the entry is about: its planets,
// points, signs, houses, aspects and stars, then the technique. Hugo's related pages (hugo.toml,
// [related]) read both to fill the "Must reads" slideshow under every entry and article. The structured
// data carries them too, as the article's section and keywords.
//
//   node tools/plan/tags.mjs moon-in-aries          → what that entry gets, in both languages
//   node tools/plan/tags.mjs --write                → writes them into every entry that has a file
//   node tools/plan/tags.mjs moon-in-aries --write  → into those
//
// They sit in the front matter as `categories:` and `tags:` lines after `family:`. A new entry gets them
// by running this with --write once it is written. check-entries.mjs reports an entry without them, or
// with lines that differ from these.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { plan, entry } from './rules.mjs';

const idOf = (p) => p.path.split('/').filter(Boolean).pop();
const pages = new Map(plan.pages.filter((p) => p.path.startsWith('/astrology/')).map((p) => [idOf(p), p]));

// ── the shelves ──────────────────────────────────────────────────────────────────────────────────
const CAT = {
  placements: ['Placements', 'Placements'],
  synastry: ['Synastry', 'Synastrie'],
  transits: ['Transits and cycles', 'Transits et cycles'],
  tested: ['Astrology, tested', 'L’astrologie, testée'],
  readings: ['Readings', 'Lectures'],
  history: ['History', 'Histoire'],
  bodies: ['Planets and points', 'Planètes et points'],
  signs: ['Signs', 'Signes'],
  houses: ['Houses', 'Maisons'],
  aspects: ['Aspects', 'Aspects'],
  moon: ['The Moon', 'La Lune'],
  stars: ['Stars', 'Étoiles'],
  foundations: ['Foundations', 'Les bases'],
  techniques: ['Techniques', 'Techniques'],
};
const KIND_CAT = {
  'planet-in-sign': 'placements', 'planet-in-house': 'placements', rising: 'placements', 'sun-moon': 'placements',
  aspect: 'placements', 'ruler-house': 'placements', 'sign-cusp': 'placements', 'star-contact': 'placements',
  'synastry-aspect': 'synastry', overlay: 'synastry', composite: 'synastry',
  'transit-natal': 'transits', 'transit-house': 'transits', 'eclipse-sign': 'transits', 'moon-in-sign': 'transits',
  'progressed-moon': 'transits', 'retrograde-sign': 'transits',
};
const GROUP_CAT = { 'techniques|Relationships': 'synastry', 'techniques|Predictive': 'transits', 'practical|Calendars': 'transits' };
const FAMILY_CAT = {
  tested: 'tested', ethics: 'readings', practical: 'readings', history: 'history',
  planets: 'bodies', bodies: 'bodies', points: 'bodies', angles: 'bodies', dignities: 'bodies',
  signs: 'signs', houses: 'houses', aspects: 'aspects', patterns: 'aspects', moon: 'moon', stars: 'stars',
  foundations: 'foundations', techniques: 'techniques', cycles: 'transits',
};

// ── the tags: [English, French], the blog's own words where it has them ──────────────────────────────
const T = {
  synastry: ['synastry', 'synastrie'], transits: ['transits', 'transits'], retrograde: ['retrograde', 'rétrograde'],
  eclipses: ['eclipses', 'éclipses'], progressions: ['progressions', 'progressions'], birthChart: ['birth chart', 'thème natal'],
  birthTime: ['birth time', 'heure de naissance'], rising: ['rising sign', 'ascendant'], houses: ['houses', 'maisons'],
  signs: ['zodiac signs', 'signes du zodiaque'], testing: ['testing', 'test'], fixedStars: ['fixed stars', 'étoiles fixes'],
  asteroids: ['asteroids', 'astéroïdes'], dignities: ['dignities', 'dignités'], traditional: ['traditional astrology', 'astrologie traditionnelle'],
  composite: ['composite chart', 'thème composite'],
};

// what a page of the plan stands for when another page names it among its parents (its `up`)
const NAME = {
  'black-moon-lilith': [['Lilith', 'Lilith']],
  'synastry-aspects': [T.synastry],
  'house-overlays': [T.synastry, ['house overlays', 'superpositions de maisons']],
  'composite-chart': [T.composite],
  transits: [T.transits],
  'house-rulers': [['house rulers', 'maîtres des maisons']],
  'house-cusps': [['house cusps', 'cuspides des maisons']],
  'conjunctions-to-fixed-stars': [T.fixedStars],
  'solar-eclipses': [T.eclipses],
  'lunar-eclipses': [T.eclipses],
  'new-moon': ['moon', ['new moon', 'nouvelle lune']],
  'full-moon': ['moon', ['full moon', 'pleine lune']],
  'progressed-moon': ['moon', ['progressed Moon', 'Lune progressée'], T.progressions],
  ascendant: [['Ascendant', 'Ascendant'], T.rising],
};
for (const planet of ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
  const id = `${planet}-retrograde`;
  if (pages.has(id)) NAME[id] = [planet, T.retrograde, [pages.get(id).en, pages.get(id).fr]];
}

// the pages that are things an entry can be about: the planets and points, the signs, the houses, the
// aspects, the stars, and a few points the plan files as concepts
const ENTITY_KINDS = new Set(['pillar', 'sign', 'house', 'aspect-type', 'star']);
const MORE_ENTITIES = ['vertex', 'part-of-fortune', 'eris', 'mercury-retrograde', 'venus-retrograde', 'mars-retrograde',
  'jupiter-retrograde', 'saturn-retrograde', 'uranus-retrograde', 'neptune-retrograde', 'pluto-retrograde'];
const LOWER = new Set(['house', 'aspect-type']);
const clean = (title) => title.replace(/^(The|Le|La|Les) /, '').replace(/^L’/, '').replace(/\s*\(.*\)$/, '');
const named = (id) => {
  const p = pages.get(id);
  const [en, fr] = [clean(p.en), clean(p.fr)];
  return LOWER.has(p.kind) ? [en.charAt(0).toLowerCase() + en.slice(1), fr.charAt(0).toLowerCase() + fr.slice(1)] : [en, fr];
};
const isEntity = (id) => pages.has(id) && (ENTITY_KINDS.has(pages.get(id).kind) || MORE_ENTITIES.includes(id));

// one parent, as tags: an entity is its own name, a combination is the entities it is made of
// (Sun in Aries Moon in Virgo → Sun, Aries, Moon, Virgo)
function fromUp(id, seen = new Set()) {
  if (seen.has(id)) return [];
  seen.add(id);
  if (NAME[id]) return NAME[id].flatMap((x) => (typeof x === 'string' ? fromUp(x, seen) : [x]));
  if (isEntity(id)) return [named(id)];
  const p = pages.get(id);
  if (p && p.up.some((u) => pages.has(u))) return p.up.flatMap((u) => fromUp(u, seen));
  return [];
}

// a page that hangs straight off the encyclopaedia (a concept, a study, a person) is read by its English
// title: the entities it names, then a few words that are subjects in their own right. Longest names first,
// so "Black Moon Lilith" is Lilith and not the Moon; "Alan Leo" is a person, not the sign.
const vocabulary = [];
for (const id of [...pages.keys()].filter(isEntity)) {
  const p = pages.get(id);
  const words = [clean(p.en)];
  if (id === 'sun') words.push('Solar');
  if (id === 'moon') words.push('Lunar');
  if (id === 'black-moon-lilith') words.push('Lilith');
  for (const w of words) vocabulary.push({ w, id });
}
for (const w of ['Alan Leo', 'Dark Moon', 'White Moon', 'Co-Ascendant', 'Polar Ascendant']) vocabulary.push({ w, id: null });
vocabulary.sort((a, b) => b.w.length - a.w.length);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KEYWORDS = [
  [/\bzodiac/i, ['zodiac', 'zodiaque']], [/\bbirth charts?\b/i, T.birthChart], [/\bbirth time\b/i, T.birthTime],
  [/\brising sign/i, T.rising], [/\bsynastry\b/i, T.synastry], [/\btransits?\b/i, T.transits],
  [/\bprogress(ed|ions?)\b/i, T.progressions], [/\bretrograde\b/i, T.retrograde], [/\beclipses?\b/i, T.eclipses],
  [/\belements?\b/i, ['elements', 'éléments']], [/\bmodalit(y|ies)\b/i, ['modalities', 'modalités']],
  [/\bhoroscopes?\b/i, ['horoscopes', 'horoscopes']], [/\bsect\b/i, ['sect', 'secte']], [/\bscams?\b/i, ['scams', 'arnaques']],
  [/\bconsent\b/i, ['consent', 'consentement']], [/\btarot\b/i, ['tarot', 'tarot']], [/\bhouses\b/i, T.houses],
  [/\bsigns?\b/i, T.signs], [/\bcomposite\b/i, T.composite],
];
function fromTitle(title) {
  let rest = title;
  const hits = [];
  for (const { w, id } of vocabulary) {
    const re = new RegExp(`(^|[^\\p{L}])(${escape(w)}(?:e?s)?)(?=$|[^\\p{L}])`, 'iu');
    const m = rest.match(re);
    if (!m) continue;
    // blank the words out, keeping the length, so a shorter name can't match inside them and each tag
    // keeps the place of its words in the title
    rest = rest.replace(re, (_, before, words) => before + ' '.repeat(words.length));
    if (id) hits.push({ at: m.index + m[1].length, tags: fromUp(id) });
  }
  hits.sort((a, b) => a.at - b.at);
  const out = hits.flatMap((h) => h.tags);
  for (const [re, tag] of KEYWORDS) if (re.test(title)) out.push(tag);
  return out;
}

// what a group of the plan adds, for pages that hang straight off the encyclopaedia. The twelve signs,
// twelve houses and ten planets add nothing: each is closer to its own placements than to its siblings.
const GROUP_TAGS = {
  'angles|The lunar nodes': [['lunar nodes', 'nœuds lunaires']],
  'angles|The angles': [['angles', 'angles']],
  'angles|Other sensitive points': [['sensitive points', 'points sensibles']],
  'aspects|In declination': [['declination', 'déclinaison']],
  'aspects|Traditional aspect doctrine': [T.traditional],
  'aspects|Minor aspects': [['minor aspects', 'aspects mineurs']],
  'bodies|Centaurs': [['centaurs', 'centaures']],
  'bodies|Dwarf planets and trans-Neptunian objects': [['dwarf planets', 'planètes naines']],
  'bodies|Other asteroids astrologers read': [T.asteroids],
  'bodies|The big four asteroids': [T.asteroids],
  'bodies|Method': [T.asteroids],
  'bodies|Uranian points (the Hamburg School)': [['Uranian astrology', 'astrologie uranienne']],
  'bodies|Other hypothetical bodies': [['hypothetical bodies', 'corps hypothétiques']],
  'cycles|Collective cycles': [T.transits],
  'cycles|Life transits': [T.transits],
  'cycles|Returns': [['planetary returns', 'retours planétaires']],
  'cycles|Time-lord techniques': [['time lords', 'maîtres du temps']],
  'dignities|Essential dignities': [T.dignities],
  'dignities|Condition and strength': [T.dignities],
  'dignities|Motion': [T.retrograde],
  'ethics|Consent': [['consent', 'consentement']],
  'ethics|Privacy': [['privacy', 'vie privée']],
  'ethics|Scams': [['scams', 'arnaques']],
  'ethics|Care': [['mental health', 'santé mentale']],
  'ethics|What a chart can’t tell you': [['limits of astrology', 'limites de l’astrologie']],
  'ethics|Belief': [['belief', 'croyances']],
  'ethics|Technology': [['AI', 'IA']],
  'foundations|Sky mechanics': [['astronomy', 'astronomie']],
  'foundations|Traditional concepts': [T.traditional],
  'foundations|Reading the whole chart': [T.birthChart],
  'foundations|Building blocks': [T.birthChart],
  'houses|House systems': [['house systems', 'systèmes de maisons']],
  'houses|House concepts': [T.houses],
  'moon|Eclipses': [T.eclipses],
  'moon|Lunar phases': [['lunar phases', 'phases lunaires']],
  'moon|Lunations': [['lunations', 'lunaisons']],
  'patterns|Aspect patterns': [['aspect patterns', 'configurations']],
  'patterns|Chart shapes': [['chart shapes', 'formes de thème']],
  'points|Lots (Arabic parts)': [['Arabic parts', 'parts arabes']],
  'points|Midpoints': [['midpoints', 'mi-points']],
  'points|Mirror points': [['antiscia', 'antiscia']],
  'points|The Liliths': [['Lilith', 'Lilith']],
  'practical|Birth time by country': [T.birthTime],
  'practical|Calendars': [['calendar', 'calendrier']],
  'practical|Getting started': [T.birthChart],
  'practical|Time and place': [T.birthTime],
  'practical|Using a reading': [['readings', 'lectures']],
  'signs|Sign topics': [T.signs],
  'signs|The 36 decans': [['decans', 'décans']],
  'signs|The 360 Sabian symbols': [['Sabian symbols', 'symboles sabians']],
  'signs|Twelfth-parts': [['twelfth-parts', 'dodécatémories']],
  'stars|Concepts': [T.fixedStars],
  'stars|Other stars astrologers use': [T.fixedStars],
  'stars|The Behenian stars': [T.fixedStars, ['Behenian stars', 'étoiles béhéniennes']],
  'stars|The four royal stars': [T.fixedStars, ['royal stars', 'étoiles royales']],
  'techniques|Accuracy': [T.birthTime],
  'techniques|Places': [['relocation', 'relocalisation']],
  'techniques|Relationships': [T.synastry],
  'tested|Biases': [T.testing, ['cognitive biases', 'biais cognitifs']],
  'tested|My own tests': [T.testing],
  'tested|Questions people search': [T.testing],
  'tested|Studies': [T.testing],
};
const KIND_TAGS = { 'planet-in-house': [T.houses] };

const MAX_TAGS = 6;

export function tagsFor(id) {
  const p = pages.get(id);
  if (!p) return null;
  const cat = CAT[GROUP_CAT[`${p.family}|${p.group}`] ?? KIND_CAT[p.kind] ?? FAMILY_CAT[p.family] ?? 'foundations'];
  const offEncyclopaedia = !p.up.some((u) => pages.has(u));
  const found = [
    ...(offEncyclopaedia ? fromTitle(p.en) : p.up.flatMap((u) => fromUp(u))),
    ...(KIND_TAGS[p.kind] ?? []),
    ...(GROUP_TAGS[`${p.family}|${p.group}`] ?? []),
  ];
  const out = { en: { categories: [cat[0]], tags: [] }, fr: { categories: [cat[1]], tags: [] } };
  const seen = { en: new Set(), fr: new Set() };
  for (const [en, fr] of found) {
    if (seen.en.has(en.toLowerCase()) && seen.fr.has(fr.toLowerCase())) continue;
    if (out.en.tags.length >= MAX_TAGS) break;
    // a pair the two languages tell apart in one and not the other (ascendant / rising sign) keeps both
    // languages' lists the same length only where the words differ: each list drops its own repeats
    if (!seen.en.has(en.toLowerCase())) { out.en.tags.push(en); seen.en.add(en.toLowerCase()); }
    if (!seen.fr.has(fr.toLowerCase())) { out.fr.tags.push(fr); seen.fr.add(fr.toLowerCase()); }
  }
  return out;
}

// ── reading and writing the front matter ────────────────────────────────────────────────────────────
const list = (xs) => `[${xs.map((x) => JSON.stringify(x)).join(', ')}]`;
export const linesFor = (t) => [`categories: ${list(t.categories)}`, `tags: ${list(t.tags)}`];

export function withTags(src, t) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  let head = m[1].split('\n').filter((l) => !/^(categories|tags):/.test(l));
  const at = head.findIndex((l) => l.startsWith('family:'));
  if (at < 0) return null;
  head.splice(at + 1, 0, ...linesFor(t));
  return `---\n${head.join('\n')}\n---\n${src.slice(m[0].length)}`;
}

const root = new URL('../../', import.meta.url);
const file = (lang, id) => new URL(`content/${lang}/astrology/${id}.md`, root);

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes('--write');
  const named = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const ids = named.length
    ? named
    : (await readdir(new URL('content/en/astrology/', root))).filter((f) => f.endsWith('.md') && f !== '_index.md').map((f) => f.slice(0, -3));
  let changed = 0;
  let missing = 0;
  for (const id of ids) {
    const t = entry(id) && tagsFor(id);
    if (!t) { console.log(`✗ ${id}: not in the plan`); missing += 1; continue; }
    if (!write) {
      console.log(`${id}\n  en: ${linesFor(t.en).join('\n      ')}\n  fr: ${linesFor(t.fr).join('\n      ')}`);
      continue;
    }
    for (const lang of ['en', 'fr']) {
      const f = file(lang, id);
      if (!existsSync(f)) { console.log(`✗ ${id} [${lang}]: no file`); missing += 1; continue; }
      const src = await readFile(f, 'utf8');
      const next = withTags(src, t[lang]);
      if (!next) { console.log(`✗ ${id} [${lang}]: no front matter with a family line`); missing += 1; continue; }
      if (next !== src) { await writeFile(f, next); changed += 1; }
    }
  }
  if (write) console.log(`${changed} files written, ${missing} problems`);
  process.exit(missing ? 1 : 0);
}
