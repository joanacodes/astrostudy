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
| Reviews | `data/reviews.yml` — `en:` and `fr:`; the featured client message (shortened, anonymised) and the Maison Tarot reviews, labelled as tarot; the French ones say they’re translated |
| What I won’t read | `data/refusals.yml` (same list as Maison Tarot, in both languages) |
| Readings offered in the form | `data/readings.yml` (both languages; the `id`s must match) |
| The sky right now | `worker/index.js` (`/api/sky`, on Cloudflare), `layouts/_partials/sky.html` and `wheel-sky.html` (the block and its wheel), `assets/js/sky.js` (placing the planets at the minute) |
| Hosting | `wrangler.jsonc` and `.github/workflows/deploy.yml` |
| Design | `assets/css/site.css` (tokens at the top) |
| Page behaviour (reveals, drawn lines, FAQ, menu, contact sheet, page transitions, header colour) | `assets/js/site.js` |
| The meadow | `assets/js/meadow/` + `assets/js/meadow-boot.js` |
| Templates | `layouts/` — `home.html`, `reading/page.html` (birth chart and the four synastry pages), `synastry/section.html`, `page.html` |
| Fonts (self-hosted, OFL) | `static/fonts/` — Fraunces and Inter, with their licences |
| Poster stills, video loops, share image | `static/media/` |

## Legal notice

The site is published from France, so it has a legal notice (*mentions légales*, `/legal-notice/` and `/fr/mentions-legales/`, linked from the footer) as French law requires of a professional site. Its details live in one place, `hugo.toml` → `[params.legal]`: your name, legal status (e.g. “Entrepreneur individuel (EI) — micro-entreprise”), address, phone, SIREN, optionally the VAT line, and the consumer mediator you’ve joined. Until a field is filled, the page shows a highlighted **[to fill in]** marker there and the build log lists it. The privacy notice takes its “who is responsible” line from the same fields, under the GDPR, with the CNIL as the authority.

## Two languages

English lives at the root, French under `/fr/`. A page and its translation share a file name (`content/en/privacy.md` ↔ `content/fr/privacy.md`), which is how Hugo pairs them: the **FR / EN** link in the header, the menu and the footer always leads to the same page in the other language, and search engines are told about both (`hreflang`). A page with no translation yet sends its language link to the other language’s home page — never to a dead end.

Write internal links in either language with the English path — `[privacy note](/privacy/)`, `href: "/synastry/couples/"` — and they come out at the right address for the page’s language. Switching language is a full page load (the header, footer and form change language too); everything else moves without reloading the meadow.

## The sky right now

The section after the hero on the home page draws the sky as it is at the minute the page is read: each planet in its sign on a fine-line wheel, the major aspects between them, the Moon’s phase, and a list beside it. Saturn, Chiron and Lilith are in accent — the three read slowest.

It works the way AGS’s sky does:

- **The key stays on the server.** The page asks `/api/sky`, a few lines of Cloudflare Worker (`worker/index.js`) that hold the FreeAstroAPI key as an encrypted secret. A key in the page itself could be copied by anyone who opened the source.
- **One FreeAstroAPI call every six hours**, at most, per Cloudflare location: it captures every planet’s position and speed. Each visitor’s browser then moves the planets on to the minute, and again every minute while the page is open.
- **If FreeAstroAPI is down**, the Worker keeps serving its last good sky for up to two days (moved on by the speeds, it stays right to within a degree or so). With no sky at all, the block steps aside and the section reads as before. Without JavaScript the block isn’t shown.
- Nothing about the visitor is sent to FreeAstroAPI: the Worker asks for “the sky now”, from Greenwich.

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

**Nothing is sent until payment is connected.** With `checkout` empty in `hugo.toml` (as now), the form checks every field, then says payment opens soon — and sends nothing anywhere. Birth details only ever travel with a payment.

### Payments (to set up)

Once Stripe is ready, payment goes through the Cloudflare Worker, like the sky:

1. In Stripe, create the four prices (birth chart and synastry, each with and without consulting), and put the amounts to show in `hugo.toml` → `priceBirthChart`, `priceBirthChartConsulting`, `priceSynastry`, `priceSynastryConsulting`.
2. Add a `/api/checkout` route to `worker/index.js`: it receives the order (JSON), creates a Stripe Checkout Session with the matching price and the order in its metadata, and answers `{ "url": … }` — the form then opens that page. A Stripe webhook (`checkout.session.completed`) hands the paid order on to the reading app. The Stripe secret key goes to the Worker as a secret, like the FreeAstroAPI key — never in a page.
3. Set `checkout = "/api/checkout"` in `hugo.toml`. The privacy note then names Stripe by itself (`{{% payments %}}` in `privacy.md`).
4. Publish the terms of sale at `/terms/` (and `/fr/conditions/` or similar, translated) before the first order.

## The meadow

The background is rendered live in the visitor’s browser with WebGL2 — no video download, never the same twice, and the camera tilts from the grass up to the sky as you scroll. Nothing is pre-made 3D: everything is generated.

- **Sky**: single-scattering atmosphere (Rayleigh, Mie, ozone), baked once into a small table.
- **Clouds**: volumetric fair-weather cumulus, ray-marched through a slab 1.5–2.9 km up, lit by the sun with multiple-scattering approximations, drifting with the wind. When a cloud crosses the sun, the meadow dims.
- **Grass**: a few thousand blades, each bent by an integrated curve so it keeps its length in the wind, lit from the front or glowing from behind. Depth of field is computed per blade (no blur pass), so the blades near the lens melt softly.
- **Droplets**: traced as tiny lenses (the sky upside-down inside, the sun caught on the skin); out of focus they open into soft discs, as a real lens would. Plus a little pollen in the air.
- **Film**: bloom, AgX tone curve, a soft warm grade, a whisper of lateral colour, vignette, grain.

It adapts itself: three quality levels, chosen from the device and lowered automatically if frames run slow. It pauses when the tab is hidden. The page changes without reloading, so the sky keeps drifting from page to page.

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
