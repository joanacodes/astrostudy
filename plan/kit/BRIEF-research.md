# Brief: pages that rest on research: history, people, texts, tests of astrology, guides, birth time by country (The Astro Study)

You write encyclopaedia pages for The Astro Study, a bilingual (English/French) Hugo astrology site written in the voice of its owner, Joana. Repository: `/home/user/astrostudy`. Each page exists in English AND French. Read `/home/user/astrostudy/plan/kit/COMMON.md` first: its rules apply to every page. These pages stand or fall on their facts.

## Read once, before writing
1. `plan/writing-guide.md`: the section of your pages' kind (`tested` → **Tested (what the research found)**; `guide` → **Guide (how-to)**; `country` → **Country (where to find a birth time)**; `history` → **History**; `person` and `text` → **Person and text (people and books of astrology)**), then **Links**, **Voice**, **French**, **Facts** (the notebook's exact words) and **Length**.
2. The site's own pages, so you say only what they say about Joana's practice: `content/en/how-i-read.md`, `content/en/disclaimers.md`, `content/en/blog/i-tested-my-birth-chart.md`, `content/en/blog/unknown-birth-time.md`, and their French twins.
3. Published models, with their French twins: `content/en/astrology/carlsons-double-blind-test-1985.md`, `barnum-forer-effect.md`, `how-to-find-your-birth-time.md`.
4. Your pages' data: the lines of `plan/kit/pages.jsonl` whose `id` is one of yours.

## Checking facts
- Only English Wikipedia opens here. `bash /home/user/astrostudy/plan/kit/wiki.sh "Article title"` prints an article's text and then its full references. Check each fact in an article you open; cite the primary source as the article's reference list gives it (authors, title, journal, volume, pages, year; or book, publisher, year), and add the article itself as a source with its address.
- A fact you only saw in a search snippet, or that the article states without a reference, stays out. No address on a source you couldn't open. Numbers only as the source gives them; where sources disagree, say so. Never invent a quotation.
- When controlled tests found no effect, say so plainly, then what Joana's notebook found, in the guide's words: a notebook, not a study. Never mock science, astrologers or readers.
- People: historical figures and published authors only; dates, works and what they changed from checked sources; no birth chart of a real person. Texts: what they are and what they say, with the editions you cite.

## Notes
- 600 to 900 words of text per language, never padded; glyph `✦`.
- In your reply, list what you left out because you couldn't confirm it.
