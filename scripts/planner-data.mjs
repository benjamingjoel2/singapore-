// Adds language-independent planner flags to every locale (run after translations change):
// - "meal": true on activities that are a meal (taken from the English titles, applied by position)
// - a localised "free" activity used when the planner runs out of new ideas
import fs from 'node:fs';
const free = {
  en: { t: 'Free time', d: 'Rest at your hotel through the heat, swim, or go back to a favourite spot from earlier.' },
  fr: { t: 'Temps libre', d: 'Reposez-vous à l’hôtel pendant la chaleur, baignez-vous ou retournez à un endroit que vous avez aimé.' },
  de: { t: 'Freie Zeit', d: 'Ruhen Sie sich in der Mittagshitze im Hotel aus, gehen Sie schwimmen oder kehren Sie an einen Lieblingsort zurück.' },
  es: { t: 'Tiempo libre', d: 'Descansa en el hotel durante las horas de calor, date un baño o vuelve a un lugar que te haya gustado.' },
};
const read = (l) => JSON.parse(fs.readFileSync(`content/${l}/pages/stopover-planner.json`, 'utf8'));
const en = read('en').activities;
const isMeal = (t) => /breakfast|lunch|dinner|supper|satay|laksa|nasi lemak/i.test(t);
for (const l of ['en', 'fr', 'de', 'es']) {
  const p = `content/${l}/pages/stopover-planner.json`;
  if (!fs.existsSync(p)) continue;
  const d = read(l);
  for (const group of ['pools', 'shortPools']) for (const [k, list] of Object.entries(en[group])) list.forEach((a, i) => { if (d.activities[group][k]?.[i]) { if (isMeal(a.t)) d.activities[group][k][i].meal = true; else delete d.activities[group][k][i].meal; } });
  d.activities.free = { ...free[l], dur: 2 };
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
}
