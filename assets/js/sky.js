// The sky right now, on the home page. The positions come from /api/sky — the Cloudflare Worker in
// worker/index.js, which keeps the FreeAstroAPI key and refreshes its answer every few hours — with
// each planet's speed in degrees a day. Here they're moved on to this minute, placed on the wheel,
// and the list beside it follows. If the sky can't be had, the block steps aside.

const SVGNS = 'http://www.w3.org/2000/svg';
const TENDER = new Set(['saturn', 'chiron', 'lilith']);
// The major aspects, with the orbs a reader would use for a quick look at the day's sky.
// Lilith is left out of the lines: she's a point, not a body, and the wheel stays readable.
const ASPECTS = [
  { angle: 60, orb: 4, hard: false },
  { angle: 90, orb: 6, hard: true },
  { angle: 120, orb: 6, hard: false },
  { angle: 180, orb: 7, hard: true },
];
const R_DOT = 150;
const R_LINES = 86;
// Older than this, the straight-line move from the build's snapshot drifts (the Moon speeds up and
// slows down, planets station and turn): the wheel then shows the snapshot as it was, with its date.
const MAX_DAYS = 3;

const norm = (d) => ((d % 360) + 360) % 360;
const gap = (a, b) => {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
};
// 0° Aries at nine o'clock, the zodiac anticlockwise — the same convention as wheel-sky.html
const at = (lon, r) => [-r * Math.cos((lon * Math.PI) / 180), r * Math.sin((lon * Math.PI) / 180)];

function el(name, attrs) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

// Each label sits just inside its planet's dot, as close as its box allows: a word lying across
// the wheel at nine o'clock needs more room than one at twelve. Labels that would touch fan out
// along the circle, away from each other (as chart software spreads its glyphs), and a hairline
// ties a moved label back to its planet. Box sizes are estimated from the text: 7px, letter-spaced.
const DOT_GAP = 9;
function labelGeometry(it) {
  const rad = (it.theta * Math.PI) / 180;
  const reach = (it.w / 2) * Math.abs(Math.cos(rad)) + (it.h / 2) * Math.abs(Math.sin(rad));
  const across = (it.w / 2) * Math.abs(Math.sin(rad)) + (it.h / 2) * Math.abs(Math.cos(rad));
  const r = R_DOT - DOT_GAP - reach;
  return { r, half: ((across + 1.5) / r) * (180 / Math.PI) };
}
function placeLabels(bodies, names) {
  const items = bodies.map((b) => {
    const text = names[b.key] || b.key;
    return { key: b.key, lon: norm(b.lon), theta: norm(b.lon), text, w: text.length * 5.6 + 4, h: 9 };
  });
  // Cut the circle in its widest empty stretch, so no group of labels straddles the cut, and lay
  // the labels out along a line from there.
  items.sort((a, b) => a.lon - b.lon);
  let cut = 0;
  let widest = -1;
  items.forEach((it, i) => {
    const next = items[(i + 1) % items.length];
    const g = norm(next.lon - it.lon) || (items.length === 1 ? 360 : 0);
    if (g > widest) {
      widest = g;
      cut = (i + 1) % items.length;
    }
  });
  const line = items.slice(cut).concat(items.slice(0, cut));
  const base = line[0].lon;
  line.forEach((it) => (it.want = base + norm(it.lon - base)));

  // Labels that would touch join one group; a group is laid out with just enough room between its
  // labels and centred on where its planets are. Groups merge until none touch. Labels never cross.
  const layout = (group) => {
    const rel = [0];
    for (let i = 1; i < group.length; i++) rel.push(rel[i - 1] + group[i - 1].half + group[i].half);
    const shift = group.reduce((t, it, i) => t + it.want - rel[i], 0) / group.length;
    group.forEach((it, i) => (it.theta = shift + rel[i]));
  };
  // a label's room depends on its angle (a word lying across the wheel at the sides, standing up
  // at the top), so lay out, measure again where the labels landed, and lay out once more
  for (let round = 0; round < 3; round++) {
    line.forEach((it) => (it.half = labelGeometry(it).half));
    const groups = line.map((it) => [it]);
    groups.forEach(layout);
    for (let i = 0; i + 1 < groups.length; ) {
      const a = groups[i];
      const b = groups[i + 1];
      const last = a[a.length - 1];
      if (b[0].theta - last.theta < last.half + b[0].half) {
        a.push(...b);
        groups.splice(i + 1, 1);
        layout(a);
        i = Math.max(0, i - 1);
      } else {
        i++;
      }
    }
  }

  const out = new Map();
  for (const it of line) {
    const { r } = labelGeometry(it);
    const [x, y] = at(it.theta, r);
    out.set(it.key, { x, y, text: it.text, theta: norm(it.theta), moved: gap(it.theta, it.lon) > 1 });
  }
  return out;
}

