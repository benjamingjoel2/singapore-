// HTML templates. Every function returns a string. No client-side templating.
import { slugs } from './pages.mjs';
import { renderPlan } from '../public/js/planner-core.js';

export const tileSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='#1F3C9C'/><path d='M20 4c4 6 4 10 0 16-4-6-4-10 0-16zm0 32c-4-6-4-10 0-16 4 6 4 10 0 16zM4 20c6-4 10-4 16 0-6 4-10 4-16 0zm32 0c-6 4-10 4-16 0 6-4 10-4 16 0z' fill='#CFE8DA'/><circle cx='20' cy='20' r='3' fill='#A3442A'/><path d='M0 0h6L0 6zM40 0h-6l6 6zM0 40h6l-6-6zM40 40h-6l6-6z' fill='#F8F1E3'/></svg>`;

const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const ARROW_L = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M15 8H2M7 3 2 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
// Peranakan tile motif used as a quiet emblem in split sections
const MOTIF = `<svg class="split__motif" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="112" height="112"/><rect x="14" y="14" width="92" height="92"/><path d="M60 18c12 16 12 26 0 42-12-16-12-26 0-42zM60 102c-12-16-12-26 0-42 12 16 12 26 0 42zM18 60c16-12 26-12 42 0-16 12-26 12-42 0zM102 60c-16 12-26 12-42 0 16-12 26-12 42 0z"/><circle cx="60" cy="60" r="6"/><path d="M4 4l14 14M116 4l-14 14M4 116l14-14M116 116l-14-14"/></g></svg>`;

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const absUrl = (cfg, loc, slug) => cfg.siteUrl + pathFor(loc, slug);
export const pathFor = (loc, slug) => (slug === '' ? (loc.prefix || '') + '/' : `${loc.prefix}/${slug}`);

export function makeCtx(o) {
  const { cfg, loc, C, pg, data, imgMeta, manifest } = o;
  const ui = C.ui;
  const url = (id, hash = '') => pathFor(loc, slugs[id]) + (hash ? '#' + hash : '');
  const tokens = (s) => String(s)
    .replaceAll('{brand}', cfg.brand.name)
    .replaceAll('{email}', cfg.contact.email)
    .replaceAll('{address}', fmtAddress(cfg))
    .replaceAll('{url}', cfg.siteUrl.replace(/^https?:\/\//, ''));
  // inline mini-markdown: **bold**, [text](@page-id#hash) and [text](https://…)
  const md = (s = '') => esc(tokens(s))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(@([\w-]+)(?:#([\w-]+))?\)/g, (_, t, id, h) => `<a class="link" href="${url(id, h)}">${t}</a>`)
    .replace(/\[([^\]]+)\]\(((?:https?:|mailto:)[^)]+)\)/g, (_, t, u) => `<a class="link" href="${u}"${u.startsWith('http') ? ' rel="noopener"' : ''}>${t}</a>`);
  const paras = (arr) => (Array.isArray(arr) ? arr : [arr]).filter(Boolean).map((p) => `<p>${md(p)}</p>`).join('');
  const alt = (key) => C.alt[key] ?? o.all.en.alt[key] ?? '';
  let heroKey = null;
  const img = (key, { sizes = '100vw', cls = '', eager = false, altText } = {}) => {
    const m = imgMeta[key];
    const a = esc(altText ?? alt(key));
    if (!m) return `<div class="img-missing ${cls}" role="img" aria-label="${a}" style="aspect-ratio:3/2;background:var(--mintDeep)"></div>`;
    const set = (ext) => m.widths.map((w) => `/img/${key}-${w}.${ext} ${w}w`).join(', ');
    const fallbackW = m.widths.find((w) => w >= 1200) || m.widths.at(-1);
    return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/img/${key}-${fallbackW}.webp" width="${m.w}" height="${m.h}" alt="${a}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="${eager ? 'sync' : 'async'}"></picture>`;
  };
  const preloadHero = (key, sizes = '100vw') => {
    const m = imgMeta[key];
    if (!m) return '';
    heroKey = key;
    return `<link rel="preload" as="image" type="image/avif" imagesrcset="${m.widths.map((w) => `/img/${key}-${w}.avif ${w}w`).join(', ')}" imagesizes="${sizes}" fetchpriority="high">`;
  };
  return { ...o, ui, url, md, paras, img, alt, tokens, preloadHero, get heroKey() { return heroKey; } };
}

const fmtAddress = (cfg) => { const a = cfg.contact.address; return `${a.company}, ${a.street}, ${a.city} ${a.postcode}`; };
const boxed = (text, cls = '') => `<span class="bx ${cls}">${String(text).split(/\s+/).map((w) => `<span>${esc(w)}</span>`).join(' ')}</span>`;
const btn = (href, label, cls = '') => `<a class="btns ${cls}" href="${href}"><span class="btn">${esc(label)}</span><span class="btn-c">${ARROW}</span></a>`;
const placeName = (ctx, id) => (ctx.C.pages[id] ?? ctx.all.en.pages[id]).nav;
const placeData = (ctx, id) => ctx.C.pages[id] ?? ctx.all.en.pages[id];

/* ─────────── shell ─────────── */
export function renderPage(ctx) {
  const body = ({
    home, place, 'hawker-guide': hawker, 'stopover-planner': stopover, 'shade-walks': walks, journeys, stays,
    about, journal, article, enquire, 'enquire-thanks': thanks, legal, credits, '404': notFound,
  })[ctx.pg.type](ctx);
  return shell(ctx, body);
}

