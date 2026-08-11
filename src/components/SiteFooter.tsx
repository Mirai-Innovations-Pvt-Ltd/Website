import { LegalLink, LegalProvider } from "@/components/LegalOverlay";

/*
  DEV NOTE (§5.3): entity name, CIN, DPIIT number, registered
  office address, and phone are real values. §5.3 requires the
  entity name, CIN, both addresses, "Operations: V-Nest Technology
  Business Incubator, VIT Chennai", email, phone, company LinkedIn,
  Privacy Policy, Terms of Use, and copyright line on EVERY page —
  which is why this footer renders from the root layout. PAN is
  deliberately excluded per §5.3 — no credibility benefit, real
  misuse risk. Do not add it even if it seems more "complete."
*/
export default function SiteFooter() {
  return (
    <LegalProvider>
      <footer className="site-footer">
      <div className="container">
        <div className="footer-columns">
          <div>
            <h3 className="footer-entity-name">Mirai Innovations Private Limited</h3>
            <p>CIN: U23101TN2025PTC184733</p>
            <p>DPIIT Recognised · DIPP243441</p>
            <p>
              Registered office: 6/1, Venkateshwara Colony Main Road, Periyar
              Nagar, Bank Colony, Kodungaiyur, Chennai, Tamil Nadu, India,
              600051
            </p>
            <p>Operations: V-Nest Technology Business Incubator, VIT Chennai</p>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="mailto:hello@miraiinnovations.tech">
              hello@miraiinnovations.tech
            </a>
            <a href="tel:+916383410936">+91 6383 410936</a>
            <a
              href="https://www.linkedin.com/company/miraiinnovations/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Company LinkedIn
            </a>
          </div>
          <div>
            <h3>Legal</h3>
            <LegalLink doc="privacy">Privacy Policy</LegalLink>
            <LegalLink doc="terms">Terms of Use</LegalLink>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Mirai Innovations Private Limited. All rights reserved.</span>
          <div className="footer-bottom-links">
            <LegalLink doc="privacy">Privacy</LegalLink>
            <LegalLink doc="terms">Terms</LegalLink>
          </div>
        </div>
      </div>
      </footer>
    </LegalProvider>
  );
}
