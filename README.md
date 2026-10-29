# The Astro Study — site

Birth chart readings for adults and synastry readings for couples, friends, co-workers and family.
Hugo (v0.165, extended) · English (en-GB) at the root, French (fr-FR) under `/fr/` · Cloudflare Workers,
like AGS · a live 3D meadow behind every page · the sky right now on the home page.

## Run it locally

```
hugo server
```

Then http://localhost:1313/ (and http://localhost:1313/fr/). In local preview, anything still to fill in shows as a highlighted `[fill in …]` marker; in production it falls back to neutral wording.

`hugo server` has no `/api/sky`, so the home page goes without the sky there. To see everything as Cloudflare serves it, sky included, put the key in a file Git ignores and run the Worker over a build:

```
echo 'FREE_ASTRO_API_KEY=…' > .dev.vars     # once; .dev.vars is in .gitignore
hugo && npx wrangler dev                    # http://localhost:8787/
```

## Where things are

| What | Where |
| --- | --- |
| Settings: email, FormSubmit endpoints, prices, Instagram, legal name | `hugo.toml` → `[params]` (empty = hidden or “On request”) |
| Settings that differ by language: description, format, reply time, share image, menus | `hugo.toml` → `[languages.en]` and `[languages.fr]` |
| Page copy, English | `content/en/` — `_index.md` (home), `birth-chart.md`, `synastry/_index.md` + `couples.md`, `friends.md`, `coworkers.md`, `family.md`, `how-i-read.md`, `contact.md`, `disclaimers.md`, `privacy.md`, `thank-you.md` |
| Page copy, French | `content/fr/` — the same file names; each sets its French address with `slug` (`/fr/theme-natal/`, `/fr/synastrie/collegues/`…) |
| Words used by the templates (buttons, form, footer, the sky) | `i18n/en.toml` and `i18n/fr.toml` — keep the keys in step |
| Reviews | `data/reviews.yml` — `en:` and `fr:`; each shows five stars unless it has its own `stars:`; the featured client message (shortened, anonymised) and the Maison Tarot reviews, labelled as tarot; the French ones say they’re translated |
| What I won’t read | `data/refusals.yml` (same list as Maison Tarot, in both languages) |
| Readings offered in the form | `data/readings.yml` (both languages; the `id`s must match) |
| The sky right now | `worker/index.js` (`/api/sky`, on Cloudflare), `layouts/_partials/sky.html` and `wheel-sky.html` (the block and its wheel), `assets/js/sky.js` (placing the planets at the minute) |
| Hosting | `wrangler.jsonc` and `.github/workflows/deploy.yml` |
| Design | `assets/css/site.css` (tokens at the top) |
| Page behaviour (reveals, drawn lines, FAQ, menu, contact sheet, page transitions, header colour) | `assets/js/site.js` |
| The meadow | `assets/js/meadow/` + `assets/js/meadow-boot.js` |
| Templates | `layouts/` — `home.html`, `reading/page.html` (birth chart and the four synastry pages), `synastry/section.html`, `page.html` |
| Fonts (self-hosted, OFL) | `static/fonts/` — Fraunces, Inter, and Noto Sans Symbols cut down to the planet and sign symbols (3 KB), with their licences |
| Symbols before headings | `## Heading {glyph="♄"}` in a Markdown page; `{{ partial "glyph.html" "☉" }}` in a template |
| Poster stills, video loops, share image | `static/media/` |

## Legal notice

The site is published from France, so it has a legal notice (*mentions légales*, `/legal-notice/` and `/fr/mentions-legales/`, linked from the footer) as French law requires of a professional site. Its details live in one place, `hugo.toml` → `[params.legal]`: your name, legal status (e.g. “Entrepreneur individuel (EI) — micro-entreprise”), address, phone, SIREN, optionally the VAT line, and the consumer mediator you’ve joined. Until a field is filled, the page shows a highlighted **[to fill in]** marker there and the build log lists it. The privacy notice takes its “who is responsible” line from the same fields, under the GDPR, with the CNIL as the authority.

## Two languages

