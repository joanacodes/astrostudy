/* ---------------------------------------------------------------------------------------------
   The Astro Study test (/test/, /fr/test/; layouts/_partials/study.html). The page is the test and
   AGS is its back end: the form sends the birth details to AGS, which draws the chart and writes the
   questions; each answer goes back the moment it's given; the last one brings the score and the
   private link to the full reading. The test's id sits in the address (?s=), so a reload, or the
   back button after a look at another page, picks up where it stopped. Nothing is kept in the
   browser itself. */

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Question {n} of {total}" → "Question 3 of 10"
const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

// 18 today, counted in calendar days as a birthday is (AGS checks again, on the Paris day)
const adultToday = (born) => {
  const b = new Date(`${born}T12:00:00Z`);
  if (Number.isNaN(b.getTime())) return true;
  const eighteenth = new Date(Date.UTC(b.getUTCFullYear() + 18, b.getUTCMonth(), b.getUTCDate(), 12));
  return eighteenth.getTime() <= Date.now();
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

export function wireStudy(box) {
  if (!box || box.dataset.wired) return;
  box.dataset.wired = '1';
  const api = (box.dataset.api || '').replace(/\/+$/, '');
  const lang = box.dataset.lang === 'fr' ? 'fr' : 'en';
  let words = {};
  try {
    words = JSON.parse(box.querySelector('[data-study-words]')?.textContent || '{}');
  } catch {
    words = {};
  }
  const form = box.querySelector('[data-study-form]');
  const quiz = box.querySelector('[data-study-quiz]');
  const result = box.querySelector('[data-study-result]');
  const formStatus = form.querySelector('[data-status]');
  const quizStatus = quiz.querySelector('[data-study-status]');
  const start = form.querySelector('[data-submit]');
  const birth = form.querySelector('[name="birthDate"]');
  const time = form.querySelector('[name="birthTime"]');
  const unknown = form.querySelector('[data-study-unknown]');
  const place = form.querySelector('[data-place-input]');
  const say = (node, text) => {
    node.textContent = text || '';
  };
  const problem = (body) => words.problems?.[body?.error?.code] || words.problems?.default || '';
  let id = null;

  const call = async (path, body) => {
    const init = body === undefined
      ? { headers: { Accept: 'application/json' }, cache: 'no-store' }
      : { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) };
    const res = await fetch(`${api}${path}`, init);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  };

  // the test's id in the address bar, the page's scroll memory (history.state) left as it was
  const remember = (value) => {
    const url = new URL(location.href);
    if (value) url.searchParams.set('s', value);
    else url.searchParams.delete('s');
    history.replaceState(history.state, '', url);
  };

  const show = (view) => {
    for (const part of [form, quiz, result]) part.hidden = part !== view;
    // the top of the pane in sight after each step, on a phone above all, without a jump when it is
    const top = box.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (view !== form) view.focus({ preventScroll: true });
  };

  const backToForm = (message) => {
    id = null;
    remember(null);
    show(form);
    say(formStatus, message);
  };

  const question = (view) => {
    const current = view.current;
    say(quiz.querySelector('[data-study-count]'), fill(words.questionOf, { n: view.answered + 1, total: view.total }));
    quiz.querySelector('[data-study-bar]').style.width = `${(view.answered / Math.max(view.total, 1)) * 100}%`;
    say(quiz.querySelector('[data-study-question]'), current.question);
    const options = current.options.map((option) => {
      const button = el('button', 'quiz__option');
      button.type = 'button';
      button.append(el('span', 'quiz__letter', option.key), el('span', 'quiz__text', option.text));
      button.addEventListener('click', () => answer(current.position, option.key, button));
      return button;
    });
    quiz.querySelector('[data-study-options]').replaceChildren(...options);
    say(quizStatus, '');
    show(quiz);
  };

  const score = (r) => {
    say(result.querySelector('[data-study-percent]'), fill(words.percent, { n: r.percent }));
    say(result.querySelector('[data-study-line]'), fill(words.resultLine, { recognised: r.recognised, answered: r.answered }));
    say(result.querySelector('[data-study-chance]'), fill(words.chance, { percent: r.chancePercent }));
    const link = typeof r.link === 'string' && r.link.startsWith('https://') ? r.link : null;
    result.querySelector('[data-study-link]').hidden = !link;
    result.querySelector('[data-study-nolink]').hidden = !!link;
    if (link) {
      result.querySelector('[data-study-open]').href = link;
      say(result.querySelector('[data-study-address]'), link);
    }
    const rows = r.items.map((item) => {
      const li = el('li', item.recognised ? 'is-right' : '');
      const own = el('p', 'quiz__own');
      own.append(el('span', '', `${words.chartSaid} `), item.own);
      li.append(el('p', 'quiz__q', item.question), own, el('p', 'quiz__verdict', item.recognised ? words.picked : words.notPicked));
      return li;
    });
    result.querySelector('[data-study-answers]').replaceChildren(...rows);
    show(result);
  };

  const render = (view) => {
    if (view?.result) score(view.result);
    else if (view?.current) question(view);
    else backToForm(words.problems?.default);
  };

  const answer = async (position, key, picked) => {
    const buttons = [...quiz.querySelectorAll('.quiz__option')];
    buttons.forEach((b) => (b.disabled = true));
    picked.classList.add('is-picked');
    say(quizStatus, words.saving);
    try {
      const { ok, data } = await call(`/api/study/${id}/answer`, { position, answer: key });
      if (!ok) throw data;
      render(data);
    } catch (body) {
      say(quizStatus, problem(body));
      buttons.forEach((b) => (b.disabled = false));
      picked.classList.remove('is-picked');
    }
  };

  const load = async () => {
    say(quiz.querySelector('[data-study-count]'), words.loading);
    quiz.querySelector('[data-study-options]').replaceChildren();
    say(quiz.querySelector('[data-study-question]'), '');
    show(quiz);
    try {
      const { ok, data } = await call(`/api/study/${id}`);
      if (!ok) return backToForm(data?.error?.code === 'not_found' ? words.notFound : problem(data));
      render(data);
    } catch {
      backToForm(words.problems?.default);
    }
  };

  // no birth time: the field steps aside, and isn't asked for
  const syncTime = () => {
    time.disabled = unknown.checked;
    time.required = !unknown.checked;
    if (unknown.checked) time.value = '';
  };
  unknown.addEventListener('change', syncTime);
  syncTime();
  birth.addEventListener('input', () => birth.setCustomValidity(''));
  place.addEventListener('input', () => place.setCustomValidity(''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // nowhere to send yet: say so before asking anyone to correct a field
    if (!api) return say(formStatus, words.soon);
    const lat = form.querySelector('[data-place-lat]').value;
    const lon = form.querySelector('[data-place-lon]').value;
    // a town typed but not picked has no coordinates, and a chart needs them
    place.setCustomValidity(place.value.trim() && !(lat && lon) ? words.pickPlace : '');
    birth.setCustomValidity(birth.value && !adultToday(birth.value) ? words.adult : '');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const text = (name, max) => String(data.get(name) || '').trim().slice(0, max);
    const query = new URLSearchParams(location.search);
    const body = {
      name: text('name', 80),
      email: text('email', 254),
      birthDate: text('birthDate', 10),
      birthTime: unknown.checked ? null : text('birthTime', 5),
      place: { label: place.value.trim().slice(0, 160), country: text('placeCountry', 80), latitude: Number(lat), longitude: Number(lon) },
      length: text('length', 10) || 'medium',
      language: lang,
      consent: true,
      news: data.get('news') === 'yes',
      source: (query.get('src') || query.get('utm_source') || '').slice(0, 200) || null,
      website: String(data.get('website') || ''),
    };
    start.disabled = true;
    say(formStatus, words.preparing);
    try {
      const { ok, data: started } = await call('/api/study/start', body);
      if (!ok || typeof started?.sessionId !== 'string') return say(formStatus, problem(started));
      id = started.sessionId;
      remember(id);
      say(formStatus, '');
      await load();
    } catch (err) {
      console.warn('[study]', err);
      say(formStatus, words.problems?.default);
    } finally {
      start.disabled = false;
    }
  });

  const asked = new URLSearchParams(location.search).get('s');
  if (api && asked && ID.test(asked)) {
    id = asked;
    load();
  }
}
