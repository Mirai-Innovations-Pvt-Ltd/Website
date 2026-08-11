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
    privacy/page.tsx      Privacy Policy (renders src/data/legal.ts)
    terms/page.tsx        Terms of Use (renders src/data/legal.ts)
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
    ContactSection.tsx    Form (client) posting to Netlify Forms
    LegalOverlay.tsx      Privacy/Terms modal + footer trigger links (client)
    LegalDocument.tsx     Same documents rendered as a full page
    SiteFooter.tsx        Legal/entity footer (§5.3)
  data/
    vton.ts               Selector result matrix + helpers — extending the
                          matrix is a data change, not a rebuild (§5.1b)
    team.ts               Team members
    legal.ts              Privacy Policy + Terms of Use copy (one source
                          for both the overlay and the routes)
public/__forms.html       Netlify Forms declaration — see "Contact form"
public/images/            Photography and institutional marks (see README there)
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
- **Contact form uses Netlify Forms, not a route of our own.** It previously
  posted to an `/api/contact` route that relayed through Resend; that was
  removed in favour of the platform's own form handling, which brings spam
  filtering and a stored, exportable submission record, and needs no API key
  or DNS work. The trade accepted knowingly: it only works on Netlify, and
  the notification comes from Netlify's sender rather than our own domain.
  See "Contact form" below for the mechanics.

## Pending before launch (from the prototype's DEV NOTEs)

Every reserved slot below is functional and clearly labeled in the UI; drop in
the real asset and the styling/interaction is already correct.

| Item | Where | What's needed |
| --- | --- | --- |
| ~~Screen recording~~ — **integrated** | `public/videos/try-on-demo.mp4`, `DemoVideo.tsx` | Done (630×1138 native, muted autoplay loop, no letterbox). Optional pre-launch: transcode the 20 MB file to ~2–3 Mbps H.264 and add a poster frame (needs ffmpeg). |
| Selector result imagery | `VtonSelector.tsx` / `data/vton.ts` | Pre-generated image per combination in the result frame. |
| ~~Credential logos~~ — **integrated** | `public/images/*.png`, `RecognitionStrip.tsx` | Done — real DPIIT + V-Nest + Startup India marks (white margins trimmed from the source exports), shown full-colour in the recognition strip below the hero. The hero's in-column greyscale chips and "No pricing · No waitlist" note were removed at the founder's direction. |
| ~~Photowalk photos (×4)~~ — **integrated** | `public/images/photowalk/`, `BehindTheBuild.tsx` | Done. Captions kept verbatim from the prototype — reword in `PHOTOWALK_SLOTS` if they should describe the new photos more literally. |
| ~~Team photos~~ — **integrated** | `TeamSection.tsx`, `public/images/team/` | Done: group photograph + all three founder headshots. |
| ~~Team LinkedIn URLs~~ — **integrated** | `data/team.ts` | Done — all three real profile URLs in place. Launch QA (§5.2): confirm each profile lists Mirai as current employment. |
| ~~Company LinkedIn URL~~ — **integrated** | `SiteFooter.tsx` | Done — links to linkedin.com/company/miraiinnovations. |
| Contact delivery — **integrated** | `ContactSection.tsx`, `public/__forms.html` | Netlify Forms. One dashboard step remains: set the notification recipient to hello@miraiinnovations.tech under Forms > Form notifications, then test from an external address (§5.6/§11). |
| ~~Privacy Policy / Terms of Use~~ — **integrated** | `data/legal.ts`, `LegalOverlay.tsx`, `app/privacy`, `app/terms` | Done — real documents, shown as a footer overlay and at their own routes. Have counsel review before any funding or compliance review, and revisit the Cookies / Third parties clauses if an analytics script, embed, or chat widget is ever added. |

## Contact form (Netlify Forms)

Netlify discovers forms by parsing **static HTML at deploy time**. This
site's form is a React client component, so it is invisible to that
detector — `public/__forms.html` is the declaration Netlify actually
reads, and it is why the form works at all.

Three things must stay in sync, and nothing fails loudly if they drift:

1. **Field names** in `ContactSection.tsx` must all appear in
   `public/__forms.html`. A field missing there is silently dropped from
   the stored submission.
2. **The POST target is `/__forms.html`**, not the page's own URL.
3. **The body is url-encoded, not JSON**, and includes `form-name`.
   Netlify's handler does not parse JSON — it would accept the request
   and record an empty submission.

`bot-field` is a honeypot: hidden from people, filled in by naive bots,
discarded by Netlify. It is removed from the layout with `display: none`
rather than positioned off-screen, so password managers don't autofill
it and get a real enquiry classified as spam.

**Local `next dev` has no Netlify edge, so submitting locally will fail.**
That is expected — test on a deploy preview or production.

No API keys, environment variables, or DNS records are involved. The
recipient is configured in the Netlify UI (Forms > Form notifications),
not in this repository.

## Verification performed

- `npm run build` passes with zero TypeScript/ESLint errors; all routes
  prerender.
- Production server smoke-tested (`npm start`): home SSR content, `/privacy`
  and `/terms` verified. Form delivery cannot be verified locally — Netlify
  Forms only exists on a deploy.
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
