// Starts the meadow behind the page, or falls back gracefully:
//   live WebGL2 scene  →  pre-rendered video loop  →  the still poster that is already on screen.
// People who ask their device for less motion get the still, on purpose.

import { createMeadow, webgl2Available, OPENING_MOMENT } from './meadow/index.js';

const host = document.querySelector('.meadow');
const canvas = host?.querySelector('canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const scrollProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
};

// A first guess; the scene steps itself down if the device can't keep up.
function firstQuality() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 820;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  if (coarse && small) return 'low';
  if (memory <= 4 || cores <= 4 || coarse) return 'medium';
  return 'high';
}

function useVideo() {
  if (!host || host.querySelector('video') || reduce.matches) return;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
  const v = document.createElement('video');
  v.muted = true;
  v.defaultMuted = true;
  v.loop = true;
  v.playsInline = true;
  v.autoplay = true;
  v.preload = 'auto';
  v.setAttribute('muted', '');
  v.setAttribute('playsinline', '');
  v.setAttribute('aria-hidden', 'true');
  // VP9 first (smaller); browsers that can't play it take the H.264 file
  const base = host.dataset.loop + (innerHeight > innerWidth ? 'tall' : 'wide');
  for (const [ext, type] of [['webm', 'video/webm; codecs="vp9"'], ['mp4', 'video/mp4']]) {
    const src = document.createElement('source');
    src.src = `${base}.${ext}`;
    src.type = type;
    v.appendChild(src);
  }
  v.addEventListener('playing', () => host.classList.add('is-video'), { once: true });
  host.appendChild(v);
  v.play().catch(() => {});
  // asking for less motion mid-visit stills the film too
  reduce.addEventListener?.('change', (e) => (e.matches ? v.pause() : v.play().catch(() => {})));
  // the film cannot tilt like the live camera, so it slides a little instead
  const tilt = () => {
    v.style.transform = `translate3d(0, ${(scrollProgress() * 7).toFixed(2)}%, 0) scale(1.16)`;
  };
  addEventListener('scroll', tilt, { passive: true });
  tilt();
}

async function boot() {
  if (!host || !canvas || reduce.matches) return;
  if (!webgl2Available()) return useVideo();
  let meadow = null;
  const giveUp = () => {
    meadow?.destroy();
    host.classList.remove('is-live');
    useVideo();
  };
  // Each visit opens on the same sky as the poster, then lets it drift. The page changes without
  // reloading, so the clock keeps running from page to page.
  const clock = () => OPENING_MOMENT + performance.now() / 1000;
  try {
    meadow = createMeadow(canvas, { quality: firstQuality(), onStruggle: giveUp, clock });
    if (!meadow) return useVideo();
    await meadow.init();
  } catch (err) {
    console.warn('[meadow]', err);
    return giveUp();
  }

  const sync = () => meadow.setScroll(scrollProgress());
  addEventListener('scroll', sync, { passive: true });
  addEventListener('astro:page', sync);
  sync();
  // a few settled frames straight away, so there is always a picture before the canvas fades in
  meadow.still(clock(), 3);

  // The paper sheets hide almost all of the meadow. Only draw while one of its openings (the hero,
  // a window between sheets, the closing sky) is on screen: it saves battery, and the browser no
  // longer has to re-blur the backdrop behind every sheet thirty times a second.
  const open = new Set();
  const update = () => (!document.hidden && !reduce.matches && open.size > 0 ? meadow.start() : meadow.stop());
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? open.add(e.target) : open.delete(e.target);
      update();
    },
    { rootMargin: '15% 0px' }
  );
  const watch = () => {
    io.disconnect();
    open.clear();
    document.querySelectorAll('.hero, .window').forEach((el) => io.observe(el));
  };
  addEventListener('astro:page', watch);
  watch();
  meadow.start();

  // fade the live scene in over the poster once a few frames have landed
  let frames = 0;
  const reveal = () => (++frames < 4 ? requestAnimationFrame(reveal) : host.classList.add('is-live'));
  requestAnimationFrame(reveal);

  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    giveUp();
  });
  let t = 0;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => meadow.resize(), 180);
  });
  reduce.addEventListener?.('change', update);
}

// Let the page itself paint first; the meadow is the backdrop, not the headline.
if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 900 });
else setTimeout(boot, 120);
