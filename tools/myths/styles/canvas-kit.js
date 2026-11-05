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

  // a box blur run three times over a field of numbers: close to a Gaussian about r wide
  function blur(src, S, r) {
    const a = Float32Array.from(src);
    const b = new Float32Array(S * S);
    const w = 2 * r + 1;
    const at = (v) => Math.min(S - 1, Math.max(0, v));
    for (let pass = 0; pass < 3; pass += 1) {
      for (let y = 0; y < S; y += 1) {
        const row = y * S;
        let sum = 0;
        for (let x = -r; x <= r; x += 1) sum += a[row + at(x)];
        for (let x = 0; x < S; x += 1) {
          b[row + x] = sum / w;
          sum += a[row + at(x + r + 1)] - a[row + at(x - r)];
        }
      }
      for (let x = 0; x < S; x += 1) {
        let sum = 0;
        for (let y = -r; y <= r; y += 1) sum += b[at(y) * S + x];
        for (let y = 0; y < S; y += 1) {
          a[y * S + x] = sum / w;
          sum += b[at(y + r + 1) * S + x] - b[at(y - r) * S + x];
        }
      }
    }
    return a;
  }

  // light from the upper left on the figure as if it were a low relief whose height is the mask blurred r wide:
  // 0 in the deepest shade, about two thirds on a flat top, 1 on a slope facing the light (0 off the figure)
  function shade(m, S, r, height) {
    const h = blur(m, S, r);
    const L = [-0.55, -0.55, 0.63];
    const len = Math.hypot(...L);
    const out = new Float32Array(S * S);
    for (let y = 1; y < S - 1; y += 1) {
      for (let x = 1; x < S - 1; x += 1) {
        const i = y * S + x;
        if (!m[i]) continue;
        const gx = (h[i + 1] - h[i - 1]) * 0.5 * height;
        const gy = (h[i + S] - h[i - S]) * 0.5 * height;
        out[i] = Math.max(0, (-gx * L[0] - gy * L[1] + L[2]) / (len * Math.hypot(gx, gy, 1)));
      }
    }
    return out;
  }

  // smooth noise between 0 and 1, changing over about `cell` pixels
  function noise(S, cell, seed) {
    const rnd = random(seed);
    const n = Math.ceil(S / cell) + 2;
    const g = new Float32Array(n * n).map(() => rnd());
    const out = new Float32Array(S * S);
    const ease = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < S; y += 1) {
      const iy = Math.floor(y / cell);
      const ty = ease(y / cell - iy);
      for (let x = 0; x < S; x += 1) {
        const ix = Math.floor(x / cell);
        const tx = ease(x / cell - ix);
        const a = g[iy * n + ix];
        const b = g[iy * n + ix + 1];
        const c = g[(iy + 1) * n + ix];
        const d = g[(iy + 1) * n + ix + 1];
        const top = a + (b - a) * tx;
        out[y * S + x] = top + (c + (d - c) * tx - top) * ty;
      }
    }
    return out;
  }

  // how much of a pixel a line covers when its middle is d away and it is 2w wide, smoothed over one pixel
  const cover = (d, w) => Math.min(1, Math.max(0, w - d + 0.5));

  // a field of ink (0 none, 1 full) painted in `ink` on `ground`, as a PNG data URL
  function picture(ink, S, colour = [255, 255, 255], ground = [0, 0, 0]) {
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d');
    const img = g.createImageData(S, S);
    const d = img.data;
    for (let i = 0; i < S * S; i += 1) {
      const v = Math.min(1, Math.max(0, ink[i]));
      d[i * 4] = ground[0] + (colour[0] - ground[0]) * v;
      d[i * 4 + 1] = ground[1] + (colour[1] - ground[1]) * v;
      d[i * 4 + 2] = ground[2] + (colour[2] - ground[2]) * v;
      d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  return { mask, distance, random, Points, scatter, blur, shade, noise, cover, picture };
})();
