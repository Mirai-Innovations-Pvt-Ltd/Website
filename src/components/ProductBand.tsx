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
              Mirai Layer renders the garment on the customer in seconds. The
              customer stands in front of the display, sees the result, and
              decides — no fitting room, no waiting.
            </p>
          </div>

          <div className="recording-video-wrap">
            <figure className="recording-video">
              <DemoVideo />
            </figure>
          </div>
        </div>
      </div>

      {/* 3B: Interactive Selector */}
      <VtonSelector />
    </section>
  );
}
