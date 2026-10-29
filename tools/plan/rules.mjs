// What each kind of encyclopaedia entry must link to: the "Site map and links" tab of the growth plan,
// worked out against the page plan so that every address is one the plan fixed. links-for.mjs prints it
// for a writer before an entry is written; check-entries.mjs holds a written entry to it.
//
// A rule is a list of groups. Each group names the section the links belong in, the pages, and how many
// of them the text must link to (all of them, or at least `need`). Pages the plan doesn't have are left
// out, so a rule never asks for an address that can't exist (Sun square Mercury, say).

import { readFile } from 'node:fs/promises';

export const plan = JSON.parse(await readFile(new URL('../../plan/pages.json', import.meta.url), 'utf8'));
export const byPath = new Map(plan.pages.map((p) => [p.path, p]));
export const entry = (id) => byPath.get(`/astrology/${id}/`);

export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
export const HOUSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
export const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const ARTICLES = ['/blog/i-tested-my-birth-chart/', '/blog/saturn-chiron-lilith/', '/blog/unknown-birth-time/',
  '/blog/retrograde-planets/', '/blog/synastry-behind-their-back/'];

// modern rulers first; Scorpio, Aquarius and Pisces keep their traditional ruler too, and the entry names both
export const RULERS = { aries: ['mars'], taurus: ['venus'], gemini: ['mercury'], cancer: ['moon'], leo: ['sun'],
  virgo: ['mercury'], libra: ['venus'], scorpio: ['pluto', 'mars'], sagittarius: ['jupiter'], capricorn: ['saturn'],
  aquarius: ['uranus', 'saturn'], pisces: ['neptune', 'jupiter'] };

// the angles sit on the cusps of these houses (in Placidus and the other quadrant systems)
export const ANGLE_HOUSE = { ascendant: 1, 'imum-coeli': 4, descendant: 7, midheaven: 10 };
const HOUSE_ANGLE = Object.fromEntries(Object.entries(ANGLE_HOUSE).map(([a, n]) => [n, a]));

