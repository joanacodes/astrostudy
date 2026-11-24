---
title: "Calculating a chart by hand"
h1: "Calculating a chart by hand"
description: "Calculating a chart by hand: Universal Time, sidereal time, a table of houses and an ephemeris, step by step, with the slips that move a birth chart."
date: 2026-11-24
reviewed: 2026-11-24
family: "practical"
categories: ["Readings"]
tags: ["birth chart"]
weight: 6
glyph: "✦"
definition: "Calculating a chart by hand means working out a birth chart’s angles, house cusps and planets with an ephemeris, a table of houses and arithmetic: the clock time turned into Universal Time, then into local sidereal time. It is what every chart program does underneath, and it starts from the exact birth time."
facts:
  - { k: "For", v: "Anyone who wants to see how a chart is built, or to check a program" }
  - { k: "You need", v: "Date, time and place of birth; an ephemeris; a table of houses for your house system" }
  - { k: "Steps", v: "9, from the clock time to the finished wheel" }
  - { k: "A sidereal day", v: "23 h 56 min 4 s: the stars come round about 4 minutes earlier each day" }
  - { k: "Longitude into time", v: "4 minutes per degree, added east of Greenwich, taken off west" }
  - { k: "The correction", v: "About 10 seconds of sidereal time per hour after the ephemeris time" }
  - { k: "House system", v: "Placidus, the one I use; the table has to match yours" }
related: ["/astrology/ephemeris-and-how-to-read-one", "/astrology/sidereal-time", "/astrology/placidus", "/astrology/abbreviations-in-astrology", "/blog/unknown-birth-time"]
faq:
  - q: "Can you calculate a birth chart by hand?"
    a: "Yes. With an ephemeris, a table of houses for your house system and patient arithmetic, you can work out the Midheaven, the Ascendant, the house cusps and every planet’s position. It takes care the first time, and it shows exactly what a chart program does in a fraction of a second."
  - q: "What is local sidereal time in astrology?"
    a: "The sidereal time at the birthplace at the moment of birth: Greenwich sidereal time plus the longitude east, or minus it west, at four minutes of time per degree. A table of houses is read with it and the latitude to find the Midheaven, the Ascendant and the other cusps."
  - q: "Why add 10 seconds for every hour?"
    a: "Because sidereal time runs slightly faster than clock time: a sidereal day lasts about 23 hours 56 minutes 4 seconds. For each hour of clock time after the ephemeris entry, the stars gain close to 10 seconds, and over a whole day nearly 4 minutes, enough to move the Midheaven by about a degree."
  - q: "Do I need the birth time to calculate a chart?"
    a: "Yes, for everything that turns with the day: the Ascendant, the Midheaven and the house cusps move about a degree every four minutes. The Moon moves about 13° a day, so its degree needs the time as well. Without a birth time I don’t read a chart at all."
sources:
  - { title: "Jean Meeus, Astronomical Algorithms, 2nd ed. (1998)", note: "sidereal time, and the Ascendant from local sidereal time, latitude and the tilt of the Earth’s axis" }
  - { title: "Wikipedia — Sidereal time", url: "https://en.wikipedia.org/wiki/Sidereal_time", note: "a sidereal day of 23 h 56 min 4.09 s; local sidereal time is Greenwich sidereal time plus east longitude; checked on 24 November 2026" }
  - { title: "Wikipedia — House (astrology)", url: "https://en.wikipedia.org/wiki/House_(astrology)", note: "Placidus, and why it isn’t always defined beyond the polar circles; checked on 24 November 2026" }
---
Before programs, every chart was worked out with two books and a pencil: an ephemeris for the planets and a table of houses for the angles. The method hasn't changed, only the speed.

## Step by step {#step-by-step}

