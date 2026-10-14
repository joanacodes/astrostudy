import { perspective, viewFromBasis, multiply, cameraBasis, dirFromAngles } from './math.js';
import { target, dispose, hdrFormat } from './gl.js';
import { buildField, BLADE_FLOATS, DROP_FLOATS } from './field.js';
import * as S from './shaders.js';

const DEG = Math.PI / 180;
const fract = (x) => x - Math.floor(x);

// The light of the day. Fixed on purpose: it is always the same early afternoon in this meadow.
const SUN_AZ = 34 * DEG;   // to the right of where we look
const SUN_EL = 61 * DEG;
const SUN_E = 20;          // top-of-atmosphere irradiance, in the units the sky table uses
const CLOUD_WIND = [9.5, 0, 3.2];   // m/s at cloud height: drifting right and slowly toward us
const BASE_TILE = 9000, DETAIL_TILE = 950, GUST_TILE = 3.2;
const COVERAGE = 0.46;
const CAM_HEIGHT = 0.011;

// The sky every visit opens on (seconds on the meadow's clock). The poster stills and the video
// loop are rendered at this same moment, so the still dissolves into the live scene without a jump.
export const OPENING_MOMENT = 1000;

const PRESETS = {
  capture: { scale: 1.0, dprCap: 1, cloudScale: 0.75, cloudSteps: 96, density: 1.0, noise: 96 },
  high: { scale: 1.0, dprCap: 1.75, cloudScale: 0.5, cloudSteps: 56, density: 1.0, noise: 96 },
  medium: { scale: 0.8, dprCap: 1.5, cloudScale: 0.42, cloudSteps: 44, density: 0.78, noise: 64 },
  low: { scale: 0.62, dprCap: 1.25, cloudScale: 0.34, cloudSteps: 30, density: 0.55, noise: 64 },
};
const ORDER = ['high', 'medium', 'low'];

export function webgl2Available() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

// Builds programs without blocking on the driver; we only ask for the result once it is ready.
function startProgram(gl, vs, fs, label) {
  const p = gl.createProgram();
  const mk = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(p, s);
    return s;
  };
  const v = mk(gl.VERTEX_SHADER, vs), f = mk(gl.FRAGMENT_SHADER, fs);
  gl.linkProgram(p);
  return { p, v, f, label, vs, fs, u: {} };
}

function finishProgram(gl, prog) {
  if (!gl.getProgramParameter(prog.p, gl.LINK_STATUS)) {
    const log = (s, src) => {
      const l = gl.getShaderInfoLog(s);
      return l ? l + '\n' + src.split('\n').map((x, i) => `${String(i + 1).padStart(4)} ${x}`).join('\n') : '';
    };
    throw new Error(`[meadow] ${prog.label}: ${gl.getProgramInfoLog(prog.p)}\n${log(prog.v, prog.vs)}${log(prog.f, prog.fs)}`);
  }
  const n = gl.getProgramParameter(prog.p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog.p, i);
    prog.u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(prog.p, info.name);
  }
  return prog;
}

