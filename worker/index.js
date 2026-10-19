// The Astro Study on Cloudflare Workers. The Hugo site (public/) is served as static files; this
// script answers two addresses:
//   /api/sky     the sky right now, read from FreeAstroAPI with the key kept here as a Worker secret
//                (FREE_ASTRO_API_KEY) instead of in a page, where anyone could copy it. Same idea as
//                AGS's sky-store: one call captures every planet's position and speed, the answer is
//                kept for six hours, and each visitor's browser moves the planets on to the minute
//                (assets/js/sky.js).
//   /api/places  birthplace suggestions for the order form, from Photon (see places() below).

export const DEFAULT_ENDPOINT = 'https://api.freeastroapi.com/api/v1/natal/calculate';
// FreeAstroAPI is asked again after six hours, as AGS does. If it doesn't answer, the last good
// sky is kept for two days: moved on by its speeds, it's still right to within a degree or so.
const FRESH_MS = 6 * 60 * 60 * 1000;
const KEEP_S = 2 * 24 * 60 * 60;
const TIMEOUT_MS = 10_000;

const KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'lilith'];
const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
// Mean daily motion, used only if an answer leaves a speed out (the sign follows the retrograde flag).
const MEAN = { sun: 0.9856, moon: 13.1764, mercury: 1.383, venus: 1.2, mars: 0.524, jupiter: 0.0831, saturn: 0.0335, uranus: 0.0117, neptune: 0.006, pluto: 0.004, chiron: 0.02, lilith: 0.1114 };

// One isolate serves many visitors in a row: the sky it last read is reused before anything else.
let memory = null;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sky' || url.pathname === '/api/sky/') {
      if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
      return sky(request, env, ctx);
    }
    if (url.pathname === '/api/places' || url.pathname === '/api/places/') {
      if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
      return places(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  },
};