1. **Write down the birth data as recorded.** Date, clock time and place, with the place's latitude and longitude in degrees and minutes. The time comes first: the angles and every house cusp are built on it, and without it there is no chart to calculate ([what changes without a birth time](/blog/unknown-birth-time/)).
2. **Find the clock that was in use.** Note the time zone and whether daylight saving applied on that date in that place ([Time zones and daylight saving in charts](/astrology/time-zones-and-daylight-saving-in-charts/)). For births before standard time zones, the clock may have shown the town's own time ([Local mean time for old births](/astrology/local-mean-time-for-old-births/)).
3. **Convert to Universal Time.** Take off the zone's offset if it is east of Greenwich, add it if west, and check whether the date changes in the process. A birth at 15:42 where clocks ran one hour ahead of Greenwich is 14:42 UT.
4. **Look up the sidereal time.** Your ephemeris gives it for each day, at 0 h UT in most editions and at noon in some: read the heading ([Ephemeris, and how to read one](/astrology/ephemeris-and-how-to-read-one/)). Sidereal time is star time, the clock that brings the zodiac back to the same place on the meridian ([Sidereal time](/astrology/sidereal-time/)).
5. **Add the time since that entry, and the correction.** A sidereal day lasts 23 h 56 min 4 s, so star time gains on clock time: add about 10 seconds for every hour elapsed. Say the ephemeris gives 6 h 40 min 0 s at 0 h UT: for a birth at 14:42 UT, add 14 h 42 min and 2 min 25 s of correction, which gives 21 h 24 min 25 s at Greenwich.
6. **Turn the longitude into time.** Count 4 minutes for each degree and 4 seconds for each minute of arc, added east of Greenwich and taken off west. A town 2° 30′ east adds 10 minutes, for a local sidereal time of 21 h 34 min 25 s. Take off 24 hours whenever a total passes 24.
7. **Read the table of houses.** At the birth latitude and the local sidereal time, read the Midheaven, the Ascendant and the cusps between them, interpolating between rows and between latitudes. I use Placidus ([Placidus](/astrology/placidus/)); a table for another system gives other cusps ([Which house system should I use?](/astrology/which-house-system-should-i-use/)). South of the equator, with tables made for northern latitudes, add 12 hours to the local sidereal time and take the opposite sign for every cusp. Beyond the polar circles, Placidus can't place every degree ([Houses at high latitudes](/astrology/houses-at-high-latitudes/)).
8. **Place the planets.** For each body, take the ephemeris positions before and after the birth and interpolate: the daily motion times the fraction of the day since the listed time. If the Moon goes from 10° 00′ to 23° 12′ of a sign in a day, at 14:42 UT, 0.6125 of the day, it has moved 8° 05′, to 18° 05′. A retrograde planet's figures go down, so subtract. Work in degrees and minutes throughout ([Degrees, minutes and seconds](/astrology/degrees-minutes-and-seconds/)), and keep a key to the symbols and short forms beside you ([Abbreviations in astrology](/astrology/abbreviations-in-astrology/)).
9. **Draw the wheel, then check it.** Put the Ascendant on the left, the cusps round it, then the planets by degree, and only then the aspects ([Chart wheel, and how to read it](/astrology/chart-wheel-and-how-to-read-it/)). Compare with a program. A degree of difference in the angles is about four minutes of time: look first at the zone, the daylight saving and the sign of the longitude.

## Common mistakes {#common-mistakes}

- **Forgetting daylight saving.** An hour wrong moves the Ascendant by about half a sign on average, and every house with it. Check the date against the rules of that place and year.
- **Swapping east and west.** Adding a western longitude instead of subtracting it doubles the error rather than cancelling it. Write the sign down before you convert.
- **Leaving out the correction.** Ten seconds an hour looks negligible; over a full day it comes to nearly four minutes of sidereal time, about a degree on the Midheaven.
- **Reading a noon ephemeris as if it were set for midnight.** The heading says which. Mixed up, the Moon alone moves by about six and a half degrees.
- **Mixing minutes of time with minutes of arc.** Four minutes of time are one degree of longitude; a minute of arc is four seconds of time. Label every figure.
- **Rounding the Moon.** At about 13° a day it covers roughly half a degree an hour, so interpolate it properly, even when you round the slower planets.
- **Using the wrong table.** A table for another house system, for the wrong latitude, or a northern table used south of the equator without the 12-hour rule: each gives the wrong houses.

My own readings are prepared with a system I built, which does these sums in an instant, and I read every chart before it's sent ([How I read](/how-i-read/)). Working one chart through by hand shows what every chart is made of, and catches a time zone or a longitude a program took on trust.
