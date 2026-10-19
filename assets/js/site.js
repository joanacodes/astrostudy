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

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateDrawings();
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
   The menu: one button, two menus — the panel that slides down from the top on a computer, the whole
   screen on a phone (CSS shows the one that fits). While it's open the page behind it is inert, so
   Tab stays in the menu; a click on the page below the panel closes it. */

const menuBtn = $('[data-menu]');
const drawer = $('#drawer');
const panel = $('#menu-panel');
const menus = [drawer, panel].filter(Boolean);
const wide = matchMedia('(min-width: 861px)');
// The menus live outside <main>, so page changes don't redraw them: where you are is marked each
// time one opens, while it's still invisible, and the phone menu's group holding this page opens.
function markDrawer() {
  for (const menu of menus) {
    for (const a of $$('a:not([hreflang])', menu)) {
      const url = new URL(a.href, location.href);
      if (!url.hash && url.pathname === location.pathname) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  }
  for (const d of $$('details[data-fold]', drawer || document.createElement('div'))) {
    // a fold still animating from the last visit would otherwise finish by undoing this
    for (const a of d.querySelector('[data-fold-body]')?.getAnimations?.() || []) a.cancel();
    delete d.dataset.busy;
    d.open = !!d.querySelector('a[aria-current]');
  }
}
// Opened from the keyboard, focus goes to the first link, ring and all, as keyboard users expect.
// Opened by a tap or a click it goes to the menu itself, so no ring is drawn around a link; Tab
// still starts at the first link.
function setMenu(open, byKeyboard = false) {
  if (!menuBtn || !menus.length) return;
  if (open) markDrawer();
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  for (const menu of menus) menu.inert = !open;
  for (const el of [$('main'), $('.footer')]) if (el) el.inert = open;
  const label = $('[data-menu-label]', menuBtn);
  if (label) label.textContent = open ? menuBtn.dataset.labelClose || 'Close' : menuBtn.dataset.labelOpen || 'Menu';
  const shown = wide.matches ? panel : drawer;
  if (open) (byKeyboard ? shown?.querySelector('a') : shown)?.focus({ preventScroll: true });
}
// a click that comes from Enter or Space has no pointer behind it: detail is 0
menuBtn?.addEventListener('click', (e) => setMenu(!document.body.classList.contains('menu-open'), e.detail === 0));
$('[data-menu-scrim]')?.addEventListener('click', () => setMenu(false));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
    setMenu(false);
    menuBtn.focus();
  }
});
// the open menu belongs to the width it was opened at: crossing over closes it
wide.addEventListener?.('change', () => setMenu(false));

/* ---------------------------------------------------------------------------------------------
   The contact form: one in the sheet, one on /contact/. Sent through FormSubmit's AJAX endpoint so
   the visitor never leaves the page; without JavaScript it posts normally and lands on /thank-you/. */