// the bodies whose transits through the houses have pages, slowest first
const TRANSITING = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north-node'];
// the order aspect addresses are written in: "sun-square-moon", never "moon-square-sun"
const ORDER = [...PLANETS, 'chiron', 'lilith', 'north-node'];
const ASPECT_WORD = { conjunction: 'conjunct', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposite' };

const p = (id) => `/astrology/${id}/`;
// the site's own pages that rules ask for, outside the encyclopaedia (the plan lists its pages and the articles)
export const SITE = new Set(['/synastry/', '/how-i-read/', '/birth-chart/']);
const real = (paths) => paths.filter((x) => byPath.has(x) || SITE.has(x));
const around = (list, i) => [list[(i + list.length - 1) % list.length], list[(i + 1) % list.length]];
const opposite = (list, i) => list[(i + list.length / 2) % list.length];
const pair = (a, b) => (ORDER.indexOf(a) <= ORDER.indexOf(b) ? [a, b] : [b, a]);

// "Aries on the 1st house cusp" is Aries rising, which has its own page: the rules link that one instead,
// so the two never compete for the same search
const cusp = (sign, n) => (n === '1st' ? p(`${sign}-rising`) : p(`${sign}-on-${n}-house-cusp`));

// Black Moon Lilith's combination pages are written "lilith-in-aries", as people search for them
const COMBO = { 'black-moon-lilith': 'lilith' };

function pillar(id) {
  const groups = [];
  const n = ANGLE_HOUSE[id];
  const c = COMBO[id] ?? id;
  if (byPath.has(p(`${c}-in-aries`))) {
    groups.push({ section: 'Through the signs', pages: SIGNS.map((s) => p(`${c}-in-${s}`)) });
    groups.push({ section: 'In the houses', pages: HOUSES.map((h) => p(`${c}-in-${h}-house`)) });
  } else if (id === 'ascendant') {
    groups.push({ section: 'Through the signs (the 12 rising signs)', pages: SIGNS.map((s) => p(`${s}-rising`)) });
    groups.push({ section: 'In the houses (where the chart ruler sits)', pages: HOUSES.map((h) => p(`1st-house-ruler-in-${h}-house`)) });
  } else if (n) {
    const h = HOUSES[n - 1];
    groups.push({ section: `Through the signs (the sign on the ${h} house cusp)`, pages: SIGNS.map((s) => cusp(s, h)) });
    groups.push({ section: `In the houses (where the ruler of the ${h} sits)`, pages: HOUSES.map((k) => p(`${h}-house-ruler-in-${k}-house`)) });
  } else if (id === 'south-node') {
    // the South Node has no pages of its own: it is always opposite the North Node, so each South Node
    // sign and house is read on the North Node page across from it
    groups.push({ section: 'Through the signs (via the North Node opposite)', pages: SIGNS.map((s, i) => p(`north-node-in-${opposite(SIGNS, i)}`)) });
    groups.push({ section: 'In the houses (via the North Node opposite)', pages: HOUSES.map((h, i) => p(`north-node-in-${opposite(HOUSES, i)}-house`)) });
  }
  const self = entry(id);
  const pillars = plan.pages.filter((x) => ['pillar', 'sign', 'house', 'aspect-type'].includes(x.kind) && x.tier === 1 && x.path !== self.path);
  const across = (self.across || []).map(p);
  groups.push({ section: 'Related pillars (anywhere in the text)', need: 3, pages: [...new Set([...real(across), ...pillars.map((x) => x.path)])], suggest: real(across) });
  groups.push({ section: 'Articles (2+, one in "What held in my tests")', need: 2, pages: ARTICLES });
  groups.push({ section: 'In synastry', pages: ['/synastry/'] });
  return groups;
}

function sign(id) {
  const i = SIGNS.indexOf(id);
  return [
    { section: 'In a birth chart (Sun, Moon, rising)', pages: [p(`sun-in-${id}`), p(`moon-in-${id}`), p(`${id}-rising`)] },
    { section: 'Its ruler', pages: RULERS[id].map(p) },
    { section: `Planets in the sign (the 10)`, pages: PLANETS.map((x) => p(`${x}-in-${id}`)) },
    { section: 'On a house cusp (the 12)', pages: HOUSES.map((h) => cusp(id, h)) },
    { section: 'The signs before and after', pages: around(SIGNS, i).map(p) },
    { section: 'In synastry', pages: ['/synastry/'] },
  ];
}

function house(id) {
  const h = id.replace(/-house$/, '');
  const i = HOUSES.indexOf(h);
  const groups = [
    { section: 'Planets in it (the 10)', pages: PLANETS.map((x) => p(`${x}-in-${h}-house`)) },
    { section: 'The sign on its cusp (the 12)', pages: SIGNS.map((s) => cusp(s, h)) },
    { section: 'Its ruler (where the ruler sits, the 12)', pages: HOUSES.map((k) => p(`${h}-house-ruler-in-${k}-house`)) },
    { section: 'Transits through it', pages: real(TRANSITING.map((x) => p(`${x}-transit-${h}-house`))) },
    { section: 'The houses before and after', pages: around(HOUSES, i).map((k) => p(`${k}-house`)) },
  ];
  if (HOUSE_ANGLE[i + 1]) groups.push({ section: 'Its angle', pages: [p(HOUSE_ANGLE[i + 1])] });
  return groups;
}

function aspectType(id) {
  const w = ASPECT_WORD[id];
  const natal = [];
  const syn = [];
  // the contacts people search for most, in order; only those the plan has (and the geometry allows)
  const pairs = [['sun', 'moon'], ['venus', 'mars'], ['moon', 'saturn'], ['sun', 'saturn'], ['moon', 'venus'], ['venus', 'saturn'],
    ['mars', 'saturn'], ['sun', 'jupiter'], ['moon', 'pluto'], ['mercury', 'saturn'], ['sun', 'pluto'], ['venus', 'pluto'],
    ['moon', 'mars'], ['sun', 'mars'], ['venus', 'jupiter'], ['moon', 'chiron'], ['sun', 'venus'], ['sun', 'mercury']];
  for (const [a, b] of pairs.map(([a, b]) => pair(a, b))) {
    if (byPath.has(p(`${a}-${w}-${b}`))) natal.push(p(`${a}-${w}-${b}`));
    if (byPath.has(p(`${a}-${w}-${b}-synastry`))) syn.push(p(`${a}-${w}-${b}-synastry`));
  }
  const transits = real([['saturn', 'sun'], ['saturn', 'moon'], ['jupiter', 'venus'], ['pluto', 'moon'], ['uranus', 'sun'],
    ['neptune', 'venus'], ['saturn', 'ascendant'], ['jupiter', 'midheaven']].map(([t, n]) => p(`transiting-${t}-${w}-natal-${n}`)));
  return [
    { section: 'The other major aspects', pages: Object.keys(ASPECT_WORD).filter((x) => x !== id).map(p) },
    { section: 'Between which planets (6+ natal aspect pages)', need: 6, pages: natal },
    { section: 'In synastry (2+ synastry aspect pages)', need: 2, pages: syn },
    { section: 'In synastry (the readings)', pages: ['/synastry/'] },
    { section: 'In transits (2+ transit pages)', need: 2, pages: transits },
  ];
}

// the concept entries of the first batch, each with the pages it explains or sits between
const CONCEPTS = {
  'horizon-axis': ['ascendant', 'descendant', '1st-house', '7th-house', 'meridian-axis'],
  'meridian-axis': ['midheaven', 'imum-coeli', '10th-house', '4th-house', 'horizon-axis'],
  'nodal-axis': ['north-node', 'south-node', 'mean-node-and-true-node', 'why-eclipses-follow-the-nodes', 'nodal-return'],
  'which-lilith-is-mine': ['black-moon-lilith', 'true-lilith', 'interpolated-lilith', 'dark-moon-lilith', 'asteroid-lilith-1181', 'white-moon-selena'],
  'part-of-fortune': ['part-of-spirit', 'sun', 'moon', 'ascendant', 'doctrine-of-the-lots', 'sect-day-and-night-charts'],
};

function concept(id) {
  const self = entry(id);
  const pages = [...new Set([...(self.across || []), ...(CONCEPTS[id] || [])])].map(p);
  return [
    { section: 'The pages it explains or sits between', pages: real(pages) },
    { section: 'Articles or How I read (1+)', need: 1, pages: [...ARTICLES, '/how-i-read/'] },
  ];
}

// The groups for one entry, or null for a kind these rules don't cover yet (the combination pages come
// with their own batches).
export function rulesFor(id) {
  const self = entry(id);
  if (!self) return null;
  const make = { pillar, sign, house, 'aspect-type': aspectType, concept }[self.kind];
  if (!make) return null;
  return make(id).map((g) => ({ ...g, pages: real(g.pages), need: g.need ?? real(g.pages).length }));
}

// Pages worth linking where the text calls for them, without being required.
export function suggestionsFor(id) {
  const self = entry(id);
  const out = [];
  const add = (...ids) => out.push(...real(ids.map(p)));
  if (self.kind === 'pillar') {
    add(`${id}-return`, `${id}-retrograde`, id === 'sun' ? 'solar-return' : '', id === 'moon' ? 'lunar-return' : '');
    // its own transits, and the slow planets' transits to it
    add(...['1st', '7th', '10th'].map((h) => `${id}-transit-${h}-house`));
    add(...['conjunct', 'square', 'opposite'].map((w) => `transiting-${id}-${w}-natal-sun`));
    add(...['saturn', 'jupiter', 'pluto'].map((t) => `transiting-${t}-conjunct-natal-${id}`));
    add(...['1st', '5th', '7th'].map((h) => `${id}-in-${h}-house-synastry`));
    if (id === 'north-node' || id === 'south-node') add('nodal-axis', 'nodal-return', 'mean-node-and-true-node', 'why-eclipses-follow-the-nodes', 'nodes-in-synastry');
    if (id === 'ascendant') add('chart-ruler', 'how-to-find-your-rising-sign');
    if (id === 'ascendant' || id === 'descendant') add('horizon-axis');
    if (id === 'midheaven' || id === 'imum-coeli') add('meridian-axis');
    if (ANGLE_HOUSE[id]) add('angular-planets', 'house-rulers', 'which-house-system-should-i-use');
    add('luminaries', 'personal-social-and-generational-planets', 'traditional-and-modern-rulers', 'born-on-the-cusp',
      'tropical-zodiac', 'ophiuchus-and-the-13th-sign');
  }
  if (self.kind === 'sign') {
    const i = SIGNS.indexOf(id);
    add(opposite(SIGNS, i), ['fire-signs', 'earth-signs', 'air-signs', 'water-signs'][i % 4], 'three-modalities', 'polarity',
      `chiron-in-${id}`, `lilith-in-${id}`, `north-node-in-${id}`, `new-moon-in-${id}`, `full-moon-in-${id}`, `eclipse-in-${id}`,
      'born-on-the-cusp', 'traditional-and-modern-rulers', 'tropical-zodiac');
  }
  if (self.kind === 'house') {
    const h = id.replace(/-house$/, '');
    add('house-rulers', 'empty-houses', 'angular-succedent-and-cadent-houses', 'which-house-system-should-i-use',
      `chiron-in-${h}-house`, `lilith-in-${h}-house`, `north-node-in-${h}-house`, `venus-in-${h}-house-synastry`, `saturn-in-${h}-house-synastry`);
  }
  if (self.kind === 'aspect-type') add('orbs', 'applying-and-separating-aspects', 'hard-and-soft-aspects', 'exact-aspects', 'synastry-aspects');
  out.push('/how-i-read/');
  return [...new Set(out)].filter((x) => x !== self.path);
}
