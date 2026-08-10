import Image from "next/image";
import { TEAM } from "@/data/team";

/*
  DEV NOTE (§5.2): names, roles, headshots, and LinkedIn URLs
  (src/data/team.ts) are all real now. One launch QA item remains
  — not a design task: each linked profile must list Mirai
  Innovations as CURRENT employment before review, since reviewers
  click through to corroborate the site (§5.2 / §11's definition
  of done tracks this as its own line item).
*/
export default function TeamSection() {
  return (
    <section className="team" id="team" aria-labelledby="team-heading">
      <div className="container">
        <div className="team-header">
          <h2 id="team-heading">Meet the Minds behind Mirai</h2>
        </div>

        {/* §5.2: the founders' group photograph. The replacement frame
          is near-square rather than the panoramic one the old photo
          needed, so it no longer spans the full container — it sits
          centred at a portrait-friendly width, anchored high so the
          three faces stay well inside the crop. */}
        <div className="team-group-photo team-group-photo--photo">
          <Image
            src="/images/team/founders-portrait.jpeg"
            alt="The three Mirai founders standing together in the V-Nest co-working space"
            fill
            sizes="(max-width: 760px) 100vw, 44rem"
            priority={false}
          />
        </div>

        <div className="team-grid">
          {TEAM.map((person) => (
            <div className="team-card" key={person.name}>
              <div className="team-photo team-photo--photo">
                <Image
                  src={person.photo}
                  alt={`Portrait of ${person.name}`}
                  fill
                  sizes="(max-width: 480px) 100vw, (max-width: 780px) 50vw, 33vw"
                  style={
                    person.photoPosition
                      ? { objectPosition: person.photoPosition }
                      : undefined
                  }
                />
              </div>
              <p className="team-name">{person.name}</p>
              <p className="team-role">{person.role}</p>
              <a
                className="team-linkedin"
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.68-2.91V8.48Z" />
                </svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
