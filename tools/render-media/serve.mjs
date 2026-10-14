// Serves the meadow renderer (../../assets) and the capture page (this folder) on :8123.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const roots = [
  ['/assets/', path.resolve(here, '../../assets') + '/'],
  ['/', here + '/'],
];
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' };

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    for (const [prefix, dir] of roots) {
      if (!url.startsWith(prefix)) continue;
      const file = path.join(dir, url.slice(prefix.length) || 'capture.html');
      if (file.startsWith(dir) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
        fs.createReadStream(file).pipe(res);
        return;
      }
    }
    res.writeHead(404);
    res.end('not found');
  })
  .listen(8123, () => console.log('meadow capture server on http://localhost:8123'));