function drawPlanets(svg, bodies, names) {
  const layer = svg.querySelector('[data-sky-planets]');
  if (!layer) return;
  const frag = document.createDocumentFragment();
  bodies.forEach((b, i) => {
    const [x, y] = at(b.lon, R_DOT);
    const r = b.key === 'sun' ? 4.2 : b.key === 'moon' ? 3.4 : 2.8;
    if (b.key === 'sun') {
      frag.append(el('circle', { class: 'w-line w-faint', cx: x.toFixed(2), cy: y.toFixed(2), r: 8, pathLength: 1, style: `--s:${(0.44 + i * 0.015).toFixed(3)};--l:.08` }));
    }
    frag.append(el('circle', { class: `w-dot${TENDER.has(b.key) ? ' w-dot--accent' : ''}`, cx: x.toFixed(2), cy: y.toFixed(2), r, style: `--s:${(0.44 + i * 0.015).toFixed(3)}` }));
  });
  const labels = placeLabels(bodies, names);
  bodies.forEach((b, i) => {
    const l = labels.get(b.key);
    if (l.moved) {
      const [x1, y1] = at(b.lon, R_DOT - 4);
      const [x2, y2] = at(l.theta, R_DOT - DOT_GAP + 2);
      frag.append(el('path', { class: 'w-line w-faint', d: `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`, pathLength: 1, style: `--s:${(0.5 + i * 0.015).toFixed(3)};--l:.04` }));
    }
    const t = el('text', { x: l.x.toFixed(2), y: l.y.toFixed(2), 'text-anchor': 'middle', 'dominant-baseline': 'central', style: `--s:${(0.5 + i * 0.015).toFixed(3)}` });
    if (TENDER.has(b.key)) t.setAttribute('class', 'w-accent-text');
    t.textContent = l.text;
    frag.append(t);
  });
  const lined = bodies.filter((b) => b.key !== 'lilith');
  let k = 0;
  for (let i = 0; i < lined.length; i++) {
    for (let j = i + 1; j < lined.length; j++) {
      const d = gap(lined[i].lon, lined[j].lon);
      const asp = ASPECTS.find((a) => Math.abs(d - a.angle) <= a.orb);
      if (!asp) continue;
      const [x1, y1] = at(lined[i].lon, R_LINES);
      const [x2, y2] = at(lined[j].lon, R_LINES);
      frag.append(el('path', { class: `w-line${asp.hard ? ' w-accent' : ''}`, d: `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`, pathLength: 1, style: `--s:${(0.64 + k * 0.025).toFixed(3)};--l:.12` }));
      k++;
    }
  }
  layer.replaceChildren(frag);
}

function updateList(box, bodies, data) {
  const sun = bodies.find((b) => b.key === 'sun');
  for (const b of bodies) {
    const row = box.querySelector(`[data-body="${b.key}"]`);
    if (!row) continue;
    const sign = Math.floor(b.lon / 30);
    const where = row.querySelector('[data-where]');
    const note = row.querySelector('[data-note]');
    if (where) where.textContent = `${Math.floor(b.lon - sign * 30)}° ${data.signs[sign]}`;
    if (!note) continue;
    if (b.key === 'moon' && sun) {
      const elong = norm(b.lon - sun.lon);
      const phase = data.phases[Math.floor(norm(elong + 22.5) / 45) % 8];
      const lit = Math.round(((1 - Math.cos((elong * Math.PI) / 180)) / 2) * 100);
      note.textContent = `${phase} · ${data.lit.replace('{n}', lit)}`;
    } else {
      note.textContent = b.speed < 0 ? data.retro : '';
    }
  }
}

// One request per visit: moving between pages reuses the answer for ten minutes, the planets being
// moved on by their speeds in the meantime.
let fetched = null;
function loadSky(api) {
  if (fetched && fetched.api === api && Date.now() - fetched.t < 10 * 60 * 1000) return fetched.p;
  const p = fetch(api, { headers: { accept: 'application/json' } }).then((r) => {
    if (!r.ok) throw new Error(`sky ${r.status}`);
    return r.json();
  });
  fetched = { api, t: Date.now(), p };
  p.catch(() => (fetched = null));
  return p;
}

let timer = 0;
export function initSky(root) {
  clearInterval(timer);
  const box = root.querySelector?.('[data-sky]');
  if (!box) return;
  let words;
  try {
    words = JSON.parse(box.querySelector('[data-sky-words]').textContent);
  } catch {
    box.hidden = true;
    return;
  }
  const svg = box.querySelector('svg');
  const when = box.querySelector('[data-sky-when]');
  const time = box.querySelector('[data-sky-time]');
  let format = null;
  try {
    format = new Intl.DateTimeFormat(words.locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  } catch {
    // an unknown locale: the time line simply stays out
  }

  loadSky(box.dataset.api)
    .then((sky) => {
      const from = Date.parse(sky?.at);
      if (!Number.isFinite(from) || !Array.isArray(sky.bodies) || !sky.bodies.length) throw new Error('sky: nothing to draw');
      if (!box.isConnected) return;
      const render = () => {
        const now = Date.now();
        const days = (now - from) / 864e5;
        // an answer older than this would drift (the Moon speeds up and slows down, planets
        // station and turn): show it as it was rather than guess
        const fresh = days > -1 && days < MAX_DAYS;
        const bodies = sky.bodies.map((b) => ({ ...b, lon: norm(b.lon + (fresh ? b.speed * days : 0)) }));
        if (svg) drawPlanets(svg, bodies, words.names || {});
        updateList(box, bodies, words);
        if (time && format) {
          const shown = fresh ? now : from;
          time.textContent = format.format(shown);
          time.setAttribute('datetime', new Date(shown).toISOString());
          if (when) when.hidden = false;
        }
      };
      render();
      box.classList.add('is-ready');
      // the Moon moves about half a degree an hour: once a minute keeps the wheel honest
      timer = setInterval(() => {
        if (!box.isConnected) clearInterval(timer);
        else if (!document.hidden) render();
      }, 60000);
    })
    .catch((err) => {
      console.warn('[sky]', err.message);
      box.hidden = true;
    });
}
