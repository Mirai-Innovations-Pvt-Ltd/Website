import DemoVideo from "@/components/DemoVideo";
import VtonSelector from "@/components/VtonSelector";

export default function ProductBand() {
  return (
    <section className="product-band" id="product" aria-labelledby="product-band-heading">
      {/* 3A: Screen Recording */}
      <div className="container">
        <h2 className="product-band-label sr-only" id="product-band-heading">
          Mirai Layer
        </h2>

        <div className="recording-row">
          <div className="recording-text">
            <p className="recording-lead">The core experience, live.</p>
            <p className="recording-caption">
              A customer stands in front of the kiosk, selects a garment, and
              sees it rendered on themselves in seconds — recorded unedited, on
              the actual retail hardware.
            </p>
          </div>

          <div className="recording-video-wrap">
            {/*
              §5.1a fulfilled: the real screen recording
              (public/videos/try-on-demo.mp4, 630×1138 native),
              embedded and playing inline — muted autoplay loop per
              the slot's DEV NOTE, no off-domain link, native
              portrait ratio preserved (never letterboxed into
              16:9). The play affordance is replaced by the real
              <video>; the frame chrome (corners + spec readout)
              stays, now overlaying the footage.
            */}
            <figure className="recording-video">
              <DemoVideo />
              <span className="video-corner video-corner--tl" aria-hidden="true"></span>
              <span className="video-corner video-corner--br" aria-hidden="true"></span>
              <span className="video-spec" aria-hidden="true">630 × 1138</span>
            </figure>
          </div>
        </div>
      </div>

      {/* How It Works (nested — sits between the video and the
          selector per founder direction, right above "Try it on
          Mirai Layer") */}
      <section className="how-it-works" aria-labelledby="how-it-works-heading">
        <div className="container">
          <div className="how-it-works-inner">
            <h2 id="how-it-works-heading">How it works</h2>
            <p>
              Mirai Layer renders the garment on the customer in seconds. The
              customer stands in front of the display, sees the result, and
              decides — no fitting room, no waiting.
            </p>
          </div>
        </div>
      </section>

      {/* 3B: Interactive Selector */}
      <VtonSelector />
    </section>
  );
}
