// ─────────────────────────────────────────────────────────────
//  Five Foot Way — brand configuration
//  Change the values below to re-brand the whole site.
//  Everything (header, footer, legal pages, JSON-LD, colours)
//  reads from this one file at build time.
// ─────────────────────────────────────────────────────────────
export default {
  brand: {
    name: 'Five Foot Way',
    shortName: 'FFW',
    // Legal/trading name used on the Privacy Policy, Booking Terms and Cookie Policy.
    legalName: 'Five Foot Way',
  },

  // The live site URL (no trailing slash). Used for canonical, hreflang, sitemap and JSON-LD.
  siteUrl: 'https://fivefootway.tourground.com',
  // Vercel production URL (updated after deployment).
  liveUrl: 'https://fivefootway.tourground.com',

  contact: {
    email: 'fivefootway@tourground.com',
    // Business address: Arcc Spaces flagship, One Marina Boulevard (Level 20).
    address: {
      company: 'Arcc Spaces',
      street: '1 Marina Boulevard, Level 20',
      city: 'Singapore',
      postcode: '018989',
      country: 'Singapore',
      countryCode: 'SG',
    },
  },

  // Palette: Shophouse and Monsoon. All text/background pairs used on the site pass WCAG AA.
  palette: {
    ink: '#1D2325',          // body text
    cream: '#F5F0E7',        // frangipani cream (page background)
    mint: '#DCEBE2',         // shophouse mint
    mintDeep: '#A9CDB9',
    sand: '#EBE4D7',         // warm sand for alternate sections
    cobalt: '#1F3C9C',       // Peranakan cobalt (accent)
    terracotta: '#A3442A',   // roof-tile terracotta
    terracottaSoft: '#E9C6B5',
    monsoon: '#5A656C',      // monsoon grey (secondary text)
    monsoonDark: '#2E3539',  // footer / dark bands
    line: 'rgba(28,35,38,.22)',
  },

  fonts: {
    // Self-hosted, only the weights used. font-display: swap.
    display: { family: 'Instrument Serif', file: '/fonts/serif-400.woff2', weight: '400' },
    text: { family: 'Instrument Sans', file: '/fonts/sans-var.woff2', weight: '400 700' },
  },

  locales: [
    { code: 'en', label: 'EN', name: 'English', hreflang: 'en', ogLocale: 'en_GB', prefix: '' },
    { code: 'fr', label: 'FR', name: 'Français', hreflang: 'fr', ogLocale: 'fr_FR', prefix: '/fr' },
    { code: 'de', label: 'DE', name: 'Deutsch', hreflang: 'de', ogLocale: 'de_DE', prefix: '/de' },
    { code: 'es', label: 'ES', name: 'Español', hreflang: 'es', ogLocale: 'es_ES', prefix: '/es' },
  ],
  defaultLocale: 'en',
};
