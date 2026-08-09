import Image from "next/image";

/*
  DEV NOTE (§8) resolved: the four reserved tiles now carry real
  photographs/captures from the build — no stock photography, no
  renders standing in as photos. Captions are the prototype's
  originals, kept verbatim per the founder's direction; swap the
  caption strings here if they should describe the new photos
  more literally.
*/
const PHOTOWALK_SLOTS = [
  {
    caption: "The kiosk, on the shop floor",
    src: "/images/photowalk/kiosk-flow-design.jpeg",
    alt: "Figma design board of the Mirai kiosk interface, showing the try-on flow screens state by state",
    wide: true,
    sizes: "(max-width: 1440px) 100vw, 1264px",
  },
  {
    caption: "Hardware assembly",
    src: "/images/photowalk/vnest-recognition.png",
    alt: "Two Mirai team members receiving a recognition document at V-NEST, the VIT Chennai startup and research foundation",
    wide: false,
    sizes: "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw",
  },
  {
    caption: "The team, at work",
    src: "/images/photowalk/team-with-mentors.jpeg",
    alt: "The Mirai team standing outdoors with their mentors",
    wide: false,
    sizes: "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw",
  },
  {
    caption: "Install day",
    src: "/images/photowalk/hardware-cad-work.jpeg",
    alt: "Two team members reviewing a 3D model of the kiosk hardware on a laptop",
    wide: false,
    sizes: "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw",
  },
];

export default function BehindTheBuild() {
  return (
    <section className="behind-the-build" id="behind-the-build" aria-labelledby="btb-heading">
      <div className="container">
        <div className="btb-header">
          <h2 id="btb-heading">Behind the Build</h2>
          <p>
            A look inside the build — real photos from the studio and the shop
            floor, not mockups.
          </p>
        </div>

        <div className="photowalk-grid">
          {PHOTOWALK_SLOTS.map((slot) => (
            <figure
              key={slot.caption}
              className={
                slot.wide
                  ? "photowalk-item photowalk-item--photo photowalk-item--wide"
                  : "photowalk-item photowalk-item--photo"
              }
            >
              <Image src={slot.src} alt={slot.alt} fill sizes={slot.sizes} />
              <figcaption>{slot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
