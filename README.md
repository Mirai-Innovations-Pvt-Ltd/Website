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

- **CSS or JS:** bump the `?v=` query on `style.css`, `app.js` and `assets/molten.js` in all three pages (and on the
  station bundle in `app.js`), so browsers pick up the new files.
- **Images and video:** browsers keep files under `assets/` for a day (`site/_headers`). When you replace a picture,
  give it a new file name (or a `?v=` query) so returning visitors don't see the old one.
- **Inline scripts:** the CSP in `site/_headers` only allows inline scripts by hash. If you add or change one, update its
  `sha256-` hash there, or it will be blocked in production. (JSON-LD data blocks are not affected.)
- **3D station:** edit `src/station/station.js`, then `cd src/station && npm install && npm run build`.
- **Contact form:** the pilot sheet is the Netlify form `contact`. Netlify detects it at deploy time from the
  `data-netlify` attribute; notifications go to hello@miraiinnovations.tech (set in the Netlify UI).

## Performance rules

The page is built to stay smooth on a laptop's integrated graphics. Keep these when you change it:

- **The liquid-metal background** (`assets/molten.js`) is a live ray-traced shader. It times its own GPU work and
  renders smaller until each frame fits its budget (`budget` in `app.js`), so weak GPUs get a slightly softer metal
  instead of dropped frames. It never draws while the hero covers it. Don't change its shader text lightly: every change
  makes each visitor's GPU compile it again from scratch (several seconds, in the background).
- **The opening is the preloader.** The 3D station is built on the dark screen before the logo is written (its
  shaders then compile in the background). The rest of the setup (the first draws, the try-on, the sections' first
  layout, the metal) runs while the written logo holds still, and the logo flies once that is done (1.2 s at most).
  It only holds if the setup's files have already downloaded: it waits on work, never on the network; otherwise the
  setup runs after the landing. A slow line (or Save-Data) never holds it.
- **Very slow lines.** If the page's script hasn't run 6 s after the styles arrive, the dark screen steps aside by
  itself and the opening is skipped. The metal's script (`assets/molten.js`) loads only when the metal is needed.
- **Shadows are box-shadows, not `filter: drop-shadow`.** A drop-shadow filter on the prints held the GPU for a
  visible moment as they came into range.
- **Lite mode on weak GPUs.** While the logo holds, a few frames of the 3D station are timed on the GPU. Over 1.7 ms (a
  laptop's integrated graphics on battery, or a weaker GPU), the page goes lite: the station draws at 1x and holds
  still while it waits, and the metal holds still while the page scrolls. Add `?lite` on localhost to force it.
- **Pictures that appear mid-scroll are drawn ahead.** The close-up wall and the try-on panel sit at an invisible .2%
  opacity until needed, so their first appearance needs no rasterising; the try-on buttons use small thumbnails.
- **The scroll path reads nothing from layout.** Positions are measured once per resize (`measure()` in `app.js`);
  per-frame changes are `transform` and `opacity` only, written only when they change.
- **Scenes off screen skip their layout** (`content-visibility` in `style.css`); a jump to a section renders the page
  first so it lands true.
- **The page's width comes from the body** (`pageW()` in `app.js`). While the opening holds the page still, the root's
  `clientWidth` counts the scrollbar's reserved gutter as page, and a 3D frame built from it sits a few pixels off its
  canvas.
- **No CSS snap for a mouse or trackpad.** On a tall window the pager lands each wheel notch on the next scene or beat;
  on a short one (a 1366 × 768 laptop) the page scrolls freely. CSS proximity snap there pulled every notch back to the
  scene's start. On touch screens How it works has no snap points either: the script finishes or settles a move.
- **The stitches hold still at rest** and feed only while the page moves; the liquid metal is the one standing motion.
- **The hero's kiosk is there from the first frame.** `assets/img/hero-station.webp` is the 3D station drawn from the
  model itself at its opening pose (turned 28° away, on a 2x frame of the hall, cropped at 1584,376, 744 × 1352). It
  stands in until the live station is up, which then takes its place on the same frame. If the station's look or its
  opening pose changes, render that picture again, or the handover will show.

## Deploy

Hosted on Netlify (project `glowing-kashata-c5f5da`), with DNS at Hostinger. The repository is not linked to Netlify
right now: deploys are uploaded by hand under **Deploys**, from the contents of `site/`. To deploy from GitHub
instead, link this repository in Netlify. `netlify.toml` already publishes `site/` with no build command.
