// Five Foot Way — small progressive enhancements. Everything works without this file.
(() => {
  const d = document;
  // header: hide on scroll down, show on scroll up
  const hdr = d.getElementById('hdr');
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      hdr.classList.toggle('is-hidden', y > 240 && y > lastY && !d.body.classList.contains('menu-open'));
      hdr.classList.toggle('is-solid', y > 40);
      lastY = y; ticking = false;
    });
  }, { passive: true });

  // menu (works via :target without JS; JS adds focus handling + Escape)
  const menu = d.getElementById('menu');
  const opener = d.querySelector('.menu-btn');
  const open = () => { menu.classList.add('is-open'); d.body.classList.add('menu-open'); opener.setAttribute('aria-expanded', 'true'); menu.querySelector('a[href]:not([data-close])')?.focus(); d.documentElement.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('is-open'); d.body.classList.remove('menu-open'); opener.setAttribute('aria-expanded', 'false'); d.documentElement.style.overflow = ''; opener.focus(); };
  opener.addEventListener('click', (e) => { e.preventDefault(); open(); });
  menu.querySelector('[data-close]').addEventListener('click', (e) => { e.preventDefault(); close(); });
  d.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...menu.querySelectorAll('a[href],button')];
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && d.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  if (location.hash === '#menu') { history.replaceState(null, '', location.pathname); open(); }

  // reveal on scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  d.querySelectorAll('.rv').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  // rails
  d.querySelectorAll('[data-rail]').forEach((b) => b.addEventListener('click', () => {
    const track = b.closest('.rail').querySelector('.rail__track');
    track.scrollBy({ left: (+b.dataset.rail) * track.clientWidth * 0.8, behavior: 'smooth' });
  }));

  // hawker filter
  const filt = d.querySelector('.tlist__filter');
  if (filt) filt.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    filt.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const k = b.dataset.filter;
    d.querySelectorAll('[data-list] > [data-tags]').forEach((row) => { row.hidden = !(k === 'all' || row.dataset.tags.split(' ').includes(k)); });
  });

  // enquiry form
  const form = d.querySelector('[data-enquiry]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const st = form.querySelector('[data-status]');
    st.className = 'form__status';
    const bad = [...form.querySelectorAll('[required]')].find((el) => (el.type === 'checkbox' ? !el.checked : !el.value.trim()) || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)));
    if (bad) { st.textContent = `${st.dataset.required}: ${form.querySelector(`label[for="${bad.id}"]`).textContent.replace(' *', '')}`; st.classList.add('err'); bad.focus(); return; }
    st.textContent = st.dataset.sending;
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!res.ok) throw new Error(res.status);
      form.querySelectorAll('input:not([type=hidden]),textarea').forEach((el) => (el.type === 'checkbox' ? (el.checked = false) : (el.value = '')));
      st.textContent = st.dataset.ok; st.classList.add('ok');
    } catch { st.textContent = st.dataset.err; st.classList.add('err'); }
    btn.disabled = false;
  });
})();
