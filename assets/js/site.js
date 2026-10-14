// The Astro Study — how the pages behave. The meadow behind them boots separately (meadow-boot.js).
//
// Pages change without a full reload, so the sky keeps drifting while you move around the site.
// Everything still works as plain links and a plain form if this script never runs.

import { initSky } from './sky.js';

// Tells the safety net in <head> that the page is in good hands (see head.html).
window.__astro = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const header = $('[data-header]');
const sheet = $('#contact-sheet');

/* ---------------------------------------------------------------------------------------------
   Arrivals: text that settles into place, hairlines that draw across, once each. */

let io = null;
function arrivals(root) {
  const els = $$('[data-reveal], .rule', root);
  if (reduce.matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------------------------------
   Drawings tied to the scroll: the chart wheels draw while you read the list beside them, and the
   line between the steps fills as you pass each one. */

let drawings = [];
function collectDrawings(root) {
  drawings = $$('[data-progress]', root);
}
function updateDrawings() {
  const vh = innerHeight;
  for (const el of drawings) {
    const box = (el.closest('.study') || el).getBoundingClientRect();
    if (box.bottom < -vh || box.top > vh * 2) continue;
    let p;
    if (el.hasAttribute('data-steps')) {
      const line = vh * 0.6;
      p = clamp((line - box.top) / Math.max(box.height, 1), 0, 1);
      for (const li of el.children) li.classList.toggle('is-lit', li.getBoundingClientRect().top < line);
    } else {
      p = clamp((vh * 0.92 - box.top) / (box.height * 0.72 + vh * 0.2), 0, 1);
    }
    el.style.setProperty('--p', reduce.matches ? '1' : p.toFixed(4));
  }
}

// The header is white while the meadow is behind it and turns ink over the glass panels. It looks
// at what actually sits under its middle line, so it's right on every page and after any jump.
let skies = [];
function headerState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', scrollY > 40);
  const y = header.offsetHeight / 2;
  const onSky = skies.some((s) => {
    const r = s.getBoundingClientRect();
    return r.top <= y && r.bottom >= y;
  });
  header.classList.toggle('on-sky', onSky);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateDrawings();
    headerState();
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll, { passive: true });

/* ---------------------------------------------------------------------------------------------
   Questions, and the menu's groups, that open and close softly instead of jumping. */

function faqs(root) {
  for (const d of $$('details[data-faq], details[data-fold]', root)) {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.answer, [data-fold-body]');
    summary.addEventListener('click', (e) => {
      if (reduce.matches || !body.animate) return;
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      const done = () => delete d.dataset.busy;
      if (d.open) {
        const h = body.offsetHeight;
        const a = body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], {
          duration: 420,
          easing: 'cubic-bezier(.22,.61,.36,1)',
        });
        a.onfinish = () => {
          d.open = false;
          done();
        };
      } else {
        d.open = true;
        const h = body.offsetHeight;
        const a = body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], {
          duration: 620,
          easing: 'cubic-bezier(.16,1,.3,1)',
        });
        a.onfinish = done;
      }
    });
  }
}

/* ---------------------------------------------------------------------------------------------
   The mobile menu. While it's open the page behind it is inert, so Tab stays in the menu. */

const menuBtn = $('[data-menu]');
const drawer = $('#drawer');
// The menu lives outside <main>, so page changes don't redraw it: where you are is marked each time
// it opens, while it's still invisible, and the group holding this page (a synastry reading) opens.
function markDrawer() {
  for (const a of $$('a:not([hreflang])', drawer)) {
    const url = new URL(a.href, location.href);
    if (!url.hash && url.pathname === location.pathname) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  for (const d of $$('details[data-fold]', drawer)) {
    // a fold still animating from the last visit would otherwise finish by undoing this
    for (const a of d.querySelector('[data-fold-body]')?.getAnimations?.() || []) a.cancel();
    delete d.dataset.busy;
    d.open = !!d.querySelector('a[aria-current]');
  }
}
function setMenu(open) {
  if (!menuBtn || !drawer) return;
  if (open) markDrawer();
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  drawer.inert = !open;
  for (const el of [$('main'), $('.footer')]) if (el) el.inert = open;
  const label = $('[data-menu-label]', menuBtn);
  if (label) label.textContent = open ? menuBtn.dataset.labelClose || 'Close' : menuBtn.dataset.labelOpen || 'Menu';
  if (open) drawer.querySelector('a')?.focus({ preventScroll: true });
}
menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
    setMenu(false);
    menuBtn.focus();
  }
});
// the menu only exists on narrow screens; widening the window must not leave it covering the page
matchMedia('(min-width: 861px)').addEventListener?.('change', (e) => {
  if (e.matches) setMenu(false);
});

