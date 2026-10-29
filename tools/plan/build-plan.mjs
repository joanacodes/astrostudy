// The page plan: every page the encyclopaedia will have, in English and French, built from the master
// list (master-list.mjs) and the rules for each kind of page (the "Site map and links" tab of the growth
// plan). One row per page: its title and address in both languages, its tier, its writing batch, its
// headings, and the pages it links up to and across to. The writer works from this file, so a page's
// address is decided once, before it is written, and never changes after it is published.
//
//   node tools/plan/build-plan.mjs        → plan/pages.json and plan/pages.csv, and the counts

import { writeFile } from 'node:fs/promises';
import { families, bodies, signs, aspects } from './master-list.mjs';

const slug = (s, lang) => {
  let t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[’'`]/g, lang === 'fr' ? '-' : '').replace(/°/g, '').replace(/&/g, lang === 'fr' ? ' et ' : ' and ');
  t = t.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return lang === 'fr' ? t.replace(/^(le|la|les|l|un|une)-/, '') : t.replace(/^(the|a|an)-/, '');
};

// the headings of each kind of page; {name} is the page's own subject
const kinds = {
  pillar: [['In a birth chart', 'Through the signs', 'In the houses', 'In synastry', 'Transits and the return', 'What held in my tests', 'Common myths', 'Questions'],
    ['Dans un thème natal', 'À travers les signes', 'Dans les maisons', 'En synastrie', 'Transits et retour', 'Ce qui a tenu dans mes tests', 'Idées reçues', 'Questions']],
  sign: [['In a birth chart', 'Its ruler', 'Planets in {name}', '{name} on a house cusp', 'In synastry', 'Common myths', 'Questions'],
    ['Dans un thème natal', 'Son maître', 'Les planètes en {name}', '{name} sur une cuspide', 'En synastrie', 'Idées reçues', 'Questions']],
  house: [['What it covers', 'Planets in it', 'The sign on its cusp', 'Its ruler', 'Transits through it', 'Questions'],
    ['Ce qu’elle couvre', 'Les planètes qui l’occupent', 'Le signe sur sa cuspide', 'Son maître', 'Les transits', 'Questions']],
  'aspect-type': [['What it means', 'Between which planets', 'In synastry', 'In transits', 'Questions'],
    ['Ce qu’il veut dire', 'Entre quelles planètes', 'En synastrie', 'En transit', 'Questions']],
  concept: [['What it is', 'How it works', 'In a reading', 'Common myths', 'Questions'],
    ['Ce que c’est', 'Comment ça marche', 'Dans une lecture', 'Idées reçues', 'Questions']],
  technique: [['What it is', 'How it is done', 'What it shows', 'Its limits', 'Questions'],
    ['Ce que c’est', 'Comment on la fait', 'Ce qu’elle montre', 'Ses limites', 'Questions']],
  pattern: [['What it looks like', 'In a birth chart', 'What helps', 'Questions'],
    ['À quoi elle ressemble', 'Dans un thème natal', 'Ce qui aide', 'Questions']],
  star: [['Where it is', 'Its tradition', 'In a birth chart', 'Questions'],
    ['Où elle se trouve', 'Sa tradition', 'Dans un thème natal', 'Questions']],
  decan: [['Its rulers', 'Its image', 'In a birth chart'], ['Ses maîtres', 'Son image', 'Dans un thème natal']],
  sabian: [['The symbol', 'How it is read', 'Questions'], ['Le symbole', 'Comment on le lit', 'Questions']],
  history: [['What it was', 'What it gave astrology', 'Questions'], ['Ce que c’était', 'Ce qu’elle a apporté', 'Questions']],
  person: [['Who', 'What they changed', 'Questions'], ['Qui', 'Son apport', 'Questions']],
  text: [['What it is', 'What it says', 'Questions'], ['Ce que c’est', 'Ce qu’il dit', 'Questions']],
  tested: [['The short answer', 'What the research found', 'What I found', 'Questions'],
    ['La réponse courte', 'Ce que la recherche a trouvé', 'Ce que j’ai trouvé', 'Questions']],
  guide: [['Step by step', 'Common mistakes', 'Questions'], ['Pas à pas', 'Erreurs fréquentes', 'Questions']],
  country: [['Where the time is written', 'How to ask for it', 'If it isn’t there', 'Questions'],
    ['Où l’heure est écrite', 'Comment la demander', 'Si elle n’y est pas', 'Questions']],
  'sky-calendar': [['Dates and times', 'House by house', 'What I watch for', 'Questions'],
    ['Dates et heures', 'Maison par maison', 'Ce que je surveille', 'Questions']],
  ethics: [['The short answer', 'Why it matters', 'What to do instead', 'Questions'],
    ['La réponse courte', 'Pourquoi c’est important', 'Que faire à la place', 'Questions']],
  article: [['As published'], ['Tel que publié']],
  'planet-in-sign': [['In a birth chart', 'In close relationships', 'At work', 'The hard part', 'What helps', 'Questions'],
    ['Dans un thème natal', 'Dans les relations proches', 'Au travail', 'Le plus difficile', 'Ce qui aide', 'Questions']],
  'planet-in-house': [['In a birth chart', 'In close relationships', 'At work', 'The hard part', 'What helps', 'Questions'],
    ['Dans un thème natal', 'Dans les relations proches', 'Au travail', 'Le plus difficile', 'Ce qui aide', 'Questions']],
  rising: [['What it shows', 'First impressions', 'Its ruler', 'In close relationships', 'Questions'],
    ['Ce qu’il montre', 'La première impression', 'Son maître', 'Dans les relations proches', 'Questions']],
  'moon-in-sign': [['What it brings', 'House by house', 'What helps', 'Questions'], ['Ce qu’elle apporte', 'Maison par maison', 'Ce qui aide', 'Questions']],
  'sun-moon': [['How they get along', 'In close relationships', 'At work', 'The hard part', 'Questions'],
    ['Comment ils s’accordent', 'Dans les relations proches', 'Au travail', 'Le plus difficile', 'Questions']],
  aspect: [['What it means', 'In a birth chart', 'In transits', 'Questions'], ['Ce qu’il veut dire', 'Dans un thème natal', 'En transit', 'Questions']],
  'synastry-aspect': [['What flows', 'Where it rubs', 'How to meet it', 'Questions'], ['Ce qui circule', 'Là où ça frotte', 'Comment le vivre', 'Questions']],
  overlay: [['What it brings', 'Where it rubs', 'How to meet it', 'Questions'], ['Ce que ça apporte', 'Là où ça frotte', 'Comment le vivre', 'Questions']],
  'transit-house': [['What changes', 'How long it lasts', 'What helps', 'Questions'], ['Ce qui change', 'Combien de temps', 'Ce qui aide', 'Questions']],
  'progressed-moon': [['What it brings', 'How long it lasts', 'What helps', 'Questions'], ['Ce qu’elle apporte', 'Combien de temps', 'Ce qui aide', 'Questions']],
  'retrograde-sign': [['What slows down', 'House by house', 'What helps', 'Questions'], ['Ce qui ralentit', 'Maison par maison', 'Ce qui aide', 'Questions']],
  'eclipse-sign': [['What it stirs', 'House by house', 'Questions'], ['Ce qu’elle remue', 'Maison par maison', 'Questions']],
  'transit-natal': [['What changes', 'How long it lasts', 'What helps', 'Questions'], ['Ce qui change', 'Combien de temps', 'Ce qui aide', 'Questions']],
  composite: [['What it says about the two of you', 'Questions'], ['Ce que ça dit de vous deux', 'Questions']],
  'ruler-house': [['What it means', 'Questions'], ['Ce que ça veut dire', 'Questions']],
  'sign-cusp': [['What it means', 'Questions'], ['Ce que ça veut dire', 'Questions']],
  'star-contact': [['What it means', 'Questions'], ['Ce que ça veut dire', 'Questions']],
};

// the published French addresses of the blog articles some entries of the list already are
const blogFr = {
  '/blog/i-tested-my-birth-chart/': '/fr/blog/j-ai-teste-mon-theme/',
  '/blog/saturn-chiron-lilith/': '/fr/blog/saturne-chiron-lilith/',
  '/blog/retrograde-planets/': '/fr/blog/planetes-retrogrades/',
  '/blog/unknown-birth-time/': '/fr/blog/heure-de-naissance-inconnue/',
  '/blog/synastry-behind-their-back/': '/fr/blog/synastrie-dans-son-dos/',
};

const pages = [];
const byId = new Map();
function add(row) {
  if (byId.has(row.id)) throw new Error(`Two pages share the address ${row.id}: “${byId.get(row.id).en}” and “${row.en}”`);
  byId.set(row.id, row);
  pages.push(row);
  return row;
}
const page = (o) => ({ status: 'planned', section: 'astrology', up: [], across: [], ...o });

// 1. the elements of the master list, plus the decans and Sabian degrees built from the signs
const ord = [['first', 'premier'], ['second', 'deuxième'], ['third', 'troisième']];
const countryIn = { France: 'en France', 'Angleterre et pays de Galles': 'en Angleterre et au pays de Galles', Écosse: 'en Écosse', Irlande: 'en Irlande',
  'États-Unis': 'aux États-Unis', Canada: 'au Canada', Australie: 'en Australie', Espagne: 'en Espagne', Allemagne: 'en Allemagne', Italie: 'en Italie',
  Portugal: 'au Portugal', Brésil: 'au Brésil', Belgique: 'en Belgique', Suisse: 'en Suisse', 'Pays-Bas': 'aux Pays-Bas', Mexique: 'au Mexique', Argentine: 'en Argentine' };
for (const fam of families) {
  const groups = [...fam.groups];
  if (fam.key === 'signs') {
    groups.splice(2, 0,
      { en: 'The 36 decans', fr: 'Les 36 décans', tier: 3, kind: 'decan', items: signs.flatMap(([s, sf]) => ord.map(([o, of]) => ({ en: `${s}, ${o} decan`, fr: `${sf}, ${of} décan`, upTo: slug(s) }))) },
      { en: 'The 360 Sabian symbols', fr: 'Les 360 symboles sabians', tier: 3, kind: 'sabian', items: signs.flatMap(([s, sf]) => Array.from({ length: 30 }, (_, i) => ({
        en: `${s} ${i + 1}°: the Sabian symbol`, fr: `${sf} ${i + 1}° : le symbole sabian`, slug: `sabian-symbol-${slug(s)}-${i + 1}`, slugFr: `symbole-sabian-${slug(sf, 'fr')}-${i + 1}`, upTo: slug(s),
      }))) });
  }
  for (const grp of groups) {
    const rows = [];
    for (const it of grp.items) {
      let o = typeof it === 'string' ? (([en, fr, t]) => ({ en, fr, tier: t ? Number(t) : undefined }))(it.split('|').map((x) => x.trim())) : it;
      const kind = o.kind || grp.kind;
      if (kind === 'country') {
        o = { ...o, en: `Birth time in ${o.en === 'United States' || o.en === 'Netherlands' ? 'the ' : ''}${o.en}: where to find it`, fr: `Heure de naissance ${countryIn[o.fr]} : où la trouver`,
          slug: `birth-time-${slug(o.en)}`, slugFr: `heure-de-naissance-${slug(o.fr, 'fr')}` };
      }
      const section = kind === 'sky-calendar' ? 'sky' : 'astrology';
      const id = o.slug || slug(o.en);
      const slugFr = o.slugFr || slug(o.fr, 'fr');
      const path = o.path || `/${section}/${id}/`;
      const pathFr = o.path ? blogFr[o.path] : section === 'sky' ? `/fr/ciel/${slugFr}/` : `/fr/astrologie/${slugFr}/`;
      rows.push(add(page({ upTo: o.upTo, id: o.path ? `blog:${o.path.split('/')[2]}:${id}` : id, family: fam.key, group: grp.en, groupFr: grp.fr, kind,
        tier: o.tier || grp.tier, en: o.en, fr: o.fr, slug: id, slugFr, path, pathFr, section: o.path ? 'blog' : section, status: o.status || 'planned' })));
    }
    rows.forEach((r, i) => { r.up = r.upTo ? [r.upTo] : [r.section === 'sky' ? '/sky/' : '/astrology/']; r.across = [rows[i - 1], rows[i + 1]].filter(Boolean).map((x) => x.id); });
  }
}

// 2. the combination pages, each built from two pages it links up to
const pillarOf = (b) => (b === 'Lilith' ? 'black-moon-lilith' : slug(b));
const n = (k) => `${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'}`;
const houses = Array.from({ length: 12 }, (_, i) => i + 1);
const around = (list, i, f) => [list[(i + list.length - 1) % list.length], list[(i + 1) % list.length]].map(f);
const combo = (fam, kind, tier, o) => add(page({ family: 'combinations', group: fam[0], groupFr: fam[1], kind, tier, slug: o.id, ...o, path: `/astrology/${o.id}/`, pathFr: `/fr/astrologie/${o.slugFr}/` }));
const fr = (b) => bodies.find((x) => x[0] === b);

for (const [b, bf] of bodies) {
  signs.forEach(([s, sf], i) => combo(['Planet in a sign', 'Planète dans un signe'], 'planet-in-sign', 1, {
    id: `${slug(b)}-in-${slug(s)}`, slugFr: `${slug(bf, 'fr')}-en-${slug(sf, 'fr')}`, en: `${b} in ${s}`, fr: `${bf} en ${sf}`,
    up: [pillarOf(b), slug(s)], across: around(signs, i, ([x]) => `${slug(b)}-in-${slug(x)}`) }));
}
for (const [b, bf] of bodies) {
  houses.forEach((k, i) => combo(['Planet in a house', 'Planète dans une maison'], 'planet-in-house', 1, {
    id: `${slug(b)}-in-${n(k)}-house`, slugFr: `${slug(bf, 'fr')}-en-maison-${k}`, en: `${b} in the ${n(k)} house`, fr: `${bf} en maison ${k}`,
    up: [pillarOf(b), `${n(k)}-house`], across: around(houses, i, (x) => `${slug(b)}-in-${n(x)}-house`) }));
}
signs.forEach(([s, sf], i) => combo(['Rising sign', 'Ascendant'], 'rising', 1, {
  id: `${slug(s)}-rising`, slugFr: `ascendant-${slug(sf, 'fr')}`, en: `${s} rising`, fr: `Ascendant ${sf}`,
  up: ['ascendant', slug(s)], across: around(signs, i, ([x]) => `${slug(x)}-rising`) }));
for (const [ph, phf, up] of [['New moon', 'Nouvelle lune', 'new-moon'], ['Full moon', 'Pleine lune', 'full-moon']]) {
  signs.forEach(([s, sf], i) => combo(['New and full moon by sign', 'Nouvelle et pleine lune par signe'], 'moon-in-sign', 1, {
    id: `${up}-in-${slug(s)}`, slugFr: `${slug(phf, 'fr')}-en-${slug(sf, 'fr')}`, en: `${ph} in ${s}`, fr: `${phf} en ${sf}`,
    up: [up, slug(s)], across: around(signs, i, ([x]) => `${up}-in-${slug(x)}`) }));
}
for (const [s1, s1f] of signs) {
  signs.forEach(([s2, s2f], i) => combo(['Sun and Moon combinations', 'Combinaisons Soleil-Lune'], 'sun-moon', 2, {
    id: `sun-in-${slug(s1)}-moon-in-${slug(s2)}`, slugFr: `soleil-en-${slug(s1f, 'fr')}-lune-en-${slug(s2f, 'fr')}`,
    en: `Sun in ${s1}, Moon in ${s2}`, fr: `Soleil en ${s1f}, Lune en ${s2f}`,
    up: [`sun-in-${slug(s1)}`, `moon-in-${slug(s2)}`], across: around(signs, i, ([x]) => `sun-in-${slug(s1)}-moon-in-${slug(x)}`) }));
}
// natal aspects: Mercury never gets more than 28° from the Sun, Venus 47°, and the two 76° from each other
const impossible = { 'Sun|Mercury': ['conjunct'], 'Sun|Venus': ['conjunct'], 'Mercury|Venus': ['conjunct', 'sextile'] };
for (let i = 0; i < bodies.length; i++) {
  for (let j = i + 1; j < bodies.length; j++) {
    const [a, af] = bodies[i]; const [b, bf] = bodies[j];
    const only = impossible[`${a}|${b}`];
    const natal = aspects.filter(([v]) => !only || only.includes(v));
    for (const [v, vf, type] of natal) {
      combo(['Natal aspects', 'Aspects natals'], 'aspect', 2, {
        id: `${slug(a)}-${v}-${slug(b)}`, slugFr: `${slug(af, 'fr')}-${slug(vf, 'fr')}-${slug(bf, 'fr')}`, en: `${a} ${v} ${b}`, fr: `${af} ${vf} ${bf}`,
        up: [pillarOf(a), pillarOf(b), slug(type)], across: natal.filter(([w]) => w !== v).map(([w]) => `${slug(a)}-${w}-${slug(b)}`) });
    }
    for (const [v, vf, type] of aspects) {
      combo(['Aspects in synastry', 'Aspects en synastrie'], 'synastry-aspect', 2, {
        id: `${slug(a)}-${v}-${slug(b)}-synastry`, slugFr: `${slug(af, 'fr')}-${slug(vf, 'fr')}-${slug(bf, 'fr')}-synastrie`,
        en: `${a} ${v} ${b} in synastry`, fr: `${af} ${vf} ${bf} en synastrie`,
        up: [pillarOf(a), pillarOf(b), slug(type), 'synastry-aspects'], across: aspects.filter(([w]) => w !== v).map(([w]) => `${slug(a)}-${w}-${slug(b)}-synastry`) });
    }
  }
}
// French gives Saturne, Mars, Jupiter… no settled gender, so the French titles never lend them one: no
// "son Saturne" or "Saturne natal", but "Saturne de l’autre" and "Saturne du thème natal". Only the
// words French always writes with an article keep it.
const withArticle = { Soleil: 'Le Soleil', Lune: 'La Lune', 'Nœud Nord': 'Le Nœud Nord' };
for (const [b, bf] of bodies) {
  houses.forEach((k, i) => combo(['House overlays in synastry', 'Superpositions de maisons'], 'overlay', 2, {
    id: `${slug(b)}-in-${n(k)}-house-synastry`, slugFr: `${slug(bf, 'fr')}-en-maison-${k}-synastrie`,
    en: `Their ${b} in your ${n(k)} house`, fr: `${withArticle[bf] ?? bf} de l’autre dans votre maison ${k}`,
    up: [pillarOf(b), `${n(k)}-house`, 'house-overlays'], across: around(houses, i, (x) => `${slug(b)}-in-${n(x)}-house-synastry`) }));
}
const slow = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node'];
for (const b of slow) {
  const bf = fr(b)[1];
  houses.forEach((k, i) => combo(['Transits through the houses', 'Transits dans les maisons'], 'transit-house', 2, {
    id: `${slug(b)}-transit-${n(k)}-house`, slugFr: `transit-${slug(bf, 'fr')}-maison-${k}`, en: `${b} transiting the ${n(k)} house`, fr: `${bf} en transit en maison ${k}`,
    up: [pillarOf(b), `${n(k)}-house`, 'transits'], across: around(houses, i, (x) => `${slug(b)}-transit-${n(x)}-house`) }));
}
signs.forEach(([s, sf], i) => combo(['Progressed Moon by sign', 'Lune progressée par signe'], 'progressed-moon', 2, {
  id: `progressed-moon-in-${slug(s)}`, slugFr: `lune-progressee-en-${slug(sf, 'fr')}`, en: `Progressed Moon in ${s}`, fr: `Lune progressée en ${sf}`,
  up: ['progressed-moon', slug(s)], across: around(signs, i, ([x]) => `progressed-moon-in-${slug(x)}`) }));
for (const b of ['Mercury', 'Venus', 'Mars']) {
  const bf = fr(b)[1];
  signs.forEach(([s, sf], i) => combo(['Retrograde by sign', 'Rétrogradations par signe'], 'retrograde-sign', 2, {
    id: `${slug(b)}-retrograde-in-${slug(s)}`, slugFr: `${slug(bf, 'fr')}-retrograde-en-${slug(sf, 'fr')}`, en: `${b} retrograde in ${s}`, fr: `${bf} rétrograde en ${sf}`,
    up: [`${slug(b)}-retrograde`, slug(s)], across: around(signs, i, ([x]) => `${slug(b)}-retrograde-in-${slug(x)}`) }));
}
signs.forEach(([s, sf], i) => combo(['Eclipses by sign', 'Éclipses par signe'], 'eclipse-sign', 2, {
  id: `eclipse-in-${slug(s)}`, slugFr: `eclipse-en-${slug(sf, 'fr')}`, en: `Eclipse in ${s}`, fr: `Éclipse en ${sf}`,
  up: ['solar-eclipses', 'lunar-eclipses', slug(s)], across: around(signs, i, ([x]) => `eclipse-in-${slug(x)}`) }));
const natalPoints = [...bodies.slice(0, 10).map(([e, f]) => [e, f]), ['Ascendant', 'Ascendant'], ['Midheaven', 'Milieu du Ciel']];
// a slow planet's conjunction with its own birth place is its return: the Jupiter and Saturn returns have
// their own pages, the Uranus return at about 84 too, and Neptune's and Pluto's never come in a lifetime
const isReturn = (t, v, p) => v === 'conjunct' && t === p;
for (const t of slow) {
  const tf = fr(t)[1];
  for (const [p, pf] of natalPoints) {
    for (const [v, vf, type] of aspects) {
      if (isReturn(t, v, p)) continue;
      combo(['Transits to natal points', 'Transits aux points natals'], 'transit-natal', 3, {
        id: `transiting-${slug(t)}-${v}-natal-${slug(p)}`, slugFr: `${slug(tf, 'fr')}-transit-${slug(vf, 'fr')}-${slug(pf, 'fr')}-natal`,
        en: `Transiting ${t} ${v} natal ${p}`, fr: `${tf} en transit ${vf} ${pf} du thème natal`,
        up: [pillarOf(t), p === 'Midheaven' ? 'midheaven' : pillarOf(p), slug(type), 'transits'],
        across: aspects.filter(([w]) => w !== v && !isReturn(t, w, p)).map(([w]) => `transiting-${slug(t)}-${w}-natal-${slug(p)}`) });
    }
  }
}
for (const [b, bf] of bodies) {
  signs.forEach(([s, sf], i) => combo(['Composite chart placements', 'Placements du thème composite'], 'composite', 3, {
    id: `composite-${slug(b)}-in-${slug(s)}`, slugFr: `${slug(bf, 'fr')}-composite-en-${slug(sf, 'fr')}`, en: `Composite ${b} in ${s}`, fr: `${bf} composite en ${sf}`,
    up: [pillarOf(b), slug(s), 'composite-chart'], across: around(signs, i, ([x]) => `composite-${slug(b)}-in-${slug(x)}`) }));
  houses.forEach((k, i) => combo(['Composite chart placements', 'Placements du thème composite'], 'composite', 3, {
    id: `composite-${slug(b)}-in-${n(k)}-house`, slugFr: `${slug(bf, 'fr')}-composite-en-maison-${k}`, en: `Composite ${b} in the ${n(k)} house`, fr: `${bf} composite en maison ${k}`,
    up: [pillarOf(b), `${n(k)}-house`, 'composite-chart'], across: around(houses, i, (x) => `composite-${slug(b)}-in-${n(x)}-house`) }));
}
for (const k1 of houses) {
  houses.forEach((k2, i) => combo(['House rulers in the houses', 'Maîtres de maison dans les maisons'], 'ruler-house', 3, {
    id: `${n(k1)}-house-ruler-in-${n(k2)}-house`, slugFr: `maitre-maison-${k1}-en-maison-${k2}`, en: `Ruler of the ${n(k1)} in the ${n(k2)} house`, fr: `Maître de la maison ${k1} en maison ${k2}`,
    up: [`${n(k1)}-house`, `${n(k2)}-house`, 'house-rulers'], across: around(houses, i, (x) => `${n(k1)}-house-ruler-in-${n(x)}-house`) }));
}
// the sign on the 1st house cusp is the rising sign, which has its own page: no second page competes with it
const cuspPage = (s, k) => (k === 1 ? `${slug(s)}-rising` : `${slug(s)}-on-${n(k)}-house-cusp`);
for (const [s, sf] of signs) {
  houses.forEach((k, i) => k > 1 && combo(['Signs on the house cusps', 'Signes sur les cuspides'], 'sign-cusp', 3, {
    id: cuspPage(s, k), slugFr: `${slug(sf, 'fr')}-cuspide-maison-${k}`, en: `${s} on the ${n(k)} house cusp`, fr: `${sf} sur la cuspide de la maison ${k}`,
    up: [slug(s), `${n(k)}-house`, 'house-cusps'], across: around(houses, i, (x) => cuspPage(s, x)) }));
}
const stars = [['Regulus', 'Régulus'], ['Aldebaran', 'Aldébaran'], ['Antares', 'Antarès'], ['Fomalhaut', 'Fomalhaut'], ['Algol', 'Algol'], ['Spica', 'Spica']];
const starBodies = ['Sun', 'Moon', 'Venus', 'Mars', 'Saturn'];
for (const [st, stf] of stars) {
  starBodies.forEach((b, i) => combo(['Fixed star contacts', 'Contacts aux étoiles fixes'], 'star-contact', 3, {
    id: `${slug(b)}-conjunct-${slug(st)}`, slugFr: `${slug(fr(b)[1], 'fr')}-conjonction-${slug(stf, 'fr')}`, en: `${b} conjunct ${st}`, fr: `${fr(b)[1]} conjonction ${stf}`,
    up: [pillarOf(b), slug(st), 'conjunctions-to-fixed-stars'], across: starBodies.filter((x) => x !== b).map((x) => `${slug(x)}-conjunct-${slug(st)}`) }));
}

// 3. no two pages share an address in either language, and every link leads to a page of the plan
const seenFr = new Map();
for (const p of pages) {
  if (seenFr.has(p.pathFr)) throw new Error(`Two pages share the French address ${p.pathFr}: “${seenFr.get(p.pathFr)}” and “${p.fr}”`);
  seenFr.set(p.pathFr, p.fr);
}
const hubs = new Set(['/astrology/', '/sky/']);
for (const p of pages) {
  for (const id of [...p.up, ...p.across]) {
    if (!hubs.has(id) && !byId.has(id)) throw new Error(`${p.id} links to ${id}, which isn't in the plan`);
  }
}

// 4. the writing order of tier 1, as in the master list
const t1 = (p) => p.tier === 1 && p.status !== 'published';
const signature = new Set(['saturn', 'chiron', 'black-moon-lilith']);
const batches = [
  ['The pillars: planets, signs, houses, angles, nodes, Chiron, Lilith, the major aspects', (p) => ['pillar', 'sign', 'house', 'aspect-type'].includes(p.kind) || ['horizon-axis', 'meridian-axis', 'nodal-axis', 'which-lilith-is-mine', 'part-of-fortune'].includes(p.id)],
  ['Saturn, Chiron and Lilith in every sign and house', (p) => ['planet-in-sign', 'planet-in-house'].includes(p.kind) && signature.has(p.up[0])],
  ['The other bodies in the signs and houses, and the rising signs', (p) => ['planet-in-sign', 'planet-in-house', 'rising'].includes(p.kind)],
  ['Astrology tested, the practical guides and birth time by country', (p) => ['tested', 'practical'].includes(p.family) && p.kind !== 'sky-calendar'],
  ['The Moon, retrogrades and eclipses, ready for the sky calendar', (p) => p.family === 'moon' || p.kind === 'moon-in-sign' || p.kind === 'sky-calendar' || p.group === 'Motion'],
  ['Everything else in tier 1', () => true],
];
for (const p of pages) {
  if (p.status === 'published') { p.batch = 0; continue; }
  if (!t1(p)) continue;
  p.batch = batches.findIndex(([, test]) => test(p)) + 1;
}

// 5. write it out
const famNames = Object.fromEntries([...families.map((f) => [f.key, [f.en, f.fr]]), ['combinations', ['Combination pages', 'Pages combinées']]]);
const counts = { all: pages.length, published: pages.filter((p) => p.status === 'published').length, byTier: {}, byBatch: {}, byFamily: {} };
for (const p of pages) {
  counts.byTier[p.tier] = (counts.byTier[p.tier] || 0) + 1;
  if (p.batch !== undefined) counts.byBatch[p.batch] = (counts.byBatch[p.batch] || 0) + 1;
  counts.byFamily[p.family] = (counts.byFamily[p.family] || 0) + 1;
}
const out = {
  about: 'The page plan of The Astro Study: every page of the encyclopaedia, in English and French. Built by tools/plan/build-plan.mjs from tools/plan/master-list.mjs.',
  built: new Date().toISOString().slice(0, 10),
  counts,
  batches: batches.map(([name]) => name),
  families: famNames,
  kinds: Object.fromEntries(Object.entries(kinds).map(([k, [en, f]]) => [k, { en, fr: f }])),
  pages: pages.map(({ id, family, group, groupFr, kind, tier, batch, status, en, fr: f, path, pathFr, up, across }) =>
    ({ id, family, group, groupFr, kind, tier, batch, status, en, fr: f, path, pathFr, up, across })),
};
await writeFile(new URL('../../plan/pages.json', import.meta.url), JSON.stringify(out, null, 1));
const csv = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const lines = [['tier', 'batch', 'status', 'family', 'group', 'kind', 'title_en', 'address_en', 'title_fr', 'address_fr', 'links_up', 'links_across'].join(',')];
for (const p of pages) lines.push([p.tier, p.batch ?? '', p.status, famNames[p.family][0], p.group, p.kind, p.en, p.path, p.fr, p.pathFr, p.up.join(' '), p.across.join(' ')].map(csv).join(','));
await writeFile(new URL('../../plan/pages.csv', import.meta.url), `${lines.join('\n')}\n`);

console.log(`${pages.length} pages per language (${counts.published} published). By tier: ${Object.entries(counts.byTier).map(([t, c]) => `T${t} ${c}`).join(', ')}.`);
console.log(`Tier 1 by batch: ${Object.entries(counts.byBatch).filter(([b]) => b !== '0').map(([b, c]) => `${b}: ${c}`).join(', ')}.`);
console.log(`By family: ${Object.entries(counts.byFamily).map(([f, c]) => `${f} ${c}`).join(', ')}.`);
