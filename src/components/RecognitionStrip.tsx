import Image from "next/image";

/* Institutional marks on the white band between the Hero and the
   product band — the site's third-party validation (it replaced
   the hero's in-column greyscale credential chips). Full colour,
   an intentional §5.7 exception for this band only; the band is a
   fixed white surface in both themes, so the marks' baked white
   backgrounds disappear into it. Files are the trimmed exports in
   public/images (see the README there). */
const MARKS = [
  {
    src: "/images/dpiit-mark.png",
    alt: "Recognized by DPIIT — Department for Promotion of Industry and Internal Trade",
    width: 582,
    height: 583,
  },
  {
    src: "/images/vnest-mark.png",
    alt: "V-Nest — VIT Chennai Startup and Research Foundation",
    width: 745,
    height: 410,
  },
  {
    src: "/images/startupindia-mark.png",
    alt: "#startupindia — Government of India, Ministry of Commerce and Industry",
    width: 800,
    height: 340,
  },
  {
    src: "/images/298-2985895_google-cloud-for-startups-hd-png-download.png",
    alt: "Google Cloud for Startups",
    width: 1200,
    height: 360,
  },
];

export default function RecognitionStrip() {
  return (
    <section
      className="recognition-strip"
      data-component="recognition-strip"
      aria-label="Recognitions and incubation"
    >
      <div className="container">
        <ul className="recognition-strip-row">
          {MARKS.map((mark) => (
            <li key={mark.src}>
              <Image
                src={mark.src}
                alt={mark.alt}
                width={mark.width}
                height={mark.height}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