/* ---------------------------------------------------------------------------------------------
   The form: one in the sheet, one on /contact/. Sent through FormSubmit's AJAX endpoint so the
   visitor never leaves the page; without JavaScript it posts normally and lands on /thank-you/. */

function preset(form, id) {
  const select = form?.querySelector('[data-reading]');
  if (!select || !id) return;
  const opt = Array.from(select.options).find((o) => o.dataset.id === id);
  if (opt) {
    select.value = opt.value;
    select.dispatchEvent(new Event('change'));
  }
}

function wireForm(form) {
  if (!form || form.dataset.wired) return;
  form.dataset.wired = '1';
  const select = form.querySelector('[data-reading]');
  const subject = form.querySelector('[data-subject]');
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('[data-submit]');
  const consent = form.querySelector('[data-pair-required]');
  const consentText = form.querySelector('[data-consent-text]');
  const sent = form.nextElementSibling?.matches('[data-sent]') ? form.nextElementSibling : null;

  const sync = () => {
    const opt = select.selectedOptions[0];
    const pair = opt?.dataset.kind === 'pair';
    // Hidden and disabled: nothing about another person is sent unless the reading is about two.
    for (const el of form.querySelectorAll('[data-pair]')) {
      el.hidden = !pair;
      if (el.matches('fieldset')) el.disabled = !pair;
      else el.querySelectorAll('input, select, textarea').forEach((c) => (c.disabled = !pair));
    }
    if (consent) consent.required = pair;
    // coworker readings ask for the colleague's agreement, not just care; the email records
    // exactly the sentence that was ticked
    if (consentText) {
      consentText.dataset.default ??= consentText.textContent;
      consentText.textContent = opt?.dataset.consent || consentText.dataset.default;
      if (consent) consent.value = consentText.textContent;
    }
    if (subject) subject.value = `${subject.dataset.prefix ?? ''}${opt && opt.dataset.id !== 'unsure' ? opt.value : 'astrostudy.co.uk'}`;
  };
  select?.addEventListener('change', sync);
  sync();

  form.addEventListener('submit', async (e) => {
    const endpoint = form.dataset.ajax;
    if (!endpoint || !window.fetch) return;
    e.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    status.textContent = form.dataset.msgSending || '…';
    const data = {};
    for (const [k, v] of new FormData(form)) {
      if (typeof v === 'string' && v.trim() !== '' && k !== '_next') data[k] = v.trim();
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `HTTP ${res.status}`);
      status.textContent = '';
      form.reset();
      sync();
      if (sent) {
        form.hidden = true;
        sent.hidden = false;
        form.parentElement.classList.add('is-sent');
        sent.focus({ preventScroll: true });
      } else {
        status.textContent = form.dataset.msgSent || '';
      }
    } catch (err) {
      console.warn('[contact]', err);
      const mail = form.dataset.email;
      // FormSubmit answers this way until the owner clicks the link in its first email.
      if (/activat/i.test(err.message)) {
        status.textContent = (form.dataset.msgActivate || '').replace('{email}', mail);
      } else {
        const [before, after = ''] = (form.dataset.msgError || '{email}').split('{email}');
        const link = Object.assign(document.createElement('a'), { href: `mailto:${mail}`, textContent: mail });
        status.replaceChildren(before, link, after);
      }
    } finally {
      button.disabled = false;
    }
  });

  sent?.querySelector('[data-again]')?.addEventListener('click', () => {
    sent.hidden = true;
    form.hidden = false;
    form.parentElement.classList.remove('is-sent');
    form.querySelector('input[name="name"]')?.focus();
  });
}

