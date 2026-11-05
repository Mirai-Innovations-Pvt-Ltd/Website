# layer-website

The website of **Layer**, Mirai Innovations' walk-up virtual try-on station for fashion brands, live at
https://miraiinnovations.tech. It opens straight onto Layer and ends on one contact sheet (the pilot form).

- **Current version:** v120 (5 Nov 2026). The version is the `?v=` on `style.css` and `app.js` in the pages.
- **Test version:** https://staging-mirai-website.blesson.workers.dev (the `staging` branch).
- **Earlier site:** the previous Next.js company site is kept at the tag `nextjs-site-final`.

## The page, top to bottom

| Section | id | What it does |
|---|---|---|
| Hero | `hero` | A pinned 3D push into the station; "The fitting room, minus the room." with the brand line "Advertising that wears the shopper." and a Let's pilot key (the key steps aside on phones, where the bottom bar has it). |
| One pose | `intro` | "One pose. Every look." with a playable look picker. |
| How it works | `how` | Plays itself on the kiosk screen on its own clock while in view: a five-segment bar, a pause key and a forward key; a click on the screen, a step name or a segment jumps. It does not follow the scroll. |
| Run a pilot | `pilot` | Before / the run / after, and the Pilot 01 readout with its real figures (90% of shoppers tried on, 17 sessions an hour, 86 shoppers in one day), measured at a one-day streetwear pop-up. No client is named on the readout. |
| Pilot 01 | `drops` | Max URB_N's UN-MUTE pop-up in two scenes: the event, and the station skinned in Max's identity. |
| For brands | `brands` | "Advertising that wears the shopper": a banner vs a Layer station, and three gains. |
| Crew | `crew` | Crew mode: friends trying looks together. |
| Station | `station` | The Layer Station and its specs. |
| FAQ, Mirai, contact | `faq`, `mirai`, `contact` | Questions, the team, the pilot form. |

## What's here

| Path | What it is |
|---|---|
| `site/` | Exactly what the domain serves. Static HTML, CSS and JS: no framework, no build step. |
| `site/index.html`, `app.js`, `style.css` | The page, its behaviour and its styles. |
| `site/privacy.html`, `terms.html` | Legal pages (drafts, to be reviewed by a lawyer). Served at `/privacy` and `/terms`. |
| `site/assets/` | Images (WebP), fonts (self-hosted woff2), kiosk screen media, logos and the 3D station bundle. |
| `site/_headers` | Security headers (CSP, HSTS, frame and permissions policy) and cache rules. |
| `site/robots.txt`, `sitemap.xml` | For search engines. The page also carries schema.org data for Mirai Innovations (name, Mirai logo, contacts). |
| `wrangler.jsonc` | Cloudflare's settings: serve `site/` as static assets, run `worker/` for `/api/*` only. |
| `worker/index.js` | The only server code: `POST /api/contact`, the pilot sheet. |
| `worker/enquiries.gs` | The Google Apps Script the form hands enquiries to (a Google Sheet, and a mail to hello@). |
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
- **Contact form:** the pilot sheet posts to `/api/contact`. `worker/index.js` checks it and passes it to the Apps
  Script web app whose URL is the Worker's `FORM_HOOK` secret (set from the GitHub repo secret of the same name on
  every deploy). The script (`worker/enquiries.gs`, bound to the "Layer pilot enquiries" sheet in Google
  Drive) adds a row and mails hello@miraiinnovations.tech. Sends from the test version are marked `[test: …]`.
  Without the secret, or locally, the form offers WhatsApp or mail instead.

## Performance rules

The page is built to stay smooth on a laptop's integrated graphics. Keep these when you change it:

- **The liquid-metal background** (`assets/molten.js`) is a live ray-traced shader. It times its own GPU work and
  renders smaller until each frame fits its budget (`budget` in `app.js`), so weak GPUs get a slightly softer metal
  instead of dropped frames. It never draws while the hero covers it. Don't change its shader text lightly: every change
  makes each visitor's GPU compile it again from scratch (several seconds, in the background).
