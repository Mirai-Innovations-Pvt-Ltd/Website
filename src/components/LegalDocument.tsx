import type { LegalDoc } from "@/data/legal";

/* The full-page rendering of a legal document, for the /privacy and
   /terms routes. The overlay in LegalOverlay.tsx renders the same
   `doc` object with the same class names inside its panel, so the two
   presentations stay visually identical without sharing a component
   across the client/server boundary. */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <section className="legal-page">
      <div className="container legal-page-inner">
        <h1>{doc.title}</h1>

        <div className="legal-panel-body">
          <p className="legal-intro">{doc.intro}</p>
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
