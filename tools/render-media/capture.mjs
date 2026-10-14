// Renders the meadow headlessly, frame by frame, at the opening moment.
//   node capture.mjs still <w> <h> <outdir>
//   node capture.mjs video <w> <h> <outdir> [period=16] [fade=2.5] [fps=30]
// Needs Playwright (npm i playwright). Without a GPU, set SOFTWARE_GL=1 (slow, but it works).
// PRESET='{"cloudScale":0.5,"cloudSteps":64}' overrides the capture quality.
import { chromium } from 'playwright';
import fs from 'node:fs';

const [, , mode = 'still', w = '1920', h = '1080', out = './capture', period = '16', fade = '2.5', fps = '30'] = process.argv;
fs.mkdirSync(out, { recursive: true });
const args = process.env.SOFTWARE_GL ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'];
const browser = await chromium.launch({ args });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
const preset = encodeURIComponent(process.env.PRESET || '');
await page.goto(`http://localhost:8123/capture.html?w=${w}&h=${h}&period=${period}&preset=${preset}`);
await page.waitForFunction(() => window.__ready || window.__err, null, { timeout: 600000 });
const err = await page.evaluate(() => window.__err);
if (err) {
  console.error(err);
  process.exit(1);
}
const T0 = await page.evaluate(() => window.T0);
const save = (name, dataUrl) => fs.writeFileSync(`${out}/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'));

if (mode === 'still') {
  await page.evaluate((t) => window.warm(t, 8), T0);
  save('still.png', await page.evaluate((t) => window.frame(t, 1 / 30), T0));
} else {
  const P = +period, F = +fade, FPS = +fps;
  const total = Math.round((P + F) * FPS);
  await page.evaluate((t) => window.warm(t, 6), T0);
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    const t = T0 + i / FPS;
    save(`f${String(i).padStart(5, '0')}.png`, await page.evaluate(([t, dt]) => window.frame(t, dt), [t, 1 / FPS]));
    if (i % 30 === 0) console.log(`frame ${i}/${total} · ${((Date.now() - started) / (i + 1) / 1000).toFixed(2)} s/frame`);
  }
}
await browser.close();
console.log('done');
