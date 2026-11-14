// Applies location-correct image assignments to every locale (image keys are language-independent).
import fs from 'node:fs';
const set = (lang, file, fn) => { const p = `content/${lang}/pages/${file}.json`; if (!fs.existsSync(p)) return; const d = JSON.parse(fs.readFileSync(p, 'utf8')); fn(d); fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); };
for (const l of ['en', 'fr', 'de', 'es']) {
  set(l, 'chinatown', (d) => { d.bleed.image = 'chinatown-2'; });
  set(l, 'mandai', (d) => { d.rows[0].image = null; d.bleed.image = null; });
  set(l, 'little-india', (d) => { d.rows[3].image = null; });
  set(l, 'changi', (d) => { d.bleed.image = null; });
  set(l, 'shade-walks', (d) => { for (const w of d.walks) if (w.id === 'changi' || w.id === 'mandai') w.image = null; });
  set(l, 'stays', (d) => { d.items[4].image = null; });
}
