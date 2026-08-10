import Image from "next/image";

/*
  DEV NOTE (§8) resolved: four EQUAL tiles carrying real
  photographs/captures from the build — no stock photography, no
  renders standing in as photos.

  Second pass (founder's direction): the tiles no longer carry a
  short title burned over the photograph. Each one instead holds a
  three-line note that stays out of the way until the tile is
  hovered or focused, at which point that tile expands, its
  siblings give up the width, and the note opens in the space
  revealed beside the image. `alt` still describes the photograph
  for assistive tech; `note` is the story, and it is real text in
  the DOM (not a pseudo-element or a title attribute) so it is
  reachable by keyboard and by a screen reader regardless of
  hover.
*/
const PHOTOWALK_SLOTS = [
  {
    id: "vnest",
    src: "/images/photowalk/vnest-recognition.png",
    alt: "Two Mirai team members receiving a recognition document at V-NEST, the VIT Chennai startup and research foundation",
    note: "Alongside the Director of V-NEST, on the day of our incorporation.",
  },
  {
    id: "mentors",
    src: "/images/photowalk/team-with-mentors.jpeg",
    alt: "The Mirai team standing outdoors with their mentors",
    note: "Blesson & Dhakshesh along with our mentor Janakiraman Sir, meeting Mr. R Narayanan — President of TIE Chennai & a core member of Chennai Angels.",
  },
  {
    id: "hardware",
    src: "/images/photowalk/hardware-cad-work.jpeg",
    alt: "Two team members reviewing a 3D model of the kiosk hardware on a laptop",
    note: "Kiosk development and model iterations with the Hardware Development Team.",
  },
  {
    id: "planning",
    src: "/images/photowalk/mirai-layer-planning.jpeg",
    alt: "Three team members at a whiteboard in the Mirai office, mapping the Mirai Layer v0.2.0 architecture across hardware, frontend, layer engine, and bridge",
    note: "Brainstorming the product development pipeline for our MVP launch.",
  },
];

/* Tiles no longer hold a fixed share of the row — the hovered one
   takes roughly half of it — so the widest state is what the
   browser needs to size for. */
const TILE_SIZES = "(max-width: 560px) 100vw, (max-width: 860px) 60vw, 45vw";

export default function BehindTheBuild() {
  return (
    <section className="behind-the-build" id="behind-the-build" aria-labelledby="btb-heading">
      <div className="container">
        <div className="btb-header">
          <h2 id="btb-heading">Behind the Build</h2>
          <p>A look into some of our memories along our journey.</p>
        </div>

        <div className="photowalk-row">
          {PHOTOWALK_SLOTS.map((slot) => (
            <figure key={slot.id} className="photowalk-item" tabIndex={0}>
              <div className="photowalk-media">
                <Image src={slot.src} alt={slot.alt} fill sizes={TILE_SIZES} />
              </div>
              <figcaption className="photowalk-note">
                <span>{slot.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