English lives at the root, French under `/fr/`. A page and its translation share a file name (`content/en/privacy.md` ↔ `content/fr/privacy.md`), which is how Hugo pairs them: the **FR / EN** link in the header, the menu and the footer always leads to the same page in the other language, and search engines are told about both (`hreflang`). A page with no translation yet sends its language link to the other language’s home page — never to a dead end.

Write internal links in either language with the English path — `[privacy note](/privacy/)`, `href: "/synastry/couples/"` — and they come out at the right address for the page’s language. Switching language is a full page load (the header, footer and form change language too); everything else moves without reloading the meadow.

## The sky right now

The section after the hero on the home page draws the sky as it is at the minute the page is read: each planet in its sign on a fine-line wheel, the major aspects between them, the Moon’s phase, and a list beside it. Saturn, Chiron and Lilith are in accent — the three read slowest. The same sky is on the wheel of the birth chart page, on the small wheel of the birth chart card, and in the preloader’s dots. (The synastry wheel stays a drawn figure: it shows two people, not the sky.)

It works the way AGS’s sky does:

- **The key stays on the server.** The page asks `/api/sky`, a few lines of Cloudflare Worker (`worker/index.js`) that hold the FreeAstroAPI key as an encrypted secret. A key in the page itself could be copied by anyone who opened the source.
- **One FreeAstroAPI call every six hours**, at most, per Cloudflare location: it captures every planet’s position and speed. Each visitor’s browser then moves the planets on to the minute, and again every minute while the page is open.
- **If FreeAstroAPI is down**, the Worker keeps serving its last good sky for up to two days (moved on by the speeds, it stays right to within a degree or so). With no sky at all, the block steps aside and the section reads as before. Without JavaScript the block isn’t shown.
- Nothing about the visitor is sent to FreeAstroAPI: the Worker asks for “the sky now”, from Greenwich.
- **Every page also carries the sky inline**, captured at build time by `tools/sky-snapshot.mjs` (same request as the Worker; the `FREE_ASTRO_API` repository secret is read in that one build step and goes nowhere else). That’s what the preloader draws before any script runs, what stands in if `/api/sky` doesn’t answer, and the only source on the GitHub Pages preview, which has no server. The workflow runs once a day so it stays fresh; the browser moves it on to the minute (good for about three days). `data/sky.json` is written by the build and kept out of git.

## Hosting

`.github/workflows/deploy.yml` publishes every push to `main` (or by hand: Actions → “Deploy” → Run workflow) to one of two places:

- **GitHub Pages, as a preview**, until the Cloudflare secrets below exist: the whole site at `https://joanacodes.github.io/astrostudy/`, without the live sky (Pages has no server to keep the API key, so that block steps aside). One-time setting: Settings → Pages → Build and deployment → Source: **GitHub Actions**. On a private repository, GitHub Pages needs a paid GitHub plan.
- **Cloudflare Workers**, like AGS, as soon as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set — nothing else to change. The Hugo build is served as static files; the Worker only runs for `/api/*`.

The legal and privacy notices name whichever host is serving the site (`params.legal.host`, set by the workflow; the details are in `data/hosts.yml`). Pushes to other branches build the site and check the Worker without publishing anything.

