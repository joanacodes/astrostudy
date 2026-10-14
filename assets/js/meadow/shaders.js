// GLSL for the meadow. Units are metres; light is linear radiance; the camera sits a centimetre
// above the soil. Everything that moves is a pure function of time, so a page reload, the next
// page, or a video export all show the same sky at the same moment.

const HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
#define PI 3.14159265359
`;

export const FULLSCREEN_VS = HEAD + `
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------------------------
// Noise. Tileable, so the clouds can drift for ever without a seam.

const HASH = `
vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}
float gradNoise(vec3 p, float per) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  #define G(o) dot(hash33(mod(i + o, per)) * 2.0 - 1.0, f - o)
  float n000 = G(vec3(0,0,0)), n100 = G(vec3(1,0,0)), n010 = G(vec3(0,1,0)), n110 = G(vec3(1,1,0));
  float n001 = G(vec3(0,0,1)), n101 = G(vec3(1,0,1)), n011 = G(vec3(0,1,1)), n111 = G(vec3(1,1,1));
  #undef G
  return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
             mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
}
float worley(vec3 p, float per) {
  vec3 id = floor(p), f = fract(p);
  float md = 1.0;
  for (int z = -1; z <= 1; z++)
  for (int y = -1; y <= 1; y++)
  for (int x = -1; x <= 1; x++) {
    vec3 o = vec3(float(x), float(y), float(z));
    vec3 d = o + hash33(mod(id + o, per)) - f;
    md = min(md, dot(d, d));
  }
  return 1.0 - clamp(sqrt(md), 0.0, 1.0);
}
float remap(float v, float l0, float h0, float l1, float h1) {
  return l1 + (v - l0) * (h1 - l1) / (h0 - l0);
}
`;

// One slice of the 3D cloud noise per draw. R: Perlin-Worley (shapes), GBA: Worley fbm at rising
// frequencies (billows and erosion).
export const NOISE3D_FS = HEAD + HASH + `
uniform float u_slice;
uniform float u_size;
out vec4 o;
void main() {
  vec3 p = vec3(gl_FragCoord.xy / u_size, u_slice);
  float perlin = 0.0, amp = 0.5;
  for (int k = 0; k < 4; k++) {
    float f = 4.0 * pow(2.0, float(k));
    perlin += gradNoise(p * f, f) * amp;
    amp *= 0.5;
  }
  perlin = clamp(perlin * 0.85 + 0.5, 0.0, 1.0);
  float w3 = worley(p * 3.0, 3.0), w6 = worley(p * 6.0, 6.0), w12 = worley(p * 12.0, 12.0), w24 = worley(p * 24.0, 24.0);
  float f0 = w3 * 0.625 + w6 * 0.25 + w12 * 0.125;
  float f1 = w6 * 0.625 + w12 * 0.25 + w24 * 0.125;
  float f2 = w12 * 0.75 + w24 * 0.25;
  float pw = remap(perlin, 0.0, 1.0, f0, 1.0);
  // stretch to use the whole range: the raw mix bunches between 0.6 and 0.9, which reads as overcast
  pw = clamp((pw - 0.6) / 0.27, 0.0, 1.0);
  o = vec4(pw, f0, f1, f2);
}`;

// The ground-level wind field: a soft 2D noise the gusts ride across.
export const GUST_FS = HEAD + HASH + `
uniform float u_size;
out vec4 o;
void main() {
  vec2 p = gl_FragCoord.xy / u_size;
  float n = 0.0, amp = 0.55;
  for (int k = 0; k < 3; k++) {
    float f = 3.0 * pow(2.0, float(k));
    n += gradNoise(vec3(p * f, 0.37), f) * amp;
    amp *= 0.5;
  }
  o = vec4(clamp(n * 0.9 + 0.5, 0.0, 1.0));
}`;

// ---------------------------------------------------------------------------------------------
// Atmosphere: single scattering, Rayleigh + Mie + a touch of ozone, baked once into a small table.

