# miraiinnovations.tech

The Mirai Innovations website. It opens straight onto **Layer**, Mirai's walk-up virtual try-on station, with one
contact sheet at the bottom. Live at https://miraiinnovations.tech.

The previous Next.js company site is kept at the tag `nextjs-site-final`.

## What's here

| Path | What it is |
|---|---|
| `site/` | Exactly what the domain serves. Static HTML, CSS and JS: no framework, no build step. |
| `site/index.html`, `app.js`, `style.css` | The page, its behaviour and its styles. |
| `site/privacy.html`, `terms.html` | Legal pages (drafts, to be reviewed by a lawyer). Served at `/privacy` and `/terms` via `_redirects`. |
| `site/assets/` | Images (WebP), fonts (self-hosted woff2), kiosk screen media, logos and the 3D station bundle. |
| `site/_headers` | Security headers (CSP, HSTS, frame and permissions policy) and cache rules. |
| `site/robots.txt`, `sitemap.xml` | For search engines. The page also carries schema.org data for Mirai Innovations (name, Mirai logo, contacts). |
| `src/station/` | Source of `site/assets/station/station.bundle.js`, the 3D Layer Station in the hero (three.js r170). |

## Run it locally

Any static server pointed at `site/` works:

```bash
python -m http.server 5190 --directory site
```

Then open http://127.0.0.1:5190.

## Change things safely

- **CSS or JS:** bump the `?v=` query on `style.css` and `app.js` in all three pages, so browsers pick up the new files.
- **Inline scripts:** the CSP in `site/_headers` only allows inline scripts by hash. If you add or change one, update its
  `sha256-` hash there, or it will be blocked in production. (JSON-LD data blocks are not affected.)
- **3D station:** edit `src/station/station.js`, then `cd src/station && npm install && npm run build`.
- **Contact form:** the pilot sheet is the Netlify form `contact`. Netlify detects it at deploy time from the
  `data-netlify` attribute; notifications go to hello@miraiinnovations.tech (set in the Netlify UI).

## Deploy

Hosted on Netlify (project `glowing-kashata-c5f5da`), with DNS at Hostinger. The repository is not linked to Netlify
right now: deploys are uploaded by hand under **Deploys**, from the contents of `site/`. To deploy from GitHub
instead, link this repository in Netlify. `netlify.toml` already publishes `site/` with no build command.