function wireForm(form) {
  if (!form || form.dataset.wired) return;
  form.dataset.wired = '1';
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('[data-submit]');
  const sent = form.nextElementSibling?.matches('[data-sent]') ? form.nextElementSibling : null;

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
   The order form: in the panel, and on /order/. The reading decides whether there's a second person
   (and their fields) and which prices show. "Continue to payment" opens that reading's Stripe
   Payment Link; the order waits in this tab (sessionStorage) and leaves it only from the page Stripe
   sends the visitor back to once they've paid (wireReceived). Birth details travel with a payment
   or not at all. */

const ORDER_KEY = 'astro-order';
// A reference the visitor, Stripe and the order email all carry, so a payment and its birth
// details meet: AS-251019-K7QD. Letters that can't be misread for digits.
function orderRef() {
  const d = new Date();
  const day = [d.getFullYear() % 100, d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('');
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = crypto.getRandomValues(new Uint8Array(4));
  return `AS-${day}-${Array.from(pick, (n) => abc[n % abc.length]).join('')}`;
}

function presetOrder(form, id) {
  const select = form?.querySelector('[data-order-reading]');
  if (!select || !id || !Array.from(select.options).some((o) => o.value === id)) return;
  select.value = id;
  select.dispatchEvent(new Event('change'));
}

function wireOrder(form) {
  if (!form || form.dataset.wired) return;
  form.dataset.wired = '1';
  const select = form.querySelector('[data-order-reading]');
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('[data-submit]');
  const consent = form.querySelector('[data-pair-required]');
  const consentText = form.querySelector('[data-consent-text]');
  const total = form.querySelector('[data-total]');

  const sync = () => {
    const opt = select.selectedOptions[0];
    const pair = opt?.dataset.kind === 'pair';
    // The other person exists only in a synastry: hidden and disabled otherwise, so their fields
    // are neither required nor sent.
    for (const el of form.querySelectorAll('[data-pair]')) {
      el.hidden = !pair;
      if (el.matches('fieldset')) el.disabled = !pair;
    }
    if (consent) {
      consent.disabled = !pair;
      consent.required = pair;
    }
    // a co-worker reading asks for the colleague's agreement too; the order keeps the very sentence
    // that was ticked
    if (consentText) {
      consentText.dataset.default ??= consentText.textContent;
      consentText.textContent = opt?.dataset.consent || consentText.dataset.default;
      if (consent) consent.value = consentText.textContent;
    }
    const prices = { full: opt?.dataset.priceFull || '', consulting: opt?.dataset.priceConsulting || '' };
    for (const el of form.querySelectorAll('[data-price]')) el.textContent = prices[el.dataset.price] || '';
    const chosen = prices[form.querySelector('input[name="option"]:checked')?.value] || '';
    if (total) {
      total.hidden = !chosen;
      total.querySelector('[data-total-value]').textContent = chosen;
    }
    status.textContent = '';
  };
  select.addEventListener('change', sync);
  form.addEventListener('change', (e) => {
    if (e.target.name === 'option') sync();
  });
  // "I don't know the time" empties the time beside it and sets it aside
  for (const box of form.querySelectorAll('[data-time-unknown]')) {
    const time = form.querySelector(`input[name="${box.dataset.timeUnknown}"]`);
    box.addEventListener('change', () => {
      if (!time) return;
      time.disabled = box.checked;
      if (box.checked) time.value = '';
    });
  }
  sync();
  wirePlaces(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const opt = select.selectedOptions[0];
    const option = form.querySelector('input[name="option"]:checked')?.value === 'consulting' ? 'consulting' : 'full';
    const link = opt?.dataset[option === 'consulting' ? 'payConsulting' : 'payFull'];
    if (!link) {
      status.textContent = form.dataset.msgClosed || '';
      return;
    }
    const ref = orderRef();
    const order = { ref, lang: document.documentElement.lang, reading_label: opt.textContent.trim() };
    for (const [k, v] of new FormData(form)) {
      if (typeof v === 'string' && v.trim() !== '') order[k] = v.trim();
    }
    let url;
    try {
      url = new URL(link);
      sessionStorage.setItem(ORDER_KEY, JSON.stringify({ at: Date.now(), order }));
    } catch (err) {
      // no storage (a locked-down browser) or a mistyped link: better to say so than take a payment
      // whose details would be lost
      console.warn('[order]', err);
      status.textContent = form.dataset.msgError || '';
      return;
    }
    url.searchParams.set('client_reference_id', ref);
    if (order.email) url.searchParams.set('prefilled_email', order.email);
    url.searchParams.set('locale', order.lang.startsWith('fr') ? 'fr' : 'en-GB');
    button.disabled = true;
    status.textContent = form.dataset.msgOpening || '…';
    location.assign(url.href);
    // coming back with the browser's Back button shows the form as it was, ready again
    addEventListener('pageshow', () => {
      button.disabled = false;
      status.textContent = '';
    }, { once: true });
  });
}

/* ---------------------------------------------------------------------------------------------
   Back from Stripe: /order-received/?session_id=… The order kept in this tab is sent now, with
   Stripe's session id and the reference, through the same form service as the contact form. It's
   only sent when Stripe sent the visitor here; it stays in the tab until it has gone, so a failed
   send can be tried again. An order placed in French moves on to the French page first. */

function wireReceived(box) {
  if (!box || box.dataset.wired) return;
  box.dataset.wired = '1';
  const show = (name, ref = '') => {
    for (const el of box.querySelectorAll('[data-state]')) el.hidden = el.dataset.state !== name;
    for (const el of box.querySelectorAll('[data-ref]')) el.textContent = ref;
  };
  const session = new URLSearchParams(location.search).get('session_id') || '';
  let kept = null;
  try {
    kept = JSON.parse(sessionStorage.getItem(ORDER_KEY) || 'null');
  } catch {
    kept = null;
  }
  const order = kept?.order;
  if (!session || !order) {
    show(order ? 'unpaid' : 'missing', order?.ref || '');
    return;
  }
  const here = document.documentElement.lang.slice(0, 2);
  if (order.lang && order.lang.slice(0, 2) !== here && box.dataset.altUrl && box.dataset.altLang === order.lang.slice(0, 2)) {
    location.replace(`${box.dataset.altUrl}${location.search}`);
    return;
  }
  const send = async () => {
    show('sending', order.ref);
    try {
      const res = await fetch(box.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `${box.dataset.subject || 'New order'} ${order.ref}`, _template: 'table', stripe_session: session, ...order }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `HTTP ${res.status}`);
      try {
        sessionStorage.removeItem(ORDER_KEY);
      } catch {
        // nothing kept, nothing to clear
      }
      show('sent', order.ref);
    } catch (err) {
      console.warn('[order]', err);
      show('failed', order.ref);
    }
  };
  box.querySelector('[data-retry]')?.addEventListener('click', send);
  send();
}