export const SKYLUT_FS = HEAD + `
in vec2 v_uv;
uniform vec3 u_sun;
uniform float u_sunI;
out vec4 o;
const float Re = 6360e3, Ra = 6420e3;
const vec3 bR = vec3(5.802e-6, 13.558e-6, 33.1e-6);
const vec3 bO = vec3(0.650e-6, 1.881e-6, 0.085e-6);
const float bM = 6.5e-6, bMe = 7.2e-6, HR = 8000.0, HM = 1200.0;
float exitSphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd), c = dot(ro, ro) - r * r;
  return -b + sqrt(max(b * b - c, 0.0));
}
void main() {
  float az = v_uv.x * PI;
  float el = v_uv.y * v_uv.y * PI * 0.5;
  vec2 s2 = normalize(u_sun.xz);
  float sa = atan(s2.x, -s2.y) + az;
  vec3 dir = vec3(sin(sa) * cos(el), sin(el), -cos(sa) * cos(el));
  vec3 ro = vec3(0.0, Re + 2.0, 0.0);
  float tMax = exitSphere(ro, dir, Ra);
  const int N = 32, NL = 10;
  float dt = tMax / float(N);
  vec3 sumR = vec3(0.0), sumM = vec3(0.0);
  float odR = 0.0, odM = 0.0;
  for (int i = 0; i < N; i++) {
    vec3 p = ro + dir * (float(i) + 0.5) * dt;
    float h = length(p) - Re;
    float hr = exp(-h / HR) * dt, hm = exp(-h / HM) * dt;
    odR += hr; odM += hm;
    float tl = exitSphere(p, u_sun, Ra), dl = tl / float(NL);
    float lR = 0.0, lM = 0.0;
    for (int j = 0; j < NL; j++) {
      vec3 q = p + u_sun * (float(j) + 0.5) * dl;
      float hq = length(q) - Re;
      lR += exp(-hq / HR) * dl; lM += exp(-hq / HM) * dl;
    }
    vec3 tau = (bR + bO) * (odR + lR) + bMe * (odM + lM);
    vec3 att = exp(-tau);
    sumR += att * hr; sumM += att * hm;
  }
  float mu = dot(dir, u_sun);
  float pR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
  float g = 0.76;
  float pM = 3.0 / (8.0 * PI) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
  o = vec4(u_sunI * (sumR * bR * pR + sumM * bM * pM), 1.0);
}`;

const SKY_LOOKUP = `
uniform sampler2D u_skyLUT;
uniform vec3 u_sun;
vec3 skyRadiance(vec3 d) {
  float el = asin(clamp(d.y, 0.0, 1.0));
  vec2 h = d.xz;
  float hl = length(h);
  vec2 s = normalize(u_sun.xz);
  float c = hl > 1e-4 ? dot(h / hl, s) : 1.0;
  float az = acos(clamp(c, -1.0, 1.0));
  return texture(u_skyLUT, vec2(az / PI, sqrt(el / (PI * 0.5)))).rgb;
}
`;

// ---------------------------------------------------------------------------------------------
// Clouds: fair-weather cumulus in a slab, marched from the ground.

const CLOUD_COMMON = `
uniform sampler3D u_noise;
uniform vec3 u_cloudOff;    // drift, already wrapped to the tile on the CPU
uniform vec3 u_detailOff;
uniform float u_coverage;
const float CB = 1500.0, CT = 2900.0;
const float BASE_TILE = 9000.0, DETAIL_TILE = 950.0;
float cloudDensity(vec3 p, bool cheap) {
  float h = (p.y - CB) / (CT - CB);
  if (h <= 0.0 || h >= 1.0) return 0.0;
  // tops lean downwind a little, like real cumulus
  vec3 q = p + vec3(h * h * 380.0, 0.0, h * h * 120.0);
  vec4 n = texture(u_noise, q / BASE_TILE + u_cloudOff);
  float fbm = n.g * 0.625 + n.b * 0.25 + n.a * 0.125;
  float base = n.r * mix(0.75, 1.0, fbm);
  // flat bases, rounded tops
  float profile = smoothstep(0.0, 0.045, h) * (1.0 - smoothstep(0.25, 1.0, h));
  float cov = u_coverage;
  float shape = remap(base * mix(0.55, 1.0, profile), 1.0 - cov, 1.0, 0.0, 1.0) * profile;
  if (shape <= 0.0) return 0.0;
  if (cheap) return clamp(shape, 0.0, 1.0);
  vec4 dn = texture(u_noise, q / DETAIL_TILE + u_detailOff);
  float dfbm = dn.g * 0.625 + dn.b * 0.25 + dn.a * 0.125;
  // wispy under the base, cauliflower above
  float dmod = mix(1.0 - dfbm, dfbm, clamp(h * 6.0, 0.0, 1.0));
  shape = remap(shape, dmod * 0.58, 1.0, 0.0, 1.0);
  return clamp(shape, 0.0, 1.0);
}
`;