Repository secrets (GitHub → Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Same value as AGS (Cloudflare → My Profile → API Tokens → template **Edit Cloudflare Workers**) |
| `CLOUDFLARE_ACCOUNT_ID` | Same value as AGS (Cloudflare → Workers & Pages → Account ID) |
| `FREE_ASTRO_API` | The FreeAstroAPI key (the same one as AGS). Copied to the Worker as the encrypted secret `FREE_ASTRO_API_KEY` on every deploy |

Without the first two, `main` goes to the GitHub Pages preview; without the third, the site deploys without the sky. After the first deploy the site answers at `https://the-astro-study.<your-account>.workers.dev`; to put it on **astrostudy.co.uk**, Cloudflare → Workers & Pages → the-astro-study → Settings → Domains & Routes → Add → Custom domain (the domain’s DNS has to be on Cloudflare).

## The contact button and the form

The **Contact** button sits bottom right on every page and opens the form in the middle of the screen (from the bottom on phones). The same form is on `/contact/` and `/fr/contact/` (and that’s where the button leads if JavaScript is off).

Messages go through [FormSubmit](https://formsubmit.co) to **hello@astrostudy.co.uk**:

1. **Activate it once.** The very first message sent triggers an email from FormSubmit to hello@astrostudy.co.uk with an “Activate Form” link. Until it’s clicked, nothing is forwarded. Send yourself a test from the live site, then click the link.
2. **Then hide the address** (recommended). After activation FormSubmit gives you a random alias. Put it in `hugo.toml` → `formEndpoint` and `formAjaxEndpoint` (`https://formsubmit.co/<alias>` and `https://formsubmit.co/ajax/<alias>`), so bots can’t read the address in the page source.
3. People who write get an automatic confirmation, in the language they wrote in (`autoresponse` in `i18n/en.toml` and `i18n/fr.toml`). Edit the wording there.

The contact form asks for a name, an email, a message and an 18+ confirmation — nothing else. Birth details are never asked for here: they belong to the order (below). Spam is filtered with a hidden honeypot field.

## Ordering a reading

Every reading page has an **Order this reading** button (and the same at the bottom of the page). It opens the order panel from the right edge of the screen — the whole screen on a phone — on that reading; the same form is on `/order/` and `/fr/commander/`, and `?reading=birth-chart` (or `synastry-couples`, `synastry-friends`, `synastry-coworkers`, `synastry-family`) picks the reading.

The order asks for the reading, the option (**Full reading** or **Full reading + consulting**), a name and email, the birth details (date, place, and the time if known; for a synastry, the other person’s first name and birth details too), an optional note, and three confirmations: 18 or over; for a synastry, that the other person is an adult and knows about the reading (for co-workers, that they agreed); and the request to start straight away, giving up the 14-day withdrawal right once the reading is delivered (Code de la consommation, L221-28). When a page exists at `/terms/` (the terms of sale, *CGV*), a fourth box asks to accept them, with a link.

**Birthplaces** are suggested as people type, by [Photon](https://github.com/komoot/photon) — the open-source place search built on OpenStreetMap, on Komoot’s free public server. On Cloudflare the browser asks the Worker (`/api/places`), which asks Photon and keeps each answer a week, so visitors never talk to a third party; on the GitHub Pages preview, which has no server, the browser asks photon.komoot.io directly. Picking a suggestion also keeps the town’s coordinates with the order (`birth_lat`, `birth_lon`, and `their_…` for a synastry); a place typed by hand is kept as typed. The privacy note says which way it goes, per host.

**Birth details travel with a payment, or not at all.** “Continue to payment” keeps the order in that browser tab and opens the Stripe Payment Link for that reading and option. Stripe, once paid, sends the visitor to `/order-received/`, and only from there does the order leave the browser — to the same FormSubmit address as the contact form, as an email titled “New order AS-…” with Stripe’s session id. A French order moves on to `/fr/commande-recue/` by itself. If someone leaves Stripe without paying, nothing is sent.

Each order has a reference (`AS-251019-K7QD`): it’s on the confirmation page, in the order email, and in Stripe as the payment’s *client reference ID*. **Before reading, check that reference in Stripe → Payments**: the order email is only sent from Stripe’s return page, but the page itself can’t prove a payment.

With no link set for a reading (as now), the form checks every field, then says payment opens soon — and sends nothing anywhere.

### Payments (to set up)

1. In Stripe → **Payment links**, create four links: birth chart, birth chart + consulting, synastry, synastry + consulting (one synastry link serves all four kinds; the kind is in the order email).
2. In each link → **After payment** → *Don’t show confirmation page* → redirect to `https://astrostudy.co.uk/order-received/?session_id={CHECKOUT_SESSION_ID}` (on the preview: `https://joanacodes.github.io/astrostudy/order-received/?session_id={CHECKOUT_SESSION_ID}`).
3. Paste the four links into `hugo.toml` → `[params.stripe]`, and the amounts into `priceBirthChart`, `priceBirthChartConsulting`, `priceSynastry`, `priceSynastryConsulting`. The privacy note then names Stripe by itself (`{{% payments %}}` in `privacy.md`).
4. **The form address must work first**: orders arrive through FormSubmit at `params.email` (see “The contact button and the form”). Send a test order through a Stripe test-mode link before switching to live.
5. Publish the terms of sale at `/terms/` (and its French page) before the first order.

## The menu

One **Menu** button in the bar opens, on a computer, a panel that slides down from the top (40% of the screen): a card per page with its picture, name and one line, Synastry’s four readings under its card, and the order button, Home, Contact and the other language at the end. On a phone it opens the whole-screen menu, Synastry folding open in place. Each card’s line, sign and picture are in `hugo.toml`, on the menu entry: `blurb`, `glyph` and `image` (e.g. `image = "media/menu/birth-chart.jpg"`, about 4:3, put the file in `static/media/menu/`). Until a picture is given, the card shows the page’s sign on a patch of sky.

## The blog

`/blog/` and `/fr/blog/`, laid out like Maison Tarot’s: the latest article large, two featured ones (`featured: true`), then every article as a card with a search box (its typing hints are `blogSearchHints` in `i18n/`), the categories as filters and a sort menu; under each article, “You might also read” (same categories and tags) and the latest articles; an article has its date and short answer beside the title, then the anchor menu (“In this article”, which marks the section being read), the text, and an order panel. On a phone the anchor menu is a tab at the bottom left that slides up.

A new article is a Markdown file in `content/en/blog/` (and its translation in `content/fr/blog/`, same file name, with a French `slug`). Front matter: `title`, `description`, `date`, `categories`, `summary` (the short answer), `glyph` (the sign on its cover until it has a picture) and optionally `image` (a path under `static/`). Give each `##` heading an anchor, e.g. `## We just met {#we-just-met}`: those make the anchor menu. The five first articles are samples in your voice, built from what the site already says: read them before they go live.

## Internal links

Links between pages are how readers, Google and AI assistants find their way through the site, so they are written in, added automatically, and checked.

- **In the text.** Every article links to at least 3 other pages of the site, and 5 or more is the aim: the encyclopaedia entries it names, the articles it builds on, How I read, and at most one reading page. Write the English path even in a French text (`[Saturne](/astrology/saturn/)`): it opens the French page.
- **Automatically.** Under each article, “In the encyclopaedia” shows the entries it names; under each entry, “In the blog” lists the articles that name it. An entry is found by its title, or by the names in its `terms` (`terms: ["Black Moon Lilith", "Lilith"]`), with capitals as written, so an entry written later joins the older articles by itself.
- **Checked at every deploy** (`tools/check-links.mjs`, after the build). A broken link or #anchor, or an article with fewer than 3 links in its text, stops the deploy before anything is published. Warnings in the run list an article under 5 links, a page no article or entry links to from its text, and an entry an article names without linking. The same run writes the **link map**: every article, entry and page, in each language, with its headings, the pages its text links to and the texts that link to it, on the run’s summary page in GitHub Actions. To run it yourself after `hugo`: `node tools/check-links.mjs public --map link-map.md`. The rules for each kind of page (title, address in English and French, headings, the links it must carry) are in the “Site map and links” tab of the growth plan.

## The blind chart calls

`/challenge/` and `/fr/defi/`: the free Zoom calls where six people each pick, out of six plain-language portraits, the one drawn from their own chart. The page opens on its sign-up form; everything else about the calls comes after it. The words are in the page’s front matter (`content/en/challenge.md`, and the French one under the same file name); the layout is `layouts/event/page.html`, the form `layouts/_partials/signup.html`.

- **The form.** An evening (the two dates are cards to pick), a name (first name, full name or a nickname), an email and a date of birth, then Send. The birth time and place are asked afterwards, by email, so the form stays short. Someone under 18 on the evening is stopped with a message.
- **Where it sends.** To `[params.signup] endpoint` in `hugo.toml`: the newsletter or email service you choose (a Resend-backed `/api/signup` on the Cloudflare worker, or a newsletter’s own sign-up address). It receives JSON: `name`, `email`, `birthDate` and `evening` (both `YYYY-MM-DD`), `lang`, `page`. While it’s empty the form says “sign-ups open very soon” and sends nothing, so nobody believes they’re signed up when they aren’t. Once set, the privacy page should name the service.
- **The calls.** Each is a `calls` entry: `start` (written once, in Paris time with its offset: the other cities and the reader’s own clock are worked out from it) and `full` (`true` once six people are confirmed: that evening can no longer be picked). `closes` is when sign-ups end, shown under the form; after it, or once both evenings are full or past, the form gives way to “sign-ups are closed”. What the form turns into after Send is `success`. Change both languages together.
- **Structured data and sharing.** Each call is an online event for Google and AI assistants (`layouts/_partials/schema.html`), read from the same front matter; the link preview is drawn from the page’s `share*` fields (see tools/brand-images). The footer links to the page for as long as it exists.

## The blind test

`/test/` and `/fr/test/`: the free Astro Study test. Each question shows three short descriptions of one part of life; one was written from the visitor’s birth chart, the two others from thirty fake charts, and the visitor picks the one that sounds most like them. The page is the test, and **AGS is its back end**: the page sends AGS the birth details and each answer, and AGS draws the chart, writes the questions, keeps every answer for the study and writes the full reading. The words are in the page’s front matter (`content/en/test.md`, and the French one under the same file name) and in the `study…` keys of `i18n/`; the layout is `layouts/test/page.html`, the test itself `layouts/_partials/study.html` with `assets/js/study.js`.

- **Where it sends.** To `[params.study] api` in `hugo.toml`: AGS’s address. AGS answers only this site’s pages (astrostudy.co.uk, www, and the GitHub Pages preview); a new address for the site, such as a workers.dev one, goes into AGS’s `STUDY_SITE_ORIGINS` (AGS’s DEPLOY.md). Empty = the form says “the test opens very soon” and sends nothing.
- **The form.** A name or nickname, an email, the date, time (or “I don’t know”) and place of birth, the length (5, 10 or 20 questions), the consent box (required) and the news box (unticked). The birthplace suggestions are the order form’s; AGS finds the place’s time zone itself.
- **During and after.** One question at a time, each answer saved as it’s given; the test’s id sits in the address (`?s=`), so a reload picks up where it stopped. The result shows the score beside one in three by luck, each question’s own description, and the button to the private page where the full reading appears, with its PDF (password: the date of birth as 8 digits, day first).
- **Limits.** Adults only, one test per email per day, fifty a day in all: AGS enforces them and the page says why when one applies.
- **Results.** On AGS, at `/study`: every test, the figures by area of life, length, birth time and language, and a CSV.

## The encyclopaedia

`/astrology/` and `/fr/astrologie/`: one entry per element of astrology, from the master list (the "Astrology bible — master list" tab of the growth plan). Each entry is a Markdown file in `content/en/astrology/` and its translation in `content/fr/astrology/` (same file name, French `slug`). Front matter: `title`, `h1`, `description`, `family` (its group on the front page: planets, points, bodies, signs, houses… — the labels are `fam_*` in `i18n/`), `weight` (order in the group), `glyph`, `definition` (the one paragraph shown first, 40–60 words: the lines Google and AI assistants quote), `facts` (the quick facts grid), `faq`, `related`, `sources` (each a `title` with either `page`, a page of this site such as `/blog/i-tested-my-birth-chart`, which opens in the reader's language, or `url`, an outside address), `reviewed` (the date you last checked it). Give every `##` heading an anchor: they make the "In this entry" menu. Three entries are written as samples of the format: Saturn, Chiron and Black Moon Lilith.

How an entry is written — its exact headings by kind, links, voice, the facts it may state and its sources — is in `plan/writing-guide.md`, and three tools keep it honest:

- `node tools/plan/links-for.mjs moon` before writing: the entry's files and addresses, and every page its text must link to, from the page plan and the "Site map and links" rules (a planet links its 12 sign and 12 house pages, a sign its ruler and its 10 planets, a house its 10 planets, its cusps, its ruler's 12 places and its transits…).
- `node tools/fr-typography.mjs content/fr/astrology/moon.md` after writing a French page: the non-breaking spaces before `: ; ? ! %` and inside `« »`, and the apostrophes.
- `node tools/plan/check-entries.mjs moon` holds both languages to the plan and the rules (addresses, slug, front matter, 40–60 word definition, one anchored heading per section, every required link, French typography). Errors stop it; warnings are for the writer. The deploy runs it on every published entry (`--published`), so a page that breaks the tree never goes live.

New entries go up as drafts (`draft: true`) and are published once approved in both languages, about ten a week. A link to a page of the plan that isn't published yet shows as plain text and becomes a link the day that page goes up, so entries link everything the rules ask for from the start. To review a batch: build with drafts (`hugo -D -d /tmp/review-build`), then `node tools/plan/review-page.mjs --site /tmp/review-build --batch 1 --out drafts.html` and publish `drafts.html` as the "Astro Study drafts" artifact: each entry as it will look, in both languages, with its search result preview and two buttons per language; the decisions are kept in the artifact's database.

## The page plan

`plan/pages.json`, and `plan/pages.csv` for a spreadsheet, lists every page the encyclopaedia will have: 3,604 per language, each with its title and address in English and French, its tier, its writing batch (tier 1 is written in six batches), its headings and the pages it links up and across to. `node tools/plan/build-plan.mjs` builds it from the master list (`tools/plan/master-list.mjs`, the “Astrology bible — master list” tab as data), and refuses two pages with one address or a link to a page outside the plan. Write each new entry at the address the plan gives it: an address never changes once it is published. `node tools/plan/build-viewer.mjs page-plan.html` turns the plan into one page to browse, published as the “Astro Study page plan” artifact.

## Search engines and AI assistants

- **Structured data** on every page (`layouts/_partials/schema.html`): the business (one entity in every language), articles with author and dates, encyclopaedia entries as defined terms, reading pages as services, questions and answers, breadcrumbs. Articles and entries are signed “By Joana from The Astro Study” (`[params.author]` in `hugo.toml`), the name linking to How I read.
- **Profiles** (`instagram`, `threads`, `tiktok`, `youtube`, `pinterest`, `facebook`, `trustpilot` in `hugo.toml`): each one set appears in the footer and links the accounts to the site for Google and AI assistants.
- **Large previews** for Google Discover (`max-image-preview:large`), and each article's own share picture (`static/og/…`, drawn at deploy).
- **`/llms.txt`** (and `/fr/llms.txt`): a plain map of the site for AI assistants, built from the pages.
- **`robots.txt`** welcomes AI search crawlers by name. Cloudflare's own settings can override it: in its AI crawler settings, allow Search (and Training, which teaches future models the site's name), turn off the managed robots.txt, and never pick a Block setting, which now also stops Googlebot and Bingbot.
- **The blog's feed** (`/blog/index.xml`, `/fr/blog/index.xml`), with each article's pin picture: connect it in Pinterest (Settings → Bulk create Pins → auto-publish from RSS) and new articles become Pins by themselves.

## The preloader

A visit opens on the name, “Birth chart & synastry readings”, and a faint zodiac whose dots are the planets of that minute, turning slowly — 2.45 seconds in all, by CSS alone (`layouts/_partials/preloader.html`). It’s shown once per visit: pages change without reloading, and a reload in the same tab skips it.

## The meadow

The background is rendered live in the visitor’s browser with WebGL2 — no video download, never the same twice, and the camera tilts from the grass up to the sky as you scroll. Nothing is pre-made 3D: everything is generated.

- **Sky**: single-scattering atmosphere (Rayleigh, Mie, ozone), baked once into a small table.
- **Clouds**: volumetric fair-weather cumulus, ray-marched through a slab 1.5–2.9 km up, lit by the sun with multiple-scattering approximations, drifting with the wind. When a cloud crosses the sun, the meadow dims.
- **Grass**: a few thousand blades, each bent by an integrated curve so it keeps its length in the wind, lit from the front or glowing from behind. Depth of field is computed per blade (no blur pass), so the blades near the lens melt softly.
- **Droplets**: traced as tiny lenses (the sky upside-down inside, the sun caught on the skin); out of focus they open into soft discs, as a real lens would. Plus a little pollen in the air.
- **Film**: bloom, AgX tone curve, a soft warm grade, a whisper of lateral colour, vignette, grain.

It adapts itself: three quality levels, chosen from the device and lowered automatically if frames run slow, with the work capped on big screens so the page itself always has room. It pauses when the tab is hidden, while only paper is on screen, and — on a laptop or desktop — while the page is being scrolled, easing its tilt to the new place a moment after: scrolling stays smooth on big screens, and phones keep the tilt following the finger. The page changes without reloading, so the sky keeps drifting from page to page.

**Fallbacks**, in order: live scene → pre-rendered 16-second video loop (`static/media/meadow-loop-wide` and `-tall`, VP9 `.webm` first, H.264 `.mp4` for browsers that can’t play it) if WebGL2 is missing or the device can’t keep up → the still poster. Visitors who ask their device for reduced motion get the still poster on purpose, and all text appears without animation.

Every visit opens on the same moment of sky as the poster (`OPENING_MOMENT` in `assets/js/meadow/index.js`), so the still dissolves into the live scene without a jump.

### Regenerating the posters and the video

If you change the scene, re-render the media so the fallbacks match. `tools/render-media/` has the scripts (Node, Python with Pillow and NumPy, ffmpeg):

```
cd tools/render-media
npm install && npx playwright install chromium     # once
node serve.mjs &                                   # serves the renderer on :8123
node capture.mjs still 1920 1080 /tmp/wide         # → /tmp/wide/still.png
node capture.mjs still 1080 1920 /tmp/tall
node capture.mjs video 1280 720 /tmp/vwide 16 2.5
python3 compose.py /tmp/vwide ../../static/media/meadow-loop-wide.mp4 16 2.5 30 1280 720
python3 compose.py /tmp/vwide ../../static/media/meadow-loop-wide.webm 16 2.5 30 1280 720
```

On a machine without a GPU, prefix the captures with `SOFTWARE_GL=1` (slow but fine).

(Same for the tall version at 720×1280. Convert the stills to `meadow-poster-*.webp` and `.jpg`.)

The video loop is seamless: the wind and the pollen repeat exactly every 16 seconds, and the clouds cross-fade over the last 2.5 seconds into the first.

## Before going live

1. **Hosting**: the three secrets above (until then `main` publishes the GitHub Pages preview). Attach **astrostudy.co.uk** to the Worker as a custom domain (see Hosting). `baseURL` in `hugo.toml` stays the canonical address.
2. **FormSubmit**: send one test message from the live site and click the activation link (see above).
3. **Prices and payment**: the four prices in `[params]` and Stripe (see Ordering a reading); `format`, `replyTime`, `nextSlot` for each language in `hugo.toml`. Until the prices are filled, the reading pages say “On request” / “Sur demande”; `nextSlot` (e.g. “this week”) shows a “Next available slot” line in the order form, to update as bookings fill.
4. **Legal notice and privacy**: fill `[params.legal]` in `hugo.toml` (see Legal notice) — including a consumer mediator, which French law requires before selling to consumers. Check the retention periods written in `content/en/privacy.md` and `content/fr/privacy.md` (twelve months for messages, two years for readings) match what you actually do. Before taking paid orders, the site will also need terms of sale (*CGV*: prices, payment, the 14-day withdrawal right and how it applies to a reading).
5. **The client’s message** on the home page is shortened and anonymised, with the most personal passages left out (the French version says it’s translated). If you haven’t already, ask them whether they’re happy to have it there.
6. **Instagram**: `instagram` in `hugo.toml`, if you want the link in the footer.

## Rules of the site

No tracking, no cookies, no third-party fonts or scripts. Nothing invented: no fake reviews, no Review or AggregateRating schema, the tarot reviews are labelled as tarot. 18+ only, and never about children. Help lines appear where they belong — the UK’s in English (Samaritans, Shout, the National Domestic Abuse Helpline, Acas), French, Belgian, Swiss and Canadian ones in French. API keys live on the server, never in a page.
