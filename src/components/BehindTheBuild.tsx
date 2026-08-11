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
    note: "Marking our incorporation, alongside Dr Sasikumar, Director V-Nest",
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

/* Two per row, and the hovered one takes about three-quarters of
   its row — so the widest state is what the browser needs to size
   for. */
const TILE_SIZES = "(max-width: 720px) 100vw, 70vw";

/* Two flex rows of two rather than one four-column grid. The grid
   would give the 2x2 shape too, but flex-grow only redistributes
   space inside a single flex line — laying the pairs out as real
   rows is what keeps the "hovered tile grows, its neighbour yields"
   behaviour working now that the tiles are stacked 2x2. */
const ROWS = [PHOTOWALK_SLOTS.slice(0, 2), PHOTOWALK_SLOTS.slice(2, 4)];

export default function BehindTheBuild() {
  return (
    <section className="behind-the-build" id="behind-the-build" aria-labelledby="btb-heading">
      <div className="container">
        <div className="btb-header">
          <h2 id="btb-heading">Behind the Build</h2>
          <p>A look into some of our memories along our journey.</p>
        </div>

        <div className="photowalk-grid">
          {ROWS.map((row, rowIndex) => (
            <div className="photowalk-row" key={rowIndex}>
              {row.map((slot) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
