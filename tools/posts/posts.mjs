// The feed posts drawn by render.mjs: for each, the layout it uses, the words that go in it, its alt text and its
// caption. Facts come from the site's own pages (the encyclopaedia, the reading pages) or are computed.
//
// Times of the new moon: Meeus, Astronomical Algorithms, ch. 49 (to the minute); the place of the Sun and
// Moon: ch. 25. Local times: Paris on CET, London on GMT, New York on EST (summer time ended 1 November 2026),
// Sydney on AEDT.
export const POSTS = [
  {
    slug: '2026-11-09-new-moon-in-scorpio',
    postOn: 'Friday 6 November 2026 (or the morning of the 9th)',
    layout: 'eventPoster',
    words: {
      name: 'The Astro Study',
      date: '09.11.26 — 07:02 UTC',
      title: 'New Moon',
      subtitle: 'in Scorpio',
      details: ['16°53′ Scorpio', 'The Sun and the Moon together', '', 'Paris 08:02 · London 07:02', 'New York 02:02 · Sydney 18:02', '', 'One intention, written down'],
    },
    alt: 'A dark glow on a pale grey ground. In it: The Astro Study, 9 November 2026, 07:02 UTC, New Moon in Scorpio, at 16°53′ Scorpio, with the time in Paris, London, New York and Sydney.',
    caption: `New Moon in Scorpio · Monday 9 November, 07:02 UTC
(08:02 in Paris, 07:02 in London, 02:02 in New York, 18:02 in Sydney)

The Moon catches up with the Sun at 16°53′ Scorpio. A new moon is the dark start of the lunar month: the Moon passes between us and the Sun, and its lit side faces away from us.

Scorpio is the sign of depth: where you go deep, hold on, and want the truth rather than the surface. A good week to write with these:

1. What am I ready to look at honestly?
2. What am I holding on to that I could set down?
3. Whom do I trust, and how did they earn it?

Then write one intention. Keep it short, and keep it somewhere you'll see it when the Moon is full, on 24 November.

#newmoon #scorpioseason #astrology #newmoonintentions`,
  },
  {
    slug: 'myth-why-is-scorpio-a-scorpion',
    postOn: 'Any day of Scorpio season (23 October – 21 November)',
    layout: 'cultureExplainer',
    words: {
      picture: 'media/myths/feed/woodcut/orion-and-the-scorpion--white-transparent.png',
      question: ['Why is Scorpio', 'a scorpion?'],
      aside: 'the myth behind the sign',
      label: 'The Astro Study',
    },
    alt: 'A woodcut of a scorpion, claws raised and tail curled, with rays cut all around it, printed in white on electric blue. Below: Why is Scorpio a scorpion? The myth behind the sign.',
    caption: `Why is Scorpio a scorpion?

In one Greek telling, Orion the hunter boasted that he would kill every animal on earth. Gaia, the Earth herself, sent a scorpion to stop him, and its sting killed him. In another, it is Artemis who sends it.

Both were set among the stars, on opposite sides of the sky, and they are still kept apart: as Scorpius rises in the east, Orion sets in the west.

In astrology, Scorpio is the eighth sign: fixed water, ruled by Pluto in modern astrology and by Mars in the tradition. The Sun crosses it from about 23 October to 21 November. In a birth chart it shows where you go deep, hold on, and want the truth rather than the surface.

#scorpio #scorpioseason #mythology #astrology`,
  },
  {
    slug: 'birth-chart-reading',
    postOn: 'Any day; a week after the myth post works well',
    layout: 'boldStatement',
    words: {
      labels: [['The Astro Study'], ['Birth chart reading', 'For adults, 18+']],
      statement: ['the sky', 'you arrived', 'under,'],
      flourish: ['read in depth.'],
      note: ['I need your date and place of birth,', 'and the time if you know it.', 'Within a week, by email: a private', 'online reading and its PDF.'],
      call: 'Link in bio',
    },
    alt: 'Bold dark red words on cream: the sky you arrived under, read in depth. Small print: birth chart reading, for adults, 18+. Your date and place of birth, and the time if you know it; within a week, by email, a private online reading and its PDF. Link in bio.',
    caption: `The sky you arrived under, read in depth.

A birth chart is a picture of the sky at the minute you were born. Read placement by placement, it describes how you think, feel, love, work and recover, and what you protect most. Not who you must be: who you already are, in more words.

What I need: your date and place of birth, and the time if you know it.
What you receive: within a week, by email, a private online reading (notes, highlights) and its PDF.
Two options: the full reading, or the full reading with consulting.
For adults, 18+.

To order, the link is in my bio.

#birthchart #astrology #natalchart #astrologyreading`,
  },
];

