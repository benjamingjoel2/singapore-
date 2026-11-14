// Minimal local server that mimics Vercel's cleanUrls: /about → dist/about.html
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT) || 4321;
http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (req.method === 'POST' && u === '/api/enquiry') { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { console.log('[enquiry]', b); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }); return; }
  const tries = [u, u + '.html', path.join(u, 'index.html')];
  for (const t of tries) {
    const f = path.join(DIST, t);
    if (f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); return fs.createReadStream(f).pipe(res); }
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); fs.createReadStream(path.join(DIST, '404.html')).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}`));