export const CLOUDS_FS = HEAD + `
in vec2 v_uv;
uniform vec3 u_camR, u_camU, u_camF;
uniform vec2 u_tanHalf;
uniform mat4 u_prevVP;
uniform sampler2D u_history;
uniform vec3 u_sunCol;
uniform vec3 u_ambTop;
uniform vec3 u_ambBottom;
uniform float u_frame;
uniform float u_blend;
uniform int u_steps;
out vec4 o;
` + HASH + SKY_LOOKUP + CLOUD_COMMON + `
float hg(float mu, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5));
}
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// Built from the camera basis rather than by unprojecting the far plane: with a lens a few
// millimetres from the grass and clouds kilometres away, that unprojection runs out of precision.
vec3 viewDir(vec2 uv) {
  vec2 n = uv * 2.0 - 1.0;
  return normalize(u_camF + n.x * u_tanHalf.x * u_camR + n.y * u_tanHalf.y * u_camU);
}

void main() {
  vec3 dir = viewDir(v_uv);
  vec3 sky = skyRadiance(dir);
  vec3 L = vec3(0.0);
  float T = 1.0;
  float depthAcc = 0.0, wAcc = 0.0;
  if (dir.y > 0.012) {
    float t0 = CB / dir.y, t1 = min(CT / dir.y, 32000.0);
    int N = u_steps;
    float dt = (t1 - t0) / float(N);
    float t = t0 + dt * ign(gl_FragCoord.xy + u_frame * 5.588238);
    float mu = dot(dir, u_sun);
    for (int i = 0; i < 160; i++) {
      if (i >= N) break;
      vec3 p = dir * t;
      float d = cloudDensity(p, false);
      if (d > 0.002) {
        float sig = d * 0.08;
        // march toward the sun
        float od = 0.0, s = 26.0;
        vec3 q = p;
        for (int j = 0; j < 6; j++) {
          q += u_sun * s;
          od += cloudDensity(q, j > 2) * s;
          s *= 1.75;
        }
        od *= 0.08;
        float hgt = clamp((p.y - CB) / (CT - CB), 0.0, 1.0);
        // two-lobe phase (silver edges toward the sun, a little back-scatter elsewhere), and
        // multiple scattering as a few softer, wider octaves of it (Wrenninge)
        vec3 sunL = vec3(0.0);
        float a = 1.0, b = 1.0, c = 1.0;
        for (int k = 0; k < 3; k++) {
          sunL += a * mix(hg(mu, 0.82 * c), hg(mu, -0.25 * c), 0.28) * exp(-b * od);
          a *= 0.5; b *= 0.45; c *= 0.5;
        }
        // powder: the fluffy dark creases where light has not yet built up
        float powder = 1.0 - exp(-d * 0.08 * 120.0);
        sunL *= mix(1.0, powder, 0.55) * 4.0 * PI;
        vec3 amb = mix(u_ambBottom, u_ambTop, smoothstep(0.0, 0.9, hgt)) * (0.55 + 0.45 * powder);
        vec3 Sin = u_sunCol * sunL * 0.25 + amb;
        float tr = exp(-sig * dt);
        L += T * Sin * (1.0 - tr);
        depthAcc += T * (1.0 - tr) * t; wAcc += T * (1.0 - tr);
        T *= tr;
        if (T < 0.015) break;
      }
      t += dt;
    }
    // distance haze softens the far clouds into the sky
    float dist = wAcc > 0.0 ? depthAcc / wAcc : t0;
    float haze = 1.0 - exp(-dist / 26000.0);
    L = mix(L, sky * (1.0 - T), haze * 0.85);
  }
  vec3 col = sky * T + L;
  vec4 cur = vec4(col, T);

  // fold in the previous frame, found by direction so camera turns never smear
  vec4 pc = u_prevVP * vec4(dir, 1.0);
  vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
  float valid = (pc.w > 0.0 && all(greaterThan(puv, vec2(0.0))) && all(lessThan(puv, vec2(1.0)))) ? 1.0 : 0.0;
  vec4 hist = texture(u_history, puv);
  float k = mix(1.0, u_blend, valid);
  o = mix(hist, cur, k);
}`;

