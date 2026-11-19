// Light or dark. head.html has already set <html data-theme> before the first paint: the visitor's
// choice if this browser kept one, else the device's setting. This wires the switch (in the bar and in
// the phone menu) and keeps following the device, even with the page open, until the visitor chooses.
// The choice stays in this browser's localStorage; it is never sent anywhere.

const KEY = 'astro-theme';
const root = document.documentElement;
const device = matchMedia('(prefers-color-scheme: dark)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const deviceTheme = () => (device.matches ? 'dark' : 'light');

function kept() {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'dark' || t === 'light' ? t : null;
  } catch {
    return null; // storage refused (a locked-down browser): the device decides
  }
}

// What the visitor picked on this page, even if the browser wouldn't keep it.
let chosen = kept();

function show(theme) {
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  const tint = meta?.getAttribute(`data-${theme}`);
  if (tint) meta.setAttribute('content', tint);
  for (const b of document.querySelectorAll('[data-theme-toggle]')) b.setAttribute('aria-pressed', String(theme === 'dark'));
}

// Every colour takes its new value at once (see .theme-switching in site.css): the style is read once
// in between, so turning transitions back on doesn't replay the change. Where the browser can, the
// whole page crossfades meanwhile.
function change(theme) {
  if (theme === root.dataset.theme) return show(theme);
  const swap = () => {
    root.classList.add('theme-switching');
    show(theme);
    getComputedStyle(root).getPropertyValue('color');
    root.classList.remove('theme-switching');
  };
  if (document.startViewTransition && !reduce.matches && !document.hidden) document.startViewTransition(swap);
  else swap();
}

export function initTheme() {
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  show(chosen || (root.dataset.theme === 'dark' || root.dataset.theme === 'light' ? root.dataset.theme : deviceTheme()));
  for (const b of toggles) {
    b.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      // Picking what the device already says hands the choice back to the device: the site then
      // follows it again, as it did before anything was picked.
      chosen = next === deviceTheme() ? null : next;
      try {
        if (chosen) localStorage.setItem(KEY, chosen);
        else localStorage.removeItem(KEY);
      } catch {
        // not kept: this page still changes, the next one opens with the device's setting
      }
      change(next);
    });
  }
  device.addEventListener?.('change', () => {
    if (!chosen) change(deviceTheme());
  });
  // a choice made in another tab of this site
  addEventListener('storage', (e) => {
    if (e.key !== KEY && e.key !== null) return;
    chosen = kept();
    change(chosen || deviceTheme());
  });
}