function shell(ctx, body) {
  const { cfg, loc, data, ui, pg, css } = ctx;
  const title = data.meta?.title ? `${data.meta.title}` : cfg.brand.name;
  const desc = data.meta?.description ?? '';
  const canonical = absUrl(cfg, loc, pg.slug);
  const alts = cfg.locales.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${absUrl(cfg, l, pg.slug)}">`).join('') +
    `<link rel="alternate" hreflang="x-default" href="${absUrl(cfg, cfg.locales[0], pg.slug)}">`;
  const ogImg = ctx.heroKey ? `${cfg.siteUrl}/img/${ctx.heroKey}-1200.webp` : `${cfg.siteUrl}/img/hero-home-1200.webp`;
  const scripts = `<script src="/js/site.js" defer></script>` + (pg.type === 'stopover-planner' ? `<script src="/js/planner.js" type="module"></script>` : '');
  return `<!doctype html>
<html lang="${loc.hreflang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${pg.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canonical}">
${pg.slug === '404' ? '' : alts}
<meta name="theme-color" content="${cfg.palette.cream}">
<meta property="og:type" content="${pg.type === 'article' ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(cfg.brand.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="${loc.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/serif-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/sans-var.woff2" as="font" type="font/woff2" crossorigin>
${ctx.headExtra ?? ''}
<style>${css}</style>
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(jsonld(ctx, canonical))}</script>
${scripts}
</head>
<body class="t-${pg.type}">
<a class="skip" href="#main">${esc(ui.skip)}</a>
${header(ctx)}
${menu(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
</body>
</html>`;
}

function langLinks(ctx) {
  const { cfg, loc, pg } = ctx;
  return cfg.locales.map((l) => `<a href="${pathFor(l, pg.slug === '404' ? '' : pg.slug)}" hreflang="${l.hreflang}" lang="${l.hreflang}"${l.code === loc.code ? ' aria-current="true"' : ''} title="${esc(ctx.all[l.code].ui.langName)}">${l.label}</a>`).join('<span aria-hidden="true">·</span>');
}