async function sky(request, env, ctx) {
  const now = Date.now();
  if (memory && now - memory.fetched < FRESH_MS) return reply(memory.snapshot);

  // The Cache API keeps the sky for the whole data centre, across isolates (it does nothing on a
  // workers.dev address, where the memory above does the work alone).
  const cache = caches.default;
  const key = new Request(new URL('/api/sky/snapshot', request.url));
  let stale = memory?.snapshot ?? null;
  const hit = await cache.match(key).catch(() => null);
  if (hit) {
    const snapshot = await hit.json().catch(() => null);
    const fetched = Date.parse(snapshot?.fetchedAt ?? '');
    if (snapshot && now - fetched < FRESH_MS) {
      memory = { snapshot, fetched };
      return reply(snapshot);
    }
    if (snapshot) stale = snapshot;
  }

  const apiKey = (env.FREE_ASTRO_API_KEY ?? '').trim();
  if (!apiKey) {
    if (stale) return reply(stale, true);
    return json({ error: 'not_configured', message: 'The FREE_ASTRO_API_KEY secret is not set on this Worker.' }, 503);
  }
  try {
    const snapshot = await ask(env.FREE_ASTRO_API_URL || DEFAULT_ENDPOINT, apiKey, now);
    memory = { snapshot, fetched: now };
    const stored = new Response(JSON.stringify(snapshot), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${KEEP_S}` },
    });
    ctx.waitUntil(cache.put(key, stored).catch(() => {}));
    return reply(snapshot);
  } catch (err) {
    // the message names the status (401, 429…), never the key
    console.warn('[sky]', err.message);
    if (stale) return reply(stale, true);
    return json({ error: 'sky_failed', message: err.message }, 502);
  }
}

export async function ask(endpoint, apiKey, now) {
  const at = new Date(Math.floor(now / 60000) * 60000);
  const body = {
    name: 'The sky',
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
    hour: at.getUTCHours(),
    minute: at.getUTCMinutes(),
    time_known: true,
    // planetary longitudes don't depend on the place; Greenwich anchors houses nobody reads here
    lat: 51.4779,
    lng: 0,
    tz_str: 'UTC',
    house_system: 'placidus',
    zodiac_type: 'tropical',
    include_speed: true,
    include_minor_aspects: false,
    include_features: ['chiron', 'lilith'],
    interpretation: { enable: false },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`FreeAstroAPI answered ${res.status}`);
  const data = await res.json().catch(() => null);
  const bodies = readPlanets(data);
  if (!bodies.some((b) => b.key === 'sun') || !bodies.some((b) => b.key === 'moon') || bodies.length < 7) {
    throw new Error('FreeAstroAPI answered without planets we could read');
  }
  return { at: at.toISOString(), fetchedAt: new Date(now).toISOString(), bodies, source: 'freeastroapi' };
}

// Planets come back in one list, extra points (Chiron, Lilith) included, under their own names.
// The absolute longitude is used when given; otherwise it's rebuilt from the sign and the degree.
function readPlanets(data) {
  const found = new Map();
  for (const p of Array.isArray(data?.planets) ? data.planets : []) {
    const name = String(p?.name ?? '').toLowerCase();
    const key = KEYS.includes(name) ? name : name.includes('lilith') ? 'lilith' : null;
    if (!key || found.has(key)) continue;
    let lon = Number.isFinite(p.abs_pos) ? p.abs_pos : NaN;
    if (!Number.isFinite(lon)) {
      const sign = SIGNS.indexOf(String(p.sign_id ?? '').toLowerCase());
      if (sign >= 0 && Number.isFinite(p.pos)) lon = sign * 30 + p.pos;
    }
    if (!Number.isFinite(lon)) continue;
    lon = ((lon % 360) + 360) % 360;
    let speed = [p.speed, p.speed_deg_per_day, p.daily_motion].find((v) => Number.isFinite(v) && v !== 0);
    if (speed === undefined) speed = p.retrograde === true ? -MEAN[key] : MEAN[key];
    found.set(key, { key, lon: Math.round(lon * 10000) / 10000, speed });
  }
  return KEYS.filter((k) => found.has(k)).map((k) => found.get(k));
}

// Birthplace suggestions, from Photon: the open-source place search built on OpenStreetMap, on
// Komoot's free public server. Asked from here rather than from the visitor's browser, so Komoot
// never learns who is typing; each answer is kept a week for the whole data centre, which also
// spares that server (its fair-use rule is "a reasonable number of requests"). Only towns and
// villages come back, trimmed to what the form shows, in Photon's own GeoJSON shape so the
// browser reads this and the public server (on the GitHub Pages preview) alike.
const PLACES_ENDPOINT = 'https://photon.komoot.io/api/';
const PLACES_KEEP_S = 7 * 24 * 60 * 60;
const PLACES_TIMEOUT_MS = 6000;

async function places(request, env, ctx) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const lang = url.searchParams.get('lang') === 'fr' ? 'fr' : 'en';
  if (q.length < 2) return json({ type: 'FeatureCollection', features: [] });

  const cache = caches.default;
  const key = new Request(`${url.origin}/api/places/cache?lang=${lang}&q=${encodeURIComponent(q.toLowerCase())}`);
  const hit = await cache.match(key).catch(() => null);
  if (hit) return hit;

  const target = new URL(env.PHOTON_URL || PLACES_ENDPOINT);
  target.searchParams.set('q', q);
  target.searchParams.set('lang', lang);
  target.searchParams.set('limit', '6');
  for (const layer of ['city', 'locality']) target.searchParams.append('layer', layer);
  try {
    const res = await fetch(target, {
      headers: { accept: 'application/json', 'user-agent': 'The Astro Study (astrostudy.co.uk) - birthplace suggestions' },
      signal: AbortSignal.timeout(PLACES_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Photon answered ${res.status}`);
    const data = await res.json();
    const features = (data?.features ?? []).map(slimPlace).filter(Boolean);
    const out = json({ type: 'FeatureCollection', features }, 200, { 'cache-control': `public, max-age=${PLACES_KEEP_S}` });
    ctx.waitUntil(cache.put(key, out.clone()).catch(() => {}));
    return out;
  } catch (err) {
    console.warn('[places]', err);
    return json({ type: 'FeatureCollection', features: [], error: 'places_failed' }, 502);
  }
}

function slimPlace(f) {
  const p = f?.properties ?? {};
  const c = f?.geometry?.coordinates;
  if (!p.name || !Array.isArray(c) || !Number.isFinite(c[0]) || !Number.isFinite(c[1])) return null;
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [c[0], c[1]] },
    properties: { name: p.name, county: p.county, state: p.state, country: p.country, countrycode: p.countrycode },
  };
}

function reply(snapshot, stale = false) {
  // browsers may keep it ten minutes: they move the planets on by themselves in the meantime
  return json({ at: snapshot.at, bodies: snapshot.bodies, source: snapshot.source }, 200, {
    'cache-control': 'public, max-age=600',
    ...(stale ? { 'x-sky-stale': '1' } : {}),
  });
}

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', ...headers },
  });
}
