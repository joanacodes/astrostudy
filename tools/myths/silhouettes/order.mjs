// The order of a chart, which the galleries follow: the lights and planets, the points, then the signs from Aries to
// Pisces. A figure's `astrology` names its place here.
export const CHART_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'Black Moon Lilith', 'The constellations', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
  'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export const chartRank = (astrology) => (CHART_ORDER.includes(astrology) ? CHART_ORDER.indexOf(astrology) : 99);
