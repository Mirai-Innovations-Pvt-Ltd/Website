import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Mirai Innovations",
};

/* Reserved-slot page: the prototype's footer links to /privacy on
   every page (§5.3), and §5.6 forbids dead links — so the route
   exists, clearly marked as pending the real legal document. */
export default function PrivacyPage() {
  return (
    <section className="legal-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <div className="legal-reserved">
          <p>
            <strong>Reserved</strong> — the Privacy Policy for Mirai
            Innovations Private Limited is being prepared and will be published
            on this page.
          </p>
          <p>
            Until then, questions about data and privacy can be sent to{" "}
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