export function createMeadow(canvas, opts = {}) {
  const capture = opts.capture || null;
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: !!capture,
    powerPreference: 'default',
  });
  if (!gl) return null;

  const fmt = hdrFormat(gl);
  // The scene is lit in HDR. Without float render targets it would clip to flat white clouds,
  // so hand over to the video loop instead.
  if (!fmt.hdr) return null;
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  let level = Math.max(0, ORDER.indexOf(opts.quality || 'high'));
  let q = capture ? PRESETS.capture : PRESETS[ORDER[level]];
  if (opts.debug && opts.debug.preset) q = { ...q, ...opts.debug.preset };

  const sun = dirFromAngles(SUN_AZ, SUN_EL);
  // Sun light at the ground: the top-of-atmosphere light minus what the air took on the way down.
  const sunCol = (() => {
    const m = 1 / Math.max(Math.sin(SUN_EL), 0.05);
    const bR = [5.802e-6, 13.558e-6, 33.1e-6], bO = [0.65e-6, 1.881e-6, 0.085e-6];
    return bR.map((b, i) => (SUN_E / Math.PI) * Math.exp(-((b + bO[i]) * 8000 + 10e-6 * 1200) * m));
  })();

  const P = {};
  const programs = {
    noise: [S.FULLSCREEN_VS, S.NOISE3D_FS],
    gust: [S.FULLSCREEN_VS, S.GUST_FS],
    lut: [S.FULLSCREEN_VS, S.SKYLUT_FS],
    clouds: [S.FULLSCREEN_VS, S.CLOUDS_FS],
    sunvis: [S.FULLSCREEN_VS, S.SUNVIS_FS],
    sky: [S.FULLSCREEN_VS, S.SKY_FS],
    blade: [S.BLADE_VS, S.BLADE_FS],
    drop: [S.DROP_VS, S.DROP_FS],
    down: [S.FULLSCREEN_VS, S.DOWN_FS],
    up: [S.FULLSCREEN_VS, S.UP_FS],
    final: [S.FULLSCREEN_VS, S.FINAL_FS],
  };
  const pending = Object.entries(programs).map(([k, [vs, fs]]) => [k, startProgram(gl, vs, fs, k)]);

  const emptyVao = gl.createVertexArray();
  let noiseTex, gustTex, lutTarget, sunVisTarget, field, bladeBuf, dropBuf;
  let vaoNear, vaoFar, vaoDrop, nearVerts, farVerts;
  let cloudA, cloudB, scene, bloomDown = [], bloomUp = [];
  // What the sky table reads back to with this sun; used as-is if the readback isn't allowed.
  let ambient = { sky: [0.1638, 0.2894, 0.5128], ground: [0.0326, 0.0545, 0.0116], far: [0.0714, 0.1294, 0.0673] };

  let width = 0, height = 0, sceneW = 0, sceneH = 0, cloudW = 0, cloudH = 0;
  let frameNo = 0, prevVProt = null, historyValid = false;
  let scroll = 0, pitchNow = null;
  let running = false, raf = 0, lastT = 0, ready = false;
  const perf = { samples: [], cooldown: 90 };

  const use = (prog) => {
    gl.useProgram(prog.p);
    return prog.u;
  };
  const bindTex = (unit, tex, kind = gl.TEXTURE_2D) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(kind, tex);
  };
  const fullscreen = () => {
    gl.bindVertexArray(emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // -------------------------------------------------------------------------------------------
  // One-time work: noise volumes, the sky table, and the meadow itself.

  function makeNoise() {
    if (noiseTex) gl.deleteTexture(noiseTex);
    const n = q.noise;
    noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, noiseTex);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, n, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, p, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const u = use(P.noise);
    gl.uniform1f(u.u_size, n);
    gl.viewport(0, 0, n, n);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    for (let z = 0; z < n; z++) {
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, noiseTex, 0, z);
      gl.uniform1f(u.u_slice, (z + 0.5) / n);
      fullscreen();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);

    if (!gustTex) {
      const g = 128;
      const t = target(gl, g, g, { internal: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE });
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
      gl.viewport(0, 0, g, g);
      const ug = use(P.gust);
      gl.uniform1f(ug.u_size, g);
      fullscreen();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gustTex = t.tex;
      gl.deleteFramebuffer(t.fb);
    }
  }

  function makeSky() {
    const W = 128, H = 64;
    lutTarget = target(gl, W, H, fmt);
    gl.bindFramebuffer(gl.FRAMEBUFFER, lutTarget.fb);
    gl.viewport(0, 0, W, H);
    const u = use(P.lut);
    gl.uniform3fv(u.u_sun, sun);
    gl.uniform1f(u.u_sunI, SUN_E);
    fullscreen();
    // Read the table back once, to light the grass and the clouds with the same sky. Some
    // drivers only allow reading half floats back; then the measured defaults above stand.
    const px = new Float32Array(W * H * 4);
    for (let i = 0; i < 8 && gl.getError() !== gl.NO_ERROR; i++);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, px);
    if (gl.getError() === gl.NO_ERROR && px.some((v) => v > 0)) {
      const acc = [0, 0, 0];
      let wsum = 0;
      for (let y = 0; y < H; y++) {
        const v = (y + 0.5) / H, el = v * v * Math.PI * 0.5;
        const w = Math.cos(el) * Math.sin(el) * v; // solid angle × cosine, with the table's spacing
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          acc[0] += px[i] * w; acc[1] += px[i + 1] * w; acc[2] += px[i + 2] * w;
          wsum += w;
        }
      }
      const sky = acc.map((a) => a / wsum);
      const hy = Math.floor(Math.sqrt(4 / 90) * H);
      const far = [0, 1, 2].map((c) => {
        let s = 0;
        for (let x = 0; x < W; x++) s += px[(hy * W + x) * 4 + c];
        return s / W;
      });
      ambient = {
        sky,
        ground: [0.11 * sunCol[0] * 0.05, 0.2 * sunCol[1] * 0.05, 0.05 * sunCol[2] * 0.05],
        far: [far[0] * 0.12 + 0.012, far[1] * 0.14 + 0.03, far[2] * 0.08 + 0.006],
      };
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    sunVisTarget = target(gl, 1, 1, fmt, { filter: gl.NEAREST });
  }

  function makeField() {
    field = buildField({ seed: 20261014, density: q.density });
    if (!bladeBuf) bladeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bladeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, field.blades, gl.STATIC_DRAW);
    if (!dropBuf) dropBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
    gl.bufferData(gl.ARRAY_BUFFER, field.drops, gl.STATIC_DRAW);

    if (!vaoNear) {
      const strip = (seg) => {
        const a = [];
        for (let i = 0; i <= seg; i++) {
          const t = i / seg;
          a.push(-1, t, 1, t);
        }
        return new Float32Array(a);
      };
      const mk = (seg) => {
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, strip(seg), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        for (let l = 1; l <= 3; l++) {
          gl.enableVertexAttribArray(l);
          gl.vertexAttribDivisor(l, 1);
        }
        gl.bindVertexArray(null);
        return vao;
      };
      vaoNear = mk(14);
      nearVerts = 30;
      vaoFar = mk(5);
      farVerts = 12;

      vaoDrop = gl.createVertexArray();
      gl.bindVertexArray(vaoDrop);
      const qb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (let l = 1; l <= 4; l++) {
        gl.enableVertexAttribArray(l);
        gl.vertexAttribDivisor(l, 1);
      }
      gl.bindVertexArray(null);
    }
  }

  // Point the per-instance attributes at a slice of the sorted buffer (WebGL2 has no base instance).
  function pointBlades(vao, start) {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, bladeBuf);
    const stride = BLADE_FLOATS * 4, base = start * stride;
    for (let l = 1; l <= 3; l++) gl.vertexAttribPointer(l, 4, gl.FLOAT, false, stride, base + (l - 1) * 16);
  }
  function pointDrops(start) {
    gl.bindVertexArray(vaoDrop);
    gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
    const stride = DROP_FLOATS * 4, base = start * stride;
    for (let l = 1; l <= 4; l++) gl.vertexAttribPointer(l, 4, gl.FLOAT, false, stride, base + (l - 1) * 16);
  }

  // -------------------------------------------------------------------------------------------
  // Size-dependent targets.

  function sizeTargets() {
    const dpr = capture ? 1 : Math.min(window.devicePixelRatio || 1, q.dprCap);
    const cw = capture ? capture.width : Math.max(1, Math.round(canvas.clientWidth * dpr));
    const ch = capture ? capture.height : Math.max(1, Math.round(canvas.clientHeight * dpr));
    // Big screens don't need every pixel of a soft, blurred scene: cap the work, not the size.
    const sceneCap = capture ? Infinity : 2.4e6, cloudCap = capture ? Infinity : 0.55e6;
    const s1 = Math.min(q.scale, Math.sqrt(sceneCap / (cw * ch)));
    const sw = Math.max(1, Math.round(cw * s1)), sh = Math.max(1, Math.round(ch * s1));
    const k1 = Math.min(q.cloudScale, Math.sqrt(cloudCap / (sw * sh)));
    const kw = Math.max(1, Math.round(sw * k1)), kh = Math.max(1, Math.round(sh * k1));
    if (cw === width && ch === height && sw === sceneW && kw === cloudW && kh === cloudH) return;
    width = cw; height = ch;
    canvas.width = cw; canvas.height = ch;
    if (sw !== sceneW || sh !== sceneH) {
      dispose(gl, scene);
      sceneW = sw; sceneH = sh;
      scene = target(gl, sw, sh, fmt, { depth: true });
      bloomDown.forEach((t) => dispose(gl, t));
      bloomUp.forEach((t) => dispose(gl, t));
      bloomDown = []; bloomUp = [];
      let w = sw, h = sh;
      for (let i = 0; i < 6; i++) {
        w = Math.max(1, w >> 1); h = Math.max(1, h >> 1);
        bloomDown.push(target(gl, w, h, fmt));
        bloomUp.push(target(gl, w, h, fmt));
      }
    }
    if (kw !== cloudW || kh !== cloudH) {
      dispose(gl, cloudA); dispose(gl, cloudB);
      cloudW = kw; cloudH = kh;
      cloudA = target(gl, kw, kh, fmt);
      cloudB = target(gl, kw, kh, fmt);
      historyValid = false;
    }
  }

  // -------------------------------------------------------------------------------------------
  // The camera: a bug in the grass, head tilted back. Scrolling the page tilts it further up.

  function cameraFor(t) {
    const aspect = sceneW / sceneH;
    // keep at least ~56° across, so a phone held upright still sees a meadow and not one blade
    const fovY = Math.min(96 * DEG, Math.max(60 * DEG, 2 * Math.atan(Math.tan(28 * DEG) / aspect)));
    const minPitch = Math.max(37 * DEG, fovY / 2 + 6 * DEG);
    const goal = minPitch + scroll * 24 * DEG;
    if (pitchNow === null || capture) pitchNow = goal;
    const breathe = capture ? 0 : 1;
    const pitch = pitchNow + breathe * (0.22 * DEG * Math.sin((2 * Math.PI * t) / 17.3 + 1.1));
    const yaw = breathe * 0.35 * DEG * Math.sin((2 * Math.PI * t) / 23.7);
    const B = cameraBasis(yaw, pitch);
    const proj = perspective(fovY, aspect, 0.0015, 50000);
    const eye = [0, CAM_HEIGHT, 0];
    const view = viewFromBasis(B.right, B.up, B.back, eye);
    const viewRot = viewFromBasis(B.right, B.up, B.back, [0, 0, 0]);
    const vp = multiply(proj, view);
    const vpRot = multiply(proj, viewRot);
    const focal = sceneH / 2 / Math.tan(fovY / 2);
    const tanHalf = [Math.tan(fovY / 2) * aspect, Math.tan(fovY / 2)];
    return { B, vp, vpRot, tanHalf, eye, focal };
  }

  // -------------------------------------------------------------------------------------------

  function render(tSec, dtSec = 1 / 30) {
    sizeTargets();
    const period = capture ? capture.period : 600;
    const wt = ((tSec % period) + period) % period;

    // ease the pitch toward the scroll position
    const aspect = sceneW / sceneH;
    if (!capture && pitchNow !== null) {
      const fovY = Math.min(96 * DEG, Math.max(60 * DEG, 2 * Math.atan(Math.tan(28 * DEG) / aspect)));
      const goal = Math.max(37 * DEG, fovY / 2 + 6 * DEG) + scroll * 24 * DEG;
      pitchNow += (goal - pitchNow) * (1 - Math.exp(-dtSec * 3.2));
    }
    const cam = cameraFor(tSec);

    const cloudOff = [fract((tSec * CLOUD_WIND[0]) / BASE_TILE), fract(tSec * 0.00009), fract((tSec * CLOUD_WIND[2]) / BASE_TILE)];
    const detailOff = [fract((tSec * CLOUD_WIND[0]) / DETAIL_TILE), fract(tSec * 0.0011), fract((tSec * CLOUD_WIND[2]) / DETAIL_TILE)];
    // For a video loop, the gusts and the pollen must come back to where they started after
    // exactly one period: round their speeds to a whole number of tiles per period.
    const gustOff = capture
      ? [fract(-Math.max(1, Math.round((0.55 * period) / GUST_TILE)) * (tSec / period)), fract(-Math.max(1, Math.round((0.12 * period) / GUST_TILE)) * (tSec / period))]
      : [fract(-(tSec * 0.55) / GUST_TILE), fract(-(tSec * 0.12) / GUST_TILE)];
    const windDir = [0.97, 0.24];
    const moteT = capture ? fract(Math.max(1, Math.round(period / 38)) * (tSec / period)) : fract(tSec / 38);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthMask(false);

    // 1. how much sun gets through the clouds right now
    gl.bindFramebuffer(gl.FRAMEBUFFER, sunVisTarget.fb);
    gl.viewport(0, 0, 1, 1);
    let u = use(P.sunvis);
    bindTex(0, noiseTex, gl.TEXTURE_3D);
    gl.uniform1i(u.u_noise, 0);
    gl.uniform3fv(u.u_cloudOff, cloudOff);
    gl.uniform3fv(u.u_detailOff, detailOff);
    gl.uniform1f(u.u_coverage, COVERAGE);
    gl.uniform3fv(u.u_sun, sun);
    fullscreen();

    // 2. sky and clouds, low resolution, folded over time
    const cur = frameNo % 2 === 0 ? cloudA : cloudB;
    const prev = frameNo % 2 === 0 ? cloudB : cloudA;
    gl.bindFramebuffer(gl.FRAMEBUFFER, cur.fb);
    gl.viewport(0, 0, cloudW, cloudH);
    u = use(P.clouds);
    bindTex(0, noiseTex, gl.TEXTURE_3D);
    bindTex(1, lutTarget.tex);
    bindTex(2, prev.tex);
    gl.uniform1i(u.u_noise, 0);
    gl.uniform1i(u.u_skyLUT, 1);
    gl.uniform1i(u.u_history, 2);
    const basis = (uu) => {
      gl.uniform3fv(uu.u_camR, cam.B.right);
      gl.uniform3fv(uu.u_camU, cam.B.up);
      gl.uniform3fv(uu.u_camF, cam.B.fwd);
      gl.uniform2fv(uu.u_tanHalf, cam.tanHalf);
    };
    basis(u);
    gl.uniformMatrix4fv(u.u_prevVP, false, prevVProt || cam.vpRot);
    gl.uniform3fv(u.u_sun, sun);
    gl.uniform3fv(u.u_sunCol, sunCol);
    gl.uniform3fv(u.u_ambTop, ambient.sky);
    gl.uniform3fv(u.u_ambBottom, [ambient.sky[0] * 0.38 + 0.02, ambient.sky[1] * 0.38 + 0.03, ambient.sky[2] * 0.3 + 0.01]);
    gl.uniform3fv(u.u_cloudOff, cloudOff);
    gl.uniform3fv(u.u_detailOff, detailOff);
    gl.uniform1f(u.u_coverage, COVERAGE);
    gl.uniform1f(u.u_frame, frameNo % 64);
    gl.uniform1f(u.u_blend, historyValid ? (capture ? 0.5 : 0.18) : 1.0);
    gl.uniform1i(u.u_steps, q.cloudSteps);
    fullscreen();
    historyValid = true;
    prevVProt = cam.vpRot;

    // 3. the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb);
    gl.viewport(0, 0, sceneW, sceneH);
    gl.clearDepth(1);
    gl.depthMask(true);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.depthMask(false);
    u = use(P.sky);
    bindTex(0, cur.tex);
    gl.uniform1i(u.u_clouds, 0);
    basis(u);
    gl.uniform3fv(u.u_sun, sun);
    gl.uniform3fv(u.u_sunDisc, sunCol.map((c) => c * 260));
    gl.uniform3fv(u.u_farGrass, ambient.far);
    gl.uniform2f(u.u_cloudTexel, 1 / cloudW, 1 / cloudH);
    fullscreen();

    const lens = (uu) => {
      gl.uniformMatrix4fv(uu.u_vp, false, cam.vp);
      gl.uniform3fv(uu.u_cam, cam.eye);
      gl.uniform2f(uu.u_res, sceneW, sceneH);
      gl.uniform1f(uu.u_focal, cam.focal);
      gl.uniform1f(uu.u_cocK, 2.0);
      gl.uniform1f(uu.u_invFocus, 1 / 0.25);
      gl.uniform1f(uu.u_cocMax, 90);
      gl.uniform1f(uu.u_near, 0.0015);
      gl.uniform1f(uu.u_wt, wt);
      gl.uniform1f(uu.u_wperiod, period);
      gl.uniform2fv(uu.u_windDir, windDir);
      gl.uniform2fv(uu.u_gustOff, gustOff);
      gl.uniform1f(uu.u_windStrength, 0.55);
      gl.uniform1i(uu.u_gust, 1);
      gl.uniform1i(uu.u_sunVis, 2);
    };
    bindTex(1, gustTex);
    bindTex(2, sunVisTarget.tex);
    bindTex(3, lutTarget.tex);

    // 3a. depth of the solid parts of every blade, so beads and blades hide behind them properly
    const ub = use(P.blade);
    lens(ub);
    gl.uniform3fv(ub.u_sunDir, sun);
    gl.uniform3fv(ub.u_sunCol, sunCol);
    gl.uniform3fv(ub.u_skyAmb, ambient.sky);
    gl.uniform3fv(ub.u_groundAmb, ambient.ground);
    gl.uniform1f(ub.u_depthOnly, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.colorMask(false, false, false, false);
    const bins = opts.debug && opts.debug.noGrass ? [] : field.bins;
    for (const bin of bins) {
      if (!bin.bCount) continue;
      pointBlades(bin.near ? vaoNear : vaoFar, bin.bStart);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, bin.near ? nearVerts : farVerts, bin.bCount);
    }
    gl.colorMask(true, true, true, true);
    gl.depthMask(false);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // 3b. far to near: blades, then the drops that belong to that distance
    for (const bin of bins) {
      if (bin.bCount) {
        use(P.blade);
        gl.uniform1f(ub.u_depthOnly, 0);
        pointBlades(bin.near ? vaoNear : vaoFar, bin.bStart);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, bin.near ? nearVerts : farVerts, bin.bCount);
      }
      if (bin.dCount) {
        const ud = use(P.drop);
        lens(ud);
        gl.uniform1i(ud.u_skyLUT, 3);
        gl.uniform3fv(ud.u_sun, sun);
        gl.uniform3fv(ud.u_sunDir, sun);
        gl.uniform3fv(ud.u_sunCol, sunCol);
        gl.uniform3fv(ud.u_skyAmb, ambient.sky);
        gl.uniform3fv(ud.u_camRight, cam.B.right);
        gl.uniform3fv(ud.u_camUp, cam.B.up);
        gl.uniform3fv(ud.u_camBack, cam.B.back);
        gl.uniform1f(ud.u_moteT, moteT);
        pointDrops(bin.dStart);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, bin.dCount);
      }
    }
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(null);

    // 4. bloom
    let src = scene;
    u = use(P.down);
    gl.uniform1i(u.u_src, 0);
    for (let i = 0; i < bloomDown.length; i++) {
      const dst = bloomDown[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, dst.w, dst.h);
      bindTex(0, src.tex);
      gl.uniform2f(u.u_texel, 1 / src.w, 1 / src.h);
      gl.uniform1f(u.u_first, i === 0 ? 1 : 0);
      fullscreen();
      src = dst;
    }
    u = use(P.up);
    gl.uniform1i(u.u_src, 0);
    gl.uniform1i(u.u_add, 1);
    let up = bloomDown[bloomDown.length - 1];
    for (let i = bloomDown.length - 2; i >= 0; i--) {
      const dst = bloomUp[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, dst.w, dst.h);
      bindTex(0, up.tex);
      bindTex(1, bloomDown[i].tex);
      gl.uniform2f(u.u_texel, 1 / up.w, 1 / up.h);
      gl.uniform1f(u.u_k, 0.72);
      fullscreen();
      up = dst;
    }

    // 5. film
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    u = use(P.final);
    bindTex(0, scene.tex);
    bindTex(1, up.tex);
    gl.uniform1i(u.u_scene, 0);
    gl.uniform1i(u.u_bloom, 1);
    gl.uniform2f(u.u_res, width, height);
    gl.uniform1f(u.u_exposure, 1.45);
    gl.uniform1f(u.u_bloomK, 0.06);
    gl.uniform1f(u.u_grain, opts.grain ?? 0.03);
    gl.uniform1f(u.u_frame, frameNo);
    fullscreen();

    frameNo++;
  }

  // -------------------------------------------------------------------------------------------

  const clock = opts.clock || (() => Date.now() / 1000);

  function governor(ms) {
    if (capture || opts.adaptive === false) return;
    if (perf.cooldown > 0) {
      perf.cooldown--;
      return;
    }
    perf.samples.push(ms);
    if (perf.samples.length < 45) return;
    const sorted = perf.samples.slice().sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    perf.samples = [];
    // We ask for 30 fps. On a 50 or 75 Hz screen that already means 40 ms between frames, so only
    // step down when we fall clearly below the slot (about 20 fps).
    if (median > 50 && level < ORDER.length - 1) {
      level++;
      q = PRESETS[ORDER[level]];
      perf.cooldown = 60;
      makeField();
      if (opts.onQuality) opts.onQuality(ORDER[level]);
    } else if (median > 62 && opts.onStruggle && !perf.gaveUp) {
      // even the lightest version is too heavy here: hand over to the video loop
      perf.gaveUp = true;
      opts.onStruggle();
    }
  }

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const minMs = opts.fps60 ? 0 : 1000 / 31;
    if (now - lastT < minMs) return;
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.25) : 1 / 30;
    if (lastT) governor(now - lastT);
    lastT = now;
    render(clock(), dt);
  }

  async function init() {
    if (parallel) {
      const done = () => pending.every(([, pr]) => gl.getProgramParameter(pr.p, parallel.COMPLETION_STATUS_KHR));
      while (!done()) await new Promise((r) => setTimeout(r, 16));
    }
    for (const [k, pr] of pending) P[k] = finishProgram(gl, pr);
    makeNoise();
    makeSky();
    makeField();
    sizeTargets();
    ready = true;
  }

  const api = {
    gl,
    init,
    get ready() {
      return ready;
    },
    get quality() {
      return ORDER[level];
    },
    setScroll(p) {
      scroll = Math.min(1, Math.max(0, p));
    },
    start() {
      if (running || !ready) return;
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    // Renders frames until the cloud history has settled, then leaves the last one on screen.
    still(t = clock(), frames = 6) {
      for (let i = 0; i < frames; i++) render(t, 1 / 30);
    },
    renderAt(t, dt) {
      render(t, dt);
    },
    resize() {
      if (ready) sizeTargets();
    },
    destroy() {
      api.stop();
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    },
  };
  return api;
}
