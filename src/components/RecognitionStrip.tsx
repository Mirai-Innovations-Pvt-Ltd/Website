import Image from "next/image";

/* Institutional marks on the white band between the Hero and the
   product band. Unlike the hero's 26px credential chips (greyscale
   per §5.7), these render in each institution's own colours — the
   band is a fixed white surface in both themes (same precedent as
   the chips' fixed light background), so the marks' baked white
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
    width: 796,
    height: 345,
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
