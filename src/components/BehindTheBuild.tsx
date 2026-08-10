import Image from "next/image";

/*
  DEV NOTE (§8) resolved: four EQUAL tiles carrying real
  photographs/captures from the build — no stock photography, no
  renders standing in as photos. (The prototype's featured wide
  tile — "The kiosk, on the shop floor" — was retired with its
  image per the founder's direction.) The first three captions
  are the prototype's originals kept verbatim; the fourth
  describes its photo literally.
*/
const PHOTOWALK_SLOTS = [
  {
    caption: "Hardware assembly",
    src: "/images/photowalk/vnest-recognition.png",
    alt: "Two Mirai team members receiving a recognition document at V-NEST, the VIT Chennai startup and research foundation",
  },
  {
    caption: "The team, at work",
    src: "/images/photowalk/team-with-mentors.jpeg",
    alt: "The Mirai team standing outdoors with their mentors",
  },
  {
    caption: "Install day",
    src: "/images/photowalk/hardware-cad-work.jpeg",
    alt: "Two team members reviewing a 3D model of the kiosk hardware on a laptop",
  },
  {
    caption: "Planning Mirai Layer v0.2.0",
    src: "/images/photowalk/mirai-layer-planning.jpeg",
    alt: "Three team members at a whiteboard in the Mirai office, mapping the Mirai Layer v0.2.0 architecture across hardware, frontend, layer engine, and bridge",
  },
];

/* All four frames share one sizes expression now that the grid is
   uniform: 1-up, 2-up, then 4-up across the breakpoints. */
const TILE_SIZES = "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 25vw";

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
            <figure key={slot.caption} className="photowalk-item photowalk-item--photo">
              <Image src={slot.src} alt={slot.alt} fill sizes={TILE_SIZES} />
              <figcaption>{slot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
