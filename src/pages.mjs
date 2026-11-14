// Page registry: one entry per page. Slugs are shared by all locales (/slug, /fr/slug, /de/slug, /es/slug).
export const placeIds = {
  city: ['chinatown', 'kampong-glam', 'little-india', 'katong', 'tiong-bahru', 'civic-district'],
  green: ['marina-bay', 'botanic-gardens', 'nature-reserves', 'southern-ridges', 'pulau-ubin', 'mandai'],
  gateway: ['changi'],
};

export const slugs = {
  home: '',
  chinatown: 'chinatown-tanjong-pagar',
  'kampong-glam': 'kampong-glam',
  'little-india': 'little-india',
  katong: 'katong-joo-chiat',
  'tiong-bahru': 'tiong-bahru',
  'civic-district': 'civic-district',
  'marina-bay': 'marina-bay-gardens-by-the-bay',
  'botanic-gardens': 'singapore-botanic-gardens',
  'nature-reserves': 'nature-reserves',
  'southern-ridges': 'southern-ridges',
  'pulau-ubin': 'pulau-ubin',
  mandai: 'mandai',
  changi: 'changi-jewel',
  'hawker-guide': 'hawker-centre-guide',
  'stopover-planner': 'stopover-planner',
  'shade-walks': 'shade-and-rain-walks',
  journeys: 'sample-journeys',
  stays: 'stays',
  about: 'about',
  journal: 'journal',
  'journal-facades': 'journal/reading-a-shophouse-facade',
  'journal-rain': 'journal/why-the-rain-comes-at-four',
  'journal-ubin': 'journal/a-morning-on-pulau-ubin',
  enquire: 'enquire',
  'enquire-thanks': 'enquire/thank-you',
  privacy: 'privacy-policy',
  terms: 'booking-terms',
  cookies: 'cookie-policy',
  credits: 'credits',
  '404': '404',
};

const type = (id) => {
  if (id === 'home') return 'home';
  if (Object.values(placeIds).flat().includes(id)) return 'place';
  if (id.startsWith('journal-')) return 'article';
  if (['privacy', 'terms', 'cookies'].includes(id)) return 'legal';
  return id; // hawker-guide, stopover-planner, shade-walks, journeys, stays, about, journal, enquire, enquire-thanks, credits, 404
};

export const pages = Object.entries(slugs).map(([id, slug]) => ({
  id, slug, type: type(id), noindex: id === 'enquire-thanks' || id === '404',
}));
export const slugOf = (id) => slugs[id];