/* ---------------------------------------------------------------------------------------------
   The contact sheet. It closes with a short animation; a second Esc (or Android's back) can close
   it natively mid-way, so every path tidies up after itself. */

let pendingClose = null;
function openContact(readingId) {
  if (!sheet || typeof sheet.showModal !== 'function') return false;
  const form = sheet.querySelector('[data-form]');
  const sent = sheet.querySelector('[data-sent]');
  if (sent && !sent.hidden) {
    sent.hidden = true;
    form.hidden = false;
    form.parentElement.classList.remove('is-sent');
  }
  if (readingId) preset(form, readingId);
  setMenu(false);
  sheet.classList.remove('is-closing');
  if (!sheet.open) sheet.showModal();
  document.body.classList.add('contact-open');
  return true;
}
function closeContact() {
  if (!sheet?.open || sheet.classList.contains('is-closing')) return;
  if (reduce.matches) {
    sheet.close();
    return;
  }
  sheet.classList.add('is-closing');
  pendingClose = (e) => {
    if (e.target !== sheet || e.animationName !== 'sheet-out') return;
    sheet.close();
  };
  sheet.addEventListener('animationend', pendingClose);
}
if (sheet) {
  wireForm(sheet.querySelector('[data-form]'));
  sheet.addEventListener('close', () => {
    sheet.classList.remove('is-closing');
    if (pendingClose) sheet.removeEventListener('animationend', pendingClose);
    pendingClose = null;
    document.body.classList.remove('contact-open');
  });
  sheet.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeContact();
  });
  // Only a press that starts and ends on the backdrop closes the sheet, so selecting text in the
  // form and letting go outside it doesn't throw the message away.
  const outside = (e) => {
    const r = sheet.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let downOutside = false;
  sheet.addEventListener('pointerdown', (e) => {
    downOutside = e.target === sheet && outside(e);
  });
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeContact();
    if (e.target === sheet && downOutside && outside(e)) closeContact();
    downOutside = false;
  });
}

/* ---------------------------------------------------------------------------------------------
   Moving between pages without reloading the meadow. The newest navigation always wins; scroll
   positions live in history entries so Back, Forward and reloads land where you were. */

const cache = new Map();
let navToken = 0;
let shown = location.pathname + location.search;

function classify(a) {
  // the language links lead to the other site (its own header, footer and form): a plain page load
  if (!a || !a.href || a.hasAttribute('download') || a.hasAttribute('data-no-route') || a.hasAttribute('hreflang')) return null;
  if (a.target && a.target !== '_self') return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return null;
  if (url.pathname === location.pathname && url.search === location.search) return url.hash ? 'hash' : 'same';
  return 'page';
}

