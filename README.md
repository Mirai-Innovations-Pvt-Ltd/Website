# Mirai Innovations — marketing site

Production implementation of the Mirai Innovations single-file HTML prototype as a
**Next.js (App Router) + TypeScript + Tailwind CSS + React** application. The
prototype is the single source of truth for design, content, interactions, and
responsive behavior — this codebase reproduces it faithfully and adds only what a
multi-page production app requires (routing, an API endpoint, self-hosted fonts).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (type-checks + lints)
npm start        # serve the production build
```

## Project structure

```
src/
  app/
    layout.tsx            Root layout: fonts (next/font), metadata, skip link,
                          header + footer on every page (§5.3)
    page.tsx              Home page — composes the section components
    globals.css           The prototype's full design system, preserved verbatim
    icon.svg              Favicon (same artwork as the prototype's data URI)
    privacy/page.tsx      Reserved-slot page (see "Pending before launch")
    terms/page.tsx        Reserved-slot page (see "Pending before launch")
    api/contact/route.ts  Contact form endpoint (validation + logging)
  components/
    SiteHeader.tsx        Sticky nav, mobile <details> menu, CTA
    ThemeToggle.tsx       Light/dark toggle (client) — light default, no persistence
    Hero.tsx              Atmosphere layers, noise, headline, credentials
    HeroSlideshow.tsx     Full-bleed photo carousel behind the hero copy
                          (client): autoplay + fade, hover/focus pause,
                          arrows + dots, scrim overlay, reduced-motion aware
    ProductBand.tsx       Screen recording + How It Works + selector
    DemoVideo.tsx         The embedded try-on screen recording (client):
                          muted autoplay loop, reduced-motion aware
    VtonSelector.tsx      Interactive try-on selector (client)
    RetailerBenefits.tsx
    BehindTheBuild.tsx    Photowalk reserved slots
    TeamSection.tsx
    ContactSection.tsx    Form (client) posting to /api/contact
    SiteFooter.tsx        Legal/entity footer (§5.3)
  data/
    vton.ts               Selector result matrix + helpers — extending the
                          matrix is a data change, not a rebuild (§5.1b)
    team.ts               Team members
public/images/            Reserved credential logo slots (see README there)
```

## Architecture decisions

- **The prototype stylesheet is preserved, not atomized into utilities.**
  `globals.css` carries the prototype's hand-tuned design system verbatim —
  clamp() type scale, color-mix() hover derivation, masked atmosphere layers,
  order-dependent theme overrides — including its intent-bearing comments.
  Transcribing ~1,700 lines into utility classes would be pure fidelity risk
  with no functional gain. Tailwind v4 is fully integrated (PostCSS pipeline,
  preflight, utilities available for net-new structural styling); the design
  system rides on top as unlayered CSS so it always wins over Tailwind's
  layered base styles.
- **Fonts** are the same three families (Space Grotesk, Inter, JetBrains Mono),
  self-hosted at build time via `next/font` instead of runtime Google Fonts
  requests — no visual change, better performance and privacy.
- **Theme behavior matches the prototype deliberately**: light is the default
  regardless of system preference, and the dark override is not persisted
  across reloads. Do not "fix" this without product sign-off.
- **Vanilla JS → React**: the selector's data-driven rendering (including its
  exact initials derivation and the 90ms caption fade), the theme toggle's
  ARIA syncing, and the team rendering are reimplemented as typed React state
  with identical behavior.
- **Nav anchors are `/#section` instead of `#section`** — the one adaptation
  needed now that /privacy and /terms exist as routes; on the home page the
  behavior is identical (fragment navigation, CSS smooth scrolling,
  88px scroll-margin under the sticky header).
- **Contact form** posts to `/api/contact` (replacing the prototype's
  `action="#"` structural placeholder, as its own DEV NOTE requires). The
  route validates input and currently logs submissions server-side; the
  delivery channel is a marked integration point.

## Pending before launch (from the prototype's DEV NOTEs)

Every reserved slot below is functional and clearly labeled in the UI; drop in
the real asset and the styling/interaction is already correct.

| Item | Where | What's needed |
| --- | --- | --- |
| ~~Screen recording~~ — **integrated** | `public/videos/try-on-demo.mp4`, `DemoVideo.tsx` | Done (630×1138 native, muted autoplay loop, no letterbox). Optional pre-launch: transcode the 20 MB file to ~2–3 Mbps H.264 and add a poster frame (needs ffmpeg). |
| Selector result imagery | `VtonSelector.tsx` / `data/vton.ts` | Pre-generated image per combination in the result frame. |
| Credential logos | `public/images/*.png` | Real DPIIT mark + V-Nest crest (same filenames; CSS renders them greyscale). |
| ~~Photowalk photos (×4)~~ — **integrated** | `public/images/photowalk/`, `BehindTheBuild.tsx` | Done. Captions kept verbatim from the prototype — reword in `PHOTOWALK_SLOTS` if they should describe the new photos more literally. |
| ~~Team photos~~ — **integrated** | `TeamSection.tsx`, `public/images/team/` | Done: group photograph + all three founder headshots. |
| ~~Team LinkedIn URLs~~ — **integrated** | `data/team.ts` | Done — all three real profile URLs in place. Launch QA (§5.2): confirm each profile lists Mirai as current employment. |
| ~~Company LinkedIn URL~~ — **integrated** | `SiteFooter.tsx` | Done — links to linkedin.com/company/miraiinnovations. |
| Contact delivery — **implemented, needs credentials** | `api/contact/route.ts`, `.env.example` | Full Resend integration in place (Reply-To = submitter, timestamped, recipient hello@miraiinnovations.tech). Set `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` (see below), then test delivery from an external address (§5.6/§11). Until then the API returns an honest "not configured" error and logs submissions server-side. |
| Privacy Policy / Terms of Use | `app/privacy`, `app/terms` | Real legal documents replace the reserved blocks. |

## Email delivery configuration

The contact form delivers through [Resend](https://resend.com) (REST API,
no SDK dependency). Copy `.env.example` to `.env.local` (or set the same
variables in the hosting dashboard) and fill in:

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Resend API key (verify the `miraiinnovations.tech` domain in Resend first). |
| `CONTACT_FROM_EMAIL` | yes | Verified sender identity, e.g. `Mirai Website <noreply@miraiinnovations.tech>`. |
| `CONTACT_TO_EMAIL` | no | Recipient override; defaults to `hello@miraiinnovations.tech`. |

All variables are read server-side only — no secret ever reaches the
client. Until the two required variables are set, submissions are logged
on the server and the form shows an honest "not configured" error instead
of a fake success. The received email contains the sender's name, email,
message, and submission timestamp (IST + UTC), with Reply-To set to the
sender so replying reaches them directly.

## Verification performed

- `npm run build` passes with zero TypeScript/ESLint errors; all routes
  prerender (API route dynamic).
- Production server smoke-tested (`npm start`): home SSR content, `/privacy`,
  `/terms`, and `POST /api/contact` all verified.
- Browser-tested: theme toggle (including the Behind the Build white-surface
  inversion in dark mode), selector state machine across gender/subject/garment
  (exact prototype behavior incl. reset-on-gender-switch), contact form
  (native validation, success + error states, server log), hash navigation with
  88px sticky-header offset, skip link, mobile `<details>` menu.
- Responsive-tested at 375 / 768 / 1280: all prototype breakpoints
  (480/560/640/780/860/900) collapse exactly as specified; no horizontal
  overflow at any tested width.
- SEO/a11y: title, meta description, theme-color, favicon, `lang="en"`,
  landmark roles, labeled controls, `aria-pressed` states, `aria-live` result
  frame, reduced-motion and print guards all in place.
