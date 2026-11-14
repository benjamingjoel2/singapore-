// Post-build checks: internal links resolve, every <img> has width/height/alt, every page has lang,
// canonical and hreflang (4 + x-default), and no leftover placeholder text.
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(DIST);
const exists = (u) => { const p = u.split('#')[0].split('?')[0]; if (p === '/' ) return true; const f = path.join(DIST, p); return fs.existsSync(f + '.html') || fs.existsSync(path.join(f, 'index.html')) || (fs.existsSync(f) && fs.statSync(f).isFile()); };
let errors = 0;
const err = (f, m) => { errors++; console.log(`✗ ${path.relative(DIST, f)}: ${m}`); };
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (!/<html lang="(en|fr|de|es)">/.test(h)) err(f, 'missing lang');
  if (!f.endsWith('404.html')) {
    if (!h.includes('rel="canonical"')) err(f, 'no canonical');
    if ((h.match(/hreflang="/g) || []).length < 5 && !/noindex/.test(h)) err(f, 'hreflang count');
  }
  for (const m of h.matchAll(/<img [^>]*>/g)) { if (!/width="\d+"/.test(m[0]) || !/height="\d+"/.test(m[0])) err(f, 'img without size'); if (!/alt="[^"]+"/.test(m[0])) err(f, 'img without alt: ' + m[0].slice(0, 80)); }
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) if (!exists(m[1])) err(f, 'broken link ' + m[1]);
  for (const m of h.matchAll(/srcset="([^"]+)"/g)) for (const s of m[1].split(',')) { const u = s.trim().split(' ')[0]; if (!exists(u)) err(f, 'missing image ' + u); }
  if (/lorem ipsum|TODO|\{brand\}|\{email\}|\{address\}|\{url\}/.test(h.replace(/<script type="application\/json"[\s\S]*?<\/script>/g, ''))) err(f, 'placeholder text');
  if (/img-missing/.test(h)) err(f, 'image missing from meta');
}
console.log(`${files.length} pages checked, ${errors} problems`);
process.exit(errors ? 1 : 0);
