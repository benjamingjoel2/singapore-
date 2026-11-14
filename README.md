# Five Foot Way — Singapore travel site

A static, four-language travel website for Singapore beyond the stopover: shophouse neighbourhoods, hawker centres, Pulau Ubin and the rainforest inside the city, planned around the heat and the rain.

- **Live site:** https://fivefootway.vercel.app (production domain format: `fivefootway.tourground.com`)
- **Languages:** English (root), French `/fr/`, German `/de/`, Spanish `/es/`. Every page exists in all four, pre-rendered.
- **Stack:** plain Node.js build script (no framework, no runtime dependencies), hand-written CSS, ~4 KB of vanilla JS, one Vercel serverless function for the enquiry form.

## Run it locally

Requires Node 18 or newer.

```bash
npm run build      # writes every page in every language to dist/
npm run dev        # build, then serve dist/ at http://localhost:4321 (mimics Vercel clean URLs)
npm run check      # after a build: checks internal links, image sizes/alt text, lang/canonical/hreflang
```

The build has no dependencies, so `npm install` is only needed if you want to regenerate images (see below).

## Where things live

| What | Where |
| --- | --- |
| Brand name, email, address, site URL, palette, fonts, languages | `site.config.mjs` (the one file to edit to re-brand) |
| Page list and URL slugs | `src/pages.mjs` |
| HTML templates (header, menu, footer, every page type) | `src/templates.mjs` |
| Styles (inlined into every page at build time) | `src/styles.css` |
| Interface text (nav, buttons, form labels, planner labels) | `content/<lang>/ui.json` |
| Page text | `content/<lang>/pages/<page>.json` |
| Image alt text, per language | `content/<lang>/images.json` |
| Stopover planner logic | `public/js/planner-core.js` (shared by the build and the browser) |
| Enquiry form endpoint | `api/enquiry.js` |
| Caching, clean URLs, build settings | `vercel.json` |

### Editing text

Open the JSON file for the page, in each language folder, and change the string. Inline formatting supported in most text fields:

- `**bold**`
- `[link text](@page-id)` links to another page in the same language, e.g. `[hawker guide](@hawker-guide)`; add `#anchor` for a section, e.g. `(@shade-walks#katong)`
- `[link text](https://…)` for external links
- `{brand}`, `{email}`, `{address}`, `{url}` are replaced with the values from `site.config.mjs`

Keep the same keys in all four languages. If a page is missing in a language, the build falls back to English and prints a warning.

### Re-branding

Change `site.config.mjs`: brand name, email, address, colours and URL flow through the header, footer, legal pages, JSON-LD and meta tags. Brand-specific copy inside the content files (for example the explanation of the five-foot way) needs editing by hand.

### Adding or replacing a photo

1. Put a large JPEG (2000 px+ wide) in `images/src/<key>.jpg`.
2. Add an entry to `images/manifest.json` (source, author, licence; Creative Commons photos are credited automatically on the Credits page, Unsplash photos are not credited).
3. Add alt text for `<key>` in `content/<lang>/images.json` for each language.
4. `npm install` (once), then `npm run images -- <key>` to generate AVIF/WebP sizes into `public/img/` and update `images/meta.json`.
5. Reference the key in the content JSON (`"image": "<key>"`) and rebuild.

Generated images are committed, so Vercel never has to process images. `images/src/` (the originals) is not committed.

Photo rules: only high-quality photos, only where the location matches; named hotels, restaurants and cafés are shown only with images we are clearly allowed to use. See `IMAGES-NEEDED.md` for venues still waiting for a licensed image.

## Enquiry form

The form posts to `/api/enquiry` (a Vercel Node function). It works with and without JavaScript (without JS it redirects to the thank-you page). It validates required fields and has a honeypot field for bots.

Delivery: set these environment variables in the Vercel project to receive enquiries by email through [Resend](https://resend.com):

- `RESEND_API_KEY` — your Resend API key
- `ENQUIRY_FROM` — a verified sender, e.g. `Five Foot Way <enquiries@tourground.com>`
- `ENQUIRY_TO` — optional, defaults to `fivefootway@tourground.com`

Without `RESEND_API_KEY`, enquiries are written to the Vercel function logs (Project → Logs) so nothing is lost while email is being set up.

## Performance

- Fonts: two self-hosted WOFF2 files (Instrument Serif 400 and Instrument Sans variable), preloaded, `font-display: swap`, with metric-adjusted fallbacks.
- CSS inlined (no render-blocking stylesheet); JS deferred; the planner script loads only on its page.
- Images: AVIF and WebP at 400–2000 px with `srcset`/`sizes`, `width`/`height` on every image, lazy loading below the fold, hero preloaded with `fetchpriority="high"`.
- No video, no third-party scripts, no cookies. Long cache headers for `/img`, `/fonts` and `/js` in `vercel.json`.
- Page transitions use the native cross-document View Transitions API (no JS).

## Deploying

The repository is connected to Vercel (team "Benjamin - Sevo"); every push to `main` deploys to production. `vercel.json` sets the build command (`node build.mjs`), the output folder (`dist`), clean URLs and cache headers. To point the production domain at the site, add `fivefootway.tourground.com` under Project → Settings → Domains and create the CNAME record it shows at your DNS provider.

## Before launch

Work through `FACTS-TO-VERIFY.md` (entry rules, opening hours, monsoon dates, the business address) and `IMAGES-NEEDED.md`.
