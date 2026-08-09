import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Mirai Innovations",
};

/* Reserved-slot page: the prototype's footer links to /terms on
   every page (§5.3), and §5.6 forbids dead links — so the route
   exists, clearly marked as pending the real legal document. */
export default function TermsPage() {
  return (
    <section className="legal-page">
      <div className="container">
        <h1>Terms of Use</h1>
        <div className="legal-reserved">
          <p>
            <strong>Reserved</strong> — the Terms of Use for Mirai Innovations
            Private Limited are being prepared and will be published on this
            page.
          </p>
          <p>
            Until then, questions can be sent to{" "}
            <a href="mailto:hello@miraiinnovations.tech">
              hello@miraiinnovations.tech
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
