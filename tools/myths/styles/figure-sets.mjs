// The figures the feed pictures are drawn for, in the order of a chart: `myths`, the silhouettes of the myths behind
// the chart; `symbols`, the symbols of the signs and of the celestial bodies; and `aspects`, the symbols of the aspects
// from the conjunction to the opposition, kept with the other symbols. A set's pictures go to media/<out>.
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chartRank } from '../silhouettes/order.mjs';

export const FIGURE_SETS = {
  myths: {
    out: 'myths/feed/',
    async load() {
      const dir = fileURLToPath(new URL('../silhouettes/figures/', import.meta.url));
      const figs = [];
      for (const file of (await readdir(dir)).filter((f) => f.endsWith('.mjs'))) figs.push(await import(pathToFileURL(`${dir}${file}`).href));
      return figs.sort((a, b) => chartRank(a.astrology) - chartRank(b.astrology));
    },
  },
  symbols: {
    out: 'symbols/feed/',
    load: async () => (await import('../../symbols/symbols.mjs')).SYMBOLS.filter((s) => s.family !== 'aspects'),
  },
  aspects: {
    out: 'symbols/feed/',
    load: async () => (await import('../../symbols/symbols.mjs')).SYMBOLS.filter((s) => s.family === 'aspects'),
  },
};
