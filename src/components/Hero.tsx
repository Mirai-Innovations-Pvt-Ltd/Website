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
          </div>
        </div>
      </div>
    </section>
  );
}
