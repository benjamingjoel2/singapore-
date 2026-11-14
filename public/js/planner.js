import { renderPlan } from './planner-core.js';
const form = document.querySelector('[data-planner]');
const out = document.querySelector('[data-plan-out]');
const data = JSON.parse(document.getElementById('planner-data').textContent);
const range = form.querySelector('#pl-hours');
const label = form.querySelector('#pl-out');
form.querySelector('[data-nojs]')?.remove();
const fmtH = (h) => (h >= 48 ? `${Math.round((h / 24) * 10) / 10} ${data.ui.daysUnit}` : `${h} ${data.ui.hoursUnit}`);
const update = () => {
  const v = { hours: +range.value, arrival: +form.arrival.value, month: +form.month.value };
  label.textContent = fmtH(v.hours);
  range.setAttribute('aria-valuetext', fmtH(v.hours));
  out.innerHTML = renderPlan(v, data.acts, data.ui);
};
const params = new URLSearchParams(location.search);
if (params.has('h')) range.value = Math.min(96, Math.max(8, +params.get('h') || 12));
form.addEventListener('input', update);
form.addEventListener('submit', (e) => { e.preventDefault(); update(); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
update();