/* ---------------------------------------------------------------------------------------------
   Birthplace suggestions as you type, from Photon — the open-source place search built on
   OpenStreetMap — through this site's server where there is one (/api/places), straight from the
   browser on the preview (the form's data-places says which). Picking a place fills in the town
   and keeps its coordinates with the order; typing freely still works. */

function placeOf(f) {
  const p = f?.properties || {};
  const c = f?.geometry?.coordinates;
  if (!p.name || !Array.isArray(c) || !Number.isFinite(c[0]) || !Number.isFinite(c[1])) return null;
  const region = [p.state || p.county, p.country].filter((v, i, all) => v && v !== p.name && all.indexOf(v) === i);
  return { name: p.name, rest: region.join(', '), label: [p.name, ...region].join(', '), lon: c[0], lat: c[1] };
}

function wirePlaces(form) {
  const endpoint = form.dataset.places;
  if (!endpoint || !window.fetch) return;
  const lang = document.documentElement.lang.startsWith('fr') ? 'fr' : 'en';
  for (const box of form.querySelectorAll('[data-place]')) {
    const input = box.querySelector('[data-place-input]');
    const list = box.querySelector('[data-place-list]');
    const lat = box.querySelector('[data-place-lat]');
    const lon = box.querySelector('[data-place-lon]');
    let items = [];
    let active = -1;
    let timer = 0;
    let pending = null;

    const close = () => {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    };
    const mark = (i) => {
      active = i;
      list.querySelectorAll('[role="option"]').forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
      input.setAttribute('aria-activedescendant', `${list.id}-${i}`);
      list.children[i]?.scrollIntoView({ block: 'nearest' });
    };
    const choose = (i) => {
      const it = items[i];
      if (!it) return;
      input.value = it.label;
      lat.value = it.lat.toFixed(5);
      lon.value = it.lon.toFixed(5);
      close();
    };
    const show = () => {
      if (!items.length) {
        close();
        return;
      }
      const rows = items.map((it, i) => {
        const li = document.createElement('li');
        li.id = `${list.id}-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const name = document.createElement('strong');
        name.textContent = it.name;
        const rest = document.createElement('span');
        rest.textContent = it.rest;
        li.append(name, rest);
        // the field keeps focus while a mouse chooses; a tap ends in a click like any other
        li.addEventListener('mousedown', (e) => e.preventDefault());
        li.addEventListener('click', () => choose(i));
        return li;
      });
      const credit = document.createElement('li');
      credit.className = 'place__credit';
      credit.setAttribute('role', 'presentation');
      credit.textContent = form.dataset.placesCredit || '';
      list.replaceChildren(...rows, credit);
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      active = -1;
    };
    const search = async (q) => {
      pending?.abort();
      pending = new AbortController();
      const url = new URL(endpoint, location.href);
      url.searchParams.set('q', q);
      url.searchParams.set('lang', lang);
      url.searchParams.set('limit', '6');
      url.searchParams.append('layer', 'city');
      url.searchParams.append('layer', 'locality');
      try {
        const res = await fetch(url, { signal: pending.signal, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const seen = new Set();
        items = (data.features || [])
          .map(placeOf)
          .filter((it) => it && !seen.has(it.label) && seen.add(it.label))
          .slice(0, 6);
        if (document.activeElement === input) show();
      } catch (err) {
        if (err.name === 'AbortError') return;
        items = [];
        close();
      }
    };

    input.addEventListener('input', () => {
      // typed by hand: coordinates from an earlier pick no longer belong to this text
      lat.value = '';
      lon.value = '';
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) {
        pending?.abort();
        items = [];
        close();
        return;
      }
      // a pause in typing, not every key: Photon's public server asks for a reasonable pace
      timer = setTimeout(() => search(q), 280);
    });
    input.addEventListener('keydown', (e) => {
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        mark((active + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        mark(active <= 0 ? items.length - 1 : active - 1);
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        choose(active);
      } else if (e.key === 'Escape') {
        // the list closes first; the panel stays open
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    });
    // a moment's grace, so a tap on a suggestion still lands after the field lets go
    input.addEventListener('blur', () => setTimeout(close, 180));
  }
}

/* ---------------------------------------------------------------------------------------------
   The contact sheet and the order panel, one at a time. Each closes with a short animation; a
   second Esc (or Android's back) can close it natively mid-way, so every path tidies up after
   itself. */

function modal(dialog, bodyClass) {
  if (!dialog || typeof dialog.showModal !== 'function') return null;
  let pending = null;
  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reduce.matches) {
      dialog.close();
      return;
    }
    dialog.classList.add('is-closing');
    pending = (e) => {
      if (e.target === dialog && e.animationName === 'sheet-out') dialog.close();
    };
    dialog.addEventListener('animationend', pending);
  };
  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-closing');
    if (pending) dialog.removeEventListener('animationend', pending);
    pending = null;
    document.body.classList.remove(bodyClass);
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  // Only a press that starts and ends on the backdrop closes it, so selecting text in a field and
  // letting go outside doesn't throw away what was typed.
  const outside = (e) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let downOutside = false;
  dialog.addEventListener('pointerdown', (e) => {
    downOutside = e.target === dialog && outside(e);
  });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return close();
    if (e.target === dialog && downOutside && outside(e)) close();
    downOutside = false;
  });
  return {
    open() {
      setMenu(false);
      dialog.classList.remove('is-closing');
      if (!dialog.open) dialog.showModal();
      document.body.classList.add(bodyClass);
    },
    // at once, without the animation: when the other one opens, or the page changes
    shut() {
      if (dialog.open) dialog.close();
    },
  };
}

const orderPanel = $('#order-panel');
const contactModal = modal(sheet, 'contact-open');
const orderModal = modal(orderPanel, 'order-open');

function openContact() {
  if (!contactModal) return false;
  const form = sheet.querySelector('[data-form]');
  const sent = sheet.querySelector('[data-sent]');
  if (sent && !sent.hidden) {
    sent.hidden = true;
    form.hidden = false;
    form.parentElement.classList.remove('is-sent');
  }
  orderModal?.shut();
  contactModal.open();
  return true;
}
function openOrder(readingId) {
  if (!orderModal) return false;
  presetOrder(orderPanel.querySelector('[data-order-form]'), readingId);
  contactModal?.shut();
  orderModal.open();
  return true;
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
    contactModal?.shut();
    orderModal?.shut();
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
  const order = e.target.closest('[data-order]');
  if (order && openOrder(order.dataset.reading)) {
    e.preventDefault();
    return;
  }
  if (e.target.closest('[data-contact]') && openContact()) {
    e.preventDefault();
    return;
  }
  const a = e.target.closest('a');
  const kind = classify(a);
  if (!kind) return;
  if (kind === 'hash' || kind === 'same') {
    e.preventDefault();
    setMenu(false);
    contactModal?.shut();
    orderModal?.shut();
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

function initPage(root, settle = 0) {
  if (settle) setTimeout(() => arrivals(root), settle);
  else arrivals(root);
  initSky(root);
  collectDrawings(root);
  faqs(root);
  for (const form of $$('[data-form]', root)) wireForm(form);
  for (const box of $$('[data-received]', root)) wireReceived(box);
  for (const form of $$('[data-order-form]', root)) {
    wireOrder(form);
    presetOrder(form, new URLSearchParams(location.search).get('reading'));
  }
  updateDrawings();
}

// The preloader lifts by CSS alone (preloader.html); the page's arrivals wait for it, or they would
// play unseen beneath it. Once gone, it leaves the page.
const preloader = $('[data-preloader]');
const preloading = !!preloader && !document.documentElement.classList.contains('seen') && getComputedStyle(preloader).display !== 'none';
if (preloader && !preloading) preloader.remove();
preloader?.addEventListener('animationend', (e) => {
  if (e.target === preloader && e.animationName === 'preloader-out') preloader.remove();
});
initPage(document, preloading ? 1650 : 0);
const arrival = performance.getEntriesByType?.('navigation')[0]?.type;
const savedY = typeof history.state?.y === 'number' ? history.state.y : null;
if ((arrival === 'reload' || arrival === 'back_forward') && savedY != null) requestAnimationFrame(() => scrollTo(0, savedY));
else if (location.hash) requestAnimationFrame(() => scrollToHash(location.hash, false));
