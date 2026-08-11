import Image from "next/image";
import { TEAM } from "@/data/team";

/*
  DEV NOTE (§5.2): names, roles, headshots, and LinkedIn URLs
  (src/data/team.ts) are all real and complete. One launch QA item
  remains — not a design task: each linked profile must list Mirai
  Innovations as CURRENT employment before review, since reviewers
  click through to corroborate the site (§5.2 / §11).

  Layout: the group photograph and the individual profiles are ONE
  composition now, not two stacked blocks. Two profiles orbit each side
  of the photo, alternately nudged in and out so each column reads as an
  arrangement rather than a list. The nudges live in CSS (--nudge-x /
  --nudge-y, assigned by :nth-child) rather than as inline transforms,
  for two reasons: the card's hover lift also writes to `transform`, so
  a second author of that property would simply overwrite the first;
  and the responsive layout needs to zero the offsets out, which it
  can't do to an inline style without !important.
*/
function TeamCard({ person }: { person: (typeof TEAM)[number] }) {
  return (
    <div className="team-card">
      <div className="team-photo team-photo--photo">
        <Image
          src={person.photo}
          alt={`Portrait of ${person.name}`}
          fill
          sizes="9.5rem"
          style={
            person.photoPosition
              ? { objectPosition: person.photoPosition }
              : undefined
          }
        />
      </div>
      <p className="team-name">{person.name}</p>
      <p className="team-role">{person.role}</p>
      {person.linkedin && (
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
      )}
    </div>
  );
}

export default function TeamSection() {
  const left = TEAM.slice(0, 2);
  const right = TEAM.slice(2);

  return (
    <section className="team" id="team" aria-labelledby="team-heading">
      <div className="container">
        <div className="team-header">
          <h2 id="team-heading">Meet the Minds behind Mirai</h2>
        </div>

        <div className="team-layout">
          <div className="team-orbit team-orbit--left">
            {left.map((person) => (
              <TeamCard key={person.name} person={person} />
            ))}
          </div>

          <div className="team-group-photo team-group-photo--photo">
            <Image
              src="/images/team/founders-portrait.jpeg"
              alt="The three Mirai founders standing together in the V-Nest co-working space"
              fill
              sizes="(max-width: 1000px) 100vw, 34rem"
            />
          </div>

          <div className="team-orbit team-orbit--right">
            {right.map((person) => (
              <TeamCard key={person.name} person={person} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
