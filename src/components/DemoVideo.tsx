"use client";

import { useEffect, useRef } from "react";

/**
 * The real §5.1a screen recording, filling the recording slot as
 * its DEV NOTE prescribed: embedded, playing inline, muted
 * autoplay loop, native portrait ratio preserved (630×1138 —
 * never letterboxed or cropped). No controls: it is an ambient
 * product loop, not a media player.
 *
 * A client component for one reason: React does not serialize the
 * `muted` attribute into server-rendered markup, so browsers can
 * refuse the pre-hydration autoplay attempt — the effect re-asserts
 * muted and retries play() once after mount. It also honors
 * prefers-reduced-motion by leaving the video parked on its first
 * frame instead of auto-playing.
 */
export default function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    video.muted = true;
    video.play().catch(() => {
      /* Autoplay denied (e.g. data-saver mode): the video simply
         stays on its first frame inside the styled device frame. */
    });
  }, []);

  return (
    <video
      ref={ref}
      src="/videos/try-on-demo.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Screen recording of the Mirai Layer try-on flow, captured from the kiosk"
    />
  );
}
