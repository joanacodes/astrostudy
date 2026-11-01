// The feed posts drawn by render.mjs: for each, the layout it uses, the words that go in it, its alt text and its
// caption. Meanings follow the AGS definition library (ags-v2, knowledge/vocabulary and its glossary): a planet is a
// function, a sign the manner of it, a house its context, an aspect a relationship between two functions, and no post
// gives a sign, house or aspect a quality the library lists as not inherent to it (Scorpio is not vengeful, the 8th
// house is not death, a trine is not luck). Readings and the test are described from the site's own pages; the sky's
// times are computed.
//
// Times of the new and full moons: Meeus, Astronomical Algorithms, ch. 49 (to the minute); the place of the Sun
// and Moon, and the Sun's entry into Sagittarius: ch. 25 (to a few minutes, hence "around"). Local times: Paris on CET, London on GMT, New York on EST (summer time ended 1 November 2026),
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

Scorpio colours whatever it touches with depth: it looks beneath the surface for what is really there, and changes form without losing what matters. A good week to write with these:

1. What am I ready to look at honestly?
2. What lies beneath what I say I want?
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

In astrology, Scorpio is the eighth sign: fixed water, ruled by Pluto in modern astrology and by Mars in the tradition. The Sun crosses it from about 23 October to 21 November. In a birth chart, a planet in Scorpio works with depth and intensity: it looks for the truth beneath appearances, and it can transform and regenerate.

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
  {
    slug: '2026-11-24-full-moon-in-gemini',
    postOn: 'Monday 23 or Tuesday 24 November 2026',
    layout: 'eventPoster',
    words: {
      name: 'The Astro Study',
      date: '24.11.26 — 14:53 UTC',
      title: 'Full Moon',
      subtitle: 'in Gemini',
      details: ['2°20′ Gemini', 'The Moon opposite the Sun', '', 'Paris 15:53 · London 14:53', 'New York 09:53 · Sydney 01:53 (25th)', '', 'One thing to let go of'],
      palette: { mist: '#c9ced6', glow: '#2a3a63', core: '#0b1020', ink: '#eef0f4' },
    },
    alt: 'A dark blue glow on a pale grey ground. In it: The Astro Study, 24 November 2026, 14:53 UTC, Full Moon in Gemini, at 2°20′ Gemini, with the time in Paris, London, New York and Sydney.',
    caption: `Full Moon in Gemini · Tuesday 24 November, 14:53 UTC
(15:53 in Paris, 14:53 in London, 09:53 in New York, 01:53 on the 25th in Sydney)

The Moon stands opposite the Sun, at 2°20′ Gemini, and its whole lit face turns towards us. The new moon of 9 November began this cycle; the full moon is its turning point.

Gemini colours things with curiosity: it compares, connects, exchanges and keeps several perspectives in play at once. Three questions to write with:

1. Which conversation have I been putting off?
2. Which idea have I outgrown?
3. What am I saying yes to out of habit?

Then choose one thing to let go of before the next new moon.

#fullmoon #geminifullmoon #astrology #fullmoonritual`,
  },
  {
    slug: '2026-11-22-sagittarius-season',
    postOn: 'Sunday 22 November 2026',
    layout: 'handDrawnPoster',
    words: {
      bg: '#c4c851',
      ink: '#25271a',
      drawn: '#a9b5f2',
      drawings: [{ symbol: 'media/symbols/feed/paper-cut/sagittarius--white-transparent.png', x: 560, y: 560, size: 900 }],
      stars: [[150, 170, 46], [905, 150, 30], [120, 840, 30], [960, 760, 40], [820, 1020, 26]],
      moons: [[205, 420, 34, -20], [870, 470, 26, 160]],
      kicker: 'From Sunday 22 November',
      title: ['Sagittarius season'],
      text: 'Sagittarius is the ninth sign of the zodiac, a mutable fire sign ruled by Jupiter; the Sun crosses it from about 22 November to 21 December. A planet in Sagittarius works by exploring, learning and looking for meaning: it takes the wider view and connects ideas into a whole.',
    },
    alt: 'A large paper-cut Sagittarius glyph, an arrow crossed near its tail, drawn in pale periwinkle on chartreuse with hand-drawn stars and crescent moons. In the middle: From Sunday 22 November, Sagittarius season.',
    caption: `Sagittarius season begins · Sunday 22 November

The Sun moves from Scorpio into Sagittarius around 07:20 UTC (08:20 in Paris) and stays there until 21 December.

Sagittarius is the ninth sign of the zodiac: mutable fire, ruled by Jupiter. A planet in Sagittarius works by exploring, learning and looking for meaning: it takes the wider view and connects ideas into a whole. Exploring is not recklessness, and vision is not dogmatism.

Look for ♐ in your chart: every planet you have there takes on this way of working.

#sagittariusseason #sagittarius #astrology #zodiac`,
  },
  {
    slug: 'word-of-the-week-trine',
    postOn: 'Any week',
    layout: 'condensedSerif',
    words: {
      kicker: 'Word of the week',
      symbol: 'media/symbols/feed/paper-cut/trine--white-transparent.png',
      headline: 'Trine',
      body: 'An angle of 120°, a third of the zodiac, usually between signs of the same element: two parts of you that flow together and reinforce each other.',
      footer: 'The Astro Study · △ 120°',
    },
    alt: 'Cream on dark red: Word of the week, a drawn triangle, and the word Trine in a tall narrow serif, with its meaning: an angle of 120°, a third of the zodiac, usually between signs of the same element: two parts of you that flow together and reinforce each other.',
    caption: `Word of the week: trine △

A trine is an angle of 120° between two planets: a third of the zodiac. It usually joins two signs of the same element, like Aries and Leo, or Cancer and Pisces.

In a birth chart it connects two parts of you through flow: they support and reinforce each other, and each keeps its own nature.

A trine isn't luck. Ease is not a guarantee, and flow is not passivity: left unnoticed, a trine is support you take for granted; used on purpose, it's a strength you can build on.

Which trine in your chart do you lean on without noticing?

#astrology #aspects #trine #learnastrology`,
  },
  {
    slug: 'sun-sign-vs-moon-sign',
    postOn: 'Any week',
    layout: 'thisVsThat',
    words: {
      brand: 'The Astro Study',
      a: ['Sun sign', 'what drives you'],
      b: ['Moon sign', 'what soothes you.'],
      tiles: [
        { symbol: 'media/symbols/feed/halftone/sun--white-transparent.png', caption: 'your core purpose' },
        { symbol: 'media/symbols/feed/halftone/moon--white-transparent.png', caption: 'what you need to feel safe' },
      ],
    },
    alt: 'White on dark red corduroy: SUN SIGN, what drives you, vs MOON SIGN, what soothes you, with a hand-drawn arrow. Below, the Sun and Moon symbols, captioned: your core purpose; what you need to feel safe.',
    caption: `Sun sign vs Moon sign

Your Sun sign is the one horoscopes use. The Sun organizes your identity, vitality and purpose: what gives you direction, and how you express who you are.

The Moon regulates how you process feelings: what you need to feel secure, how you bond, and the habits that steady you.

The sign each one is in colours how it does that.

Same chart, two different questions. Which one do you recognise yourself in more?

#sunsign #moonsign #astrology #birthchart`,
  },
  {
    slug: 'myth-busting-scorpios-are-vengeful',
    postOn: 'Before 21 November (Scorpio season)',
    layout: 'boldStatement',
    words: {
      labels: [['Common myth'], ['Scorpio']],
      statement: ['“scorpios', 'are vengeful.”'],
      flourish: ['not quite.'],
      note: ['Vengefulness isn’t part of Scorpio. Scorpio', 'is depth and the search for truth: intensity', 'is not aggression, depth is not secrecy.'],
      call: 'Read on',
      colours: { bg: '#1c1311', ink: '#f1ebe1', note: '#cbbcae' },
    },
    alt: 'Cream on near-black: “scorpios are vengeful.” not quite. Small print: Vengefulness isn’t part of Scorpio. Scorpio is depth and the search for truth: intensity is not aggression, depth is not secrecy.',
    caption: `“Scorpios are vengeful.” Not quite.

Vengefulness isn't part of Scorpio's meaning, and neither are jealousy, manipulation or secrecy. Scorpio is depth: the search for what lies beneath appearances, transformation, regeneration, resilience.

Intensity is not aggression. Depth is not secrecy. Investigation is not manipulation.

And a sign never acts on its own: it colours how a planet works, in a house, in a whole chart. One sign never sums up a person.

#scorpio #scorpioseason #astrology #astrologymyths`,
  },
  {
    slug: 'myth-why-is-sagittarius-a-centaur',
    postOn: 'Any day of Sagittarius season (22 November – 21 December)',
    layout: 'cultureExplainer',
    words: {
      picture: 'media/myths/feed/woodcut/the-centaur-archer--white-transparent.png',
      question: ['Why is Sagittarius', 'a centaur?'],
      aside: 'the myth behind the sign',
      label: 'The Astro Study',
    },
    alt: 'A woodcut of a centaur drawing his bow, with rays cut all around him, printed in white on electric blue. Below: Why is Sagittarius a centaur? The myth behind the sign.',
    caption: `Why is Sagittarius a centaur?

The archer is older than the Greeks. In Babylon, the god Pabilsag was carved on boundary stones as an archer with wings, a horse's body and a scorpion's tail.

The Greeks kept the bow and the horse: a centaur, his arrow drawn towards the heart of the Scorpion, next to him in the sky. Some said he was Chiron, the wise centaur who taught heroes; others gave Chiron a constellation of his own, the Centaur.

In astrology, Sagittarius is the ninth sign: mutable fire, ruled by Jupiter, crossed by the Sun from about 22 November to 21 December. A planet in Sagittarius works by exploring, learning and looking for meaning.

#sagittarius #sagittariusseason #mythology #astrology`,
  },
  {
    slug: 'the-twelve-houses-08',
    postOn: 'Any week; the first of a series of twelve, one house at a time',
    layout: 'numberedSeries',
    words: {
      number: '08',
      label: 'The twelve houses',
      headline: ['the 8th', 'house.'],
      text: 'Intimacy and trust, what you share and owe with others, and the changes that renew you.',
      picture: 'media/symbols/feed/mosaic/scorpio--white-on-black.png',
    },
    alt: 'The Scorpio glyph laid in mosaic tiles, warmed to amber and brown. In yellow: 08, The twelve houses, the 8th house. Intimacy and trust, what you share and owe with others, and the changes that renew you.',
    caption: `The twelve houses · 08

The 8th house comes just after the house of partners. A house is a context: the part of life where a planet works. The 8th is the context of intimacy and trust, of what you share with others or owe them (joint resources, inheritance, shared obligations), and of the transformations that renew you.

It is not a house of death or catastrophe: transformation is not destruction, and depth is not obsession.

It is Scorpio's natural house. Which sign sits on the cusp of your 8th house? You need your birth time to know.

#astrology #houses #8thhouse #birthchart`,
  },
  {
    slug: 'journal-prompt-scorpio-season',
    postOn: 'Between two picture posts, in Scorpio season',
    layout: 'quietTile',
    words: {
      line: 'What is ready to change in me, and what will I keep through the change?',
      signature: 'The Astro Study · a question for Scorpio season',
    },
    alt: 'One line in cream italic on olive green: What is ready to change in me, and what will I keep through the change?',
    caption: `A question for Scorpio season, to write with for five minutes. No one has to read it.

What is ready to change in me, and what will I keep through the change?

#journalprompts #scorpioseason #selfreflection #astrology`,
  },
  {
    slug: 'comment-your-big-three',
    postOn: 'Any day; it works best on a weekend',
    layout: 'handDrawnPoster',
    words: {
      bg: '#b3bcef',
      ink: '#1f2140',
      drawn: '#e3e65a',
      drawings: [
        { symbol: 'media/symbols/feed/paper-cut/sun--white-transparent.png', x: 290, y: 330, size: 430 },
        { symbol: 'media/symbols/feed/paper-cut/moon--white-transparent.png', x: 800, y: 380, size: 430 },
        { text: 'AC', x: 540, y: 905, size: 280 },
      ],
      stars: [[540, 150, 34], [110, 640, 26], [975, 690, 30], [160, 1060, 22], [930, 1090, 28]],
      moons: [],
      kicker: 'Sun · Moon · Rising',
      title: ['Comment your', 'big three'],
      text: 'What drives you, what soothes you, and how you meet the world before anyone knows you.',
      titleAt: 590,
    },
    alt: 'Hand-drawn chartreuse Sun and Moon symbols and the letters AC on periwinkle, with scattered stars. In the middle: Sun, Moon, Rising. Comment your big three.',
    caption: `Comment your big three ☉ ☽ AC

Sun: what drives you. Moon: what soothes you. Rising: how you meet the world before anyone knows you.

Tell me yours below. Don't know your Rising sign? It needs your birth time: it's the sign that was coming up over the eastern horizon at the minute you were born.

#bigthree #astrology #risingsign #birthchart`,
  },
  {
    slug: 'guess-the-sign-pisces',
    postOn: 'Any day; answer the guesses in the comments',
    layout: 'cultureExplainer',
    words: {
      picture: 'media/myths/feed/halftone/two-fish-bound-by-a-cord--white-transparent.png',
      question: ['Which sign', 'is this?'],
      aside: 'answer at the end of the caption',
      label: 'The Astro Study',
      bg: '#1f4a3c',
      ink: '#f1ead9',
    },
    alt: 'Two fish swimming in opposite directions, tied together by a cord, printed in halftone dots in cream on deep green. Below: Which sign is this? Answer at the end of the caption.',
    caption: `Which sign is this? Guess in the comments before you read on.

.
.
.

Pisces ♓: two fish, tied together. Pisces is the twelfth and last sign of the zodiac, mutable water, ruled by Neptune in modern astrology and by Jupiter in the tradition. A planet in Pisces works through imagination, empathy and compassion: it senses how everything connects. Empathy is not a lack of boundaries.

#pisces #astrology #zodiacquiz #guessthesign`,
  },
  {
    slug: 'the-blind-test',
    postOn: 'Any day; pin it to the profile',
    layout: 'threeChoices',
    words: {
      kicker: [['Free blind test'], ['2 to 10 minutes', '18+']],
      title: 'three descriptions.',
      flourish: 'one of them is you.',
      note: ['Pick the one that sounds most like you.', 'Luck alone finds yours one time in three.'],
      call: 'Link in bio',
    },
    alt: 'Three blank cards marked A, B and C under the words: three descriptions. one of them is you. Small print: free blind test, 2 to 10 minutes, 18+. Pick the one that sounds most like you. Luck alone finds yours one time in three.',
    caption: `Three descriptions. One of them is you.

Each question shows three short descriptions of one part of your life. One was written from your birth chart, the two others from other charts. Pick the one that sounds most like you: luck alone finds yours one time in three.

It's free, it takes 2 to 10 minutes, and it's for adults, 18 and over. The link is in my bio.

#astrology #birthchart #blindtest`,
  },
  {
    slug: 'synastry-reading',
    postOn: 'Any day; a week after the birth chart reading post',
    layout: 'condensedSerif',
    words: {
      kicker: 'Synastry reading · for two adults',
      headline: 'Two charts,',
      italic: 'one conversation.',
      body: 'Where you flow, where you rub, and what each of you brings out in the other. Within a week, by email and as a PDF.',
      footer: 'The Astro Study · Link in bio',
      bg: '#3a2416',
      size: 170,
    },
    alt: 'Cream on chocolate brown: Synastry reading, for two adults. Two charts, one conversation. Where you flow, where you rub, and what each of you brings out in the other. Within a week, by email and as a PDF.',
    caption: `Two charts, one conversation.

Synastry lays two birth charts side by side and reads how they speak to each other: where you flow, where you rub, and what each of you brings out in the other. It isn't a score. It's a way of understanding.

For two adults: partners, friends, family or colleagues.
What I need: both birth dates and places, and the times if you know them.
What you receive: a private online reading about the two of you, within a week, by email and as a PDF.
Two options: the full reading, or the full reading with consulting.

The link is in my bio.

#synastry #astrology #compatibility #relationshipastrology`,
  },
];
