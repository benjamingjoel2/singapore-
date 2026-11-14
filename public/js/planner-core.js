// Stopover planner core. Pure functions, shared by the build (pre-rendered default plan) and the browser.
// All words come from the page's localised data; this file contains no copy.

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Fixed overheads, in hours (see FACTS-TO-VERIFY.md)
export const T = {
  deplane: 1,        // deplaning, immigration, bags (carry-on only assumed)
  toCity: 0.75,      // Changi → city by MRT or taxi
  fromCity: 0.75,    // city → Changi
  backBefore: 2.5,   // be back at Changi this long before departure (check-in, security, immigration)
};

export function season(month) {
  if (month === 11 || month === 0) return 'ne_wet';
  if (month === 1 || month === 2) return 'ne_dry';
  if (month === 3 || month === 4 || month === 9 || month === 10) return 'inter';
  return 'sw';
}

const part = (h) => (h >= 6 && h < 10 ? 'morning' : h >= 10 && h < 12 ? 'late' : h >= 12 && h < 15 ? 'midday' : h >= 15 && h < 18 ? 'afternoon' : h >= 18 && h < 21 ? 'evening' : h >= 21 && h < 23 ? 'late_evening' : 'night');

export function plan({ hours, arrival, month }, acts) {
  const H = Math.max(8, Math.min(96, Number(hours) || 12));
  const A = Number(arrival) || 0;
  const s = season(Number(month) || 0);
  const cityStart = A + T.deplane + T.toCity;
  const backBy = A + H - T.backBefore;
  const leaveCity = backBy - T.fromCity;
  const cityTime = leaveCity - cityStart;
  // daylight hours (06–23) actually inside the city window
  let awake = 0;
  for (let t = cityStart; t < leaveCity; t += 0.25) { const h = ((t % 24) + 24) % 24; if (h >= 6 && h < 23) awake += 0.25; }

  const items = [{ t: A, kind: 'land', a: acts.land }];
  let verdict;
  if (cityTime < 4.5 || awake < 3) {
    verdict = 'air';
    items.push({ t: A + 0.25, kind: 'act', a: acts.airsideIntro });
    let t = A + 0.75;
    for (const a of acts.airside) { if (t + a.dur > A + H - 1.5) break; items.push({ t, kind: 'act', a }); t += a.dur; }
  } else if (cityTime < 6) {
    verdict = 'jewel';
    items.push({ t: A + 0.25, kind: 'act', a: acts.immigration });
    let t = A + T.deplane + 0.25;
    for (const a of acts.jewel) { if (t + a.dur > backBy - 0.25) break; items.push({ t, kind: 'act', a }); t += a.dur; }
  } else {
    verdict = H >= 48 ? 'stay' : 'city';
    items.push({ t: A + 0.25, kind: 'act', a: acts.immigration });
    items.push({ t: A + T.deplane, kind: 'act', a: cityTime < 8 ? acts.toKatong : acts.toCity });
    const used = new Set();
    const short = cityTime < 8 ? (acts.shortPools || {}) : {};
    const order = ['morning', 'late', 'midday', 'afternoon', 'evening', 'late_evening', 'night'];
    let lastMeal = -99;
    const pick = (p, t) => {
      // prefer unused items for this time of day (near-airport ones first on short layovers),
      // then unused items from the previous part of the day, and only then repeat.
      const i = order.indexOf(p);
      const near = [p, order[i - 1]].filter(Boolean); // never pull evening-only plans earlier
      const lists = [short[p], acts.pools[p], ...near.slice(1).flatMap((q) => [short[q], acts.pools[q]])].filter(Boolean);
      const ok = (x) => !used.has(x.t) && !(x.meal && t - lastMeal < 3.5);
      for (const l of lists) { const a = l.find(ok); if (a) return a; }
      return acts.free || (acts.pools[p] || acts.pools.night)[0];
    };
    let t = cityStart;
    let guard = 0;
    while (t < leaveCity - 0.75 && guard++ < 200) {
      const h = ((t % 24) + 24) % 24;
      const left = leaveCity - t;
      if ((h >= 23 || h < 6) && left > 8) {
        const wake = t + ((7 - h + 24) % 24 || 24) % 24;
        items.push({ t, kind: 'sleep', a: acts.sleep });
        t = wake;
        // a new day: meals can be repeated, sights cannot
        for (const l of [...Object.values(acts.pools), ...Object.values(short)]) for (const x of l) if (x.meal) used.delete(x.t);
        continue;
      }
      const a = pick(part(h), t);
      if (a !== acts.free) used.add(a.t);
      if (a.meal) lastMeal = t;
      const prev = items[items.length - 1];
      if (!(a === acts.free && prev.a === acts.free)) items.push({ t, kind: 'act', a });
      t += Math.min(a.dur, left);
    }
    items.push({ t: leaveCity, kind: 'act', a: acts.back });
  }
  items.push({ t: backBy, kind: 'backby', a: acts.backAt });
  items.push({ t: A + H, kind: 'depart', a: acts.depart });
  return { H, A, s, verdict, cityTime: Math.max(0, cityTime), backBy, items };
}

const fmt = (t) => { const m = Math.round((t * 60) / 15) * 15; const hh = Math.floor(m / 60) % 24; const mm = m % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
const dayOf = (t) => Math.floor(Math.round(t * 4) / 96) + 1;

export function renderPlan(input, acts, ui) {
  const r = plan(input, acts);
  const v = { air: [ui.verdictAir, ui.airsideWhy, 'air'], jewel: [ui.verdictJewel, ui.jewelWhy, 'air'], city: [ui.verdictCity, ui.cityWhy, 'city'], stay: [ui.verdictStay, ui.stayWhy, 'city'] }[r.verdict];
  const ct = r.verdict === 'air' ? '0' : `${Math.floor(r.cityTime)}${ui.hoursShort}${r.cityTime % 1 >= 0.5 ? '30' : ''}`;
  const multi = r.A + r.H >= 24;
  let lastDay = 0;
  const rows = r.items.map((it) => {
    const d = dayOf(it.t);
    let head = '';
    if (multi && d !== lastDay) { head = `<li class="day-h">${esc(ui.dayLabel)} ${d}</li>`; lastDay = d; }
    return `${head}<li><time>${fmt(it.t)}</time><div><b>${esc(it.a.t)}</b>${it.a.d ? `<span class="small">${esc(it.a.d)}</span>` : ''}</div></li>`;
  }).join('');
  return `<div class="verdict verdict--${v[2]}"><p class="kicker">${esc(r.H >= 48 ? `${Math.round(r.H / 24 * 10) / 10} ${ui.daysUnit}` : `${r.H} ${ui.hoursUnit}`)}</p><h3>${esc(v[0])}</h3><p style="margin:0">${esc(v[1])}</p>
<dl class="facts" style="border-color:var(--line);margin-top:8px"><div><dt>${esc(ui.cityTime)}</dt><dd>${ct}</dd></div><div><dt>${esc(ui.backBy)}</dt><dd>${multi ? `${esc(ui.dayLabel)} ${dayOf(r.backBy)}, ` : ''}${fmt(r.backBy)}</dd></div></dl></div>
<p class="notice" style="margin-bottom:20px"><strong>${esc(ui.rainNote)}:</strong> ${esc(ui.rain[r.s])}</p>
<ol class="tl">${rows}</ol>`;
}