function fetchPage(url) {
  const key = url.split('#')[0];
  if (!cache.has(key)) {
    const p = fetch(key, { headers: { Accept: 'text/html' } }).then((r) => {
      if (!r.ok || !(r.headers.get('content-type') || '').includes('text/html')) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}

function scrollToHash(hash, smooth, focus = false) {
  const el = hash && hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth && !reduce.matches ? 'smooth' : 'auto', block: 'start' });
  if (focus) {
    // move keyboard focus too, or the next Tab starts back at the top of the page
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  return true;
}

function swapHead(doc) {
  document.title = doc.title;
  for (const sel of [
    'meta[name="description"]',
    'link[rel="canonical"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:url"]',
  ]) {
    const next = doc.head.querySelector(sel);
    const cur = document.head.querySelector(sel);
    if (next && cur) {
      for (const attr of ['content', 'href']) if (next.hasAttribute(attr)) cur.setAttribute(attr, next.getAttribute(attr));
    }
  }
}

function saveY() {
  try {
    history.replaceState({ ...(history.state || {}), y: scrollY }, '');
  } catch {
    // Safari throttles history writes; losing one position is harmless
  }
}

async function go(href, { push = true, y = null } = {}) {
  const token = ++navToken;
  const html = document.documentElement;
  try {
    const textP = fetchPage(href);
    setMenu(false);
    if (sheet?.open) sheet.close();
    if (push) saveY();
    html.classList.add('is-leaving');
    await wait(reduce.matches ? 0 : 380);
    const text = await textP;
    if (token !== navToken) return; // somebody clicked again, or pressed Back: theirs wins
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const next = doc.querySelector('main');
    if (!next) throw new Error('no <main>');
    if (doc.documentElement.lang !== html.lang) {
      location.href = href;
      return;
    }
    if (push) history.pushState({ y: null }, '', href);
    shown = location.pathname + location.search;
    swapHead(doc);
    io?.disconnect();
    io = null;
    $('main').replaceWith(document.importNode(next, true));
    document.body.dataset.page = doc.body.dataset.page || '';
    const nav = $('[data-nav]');
    const nextNav = doc.querySelector('[data-nav]');
    if (nav && nextNav) nav.innerHTML = nextNav.innerHTML;
    // the language links point at this page's translation, so they change with the page
    const langNext = doc.querySelector('[data-lang-link]')?.getAttribute('href');
    if (langNext) for (const a of $$('[data-lang-link]')) a.setAttribute('href', langNext);

    const url = new URL(href, location.href);
    if (y != null) scrollTo(0, y);
    else if (!scrollToHash(url.hash, false)) scrollTo(0, 0);

    html.classList.remove('is-leaving');
    html.classList.add('is-entering');
    initPage($('main'));
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('is-entering')));
    $('#announcer').textContent = doc.title;
    $('main').focus({ preventScroll: true });
    dispatchEvent(new CustomEvent('astro:page'));
  } catch (err) {
    console.warn('[router]', err);
    if (token === navToken) location.href = href;
  }
}

const routing = 'fetch' in window && 'DOMParser' in window && !!history.pushState;
if (routing) {
  history.scrollRestoration = 'manual';
  let saveTimer = 0;
  addEventListener(
    'scroll',
    () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveY, 250);
    },
    { passive: true }
  );
  addEventListener('pagehide', saveY);
  addEventListener('popstate', (e) => {
    const y = typeof e.state?.y === 'number' ? e.state.y : null;
    if (location.pathname + location.search === shown) {
      // the same page, another anchor: just move there (and cancel any page change in flight)
      navToken++;
      document.documentElement.classList.remove('is-leaving');
      if (y != null) scrollTo(0, y);
      else if (!scrollToHash(location.hash, false)) scrollTo(0, 0);
      return;
    }
    go(location.href, { push: false, y });
  });
  // warm the next page while the pointer is still on its way to the link
  addEventListener(
    'pointerover',
    (e) => {
      const a = e.target.closest?.('a');
      if (a && classify(a) === 'page') fetchPage(a.href).catch(() => {});
    },
    { passive: true }
  );
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const trigger = e.target.closest('[data-contact]');
  if (trigger && openContact(trigger.dataset.reading)) {
    e.preventDefault();
    return;
  }
  const a = e.target.closest('a');
  const kind = classify(a);
  if (!kind) return;
  if (kind === 'hash' || kind === 'same') {
    e.preventDefault();
    setMenu(false);
    if (sheet?.open) sheet.close();
    const url = new URL(a.href);
    if (kind === 'hash') {
      if (routing) saveY();
      if (scrollToHash(url.hash, true, true) && routing) history.pushState({ y: null }, '', url.hash);
    } else {
      scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    return;
  }
  if (!routing) return;
  e.preventDefault();
  go(a.href);
});

/* ---------------------------------------------------------------------------------------------
   Per page. */

function initPage(root) {
  arrivals(root);
  initSky(root);
  collectDrawings(root);
  skies = $$('.hero, .window');
  faqs(root);
  for (const form of $$('[data-form]', root)) {
    wireForm(form);
    const id = new URLSearchParams(location.search).get('reading');
    if (id) preset(form, id);
  }
  updateDrawings();
  headerState();
}

initPage(document);
const arrival = performance.getEntriesByType?.('navigation')[0]?.type;
const savedY = typeof history.state?.y === 'number' ? history.state.y : null;
if ((arrival === 'reload' || arrival === 'back_forward') && savedY != null) requestAnimationFrame(() => scrollTo(0, savedY));
else if (location.hash) requestAnimationFrame(() => scrollToHash(location.hash, false));