function header(ctx) {
  const { cfg, ui, url, pg } = ctx;
  const words = cfg.brand.name.split(' ');
  const l1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const l2 = words.slice(Math.ceil(words.length / 2)).join(' ');
  const nav = [['hawker-guide', ui.nav.hawker], ['stopover-planner', ui.nav.stopover], ['shade-walks', ui.nav.walks], ['journeys', ui.nav.journeys], ['stays', ui.nav.stays], ['journal', ui.nav.journal], ['about', ui.nav.about]];
  return `<header class="hdr" id="hdr">
<div class="hdr__left">
<a class="logo" href="${url('home')}"><span>${esc(l1)}</span> <span>${esc(l2)}</span></a>
<nav class="hdr__nav" aria-label="${esc(ui.menu)}">
<a class="cell cell--top" href="${url('home', 'neighbourhoods')}">${esc(ui.nav.neighbourhoods)}</a>
<ul>${nav.map(([id, label]) => `<li><a class="cell" href="${url(id)}"${pg.id === id ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('')}</ul>
</nav>
</div>
<div class="hdr__right">
<nav class="cell lang" aria-label="${esc(ui.languageLabel)}">${langLinks(ctx)}</nav>
<a class="cell menu-btn" href="#menu" aria-controls="menu" aria-expanded="false">${esc(ui.menu)} <i aria-hidden="true"></i></a>
<a class="cell enq-cell" href="${url('enquire')}"><span>${esc(ui.enquire)}</span>${ARROW}</a>
</div>
</header>`;
}

function menu(ctx) {
  const { ui, url, cfg, placeIds } = ctx;
  const li = (id, label) => `<li><a href="${url(id)}">${esc(label ?? placeName(ctx, id))}</a></li>`;
  return `<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="${esc(ui.menu)}">
<div class="menu__top"><a class="logo" href="${url('home')}">${esc(cfg.brand.name)}</a><a class="cell" href="#close" data-close>${esc(ui.close)}</a></div>
<nav class="menu__grid" aria-label="${esc(ui.menu)}">
<div class="menu__col"><h2>${esc(ui.groups.city)}</h2><ul>${placeIds.city.map((id) => li(id)).join('')}${li('changi')}</ul></div>
<div class="menu__col"><h2>${esc(ui.groups.green)}</h2><ul>${placeIds.green.map((id) => li(id)).join('')}</ul></div>
<div class="menu__col"><h2>${esc(ui.groups.plan)}</h2><ul>${li('hawker-guide', ui.nav.hawker)}${li('stopover-planner', ui.nav.stopover)}${li('shade-walks', ui.nav.walks)}${li('journeys', ui.nav.journeys)}${li('stays', ui.nav.stays)}${li('journal', ui.nav.journal)}${li('about', ui.nav.about)}${li('enquire', ui.nav.enquire)}</ul></div>
</nav>
<div class="menu__foot"><nav class="lang" aria-label="${esc(ui.languageLabel)}">${langLinks(ctx)}</nav><a class="link" href="mailto:${cfg.contact.email}">${cfg.contact.email}</a></div>
</div>`;
}

function footer(ctx) {
  const { ui, url, cfg, placeIds } = ctx;
  const a = cfg.contact.address;
  const li = (id, label) => `<li><a href="${url(id)}">${esc(label ?? placeName(ctx, id))}</a></li>`;
  return `<footer>
<section class="contact" aria-label="${esc(ui.footer.getInTouch)}">
<div><p class="kicker">${esc(ui.footer.getInTouch)}</p>
<p class="contact__big"><a href="mailto:${cfg.contact.email}">${esc(cfg.contact.email)}</a><br><a class="link" href="${url('enquire')}">${esc(ui.footer.planVisit)} →</a></p></div>
<address class="small" style="font-style:normal"><span class="kicker">${esc(ui.footer.address)}</span><br>${esc(cfg.brand.name)}<br>${esc(a.company)}<br>${esc(a.street)}<br>${esc(a.city)} ${esc(a.postcode)}</address>
</section>
<div class="ftr">
<div class="ftr__grid">
<div><p class="small" style="max-width:34ch">${esc(ui.footer.tagline)}</p></div>
<div><h2>${esc(ui.footer.explore)}</h2><ul>${placeIds.city.map((id) => li(id)).join('')}${li('changi')}</ul></div>
<div><h2>${esc(ui.footer.nature)}</h2><ul>${placeIds.green.map((id) => li(id)).join('')}</ul></div>
<div><h2>${esc(ui.footer.plan)}</h2><ul>${li('hawker-guide', ui.nav.hawker)}${li('stopover-planner', ui.nav.stopover)}${li('shade-walks', ui.nav.walks)}${li('journeys', ui.nav.journeys)}${li('stays', ui.nav.stays)}${li('journal', ui.nav.journal)}${li('about', ui.nav.about)}${li('enquire', ui.nav.enquire)}</ul></div>
<div><h2>${esc(ui.footer.legal)}</h2><ul>${li('privacy', ui.footer.privacy)}${li('terms', ui.footer.terms)}${li('cookies', ui.footer.cookies)}${li('credits', ui.footer.credits)}</ul></div>
</div>
<div class="ftr__legal"><span>© ${new Date().getFullYear()} ${esc(cfg.brand.legalName)}. ${esc(ui.footer.rights)}</span><nav class="lang" aria-label="${esc(ui.languageLabel)}" style="display:flex">${langLinks(ctx)}</nav></div>
<p class="ftr__word" aria-hidden="true">${esc(cfg.brand.name)}</p>
</div>
</footer>`;
}

function jsonld(ctx, canonical) {
  const { cfg, data, pg, loc } = ctx;
  const a = cfg.contact.address;
  const org = {
    '@type': 'TravelAgency', '@id': cfg.siteUrl + '/#org', name: cfg.brand.name, url: cfg.siteUrl, email: cfg.contact.email,
    address: { '@type': 'PostalAddress', streetAddress: `${a.street}, ${a.company}`, addressLocality: a.city, postalCode: a.postcode, addressCountry: a.countryCode },
    areaServed: { '@type': 'Country', name: 'Singapore' },
  };
  const graph = [org, { '@type': 'WebPage', '@id': canonical, url: canonical, name: data.meta?.title, description: data.meta?.description, inLanguage: loc.hreflang, isPartOf: { '@type': 'WebSite', name: cfg.brand.name, url: cfg.siteUrl } }];
  if (pg.type === 'place') graph.push({ '@type': 'TouristDestination', name: data.nav, description: data.meta?.description, containedInPlace: { '@type': 'Country', name: 'Singapore' } });
  if (pg.type === 'article') graph.push({ '@type': 'Article', headline: data.title, datePublished: data.date, inLanguage: loc.hreflang, author: { '@id': cfg.siteUrl + '/#org' }, publisher: { '@id': cfg.siteUrl + '/#org' } });
  if (pg.slug) graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: ctx.ui.home, item: absUrl(cfg, loc, '') }, { '@type': 'ListItem', position: 2, name: data.nav ?? data.hero?.title ?? data.title, item: canonical }] });
  return { '@context': 'https://schema.org', '@graph': graph };
}

/* ─────────── shared blocks ─────────── */
function hero(ctx, h, { inner = true, after = '' } = {}) {
  const pre = ctx.preloadHero(h.image);
  ctx.headExtra = (ctx.headExtra ?? '') + pre;
  return `<section class="hero${inner ? ' hero--inner' : ''}">
<div class="hero__media">${ctx.img(h.image, { eager: true, sizes: '100vw' })}</div>
<div class="rain" aria-hidden="true"></div>
<div class="hero__body">
${h.kicker ? `<p class="kicker hero__kicker">${esc(h.kicker)}</p>` : ''}
<h1>${boxed(h.title)}</h1>
${h.sub ? `<p class="hero__sub">${ctx.md(h.sub)}</p>` : ''}
</div>
${after}
</section>`;
}

const louvre = (light = false) => `<hr class="louvre${light ? ' louvre--light' : ''}" aria-hidden="true">`;

function placeCard(ctx, id, sizes = '(min-width:760px) 50vw, 100vw') {
  const d = placeData(ctx, id);
  return `<a class="card rv" href="${ctx.url(id)}">${ctx.img(d.hero.image, { sizes })}<span class="card__label"><span class="bx">${d.nav.split(/\s+/).map((w) => `<span>${esc(w)}</span>`).join(' ')}</span><span class="mono">${esc(d.hero.kicker)}</span></span></a>`;
}

function tile(ctx, { href, image, tag, title, meta = [], cta }) {
  return `<a class="tile" href="${href}"><span class="tile__img">${ctx.img(image, { sizes: '(min-width:900px) 380px, 78vw' })}${tag ? `<span class="tile__tag">${esc(tag)}</span>` : ''}</span>
<span class="tile__body"><h3>${esc(title)}</h3>${meta.length ? `<span class="tile__meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}</span>` : ''}<span class="btns"><span class="btn">${esc(cta ?? ctx.ui.explore)}</span><span class="btn-c">${ARROW}</span></span></span></a>`;
}

function rail(ctx, { title, link, linkLabel, items, bg }) {
  return `<section class="rail"${bg ? ` style="--railbg:${bg}"` : ''} aria-label="${esc(title)}">
<div class="rail__head"><h2>${boxed(title, 'bx--plain')}</h2>${link ? btn(link, linkLabel ?? ctx.ui.viewAll) : ''}
<div class="rail__ctl"><button type="button" data-rail="-1" aria-label="${esc(ctx.ui.previous)}">${ARROW_L}</button><button type="button" data-rail="1" aria-label="${esc(ctx.ui.next)}">${ARROW}</button></div></div>
<div class="rail__track" tabindex="0" role="region" aria-label="${esc(title)}">${items.join('')}</div>
</section>`;
}

const articleIds = ['journal-facades', 'journal-rain', 'journal-ubin'];
function journalRail(ctx, title) {
  return rail(ctx, {
    title: title ?? ctx.ui.journal.latest, link: ctx.url('journal'),
    items: articleIds.map((id) => { const a = placeData(ctx, id); return tile(ctx, { href: ctx.url(id), image: a.image, tag: a.kicker, title: a.title, meta: [a.dateLabel, `${a.minutes} ${ctx.ui.journal.minRead}`], cta: ctx.ui.readMore }); }),
  });
}

function faq(ctx, items) {
  return `<div class="acc">${items.map((f) => `<details><summary>${esc(f.q)}</summary><div class="acc__body">${ctx.paras(f.a)}</div></details>`).join('')}</div>`;
}

function steps(ctx, s) {
  return `<section class="steps">
<div class="steps__head rv">${s.kicker ? `<p class="kicker">${esc(s.kicker)}</p>` : ''}<h2>${esc(s.title)}</h2>${s.text ? `<p class="lead" style="max-width:52ch;margin-top:16px">${ctx.md(s.text)}</p>` : ''}</div>
<div class="steps__grid">${s.items.map((it, i) => {
    const inner = `<div class="step__img rv-img rv">${ctx.img(it.image, { sizes: '(min-width:760px) 25vw, 100vw' })}<span class="step__n">${i + 1}</span></div><h3>${esc(it.title)}</h3><p>${ctx.md(it.text)}</p>`;
    return it.link ? `<a class="step" href="${ctx.url(it.link)}">${inner}</a>` : `<div class="step">${inner}</div>`;
  }).join('')}</div>
</section>`;
}

function bleed(ctx, b, { cta } = {}) {
  return `<section class="bleed${b.image ? '' : ' bleed--plain'}">${b.image ? ctx.img(b.image, { sizes: '100vw' }) : ''}<div class="rain" aria-hidden="true"></div>
<div class="bleed__body rv">${b.kicker ? `<p class="kicker">${esc(b.kicker)}</p>` : ''}<h2>${boxed(b.title)}</h2>${b.text ? `<p>${ctx.md(b.text)}</p>` : ''}
${b.facts ? `<dl class="facts">${b.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>` : ''}
${cta ? `<div class="on-dark">${cta}</div>` : ''}</div></section>`;
}

/* ─────────── HOME ─────────── */
function home(ctx) {
  const { data: d, ui, url, img, md, placeIds } = ctx;
  const stripItems = d.strip.map((s, i) => `<a href="${url(s.id)}">${img(s.image, { sizes: '96px' })}<span><span class="mono">0${i + 1}</span><b>${esc(s.label)}</b></span></a>`).join('');
  const rows = d.explore.rows.map((r) => `<a class="row rv" href="${url(r.id)}">
<div class="row__head"><h3>${boxed(r.title, 'bx--plain')}</h3>${r.meta ? `<p class="mono muted">${esc(r.meta)}</p>` : ''}</div>
<div class="row__media">${img(r.image, { sizes: '(min-width:900px) 28vw, 100vw' })}</div>
<div class="row__foot"><p class="row__text">${md(r.text)}</p><span class="btns"><span class="btn">${esc(r.cta)}</span><span class="btn-c">${ARROW}</span></span></div></a>`).join('');
  const band = (b, ids, tone) => `<section class="band band--${tone}" id="${b.anchor}" aria-labelledby="band-${b.anchor}">
<h2 class="band__title" id="band-${b.anchor}">${esc(b.title)}</h2>
<div class="band__rule mono"><span>${esc(b.kicker)}</span><span>${esc(b.kickerRight)}</span></div>
<p class="lead" style="max-width:56ch;margin-bottom:28px">${md(b.text)}</p>
<div class="cards">${ids.map((id) => placeCard(ctx, id)).join('')}</div></section>`;
  const journeysData = placeData(ctx, 'journeys');
  return `${hero(ctx, d.hero, { inner: false, after: `<nav class="strip" aria-label="${esc(d.stripLabel)}">${stripItems}</nav>` })}
<section class="statement"><p class="kicker">${esc(d.statement.kicker)}</p><p class="rv">${md(d.statement.text)}</p></section>
<section class="collage">
<figure class="collage__a rv" style="margin:0">${img(d.collage.imageA, { sizes: '(min-width:900px) 66vw, 100vw' })}<figcaption><h2>${esc(d.collage.title)}</h2><p class="small" style="margin:0;max-width:60ch">${md(d.collage.caption)}</p></figcaption></figure>
<div class="collage__notes rv">${ctx.paras(d.collage.notes)}</div>
<figure class="collage__b rv rv-img" style="margin:0">${img(d.collage.imageB, { sizes: '(min-width:900px) 34vw, 100vw' })}</figure>
</section>
${louvre()}
<section class="split" aria-labelledby="explore-h">
<div class="split__l"><div><h2 id="explore-h">${boxed(d.explore.title)}</h2></div>${MOTIF}<div><p style="max-width:44ch">${md(d.explore.text)}</p>${btn(url('enquire'), ui.planTrip)}</div></div>
<div class="split__r">${rows}</div>
</section>
${band(d.bands[0], placeIds.city, 'mint')}
${band(d.bands[1], placeIds.green, 'cream')}
${steps(ctx, d.steps)}
${bleed(ctx, d.monsoon, { cta: btn(url('shade-walks'), ui.nav.walks) })}
${rail(ctx, { title: d.journeysTitle, link: url('journeys'), items: journeysData.items.map((j) => tile(ctx, { href: url('journeys', j.id), image: j.image, tag: `${j.days} ${ui.journeys.days}`, title: j.title, meta: [j.pace, j.bestFor] })) })}
${journalRail(ctx)}`;
}

/* ─────────── PLACE ─────────── */
function place(ctx) {
  const { data: d, ui, url, img, md, paras } = ctx;
  const info = `<div class="infobar">${d.info.map((i) => `<dl><dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd></dl>`).join('')}<a class="cta" href="${url('enquire')}">${esc(ui.place.enquireAbout)} ${ARROW.replace('<svg', '<svg width="16" height="16"')}</a></div>`;
  const rows = d.rows.map((r) => `<article class="row rv${r.image ? '' : ' row--text'}">
<div class="row__head"><h3>${boxed(r.title, 'bx--plain')}</h3>${r.meta?.length ? `<p class="row__meta mono">${r.meta.map(esc).join('<span aria-hidden="true">/</span>')}</p>` : ''}</div>
${r.image ? `<div class="row__media">${img(r.image, { sizes: '(min-width:900px) 28vw, 100vw' })}</div>` : ''}
<div class="row__foot"><div class="row__text">${paras(r.text)}</div></div></article>`).join('');
  const related = d.related.map((id) => { const p = placeData(ctx, id); return tile(ctx, { href: url(id), image: p.hero.image, tag: p.hero.kicker, title: p.nav }); });
  return `${hero(ctx, d.hero, { after: info })}
<section class="split" aria-labelledby="intro-h">
<div class="split__l"><div><h2 id="intro-h">${boxed(d.intro.heading)}</h2>${d.intro.chips ? `<div class="chips" style="margin-top:18px">${d.intro.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : ''}</div>${MOTIF}<div style="max-width:52ch">${paras(d.intro.text)}</div></div>
<div class="split__r"><p class="kicker" style="padding:8px 0 4px">${esc(ui.place.inThisArea)}</p>${rows}</div>
</section>
${d.bleed ? bleed(ctx, d.bleed, { cta: btn(url('shade-walks', d.id), d.bleed.cta ?? ui.seeWalk) }) : ''}
<section class="sec sec--sand"><div class="cols cols--2">
<div class="rv"><p class="kicker">${esc(ui.place.eatHere)}</p><h2 style="font-size:var(--fs-h3);margin:12px 0 16px">${esc(d.eat.title)}</h2>${paras(d.eat.text)}
${d.eat.items?.length ? `<ul class="tlist" style="list-style:none;padding:0;margin:20px 0">${d.eat.items.map((i) => `<li class="small" style="padding:12px 0;border-bottom:1px solid var(--line)"><strong>${esc(i.name)}</strong> — ${md(i.text)}</li>`).join('')}</ul>` : ''}
${btn(url('hawker-guide'), ui.place.hawkerLink)}</div>
<div class="rv"><p class="kicker">${esc(ui.place.goodToKnow)}</p><div style="margin-top:16px">${faq(ctx, d.faq)}</div></div>
</div></section>
${rail(ctx, { title: ui.place.related, items: related })}`;
}

/* ─────────── HAWKER GUIDE ─────────── */
function hawker(ctx) {
  const { data: d, ui, url, md, paras, img } = ctx;
  const items = d.centres.items.map((c) => `<article class="trow rv" data-tags="${esc(c.tags.join(' '))}">
<div><h3>${esc(c.name)}</h3><p class="mono muted" style="margin-top:8px">${esc(c.area)}</p>${c.near ? `<p class="small" style="margin-top:8px">${esc(ui.hawker.near)}: <a class="link" href="${url(c.near)}">${esc(placeName(ctx, c.near))}</a></p>` : ''}</div>
<dl><dt>${esc(ui.hawker.knownFor)}</dt><dd>${esc(c.knownFor)}</dd><dt>${esc(ui.hawker.hours)}</dt><dd>${esc(c.hours)}</dd><dt>${esc(ui.hawker.closed)}</dt><dd>${esc(c.closed)}</dd></dl>
<div class="small">${paras(c.text)}</div></article>`).join('');
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.statement.kicker)}</p><p class="rv">${md(d.statement.text)}</p></section>
<section class="split" aria-labelledby="unesco-h">
<div class="split__l"><div><h2 id="unesco-h">${boxed(d.unesco.title)}</h2></div>${MOTIF}<dl class="facts" style="border-color:var(--line)">${d.unesco.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div>
<div class="split__r"><div class="prose rv" style="padding-top:24px">${paras(d.unesco.text)}</div><div class="row__media rv" style="margin-top:24px">${img(d.unesco.image, { sizes: '(min-width:900px) 50vw, 100vw' })}</div></div>
</section>
<section class="sec" id="centres" aria-labelledby="centres-h">
<div class="sec__head"><h2 id="centres-h">${esc(d.centres.title)}</h2><p>${md(d.centres.text)}</p></div>
<div class="tlist__filter" role="group" aria-label="${esc(d.centres.filterLabel)}"><button type="button" aria-pressed="true" data-filter="all">${esc(ui.hawker.filterAll)}</button>${d.centres.filters.map((f) => `<button type="button" aria-pressed="false" data-filter="${esc(f.key)}">${esc(f.label)}</button>`).join('')}</div>
<div class="tlist" data-list>${items}</div>
<p class="notice" style="margin-top:24px">${md(d.centres.note)}</p>
</section>
${louvre()}
${steps(ctx, d.manners)}
<section class="sec sec--mint"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(d.dishesTitle)}</h2></div>
<div class="acc">${d.dishes.map((x) => `<details><summary>${esc(x.name)}</summary><div class="acc__body">${paras(x.text)}</div></details>`).join('')}</div></div></section>
<section class="sec"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(ui.place.goodToKnow)}</h2></div>${faq(ctx, d.faq)}</div></section>`;
}

/* ─────────── STOPOVER PLANNER ─────────── */
function stopover(ctx) {
  const { data: d, ui, url, md, paras, loc } = ctx;
  const P = ui.planner;
  const def = { hours: 12, arrival: 7, month: 2 };
  const planHtml = renderPlan(def, d.activities, P);
  const opts = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.intro.kicker)}</p><p class="rv">${md(d.intro.text)}</p></section>
<section class="sec" id="planner" aria-labelledby="planner-h" style="padding-top:0">
<div class="sec__head"><h2 id="planner-h">${esc(d.planner.title)}</h2><p>${md(d.planner.text)}</p></div>
<div class="planner">
<form class="planner__form on-dark" data-planner data-lang="${loc.code}" aria-describedby="planner-note">
<div><label for="pl-hours">${esc(P.hoursLabel)}</label><output class="planner__hours" for="pl-hours" id="pl-out">12 ${esc(P.hoursUnit)}</output>
<input type="range" id="pl-hours" name="hours" min="8" max="96" step="1" value="12" aria-valuetext="12 ${esc(P.hoursUnit)}"></div>
<div><label for="pl-arr">${esc(P.arrivalLabel)}</label><select id="pl-arr" name="arrival">${opts(24, (h) => `<option value="${h}"${h === def.arrival ? ' selected' : ''}>${String(h).padStart(2, '0')}:00</option>`)}</select></div>
<div><label for="pl-month">${esc(P.monthLabel)}</label><select id="pl-month" name="month">${P.months.map((m, i) => `<option value="${i}"${i === def.month ? ' selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
<button class="btn" type="submit" style="color:var(--cream)">${esc(P.update)}</button>
<p class="small" id="planner-note" style="opacity:.8;margin:0" data-nojs>${esc(P.noJs)}</p>
</form>
<div class="planner__out" aria-live="polite" data-plan-out>${planHtml}</div>
</div>
<script type="application/json" id="planner-data">${JSON.stringify({ ui: P, acts: d.activities }).replace(/</g, '\\u003c')}</script>
</section>
${louvre()}
<section class="sec sec--sand" id="rules" aria-labelledby="rules-h">
<div class="sec__head"><h2 id="rules-h">${esc(d.rules.title)}</h2><p>${md(d.rules.text)}</p></div>
<div class="cols cols--2">${d.rules.groups.map((g) => `<div class="rv"><h3 style="font-size:var(--fs-h4);margin-bottom:12px">${esc(g.title)}</h3>${faq(ctx, g.items)}</div>`).join('')}</div>
</section>
${bleed(ctx, d.changi, { cta: btn(url('changi'), d.changi.cta) })}
<section class="sec"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(ui.planner.checklistTitle)}</h2></div><ol class="route">${d.checklist.map((c) => `<li>${md(c)}</li>`).join('')}</ol></div></section>`;
}

/* ─────────── SHADE WALKS ─────────── */
function walks(ctx) {
  const { data: d, ui, url, md, paras, img } = ctx;
  const W = ui.walks;
  const hours = d.clock.hours; // 24 codes
  const day = `<div class="day" role="img" aria-label="${esc(d.clock.aria)}">${hours.map((c, h) => `<span class="h-${c}" title="${String(h).padStart(2, '0')}:00"></span>`).join('')}</div><div class="day-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
