"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Slide {
  src: string;
  alt: string;
}

/* In-situ photography for the hero backdrop (per the founder's
   reference). Swapping or extending the set is a data change. */
const SLIDES: Slide[] = [
  {
    src: "/images/hero/kiosk-shop-floor.png",
    alt: "A shopper standing at the Mirai kiosk on a retail shop floor, viewing a garment rendered on the display",
  },
  {
    src: "/images/hero/garment-select.png",
    alt: "A close-up of a hand selecting a garment card on the kiosk's touch display",
  },
  {
    src: "/images/hero/try-on-mirror.png",
    alt: "A shopper reviewing try-on results on the kiosk's full-length display",
  },
];

const AUTOPLAY_INTERVAL_MS = 5000;

/**
 * Full-bleed slideshow behind the hero copy. Renders as an
 * absolutely positioned backdrop inside the hero section; the
 * text column overlays it (see globals.css "HERO SLIDESHOW").
 * Hovering the photograph or focusing the controls pauses the
 * autoplay; reduced-motion users get no autoplay at all.
 */
export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* `active` in the deps restarts the clock after ANY slide
     change, so a manual pick gets a full interval before the
     autoplay advances again. */
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % SLIDES.length),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, active]);

  function goTo(index: number) {
    setActive((index + SLIDES.length) % SLIDES.length);
  }

  return (
    <div
      className="hero-slideshow"
      role="region"
      aria-roledescription="carousel"
      aria-label="Mirai Layer in-store"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className={
            index === active ? "hero-slide hero-slide--active" : "hero-slide"
          }
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${SLIDES.length}`}
          aria-hidden={index !== active}
        >
          {/* loading="eager" on every slide: the inactive ones sit
              at opacity 0, so lazy loading would defer them and the
              first automatic transition could fade into a
              still-fetching frame. */}
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            loading="eager"
          />
        </div>
      ))}

      <div className="hero-slideshow-scrim" aria-hidden="true"></div>

      <div className="hero-slideshow-controls">
        <button
          type="button"
          className="hero-slideshow-arrow"
          aria-label="Previous slide"
          onClick={() => goTo(active - 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="hero-slideshow-dots">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className="hero-slideshow-dot"
              aria-pressed={index === active}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goTo(index)}
            >
              <span aria-hidden="true"></span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="hero-slideshow-arrow"
          aria-label="Next slide"
          onClick={() => goTo(active + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
