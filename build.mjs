// Five Foot Way — static site builder (no dependencies).
// Reads site.config.mjs + content/<lang>/*.json and writes every page in every locale to dist/.
import fs from 'node:fs';
import path from 'node:path';
import cfg from './site.config.mjs';
import { pages, placeIds } from './src/pages.mjs';
import * as T from './src/templates.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// copy public/
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

// CSS: tokens from config + stylesheet, minified and inlined into each page
const tokens = ':root{' + Object.entries(cfg.palette).map(([k, v]) => `--${k}:${v}`).join(';') +
  `;--tile:url("data:image/svg+xml,${encodeURIComponent(T.tileSvg)}")}`;
const css = (tokens + fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

const imgMeta = fs.existsSync(path.join(ROOT, 'images/meta.json')) ? read('images/meta.json') : {};
const manifest = fs.existsSync(path.join(ROOT, 'images/manifest.json')) ? read('images/manifest.json') : [];

// load content
const content = {};
for (const loc of cfg.locales) {
  const dir = path.join(ROOT, 'content', loc.code);
  const c = { ui: read(`content/${loc.code}/ui.json`), alt: read(`content/${loc.code}/images.json`), pages: {} };
  for (const f of fs.readdirSync(path.join(dir, 'pages'))) {
    if (f.endsWith('.json')) c.pages[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, 'pages', f), 'utf8'));
  }
  content[loc.code] = c;
}

let count = 0;
const sitemap = [];
for (const loc of cfg.locales) {
  const C = content[loc.code];
  for (const pg of pages) {
    const data = C.pages[pg.id] ?? content.en.pages[pg.id];
    if (!data) { console.warn('missing content', loc.code, pg.id); continue; }
    if (!C.pages[pg.id]) console.warn(`! ${loc.code}: using English fallback for ${pg.id}`);
    const ctx = T.makeCtx({ cfg, loc, C, all: content, pg, data, imgMeta, manifest, css, pages, placeIds });
    const html = T.renderPage(ctx);
    const rel = pg.slug === '' ? 'index.html' : pg.slug === '404' ? '404.html' : `${pg.slug}.html`;
    const out = path.join(DIST, loc.prefix.replace(/^\//, ''), rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    count++;
    if (pg.slug !== '404' && !pg.noindex) sitemap.push(T.absUrl(cfg, loc, pg.slug));
  }
}

// sitemap + robots
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemap.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);

console.log(`Built ${count} pages into dist/`);
