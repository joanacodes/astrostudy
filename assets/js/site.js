// Astrostudy — how the pages behave. The meadow behind them boots separately (meadow-boot.js).
//
// Pages change without a full reload, so the sky keeps drifting while you move around the site.
// Everything still works as plain links and a plain form if this script never runs.

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

function headerState() {
  header?.classList.toggle('is-scrolled', scrollY > 40);
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
   Questions that open and close softly instead of jumping. */

function faqs(root) {
  for (const d of $$('details[data-faq]', root)) {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.answer');
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
   The mobile menu. */

const menuBtn = $('[data-menu]');
const drawer = $('#drawer');
function setMenu(open) {
  if (!menuBtn || !drawer) return;
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  drawer.inert = !open;
  const label = $('[data-menu-label]', menuBtn);
  if (label) label.textContent = open ? 'Close' : 'Menu';
  if (open) drawer.querySelector('a')?.focus({ preventScroll: true });
}
menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
    setMenu(false);
    menuBtn.focus();
  }
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
  const sent = form.nextElementSibling?.matches('[data-sent]') ? form.nextElementSibling : null;

  const sync = () => {
    const opt = select.selectedOptions[0];
    const pair = opt?.dataset.kind === 'pair';
    for (const el of form.querySelectorAll('[data-pair]')) el.hidden = !pair;
    const consent = form.querySelector('[data-pair-required]');
    if (consent) consent.required = pair;
    if (subject) subject.value = `New message — ${opt && opt.dataset.id !== 'unsure' ? opt.value : 'astrostudy.co.uk'}`;
  };
  select?.addEventListener('change', sync);
  sync();

  form.addEventListener('submit', async (e) => {
    const endpoint = form.dataset.ajax;
    if (!endpoint || !window.fetch) return;
    e.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    status.textContent = 'Sending…';
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
        status.textContent = 'Thank you — your message is with me.';
      }
    } catch (err) {
      console.warn('[contact]', err);
      const mail = form.dataset.email;
      // FormSubmit answers this way until the owner clicks the link in its first email.
      if (/activat/i.test(err.message)) {
        status.textContent = `Almost there: this form still needs to be activated. FormSubmit has sent the activation link to ${mail}.`;
      } else {
        status.innerHTML = `Sorry — that didn’t go through. Please try again, or write to <a href="mailto:${mail}">${mail}</a>.`;
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
  sheet.showModal();
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
  sheet.addEventListener(
    'animationend',
    () => {
      sheet.classList.remove('is-closing');
      sheet.close();
    },
    { once: true }
  );
}
if (sheet) {
  wireForm(sheet.querySelector('[data-form]'));
  sheet.addEventListener('close', () => document.body.classList.remove('contact-open'));
  sheet.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeContact();
  });
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeContact();
    if (e.target !== sheet) return;
    const r = sheet.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeContact();
  });
}

/* ---------------------------------------------------------------------------------------------
   Moving between pages without reloading the meadow. */

const cache = new Map();
let navigating = false;

function classify(a) {
  if (!a || !a.href || a.hasAttribute('download') || a.hasAttribute('data-no-route')) return null;
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

function scrollToHash(hash, smooth) {
  const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth && !reduce.matches ? 'smooth' : 'auto', block: 'start' });
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

async function go(href, { push = true, y = null } = {}) {
  if (navigating) return;
  navigating = true;
  const html = document.documentElement;
  try {
    const textP = fetchPage(href);
    setMenu(false);
    if (sheet?.open) sheet.close();
    html.classList.add('is-leaving');
    await wait(reduce.matches ? 0 : 380);
    const doc = new DOMParser().parseFromString(await textP, 'text/html');
    const next = doc.querySelector('main');
    if (!next) throw new Error('no <main>');
    if (push) {
      history.replaceState({ ...(history.state || {}), y: scrollY }, '');
      history.pushState({ y: 0 }, '', href);
    }
    swapHead(doc);
    const main = $('main');
    main.replaceWith(document.importNode(next, true));
    document.body.dataset.page = doc.body.dataset.page || '';
    const nav = $('[data-nav]');
    const nextNav = doc.querySelector('[data-nav]');
    if (nav && nextNav) nav.innerHTML = nextNav.innerHTML;

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
    location.href = href;
  } finally {
    navigating = false;
  }
}

if ('fetch' in window && 'DOMParser' in window && history.pushState) {
  // We restore scroll positions ourselves (pages are swapped in place), including after a reload.
  history.scrollRestoration = 'manual';
  addEventListener('pagehide', () => history.replaceState({ ...(history.state || {}), y: scrollY }, ''));
  addEventListener('popstate', (e) => go(location.href, { push: false, y: e.state?.y ?? 0 }));
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
  if (kind === 'hash') {
    e.preventDefault();
    const url = new URL(a.href);
    if (scrollToHash(url.hash, true)) history.pushState(history.state, '', url.hash);
    setMenu(false);
    return;
  }
  if (kind === 'same') {
    e.preventDefault();
    setMenu(false);
    scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    return;
  }
  if (!('DOMParser' in window)) return;
  e.preventDefault();
  go(a.href);
});

/* ---------------------------------------------------------------------------------------------
   Per page. */

function initPage(root) {
  arrivals(root);
  collectDrawings(root);
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
const reloaded = performance.getEntriesByType?.('navigation')[0]?.type === 'reload';
if (reloaded && history.state?.y) requestAnimationFrame(() => scrollTo(0, history.state.y));
else if (location.hash) requestAnimationFrame(() => scrollToHash(location.hash, false));
