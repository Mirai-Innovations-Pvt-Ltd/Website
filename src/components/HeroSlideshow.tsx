"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Slide {
  src: string;
  alt: string;
}

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

export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % SLIDES.length),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion, active]);

  return (
    <div
      className="hero-slideshow"
      role="region"
      aria-roledescription="carousel"
      aria-label="Mirai Layer in-store"
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
    </div>
  );
}
