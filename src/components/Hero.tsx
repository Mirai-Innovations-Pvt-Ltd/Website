import HeroSlideshow from "@/components/HeroSlideshow";

export default function Hero() {
  return (
    <section className="hero" data-component="hero" aria-labelledby="hero-heading">
      <div className="hero-atmosphere" aria-hidden="true"></div>
      <div className="hero-fill-light" aria-hidden="true"></div>
      <svg
        className="hero-noise"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="mirai-hero-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#mirai-hero-noise-filter)" />
      </svg>

      {/* Full-bleed backdrop: paints over the atmosphere/noise
          layers; the content column below overlays it (z-index 2). */}
      <HeroSlideshow />

      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-kicker">Interactive kiosks for physical retail</p>

            <h1 className="hero-heading" id="hero-heading">
              <span className="line-soft">Mirai builds</span>
              <span className="line-strong">
                interactive kiosks that help customers decide in-store.
              </span>
            </h1>

            <p className="hero-subhead">
              A shopper stands in front of the display, sees the garment on
              themselves, and buys with confidence — no more guessing from a
              hanger.
            </p>

            <div className="hero-actions" role="group" aria-label="Primary action">
              <span className="hero-actions-note">No pricing · No waitlist</span>
            </div>

            <div className="hero-credentials" aria-label="Credentials">
              <a
                className="credential-item"
                href="https://www.startupindia.gov.in/content/sih/en/search.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="credential-logo" aria-hidden="true">
                  {/* Reserved slot: replace public/images/dpiit-mark.png with the
                      real DPIIT recognition mark (rendered greyscale via CSS). */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- 26px static credential mark; exact prototype rendering (CSS grayscale filter) on a plain <img> */}
                  <img src="/images/dpiit-mark.png" alt="" width={26} height={26} loading="lazy" />
                </span>
                <span className="credential-text">DPIIT Recognised · DIPP243441</span>
              </a>

              <span className="credential-divider" aria-hidden="true"></span>

              <span className="credential-item">
                <span className="credential-logo" aria-hidden="true">
                  {/* Reserved slot: replace public/images/vnest-mark.png with the
                      real V-Nest incubation crest (rendered greyscale via CSS). */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- 26px static credential mark; exact prototype rendering (CSS grayscale filter) on a plain <img> */}
                  <img src="/images/vnest-mark.png" alt="" width={26} height={26} loading="lazy" />
                </span>
                <span className="credential-text">
                  Incubated at V-Nest Technology Business Incubator, VIT Chennai
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