- **No opening.** The page opens straight on the hero (since v118). The 3D station, the try-on and the metal set up
  from the first frames; `assets/img/hero-station.webp` stands in until the live station is up. The metal's script
  (`assets/molten.js`) loads only when the metal is needed.
- **Shadows are box-shadows, not `filter: drop-shadow`.** A drop-shadow filter on the prints held the GPU for a
  visible moment as they came into range.
- **Lite mode on weak GPUs.** For a second and a half after load the page times its own frames (and the station's GPU
  work where the browser allows). If they can't hold a steady pace (a laptop's integrated graphics on battery, or a
  weaker GPU), the page goes lite: the station draws at 1x and holds still while it waits, and the metal holds still
  while the page scrolls. Add `?lite` on localhost to force it.
- **Pictures that appear mid-scroll are drawn ahead.** The try-on panel sits at an invisible .2% opacity until needed,
  so its first appearance needs no rasterising; the try-on buttons use small thumbnails.
- **The scroll path reads nothing from layout.** Positions are measured once per resize (`measure()` in `app.js`);
  per-frame changes are `transform` and `opacity` only, written only when they change.
- **Scenes off screen skip their layout** (`content-visibility` in `style.css`); a jump to a section renders the page
  first so it lands true.
- **The page's width comes from the body** (`pageW()` in `app.js`). While the opening holds the page still, the root's
  `clientWidth` counts the scrollbar's reserved gutter as page, and a 3D frame built from it sits a few pixels off its
  canvas.
- **No CSS snap for a mouse or trackpad.** A mouse-wheel notch lands on the next scene; trackpads and touch keep the
  browser's own momentum. CSS snap pulled every notch back to the scene's start and is not used.
- **The stitches hold still at rest** and feed only while the page moves; the liquid metal is the one standing motion.
- **The hero's kiosk is there from the first frame.** `assets/img/hero-station.webp` is the 3D station drawn from the
  model itself at its opening pose (turned 28° away, on a 2x frame of the hall, cropped at 1584,376, 744 × 1352). It
  stands in until the live station is up, which then takes its place on the same frame. If the station's look or its
  opening pose changes, render that picture again, or the handover will show.

## Check a change

`tools/site_check.py` loads a version of the site in headless Microsoft Edge at laptop (1366 × 768), tablet (820 × 1180)
and phone (390 × 844) sizes and reports script errors, failed requests, sideways scroll, the section order, whether How
it works plays, and (on the laptop) where real mouse-wheel notches land. It saves screenshots of the hero, How it works,
the pilot readout and Pilot 01.

```bash
pip install websocket-client
python tools/site_check.py local out/                                         # this folder's site/, served locally
python tools/site_check.py https://staging-mirai-website.blesson.workers.dev/ out/   # the test version
python tools/site_check.py https://miraiinnovations.tech/ out/                # live
```

Run it on the test version before every push to `main`, and on live right after. "ALL OK" means every size passed.

## Deploy

Hosted on Cloudflare (Workers static assets, free plan), project `mirai-website`; the domain's DNS is on Cloudflare
too (registrar: Hostinger). GitHub Actions deploys from this repository (`.github/workflows/deploy.yml`, using the
repo secret `CLOUDFLARE_API_TOKEN`):

- **Live:** a push to `main` goes to https://miraiinnovations.tech.
- **Test version:** a push to `staging` updates its own preview link (`staging-mirai-website.blesson.workers.dev`).
  Check changes there first, then merge into `main`.
- **Rule:** nothing goes to `main` (live) until Blesson has reviewed it on the test version. A local `pre-push` hook can
  enforce this: it refuses a push to `main` unless `LAYER_LIVE_OK=yes` is set for that push.

Static requests are free and unlimited, so deploys and test pushes cost nothing. Email (Google Workspace MX, SPF,
DKIM, DMARC) stays in Cloudflare's DNS as it was; keep Cloudflare Email Routing and Email Obfuscation off (the CSP
would block the obfuscation script).
