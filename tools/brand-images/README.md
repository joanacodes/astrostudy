# The Astro Study — pictures

Share and social pictures drawn from the site itself: the same Fraunces and Inter, the same planet
and sign symbols, the same frosted glass over the same meadow. You write a few lines of text in a
small file; the generator gives you a finished picture at the exact size each platform wants.

## Set up once (on a Mac)

1. Install Node 22: download the "LTS" installer from [nodejs.org](https://nodejs.org) and run it.
2. In Terminal, from the site's folder:

   ```sh
   cd tools/brand-images
   npm install
   npx playwright install chromium
   ```

That's all. The pictures need nothing else: the fonts and photos come from the site's own
`static/` folder.

## Make pictures

From `tools/brand-images`:

```sh
npm run render -- examples/carousel-saturn.json       # one job file
npm run render -- examples/*.json                     # every example
npm run render -- my-posts/week-44.json --out ~/Desktop/week-44
npm run site                                          # the site's own article pictures (below)
```

Pictures land in `tools/brand-images/out/` unless you give `--out`. The generator prints one line
per file, and a warning if some text had to shrink to its minimum and still didn't fit (shorten it).

## The job file

A job file is JSON: one job, a list of jobs, or `{ "jobs": [ … ] }`. Every job has:

| Field | What it is |
| --- | --- |
| `name` | the file name (no extension): `post-chiron` → `out/post-chiron.png` |
| `template` | `cover`, `glyph`, `quote`, `stat`, `challenge` or `carousel` |
| `size` | `og` 1200×630 (link previews) · `square` 1080×1080 · `post` 1080×1350 (Instagram, Threads, Facebook) · `story` 1080×1920 (Stories, Reels and TikTok covers) · `pin` 1000×1500 (Pinterest) |
| `sizes` | several at once, e.g. `["post", "story"]` → `name-post.png`, `name-story.png` |
| `lang` | `en`, `fr`… — sets the built-in words (labels, "Swipe", the challenge) and French quotation marks |
| `format` | `"jpeg"` for a `.jpg` instead of a `.png` (lighter, for websites) |
| `background` | optional: another photo, a path from the job file or a file name in `static/media/` |
| `backgroundPosition` | optional: which part of the photo shows, e.g. `"50% 30%"` |

Text fields may use `<em>…</em>` (Fraunces italic), `<span class="sunword">…</span>` (the glowing
sun word), `<span class="redword">…</span>` (the red word), and French spaces (` ` before `:`
`?` `!` `%`). Planet and sign symbols never turn into emoji.

### Templates and their fields

- **cover** — `label` (small capitals), `title`, `subtitle`. Defaults to `post`.
- **glyph** — a big white symbol on the sky, then the text: `glyph` (one symbol, several separated by
  spaces, or a pair like `"☌/☍"`), `label`, `title`, `text`. Defaults to `og`.
- **quote** — a review: `quote`, `author`, `context`, `stars` (1–5, none by default). Defaults to `post`.
  Use real words from a real person, with their permission, and stars only if they gave that rating.
- **stat** — one number: `number` (e.g. `"75–90%"`), `text`, `note`, `label` (default "In my
  tests"), `numberStyle` (`"sun"` default, `"red"` or `"plain"`). Defaults to `post`.
- **challenge** — the Blind Chart Challenge: by default "Which one is you?" with three cards A, B,
  C; `count` (2 to 6: the live calls use six, A to F, and the built-in words follow it), `title`,
  `subtitle`, `choices` (`[{ "letter": "A", "text": "…" }, …]` to show real excerpts), `chance`. With `"variant": "result"`: "I picked my chart", `result` (a line), `picked` (`"B"`
  frames that card). Defaults to `post`.
- **carousel** — `slides`: a list of `{ label?, title, text?, glyph? }`. The first slide is a
  cover (with "Swipe →"), the middle ones a symbol on the sky and a few lines (or the zodiac ring
  when there's no `glyph`), the last one the name and `url`. Always 1080×1350; files are
  `name-01.png`, `name-02.png`…

See `examples/` for one of each.

## The site's own pictures

`npm run site` draws two pictures for every blog article (and, once it exists, every page of the
astrology encyclopaedia, `content/<lang>/astrology/`), from the article's front matter (`title`,
`description`, first `categories` entry, `glyph`):

- a link preview, 1200×630: `static/og/<lang>/<section>/<file name>.jpg`
- a Pinterest pin, 1000×1500: `static/pin/<lang>/<section>/<file name>.jpg`

Any other page can have its own link preview too, in any template, by naming it in its front matter:
`shareTemplate` (e.g. `"challenge"`), then `shareLabel`, `shareTitle`, `shareText`, `shareCount`,
`shareChance` for its words. The blind chart calls page (`content/en/challenge.md`) does this: its
preview is six cards, A to F, at `static/og/en/challenge.jpg`.

`<file name>` is the article's Markdown file name, even when the page has a French `slug`:
`content/fr/blog/unknown-birth-time.md` → `static/og/fr/blog/unknown-birth-time.jpg`. Articles in
sub-folders keep them (`content/en/astrology/planets/saturn.md` →
`static/og/en/astrology/planets/saturn.jpg`); a page bundle is named after its folder, inside it
(`content/en/astrology/saturn/index.md` → `static/og/en/astrology/saturn/saturn.jpg`) — the same
path Hugo builds from the page's `.File.Dir` and `.File.ContentBaseName`.
Drafts are skipped. Only what changed is redrawn: `.cache/manifest.json` keeps, for each picture,
a hash of what it shows (title, description, symbol, categories, size, language) and of the look
(this script, the photos, the fonts), so file dates don't matter and a fresh checkout redraws
nothing. The run ends with `rendered N, skipped M`; `npm run site -- --force` redraws everything.

The deploy runs this before building the site, so you never have to: a new article gets its
pictures on its way out.

## A new background photo

Put the photo (JPEG, at least 2000 px on its long side) in `static/media/` and name it in a job:
`"background": "my-photo.jpg"`. Choose calm photos with sky or soft texture where the glass sits —
the text is always on glass, but busy photos fight it.

## Brand rules

- **Fonts:** Fraunces for titles and quotes (light, italic for the turn of the sentence), Inter
  for everything small. Nothing else.
- **Colours:** ink `#1c211b` on paper glass; the red `#b5512c` only for one accent; gold `#c98a2e`
  only for stars; white only on the sky.
- **Glass over the meadow,** never text straight on the photo (symbols are the exception, in
  white on the sky).
- **One lit word per title at most** (`<em>`, a sun word or a red word), never two kinds together.
- **About 12 words per slide.** A carousel teaches one thing; the article teaches the rest.
- **No prices, no "book now".** A picture invites reading; the site does the selling quietly.