<div class="legend">${d.clock.legend.map((l) => `<span><i class="h-${l.code}" style="background:${{ best: '#2F6B4F', hot: 'var(--terracotta)', storm: 'var(--cobalt)', night: 'var(--monsoonDark)', ok: 'var(--mint)' }[l.code]}"></i>${esc(l.label)}</span>`).join('')}</div>`;
  const walkHtml = d.walks.map((w) => `<article class="walk rv" id="${w.id}" aria-labelledby="w-${w.id}">
<div><p class="kicker"><a class="link" href="${url(w.id)}">${esc(placeName(ctx, w.id))}</a></p><h3 id="w-${w.id}" style="margin:10px 0 16px">${esc(w.title)}</h3>
<dl class="trow" style="grid-template-columns:1fr;padding:0;border:0"><dl style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:var(--fs-s);margin:0"><dt class="mono muted">${esc(W.distance)}</dt><dd style="margin:0">${esc(w.distance)}</dd><dt class="mono muted">${esc(W.time)}</dt><dd style="margin:0">${esc(w.time)}</dd><dt class="mono muted">${esc(W.start)}</dt><dd style="margin:0">${esc(w.start)}</dd><dt class="mono muted">${esc(W.best)}</dt><dd style="margin:0">${esc(w.best)}</dd></dl></dl>
<div class="small" style="margin-top:16px">${paras(w.intro)}</div></div>
<div><p class="kicker" style="margin-bottom:14px">${esc(W.route)}</p><ol class="route">${w.route.map((r) => `<li>${md(r.text)} <span class="chip shade-${r.shade}">${esc(W.shade[r.shade])}</span></li>`).join('')}</ol>
<p class="notice"><strong>${esc(W.bailout)}:</strong> ${md(w.bailout)}</p></div>
${w.image ? `<div class="walk__img">${img(w.image, { sizes: '(min-width:1000px) 30vw, 100vw' })}</div>` : ''}
</article>`).join('');
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.intro.kicker)}</p><p class="rv">${md(d.intro.text)}</p></section>
<section class="sec sec--tight" aria-labelledby="clock-h" style="padding-top:0"><div class="cols cols--12"><div><h2 id="clock-h" style="font-size:var(--fs-h3)">${esc(d.clock.title)}</h2></div><div>${paras(d.clock.text)}${day}</div></div></section>
<section class="sec sec--mint" aria-labelledby="seasons-h"><div class="sec__head"><h2 id="seasons-h">${esc(d.seasonsTitle)}</h2></div>
<div class="cols cols--2">${d.seasons.map((s) => `<div class="rv" style="border-top:1px solid var(--ink);padding-top:14px"><p class="mono">${esc(s.months)}</p><h3 style="font-size:var(--fs-h4);margin:8px 0">${esc(s.name)}</h3>${paras(s.text)}</div>`).join('')}</div></section>
${louvre()}
<section class="sec" aria-labelledby="walks-h"><div class="sec__head"><h2 id="walks-h">${esc(d.walksTitle)}</h2><p>${md(d.walksText)}</p>
<div class="legend">${Object.entries(W.shade).map(([k, v]) => `<span><span class="chip shade-${k}">${esc(v)}</span></span>`).join('')}</div></div>
${walkHtml}</section>
<section class="sec sec--sand"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(d.tipsTitle)}</h2></div>${faq(ctx, d.tips)}</div></section>`;
}

