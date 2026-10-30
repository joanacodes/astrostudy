// Loaded into the browser page for the styles drawn pixel by pixel (mosaic, stipple, stained glass): the figure
// turned into a mask, distance fields, a seeded random source, even sampling of points, and a grid to find the
// nearest of many points quickly.
window.kit = (() => {
  // the figure (an SVG document drawn white) as an S × S array of 1 (figure) and 0 (ground)
  async function mask(svg, S) {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, S, S);
    const px = g.getImageData(0, 0, S, S).data;
    const m = new Uint8Array(S * S);
    for (let i = 0; i < S * S; i += 1) m[i] = px[i * 4 + 3] > 127 ? 1 : 0;
    return m;
  }

  // the exact distance from every pixel to the nearest pixel where on[i] is 1 (Felzenszwalb and Huttenlocher's
  // squared-distance transform, by columns then by rows)
  function distance(on, S) {
    const INF = 1e20;
    const grid = new Float64Array(S * S);
    for (let i = 0; i < S * S; i += 1) grid[i] = on[i] ? 0 : INF;
    const f = new Float64Array(S);
    const d = new Float64Array(S);
    const v = new Int32Array(S);
    const z = new Float64Array(S + 1);
    const line = () => {
      let k = 0;
      v[0] = 0;
      z[0] = -INF;
      z[1] = INF;
      for (let q = 1; q < S; q += 1) {
        let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) {
          k -= 1;
          s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        }
        k += 1;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < S; q += 1) {
        while (z[k + 1] < q) k += 1;
        d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
      }
    };
    for (let x = 0; x < S; x += 1) {
      for (let y = 0; y < S; y += 1) f[y] = grid[y * S + x];
      line();
      for (let y = 0; y < S; y += 1) grid[y * S + x] = d[y];
    }
    for (let y = 0; y < S; y += 1) {
      for (let x = 0; x < S; x += 1) f[x] = grid[y * S + x];
      line();
      for (let x = 0; x < S; x += 1) grid[y * S + x] = d[x];
    }
    const out = new Float32Array(S * S);
    for (let i = 0; i < S * S; i += 1) out[i] = Math.sqrt(grid[i]);
    return out;
  }

  // mulberry32, the same generator as on the Node side
  function random(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // points kept in square cells of side `cell`, to find the nearest ones without looking at all of them
  class Points {
    constructor(S, cell) {
      this.S = S;
      this.cell = cell;
      this.n = Math.ceil(S / cell);
      this.cells = Array.from({ length: this.n * this.n }, () => []);
      this.x = [];
      this.y = [];
      this.tag = [];
    }

    add(x, y, tag) {
      const i = this.x.length;
      this.x.push(x);
      this.y.push(y);
      this.tag.push(tag);
      const cx = Math.min(this.n - 1, Math.max(0, Math.floor(x / this.cell)));
      const cy = Math.min(this.n - 1, Math.max(0, Math.floor(y / this.cell)));
      this.cells[cy * this.n + cx].push(i);
      return i;
    }

    // is any point closer than r to (x, y)? (r no larger than the cell)
    crowded(x, y, r) {
      const cx = Math.floor(x / this.cell);
      const cy = Math.floor(y / this.cell);
      for (let j = cy - 1; j <= cy + 1; j += 1) {
        if (j < 0 || j >= this.n) continue;
        for (let i = cx - 1; i <= cx + 1; i += 1) {
          if (i < 0 || i >= this.n) continue;
          for (const p of this.cells[j * this.n + i]) {
            if ((this.x[p] - x) ** 2 + (this.y[p] - y) ** 2 < r * r) return true;
          }
        }
      }
      return false;
    }

    // the nearest and second-nearest points to (x, y): [index, distance, index, distance], looking out ring by ring
    nearest2(x, y, out) {
      const cx = Math.floor(x / this.cell);
      const cy = Math.floor(y / this.cell);
      let b1 = -1;
      let d1 = Infinity;
      let b2 = -1;
      let d2 = Infinity;
      for (let ring = 1; ring <= 6; ring += 1) {
        for (let j = cy - ring; j <= cy + ring; j += 1) {
          if (j < 0 || j >= this.n) continue;
          for (let i = cx - ring; i <= cx + ring; i += 1) {
            if (i < 0 || i >= this.n) continue;
            if (ring > 1 && Math.abs(i - cx) < ring && Math.abs(j - cy) < ring) continue;
            for (const p of this.cells[j * this.n + i]) {
              const d = (this.x[p] - x) ** 2 + (this.y[p] - y) ** 2;
              if (d < d1) {
                b2 = b1;
                d2 = d1;
                b1 = p;
                d1 = d;
              } else if (d < d2) {
                b2 = p;
                d2 = d;
              }
            }
          }
        }
        // once two are found, anything in a further ring is at least (ring) cells away
        if (b2 >= 0 && Math.sqrt(d2) <= ring * this.cell) break;
      }
      out[0] = b1;
      out[1] = Math.sqrt(d1);
      out[2] = b2;
      out[3] = Math.sqrt(d2);
      return out;
    }
  }

  // from the candidate pixels, in a random order, keep each that is no closer than r to a point already kept
  function scatter(cands, S, r, rnd, points, tag) {
    for (let i = cands.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [cands[i], cands[j]] = [cands[j], cands[i]];
    }
    for (const c of cands) {
      const x = c % S;
      const y = (c - x) / S;
      if (!points.crowded(x + 0.5, y + 0.5, r)) points.add(x + 0.5, y + 0.5, typeof tag === 'function' ? tag(c) : tag);
    }
  }

  return { mask, distance, random, Points, scatter };
})();