// How much sun reaches the meadow right now, given the clouds. One pixel, read by the blade shaders.
export const SUNVIS_FS = HEAD + HASH + CLOUD_COMMON + `
uniform vec3 u_sun;
out vec4 o;
void main() {
  float od = 0.0;
  float t0 = CB / u_sun.y, t1 = CT / u_sun.y;
  const int N = 24;
  float dt = (t1 - t0) / float(N);
  for (int i = 0; i < N; i++) {
    vec3 p = u_sun * (t0 + (float(i) + 0.5) * dt);
    od += cloudDensity(p, false) * dt;
  }
  od *= 0.055;
  float vis = max(exp(-od), 0.32 * exp(-od * 0.12));
  o = vec4(vis, od, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------------------------
// Sky as seen through the lens: the cloud buffer, the sun disc, and the far meadow at the horizon.

export const SKY_FS = HEAD + `
in vec2 v_uv;
uniform sampler2D u_clouds;
uniform vec3 u_camR, u_camU, u_camF;
uniform vec2 u_tanHalf;
uniform vec3 u_sun;
uniform vec3 u_sunDisc;
uniform vec3 u_farGrass;
uniform vec2 u_cloudTexel;
out vec4 o;
void main() {
  vec2 n = v_uv * 2.0 - 1.0;
  vec3 dir = normalize(u_camF + n.x * u_tanHalf.x * u_camR + n.y * u_tanHalf.y * u_camU);
  // a soft 5-tap read: the sky sits far behind the focal plane, so it is never razor sharp
  vec2 e = u_cloudTexel * 0.45;
  vec4 c = texture(u_clouds, v_uv) * 0.4
         + (texture(u_clouds, v_uv + vec2(e.x, e.y)) + texture(u_clouds, v_uv + vec2(-e.x, e.y))
          + texture(u_clouds, v_uv + vec2(e.x, -e.y)) + texture(u_clouds, v_uv - e)) * 0.15;
  float mu = dot(dir, u_sun);
  float disc = smoothstep(0.999955, 0.999975, mu);
  vec3 col = c.rgb + u_sunDisc * disc * c.a;
  // beyond the last blades: a hazy band of meadow, so the horizon never shows through
  float el = asin(clamp(dir.y, -1.0, 1.0));
  float band = 1.0 - smoothstep(0.06, 0.2, el);
  col = mix(col, u_farGrass * (0.55 + 0.45 * smoothstep(0.0, 0.2, el)), band);
  o = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------------------------------------
// Grass. Each blade is a strip whose centre line is integrated from a bend angle, so it keeps its
// length when the wind leans on it. The strip is widened on screen by its own blur circle and the
// edge is resolved analytically: depth of field without a blur pass, and soft edges that sort
// correctly because the strips are drawn far to near.

const WIND = `
uniform float u_wt;
uniform float u_wperiod;
uniform vec2 u_windDir;
uniform vec2 u_gustOff;
uniform float u_windStrength;
uniform sampler2D u_gust;
const int SEG = 14;
float qf(float f) { return floor(f * u_wperiod + 0.5) / u_wperiod; }
vec2 windAngle(vec3 base, float H, float flex, float phase) {
  float g = texture(u_gust, base.xz / 3.2 + u_gustOff).r;
  float gust = smoothstep(0.3, 0.8, g);
  float f1 = qf(0.42 + 0.28 / (0.2 + H * 3.0));
  float s1 = sin(2.0 * PI * f1 * u_wt + phase);
  float s2 = sin(2.0 * PI * qf(f1 * 2.31) * u_wt + phase * 1.7);
  float s3 = sin(2.0 * PI * qf(f1 * 0.63) * u_wt + phase * 2.3);
  float bend = u_windStrength * flex * (0.1 + 0.42 * gust);
  float flutter = u_windStrength * flex * (0.035 + 0.11 * gust);
  vec2 perp = vec2(-u_windDir.y, u_windDir.x);
  return u_windDir * (bend + flutter * (0.7 * s1 + 0.3 * s2)) + perp * flutter * 0.5 * s3;
}
vec3 bladeDir(float s, vec2 lean, float leanAng, float bp, vec2 wind) {
  vec2 a = lean * leanAng * pow(s, bp) + wind * s * s;
  float m = length(a);
  vec2 ad = a / max(m, 1e-5);
  return vec3(ad.x * sin(m), cos(m), ad.y * sin(m));
}
vec3 bladePoint(float t, vec3 base, float H, vec2 lean, float leanAng, float bp, vec2 wind, out vec3 dir) {
  vec3 p = base;
  float ds = 1.0 / float(SEG);
  for (int j = 0; j < SEG; j++) {
    float s0 = float(j) * ds;
    if (s0 >= t) break;
    float len = min(ds, t - s0);
    p += bladeDir(s0 + 0.5 * len, lean, leanAng, bp, wind) * (len * H);
  }
  dir = bladeDir(t, lean, leanAng, bp, wind);
  return p;
}
void bladeFrame(vec3 dir, vec2 lean, float tw, out vec3 side, out vec3 nrm) {
  vec3 s0 = vec3(-lean.y, 0.0, lean.x);
  s0 = normalize(s0 - dir * dot(s0, dir));
  vec3 n0 = cross(s0, dir);
  side = s0 * cos(tw) + n0 * sin(tw);
  nrm = cross(side, dir);
}
float bladeHalfWidth(float t, float hw) {
  float k = clamp((1.0 - t) / 0.3, 0.0, 1.0);
  return hw * sqrt(k) * (0.55 + 0.45 * k) * (0.8 + 0.2 * smoothstep(0.0, 0.18, t));
}
`;

const LENS = `
uniform mat4 u_vp;
uniform vec3 u_cam;
uniform vec2 u_res;
uniform float u_focal;
uniform float u_cocK;
uniform float u_invFocus;
uniform float u_cocMax;
uniform float u_near;
float cocPx(float depth) {
  return clamp(u_cocK * abs(1.0 / depth - u_invFocus) * (u_res.y / 1080.0), 0.0, u_cocMax * (u_res.y / 1080.0));
}
`;

export const BLADE_VS = HEAD + `
layout(location = 0) in vec2 a_vert;
layout(location = 1) in vec4 a_i0;
layout(location = 2) in vec4 a_i1;
layout(location = 3) in vec4 a_i2;
uniform sampler2D u_sunVis;
` + LENS + WIND + `
out vec3 v_world;
out vec3 v_nrm;
out vec3 v_side;
out float v_lat;
out float v_hw;
out float v_r;
out float v_t;
out vec3 v_var;
out float v_sun;
invariant gl_Position;
void main() {
  vec3 base = vec3(a_i0.x, 0.0, a_i0.y);
  float H = a_i0.z, hw = a_i0.w;
  vec2 lean = vec2(cos(a_i1.x), sin(a_i1.x));
  vec2 wind = windAngle(base, H, a_i2.w, a_i2.z);
  float t = a_vert.y;
  vec3 dir;
  vec3 c = bladePoint(t, base, H, lean, a_i1.y, a_i1.w, wind, dir);
  vec3 side, nrm;
  bladeFrame(dir, lean, a_i1.z * t, side, nrm);
  float w = bladeHalfWidth(t, hw);

  vec4 cc = u_vp * vec4(c, 1.0);
  float depth = cc.w;
  float lat = 0.0, hwPx = 0.0, r = 0.7;
  vec2 off = vec2(0.0);
  if (depth > u_near * 3.0) {
    vec4 ct = u_vp * vec4(c + dir * (0.004 + 0.02 * H), 1.0);
    vec4 cs = u_vp * vec4(c + side * w, 1.0);
    vec2 sc = cc.xy / cc.w * 0.5 * u_res;
    vec2 st = ct.xy / max(ct.w, 1e-4) * 0.5 * u_res;
    vec2 ss = cs.xy / max(cs.w, 1e-4) * 0.5 * u_res;
    vec2 tang = st - sc;
    float tl = length(tang);
    tang = tl > 1e-5 ? tang / tl : vec2(0.0, 1.0);
    vec2 perp = vec2(-tang.y, tang.x);
    hwPx = abs(dot(ss - sc, perp));
    float thick = 0.00018 * u_focal / depth * clamp(w / max(hw, 1e-5), 0.0, 1.0);
    hwPx = max(hwPx, thick);
    float coc = cocPx(depth);
    r = max(coc * 0.5, 0.7);
    float ext = hwPx + r + 0.75;
    lat = a_vert.x * ext;
    off = perp * lat;
  }
  gl_Position = cc + vec4(off / (0.5 * u_res) * cc.w, 0.0, 0.0);
  v_world = c;
  v_nrm = nrm;
  v_side = side;
  v_lat = lat;
  v_hw = hwPx;
  v_r = r;
  v_t = t;
  v_var = vec3(a_i2.x, a_i2.y, c.y);
  v_sun = texture(u_sunVis, vec2(0.5)).r;
}`;

const GRASS_SHADING = `
uniform vec3 u_sunDir;
uniform vec3 u_sunCol;
uniform vec3 u_skyAmb;
uniform vec3 u_groundAmb;
vec3 grassAlbedo(float hue, float dry, float t) {
  vec3 deep = vec3(0.034, 0.085, 0.018);
  vec3 fresh = vec3(0.085, 0.15, 0.026);
  vec3 blue = vec3(0.04, 0.09, 0.05);
  vec3 c = mix(deep, fresh, smoothstep(0.15, 0.85, hue));
  c = mix(c, blue, smoothstep(0.86, 1.0, hue) * 0.7);
  c *= mix(0.78, 1.12, t);
  vec3 straw = vec3(0.30, 0.235, 0.105);
  float d = dry * smoothstep(0.35, 1.0, t + dry * 0.35);
  return mix(c, straw, d);
}
`;

export const BLADE_FS = HEAD + `
in vec3 v_world;
in vec3 v_nrm;
in vec3 v_side;
in float v_lat;
in float v_hw;
in float v_r;
in float v_t;
in vec3 v_var;
in float v_sun;
uniform vec3 u_cam;
uniform float u_depthOnly;
out vec4 o;
` + GRASS_SHADING + `
void main() {
  float x = abs(v_lat);
  float cov = max(0.0, min(v_hw, x + v_r) - max(-v_hw, x - v_r)) / (2.0 * v_r);
  if (u_depthOnly > 0.5) {
    if (cov < 0.62) discard;
    o = vec4(0.0);
    return;
  }
  if (cov < 0.003) discard;
  float across = clamp(v_lat / max(v_hw, 0.5), -1.0, 1.0);
  vec3 V = normalize(u_cam - v_world);
  vec3 N = normalize(v_nrm);
  if (dot(N, V) < 0.0) N = -N;
  vec3 S = normalize(v_side);
  // edge effects belong to a blade we can actually see sharply; a blurred one is just its average
  float crisp = 1.0 - smoothstep(1.0, 6.0, v_r);
  // the blade is folded along its midrib: a shallow V, so one half catches more light than the other
  vec3 Nf = normalize(N + S * across * 0.5 * crisp);
  float NL = dot(Nf, u_sunDir);
  float h = v_var.z;
  float dapple = 0.5 + 0.5 * sin(v_world.x * 37.0 + v_world.z * 23.0 + h * 51.0);
  float canopy = smoothstep(0.07, 0.3 + 0.08 * dapple, h);
  float sunVis = canopy * v_sun;
  float ao = mix(0.1, 1.0, smoothstep(0.02, 0.3, h));
  vec3 albedo = grassAlbedo(v_var.x, v_var.y, v_t);
  vec3 transCol = albedo * vec3(2.1, 2.4, 0.55);
  float VL = max(dot(-V, u_sunDir), 0.0);
  // lit from the front, or glowing from behind like a lampshade
  vec3 diff = albedo * max(NL, 0.0) * 0.9;
  vec3 trans = transCol * max(-NL, 0.0) * (0.28 + 1.9 * pow(VL, 5.0));
  float edge = smoothstep(0.6, 1.0, abs(across)) * crisp;
  trans += transCol * edge * (0.12 + 0.7 * pow(VL, 3.0));
  vec3 Hh = normalize(u_sunDir + V);
  float spec = pow(max(dot(Nf, Hh), 0.0), 70.0) * 0.6 * step(0.0, NL) * (0.04 + 0.96 * pow(1.0 - max(dot(Nf, V), 0.0), 5.0));
  vec3 direct = (diff + trans + spec) * u_sunCol * sunVis;
  vec3 amb = albedo * (u_skyAmb * (0.5 + 0.5 * Nf.y) + u_groundAmb) * ao;
  vec3 col = direct + amb;
  // veins and the pale midrib, only where the blade is in focus and wide enough to show them
  float sharp = (1.0 - smoothstep(1.0, 3.5, v_r)) * smoothstep(3.0, 9.0, v_hw);
  float veins = 0.5 + 0.5 * cos(across * PI * 7.0);
  col *= 1.0 - 0.09 * veins * sharp;
  float rib = 1.0 - smoothstep(0.0, 0.14, abs(across));
  col *= 1.0 + 0.22 * rib * sharp;
  o = vec4(col * cov, cov);
}`;

// ---------------------------------------------------------------------------------------------
// Droplets: little lenses. In focus they are traced as spheres (an upside-down sky inside, the sun
// caught on the skin); out of focus they open into soft discs of light, as a real lens would.

export const DROP_VS = HEAD + `
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec4 a_i0;
layout(location = 2) in vec4 a_i1;
layout(location = 3) in vec4 a_i2;
layout(location = 4) in vec4 a_d;
uniform sampler2D u_sunVis;
uniform float u_moteT;
` + LENS + WIND + `
out vec2 v_q;
out float v_R;
out float v_rb;
out float v_kind;
out float v_light;
out vec3 v_center;
void main() {
  float kind = a_d.w;
  vec3 center;
  float light = 1.0;
  if (kind > 1.5) {
    // pollen: drifts along the wind, fades in and out at the ends of its run
    float s = fract(a_i2.z / (2.0 * PI) + u_moteT);
    vec3 wd = vec3(u_windDir.x, 0.0, u_windDir.y);
    center = vec3(a_i0.x, a_i0.z, a_i0.y) + wd * (s - 0.5) * 0.22
           + vec3(0.0, 0.012 * sin(2.0 * PI * (s * 3.0 + a_i2.x)), 0.0);
    light = sin(PI * s);
    light *= smoothstep(0.03, 0.2, center.y);
  } else {
    vec3 base = vec3(a_i0.x, 0.0, a_i0.y);
    float H = a_i0.z, hw = a_i0.w;
    vec2 lean = vec2(cos(a_i1.x), sin(a_i1.x));
    vec2 wind = windAngle(base, H, a_i2.w, a_i2.z);
    float t = a_d.x;
    vec3 dir;
    vec3 c = bladePoint(t, base, H, lean, a_i1.y, a_i1.w, wind, dir);
    vec3 side, nrm;
    bladeFrame(dir, lean, a_i1.z * t, side, nrm);
    vec3 toCam = u_cam - c;
    vec3 n = dot(nrm, toCam) > 0.0 ? nrm : -nrm;
    float w = bladeHalfWidth(t, hw);
    if (kind > 0.5) {
      center = c + vec3(0.0, -a_d.z * 0.95, 0.0) + dir * a_d.z * 0.2;
    } else {
      center = c + side * a_d.y * w + n * a_d.z * 0.62;
    }
    light = smoothstep(0.015, 0.14, center.y);
  }
  vec4 cc = u_vp * vec4(center, 1.0);
  float depth = max(cc.w, u_near);
  float R = a_d.z * u_focal / depth;
  float coc = cocPx(depth);
  float rb = max(R, coc * 0.5);
  float ext = rb * (kind > 0.5 && kind < 1.5 ? 1.25 : 1.0) + 1.5;
  gl_Position = cc + vec4(a_corner * ext / (0.5 * u_res) * cc.w, 0.0, 0.0);
  if (cc.w < u_near * 3.0) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
  v_q = a_corner * ext;
  v_R = R;
  v_rb = rb;
  v_kind = kind;
  v_light = light * texture(u_sunVis, vec2(0.5)).r;
  v_center = center;
}`;

export const DROP_FS = HEAD + `
in vec2 v_q;
in float v_R;
in float v_rb;
in float v_kind;
in float v_light;
in vec3 v_center;
uniform vec3 u_camRight;
uniform vec3 u_camUp;
uniform vec3 u_camBack;
uniform vec3 u_cam;
uniform vec3 u_sunCol;
uniform vec3 u_sunDir;
uniform vec3 u_skyAmb;
out vec4 o;
` + SKY_LOOKUP + `
vec3 dropEnv(vec3 d, float light) {
  vec3 sky = skyRadiance(d);
  float e = d.y;
  vec3 grass = mix(vec3(0.012, 0.03, 0.008), vec3(0.16, 0.26, 0.04) * (0.4 + 0.6 * light), smoothstep(-0.25, 0.32, e));
  float k = smoothstep(0.2, 0.45, e);
  vec3 c = mix(grass, sky, k);
  float mu = max(dot(d, u_sunDir), 0.0);
  c += u_sunCol * (pow(mu, 1800.0) * 70.0 + pow(mu, 60.0) * 0.6) * k * light;
  return c;
}
void main() {
  float d = length(v_q);
  if (v_kind > 1.5) {
    // a mote of pollen, lit from behind
    vec3 V = normalize(u_cam - v_center);
    float VL = max(dot(-V, u_sunDir), 0.0);
    float rb = v_rb;
    float a = clamp(rb - d + 0.5, 0.0, 1.0);
    float area = max(rb * rb, 0.6);
    float energy = max(v_R * v_R, 0.25) / area;
    vec3 c = u_sunCol * vec3(1.0, 0.92, 0.75) * v_light * (0.008 + 0.5 * pow(VL, 12.0)) * energy;
    if (a <= 0.0) discard;
    o = vec4(c * a, 0.0);
    return;
  }
  vec2 q = v_q;
  float R = max(v_R, 0.35);
  if (v_kind > 0.5) { q.y = q.y / 1.18 + R * 0.12; }   // pendant drops sag
  float rb = v_rb;
  float blur = smoothstep(1.0, 2.6, rb / R);

  // in focus: trace the sphere
  vec4 sharp = vec4(0.0);
  float dq = length(q);
  if (blur < 0.999 && dq < R + 1.0) {
    vec2 p = q / R;
    float pp = min(dot(p, p), 1.0);
    vec3 nv = vec3(p, sqrt(1.0 - pp));
    vec3 n = normalize(u_camRight * nv.x + u_camUp * nv.y + u_camBack * nv.z);
    vec3 I = -u_camBack;
    vec3 d1 = refract(I, n, 1.0 / 1.333);
    vec3 pe = n + d1 * (-2.0 * dot(n, d1));
    vec3 ne = normalize(pe);
    vec3 d2 = refract(d1, -ne, 1.333);
    if (dot(d2, d2) < 0.5) d2 = reflect(d1, -ne);
    vec3 refr = dropEnv(d2, v_light) * vec3(0.96, 0.98, 1.0);
    float cosI = max(dot(n, -I), 0.0);
    float F = 0.02 + 0.98 * pow(1.0 - cosI, 5.0);
    vec3 refl = dropEnv(reflect(I, n), v_light);
    vec3 col = mix(refr, refl, F);
    // a dark rim where the drop reflects the shaded meadow, as in close-up photographs
    col *= mix(1.0, 0.55, smoothstep(0.75, 1.0, pp));
    // the sun on the skin of the drop, and the sun focused through it: placed exactly, so they
    // never fall between two pixels and flicker
    vec3 hv = normalize(u_sunDir + u_camBack);
    vec2 gq = vec2(dot(hv, u_camRight), dot(hv, u_camUp)) * R;
    float gs = max(R * 0.07, 0.6);
    float glint = exp(-dot(q - gq, q - gq) / (gs * gs));
    vec2 sq = -vec2(dot(u_sunDir, u_camRight), dot(u_sunDir, u_camUp)) * R * 0.62;
    float cs = max(R * 0.2, 0.8);
    float caustic = exp(-dot(q - sq, q - sq) / (cs * cs)) * smoothstep(-0.2, 0.6, dot(u_sunDir, -u_camBack));
    col += u_sunCol * v_light * (glint * 9.0 + caustic * 1.6);
    float a = clamp(R - dq + 0.5, 0.0, 1.0);
    sharp = vec4(col * a, a);
  }
  // out of focus: a disc of light with a slightly brighter rim
  vec4 bokeh = vec4(0.0);
  if (blur > 0.001) {
    float a = clamp(rb - d + 0.5, 0.0, 1.0);
    float cover = clamp((R * R) / (rb * rb), 0.0, 1.0);
    vec3 avg = mix(u_skyAmb * 0.35, vec3(0.05, 0.08, 0.02), 0.5) + u_sunCol * 0.012 * v_light;
    float rim = 1.0 + 0.45 * smoothstep(0.7, 0.97, d / rb);
    vec3 glint = u_sunCol * v_light * 1.4 * (R * R) / max(rb * rb, 1.0);
    bokeh = vec4((avg * cover + glint) * rim * a, cover * a * 0.9);
  }
  o = mix(sharp, bokeh, blur);
}`;

// ---------------------------------------------------------------------------------------------
// Bloom (dual filter), then the film: AgX tone curve, a warm lift, halation, grain.

export const DOWN_FS = HEAD + `
in vec2 v_uv;
uniform sampler2D u_src;
uniform vec2 u_texel;
uniform float u_first;
out vec4 o;
vec3 tap(vec2 uv) {
  vec3 c = texture(u_src, uv).rgb;
  if (u_first > 0.5) c /= 1.0 + dot(c, vec3(0.2126, 0.7152, 0.0722)) * 0.002; // tames single-pixel glints, keeps the sun
  return c;
}
void main() {
  vec2 h = u_texel * 0.5;
  vec3 c = tap(v_uv) * 4.0 + tap(v_uv - h) + tap(v_uv + h) + tap(v_uv + vec2(h.x, -h.y)) + tap(v_uv - vec2(h.x, -h.y));
  o = vec4(c / 8.0, 1.0);
}`;

export const UP_FS = HEAD + `
in vec2 v_uv;
uniform sampler2D u_src;
uniform sampler2D u_add;
uniform vec2 u_texel;
uniform float u_k;
out vec4 o;
void main() {
  vec2 h = u_texel * 0.5;
  vec3 c = texture(u_src, v_uv + vec2(-h.x * 2.0, 0.0)).rgb
         + texture(u_src, v_uv + vec2(-h.x, h.y)).rgb * 2.0
         + texture(u_src, v_uv + vec2(0.0, h.y * 2.0)).rgb
         + texture(u_src, v_uv + vec2(h.x, h.y)).rgb * 2.0
         + texture(u_src, v_uv + vec2(h.x * 2.0, 0.0)).rgb
         + texture(u_src, v_uv + vec2(h.x, -h.y)).rgb * 2.0
         + texture(u_src, v_uv + vec2(0.0, -h.y * 2.0)).rgb
         + texture(u_src, v_uv + vec2(-h.x, -h.y)).rgb * 2.0;
  o = vec4(c / 12.0 * u_k + texture(u_add, v_uv).rgb, 1.0);
}`;

export const FINAL_FS = HEAD + `
in vec2 v_uv;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform vec2 u_res;
uniform float u_exposure;
uniform float u_bloomK;
uniform float u_grain;
uniform float u_frame;
out vec4 o;
vec3 agxContrast(vec3 x) {
  vec3 x2 = x * x, x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}
vec3 agx(vec3 v) {
  const mat3 m = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                      0.0784335999999992, 0.878468636469772, 0.0784336,
                      0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const mat3 mi = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                       -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                       -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  const float lo = -12.47393, hi = 4.026069;
  v = m * max(v, vec3(1e-10));
  v = clamp(log2(v), lo, hi);
  v = (v - lo) / (hi - lo);
  v = agxContrast(v);
  return mi * v;
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main() {
  vec2 uv = v_uv;
  vec2 dc = uv - 0.5;
  // a whisper of lateral colour toward the edges of the frame
  float ca = dot(dc, dc) * 0.006;
  vec3 c;
  c.r = texture(u_scene, uv - dc * ca).r;
  c.g = texture(u_scene, uv).g;
  c.b = texture(u_scene, uv + dc * ca).b;
  vec3 b = texture(u_bloom, uv).rgb;
  // halation: the red that bleeds around bright things on film
  c += b * u_bloomK + b * vec3(0.03, 0.006, 0.0) * u_bloomK * 6.0;
  c *= u_exposure;
  c = agx(c);
  // the grade: soft milky blacks, warm highlights, a gentle hand on saturation
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 1.06);
  c = c * vec3(1.0, 0.985, 0.955) + vec3(0.014, 0.015, 0.017) * (1.0 - l);
  c = mix(c, c * vec3(1.03, 1.0, 0.94), smoothstep(0.5, 1.0, l));
  // vignette
  vec2 vv = dc * vec2(u_res.x / u_res.y, 1.0);
  c *= mix(1.0, 0.82, smoothstep(0.35, 1.05, length(vv)));
  // grain, heavier in the mid-tones, changing every frame
  float g = hash12(gl_FragCoord.xy + fract(u_frame * 0.6180339) * 917.0) + hash12(gl_FragCoord.xy * 1.37 + fract(u_frame * 0.3819) * 613.0) - 1.0;
  c += g * u_grain * (0.35 + 0.65 * (1.0 - abs(l * 2.0 - 1.0)));
  c = clamp(c, 0.0, 1.0);
  o = vec4(c, 1.0);
}`;