/* ─────────── JOURNEYS ─────────── */
function journeys(ctx) {
  const { data: d, ui, url, md, paras, img } = ctx;
  const J = ui.journeys;
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.intro.kicker)}</p><p class="rv">${md(d.intro.text)}</p></section>
${d.items.map((j, i) => `<section class="split" id="${j.id}" aria-labelledby="j-${j.id}">
<div class="split__l"><div><p class="mono" style="margin-bottom:12px">0${i + 1} — ${j.days} ${esc(J.days)}</p><h2 id="j-${j.id}">${boxed(j.title)}</h2>
<div class="chips" style="margin-top:18px"><span class="chip">${esc(J.pace)}: ${esc(j.pace)}</span><span class="chip chip--line">${esc(J.bestFor)}: ${esc(j.bestFor)}</span></div></div>
<div class="row__media rv rv-img">${img(j.image, { sizes: '(min-width:900px) 46vw, 100vw' })}</div>
<div style="max-width:52ch">${paras(j.summary)}<p class="small muted"><strong>${esc(J.price)}:</strong> ${esc(J.priceOnRequest)}</p>${btn(url('enquire'), ui.enquire)}</div></div>
<div class="split__r"><div class="acc" style="margin-top:12px">${j.plan.map((p, k) => `<details${k === 0 ? ' open' : ''}><summary><span><span class="mono muted">${esc(J.day)} ${esc(p.day)}</span><br>${esc(p.title)}</span></summary><div class="acc__body">${paras(p.text)}</div></details>`).join('')}</div></div>
</section>`).join(louvre())}`;
}

/* ─────────── STAYS ─────────── */
function stays(ctx) {
  const { data: d, ui, url, md, paras, img } = ctx;
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.intro.kicker)}</p><p class="rv">${md(d.intro.text)}</p></section>
<section class="sec" style="padding-top:0"><p class="notice">${md(d.note)}</p></section>
<section class="split" aria-labelledby="stays-h">
<div class="split__l"><div><h2 id="stays-h">${boxed(d.listTitle)}</h2></div>${MOTIF}<div style="max-width:46ch">${paras(d.listText)}${btn(url('enquire'), ui.enquire)}</div></div>
<div class="split__r">${d.items.map((s) => `<article class="row rv${s.image ? '' : ' row--text'}">
<div class="row__head"><span class="placeholder-tag">${esc(ui.placeholder)}</span><h3>${boxed(s.name, 'bx--plain')}</h3><p class="row__meta mono">${esc(s.area)}<span aria-hidden="true">/</span>${esc(s.type)}</p></div>
${s.image ? `<div class="row__media">${img(s.image, { sizes: '(min-width:900px) 28vw, 100vw' })}</div>` : ''}
<div class="row__foot"><div class="row__text">${paras(s.text)}</div></div></article>`).join('')}</div>
</section>`;
}

