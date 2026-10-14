# Astrostudy — site

Birth chart readings for adults and synastry readings for couples, friends, co-workers and family.
Hugo (v0.165, extended) · English (en-GB) · GitHub Pages · a live 3D meadow behind every page.

## Run it locally

```
hugo server
```

Then http://localhost:1313/. In local preview, anything still to fill in shows as a highlighted `[fill in …]` marker; in production it falls back to neutral wording.

## Where things are

| What | Where |
| --- | --- |
| Settings: email, FormSubmit endpoints, prices, format, Instagram, legal name | `hugo.toml` → `[params]` (empty = hidden or “On request”) |
| Page copy | `content/` — `_index.md` (home), `birth-chart.md`, `synastry/_index.md` + `couples.md`, `friends.md`, `coworkers.md`, `family.md`, `how-i-read.md`, `contact.md`, `disclaimers.md`, `privacy.md`, `thank-you.md` |
| Reviews | `data/reviews.yml` — the featured client message (shortened, anonymised) and the Maison Tarot reviews, labelled as tarot |
| What I won’t read | `data/refusals.yml` (same list as Maison Tarot) |
| Readings offered in the form | `data/readings.yml` |
| Design | `assets/css/site.css` (tokens at the top) |
| Page behaviour (reveals, drawn lines, FAQ, menu, contact sheet, page transitions) | `assets/js/site.js` |
| The meadow | `assets/js/meadow/` + `assets/js/meadow-boot.js` |
| Templates | `layouts/` — `home.html`, `reading/page.html` (birth chart and the four synastry pages), `synastry/section.html`, `page.html` |
| Fonts (self-hosted, OFL) | `static/fonts/` — Fraunces and Inter, with their licences |
| Poster stills, video loops, share image | `static/media/` |

## The contact button and the form

The **Contact** button sits bottom left on every page and opens a sheet with the form. The same form is on `/contact/` (and that’s where the button leads if JavaScript is off).

Messages go through [FormSubmit](https://formsubmit.co) to **hello@astrostudy.co.uk**:

1. **Activate it once.** The very first message sent triggers an email from FormSubmit to hello@astrostudy.co.uk with an “Activate Form” link. Until it’s clicked, nothing is forwarded. Send yourself a test from the live site, then click the link.
2. **Then hide the address** (recommended). After activation FormSubmit gives you a random alias. Put it in `hugo.toml` → `formEndpoint` and `formAjaxEndpoint` (`https://formsubmit.co/<alias>` and `https://formsubmit.co/ajax/<alias>`), so bots can’t read the address in the page source.
3. People who write get an automatic confirmation (`_autoresponse` in `layouts/_partials/form.html`). Edit the wording there.

The form asks for a name, an email, which reading, a message, optional birth details (yours, and for synastry the other person’s), and an 18+ confirmation — plus, for synastry, confirmation that the other person is an adult and that their details are shared with care. Spam is filtered with a hidden honeypot field.

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

1. **Domain**: `baseURL` in `hugo.toml`. In GitHub: Settings → Pages → Source: **GitHub Actions**, then set the custom domain there. Push to `main` to deploy (`.github/workflows/deploy.yml`).
2. **FormSubmit**: send one test message and click the activation link (see above).
3. **Prices and format**: `priceBirthChart`, `priceSynastry`, `format`, `replyTime` in `hugo.toml`. Until they’re filled, the site says “On request” and makes no promise about delays.
4. **Privacy notice**: your name (and, if you like, an address) in `[params.legal]`. Check the retention periods written in `content/privacy.md` (twelve months for messages, two years for readings) match what you actually do.
5. **The client’s message** on the home page is shortened and anonymised, with the most personal passages left out. If you haven’t already, ask them whether they’re happy to have it there.
6. **Instagram**: `instagram` in `hugo.toml`, if you want the link in the footer.

## Rules of the site

No tracking, no cookies, no third-party fonts or scripts. Nothing invented: no fake reviews, no Review or AggregateRating schema, the tarot reviews are labelled as tarot. 18+ only, and never about children. Help lines (Samaritans, Shout, the National Domestic Abuse Helpline, Acas) appear where they belong.