/* ─────────── ABOUT ─────────── */
function about(ctx) {
  const { data: d, ui, url, md, paras, img } = ctx;
  return `${hero(ctx, d.hero)}
<section class="statement"><p class="kicker">${esc(d.statement.kicker)}</p><p class="rv">${md(d.statement.text)}</p></section>
<section class="collage">
<figure class="collage__a rv" style="margin:0">${img(d.collage.imageA, { sizes: '(min-width:900px) 66vw, 100vw' })}<figcaption><h2>${esc(d.collage.title)}</h2><p class="small" style="margin:0;max-width:60ch">${md(d.collage.caption)}</p></figcaption></figure>
<div class="collage__notes rv">${paras(d.collage.notes)}</div>
<figure class="collage__b rv rv-img" style="margin:0">${img(d.collage.imageB, { sizes: '(min-width:900px) 34vw, 100vw' })}</figure>
</section>
${louvre()}
<section class="sec" aria-labelledby="pr-h"><div class="sec__head"><h2 id="pr-h">${esc(d.principlesTitle)}</h2></div>
<div class="cols cols--2">${d.principles.map((p) => `<div class="rv" style="border-top:1px solid var(--ink);padding-top:14px"><h3 style="font-size:var(--fs-h4);margin-bottom:10px">${esc(p.title)}</h3>${paras(p.text)}</div>`).join('')}</div></section>
<section class="sec sec--mint"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(d.howTitle)}</h2></div><ol class="route">${d.how.map((h) => `<li><strong>${esc(h.title)}</strong><br>${md(h.text)}</li>`).join('')}</ol></div></section>
${bleed(ctx, d.bleed, { cta: btn(url('enquire'), ui.enquire) })}`;
}

/* ─────────── JOURNAL ─────────── */
function journal(ctx) {
  const { data: d, ui, url, md } = ctx;
  return `${hero(ctx, d.hero)}
<section class="sec"><div class="sec__head"><p class="lead" style="max-width:56ch">${md(d.intro)}</p></div>
<div class="cards cards--3">${articleIds.map((id) => { const a = placeData(ctx, id); return `<a class="tile rv" href="${url(id)}" style="background:#EFE7D6"><span class="tile__img">${ctx.img(a.image, { sizes: '(min-width:760px) 33vw, 100vw' })}<span class="tile__tag">${esc(a.kicker)}</span></span><span class="tile__body"><h3>${esc(a.title)}</h3><span class="small">${esc(a.excerpt)}</span><span class="tile__meta"><span>${esc(a.dateLabel)}</span><span>${a.minutes} ${esc(ui.journal.minRead)}</span></span><span class="btns"><span class="btn">${esc(ui.readMore)}</span><span class="btn-c">${ARROW}</span></span></span></a>`; }).join('')}</div></section>`;
}

function article(ctx) {
  const { data: d, ui, url, md, paras } = ctx;
  const blocks = d.body.map((b) => b.h2 ? `<h2>${esc(b.h2)}</h2>` : b.ul ? `<ul>${b.ul.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : `<p>${md(b.p)}</p>`).join('');
  return `${hero(ctx, { image: d.image, kicker: d.kicker, title: d.title, sub: d.excerpt })}
<article class="article"><aside><p class="mono">${esc(d.dateLabel)} · ${d.minutes} ${esc(ui.journal.minRead)}</p><p style="margin-top:16px">${btn(url('journal'), ui.journal.back)}</p>${d.related ? `<p class="kicker" style="margin-top:32px">${esc(ui.place.related)}</p><ul style="list-style:none;padding:0">${d.related.map((id) => `<li style="padding:6px 0;border-bottom:1px solid var(--line)"><a class="link" href="${url(id)}">${esc(placeName(ctx, id))}</a></li>`).join('')}</ul>` : ''}</aside>
<div class="prose">${blocks}</div></article>
${journalRail(ctx)}`;
}

/* ─────────── ENQUIRE ─────────── */
function enquire(ctx) {
  const { data: d, ui, url, md, img, cfg, loc, paras } = ctx;
  const F = ui.form;
  ctx.headExtra = (ctx.headExtra ?? '') + ctx.preloadHero(d.image);
  return `<section class="enq">${img(d.image, { sizes: '100vw', eager: true })}
<h1 class="enq__title">${boxed(d.title)}</h1>
<div class="enq__panel">
<form class="form" method="post" action="/api/enquiry" data-enquiry novalidate>
<input type="hidden" name="lang" value="${loc.code}">
<input type="hidden" name="redirect" value="${url('enquire-thanks')}">
<div class="hp" aria-hidden="true"><label for="f-company">Company</label><input id="f-company" name="company" tabindex="-1" autocomplete="off"></div>
<div class="field"><label for="f-first">${esc(F.firstName)} *</label><input id="f-first" name="firstName" autocomplete="given-name" required></div>
<div class="field"><label for="f-last">${esc(F.lastName)} *</label><input id="f-last" name="lastName" autocomplete="family-name" required></div>
<div class="field"><label for="f-email">${esc(F.email)} *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
<div class="field"><label for="f-country">${esc(F.country)}</label><input id="f-country" name="country" autocomplete="country-name"></div>
<div class="field"><label for="f-dates">${esc(F.dates)}</label><input id="f-dates" name="dates" placeholder="${esc(F.datesHint)}"></div>
<div class="field"><label for="f-len">${esc(F.length)}</label><select id="f-len" name="length">${F.lengthOptions.map((o) => `<option>${esc(o)}</option>`).join('')}</select></div>
<div class="field"><label for="f-trav">${esc(F.travellers)}</label><input id="f-trav" name="travellers" type="number" min="1" max="30" inputmode="numeric"></div>
<div class="field"><label for="f-int">${esc(F.interests)}</label><select id="f-int" name="interest">${F.interestsOptions.map((o) => `<option>${esc(o)}</option>`).join('')}</select></div>
<div class="field full"><label for="f-msg">${esc(F.message)} *</label><textarea id="f-msg" name="message" required></textarea></div>
<div class="field field--check full"><input id="f-consent" name="consent" type="checkbox" value="yes" required><label for="f-consent">${md(F.consent.replace('Privacy Policy', `[Privacy Policy](@privacy)`))} *</label></div>
<div class="full" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center"><button class="btns" type="submit" style="background:none;border:0;padding:0;cursor:pointer"><span class="btn btn--solid">${esc(F.submit)}</span><span class="btn-c">${ARROW}</span></button>
<p class="form__status" role="status" aria-live="polite" data-status data-sending="${esc(F.sending)}" data-ok="${esc(F.success)}" data-err="${esc(F.error)} ${esc(cfg.contact.email)}" data-required="${esc(F.required)}"></p></div>
</form>
<aside class="enq__side on-dark"><div><h2 style="font:600 var(--fs-s)/1.2 var(--f-t);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">${esc(F.sideTitle)}</h2><p class="small">${esc(F.sideText)}</p></div>
<div class="small">${paras(d.side)}<p><a class="link" href="mailto:${cfg.contact.email}">${cfg.contact.email}</a></p></div></aside>
</div>
</section>
<section class="sec sec--sand"><div class="cols cols--12"><div><h2 style="font-size:var(--fs-h3)">${esc(d.faqTitle)}</h2></div>${faq(ctx, d.faq)}</div></section>`;
}

function thanks(ctx) {
  const { data: d, ui, url, md } = ctx;
  return `${hero(ctx, { image: d.image, title: d.title, sub: d.text })}
<section class="sec">${btn(url('home'), ui.notFound.cta)}</section>`;
}

/* ─────────── LEGAL ─────────── */
function legal(ctx) {
  const { data: d, md, tokens } = ctx;
  return `<section class="sec" style="padding-top:calc(var(--hdr) + 80px)">
<p class="kicker">${esc(d.kicker)}</p><h1 style="font-size:var(--fs-h2);margin:12px 0 18px">${boxed(d.title)}</h1><p class="mono muted">${esc(d.updated)}</p></section>
<section class="sec" style="padding-top:0"><div class="cols cols--12"><nav aria-label="${esc(d.tocLabel)}" class="small"><ol style="padding-left:1.2em;position:sticky;top:96px">${d.sections.map((s, i) => `<li><a class="link" href="#s${i + 1}">${esc(s.h)}</a></li>`).join('')}</ol></nav>
<div class="prose">${d.intro ? `<p class="lead">${md(d.intro)}</p>` : ''}${d.sections.map((s, i) => `<h2 id="s${i + 1}">${i + 1}. ${esc(s.h)}</h2>${(s.p ?? []).map((p) => `<p>${md(p)}</p>`).join('')}${s.ul ? `<ul>${s.ul.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : ''}${(s.p2 ?? []).map((p) => `<p>${md(p)}</p>`).join('')}`).join('')}</div></div></section>`;
}

/* ─────────── CREDITS ─────────── */
function credits(ctx) {
  const { data: d, ui, manifest, md } = ctx;
  const cc = manifest.filter((m) => m.source === 'commons');
  return `<section class="sec" style="padding-top:calc(var(--hdr) + 80px)"><h1 style="font-size:var(--fs-h2);margin-bottom:18px">${boxed(d.title)}</h1><p class="lead" style="max-width:60ch">${md(d.intro)}</p></section>
<section class="sec" style="padding-top:0"><div class="tlist">${cc.map((m) => `<div class="trow small"><div><strong>${esc(ctx.alt(m.key) || m.title)}</strong></div>
<dl><dt>${esc(ui.credits.author)}</dt><dd>${esc(m.author)}</dd><dt>${esc(ui.credits.license)}</dt><dd>${m.licenseUrl ? `<a class="link" href="${esc(m.licenseUrl)}" rel="noopener license">${esc(m.license)}</a>` : esc(m.license)}</dd></dl>
<dl><dt>${esc(ui.credits.source)}</dt><dd><a class="link" href="${esc(m.pageUrl)}" rel="noopener">Wikimedia Commons</a></dd><dt>${esc(ui.credits.usedOn)}</dt><dd>${esc(m.place)}</dd></dl></div>`).join('')}</div>
<p class="small muted" style="margin-top:24px;max-width:60ch">${md(d.note)}</p></section>`;
}

function notFound(ctx) {
  const { ui, url, placeIds } = ctx;
  const nf = ui.notFound;
  return `${hero(ctx, { image: 'walk-1', title: nf.title, sub: nf.text })}
<section class="sec"><p>${btn(url('home'), nf.cta)}</p><ul class="chips" style="list-style:none;padding:0;margin-top:24px">${[...placeIds.city, ...placeIds.green].map((id) => `<li><a class="chip chip--line" href="${url(id)}">${esc(placeName(ctx, id))}</a></li>`).join('')}</ul></section>`;
}
