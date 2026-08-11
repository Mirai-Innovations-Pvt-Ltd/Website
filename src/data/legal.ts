/**
 * Privacy Policy and Terms of Use (§5.3).
 *
 * These replace the "reserved slot" placeholders the footer used to
 * link to. They are standard, general-purpose documents written to
 * match what this site actually does — a contact form that emails
 * hello@miraiinnovations.tech, server logs, and no analytics or
 * advertising trackers of any kind (verify that is still true before
 * changing anything in src/app/layout.tsx).
 *
 * IMPORTANT: general documents are not legal advice. Have counsel
 * review both before the site is used in a funding or compliance
 * review, and revisit the Cookies and Third parties clauses the
 * moment an analytics script, embed, or chat widget is added.
 *
 * One source of truth: the footer overlays and the /privacy and
 * /terms routes both render from here.
 */

export type LegalDocId = "privacy" | "terms";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  intro: string;
  sections: LegalSection[];
}

const CONTACT_LINE =
  "Mirai Innovations Private Limited, 6/1, Venkateshwara Colony Main Road, Periyar Nagar, Bank Colony, Kodungaiyur, Chennai, Tamil Nadu 600051, India. Email: hello@miraiinnovations.tech.";

export const PRIVACY: LegalDoc = {
  id: "privacy",
  title: "Privacy Policy",
  intro:
    "Mirai Innovations Private Limited (“Mirai”, “we”, “us”) operates this website. This policy explains what personal information we collect through it, why we collect it, and what you can ask us to do with it.",
  sections: [
    {
      heading: "Information you give us",
      body: [
        "The contact form on this site asks for your name, your email address, and your message. We collect only what you type into it. There is no account to create and no payment information is ever requested or handled on this site.",
        "If you email or call us directly using the details in the footer, we hold that correspondence for as long as it takes to deal with your enquiry and to keep a reasonable business record of it.",
      ],
    },
    {
      heading: "Information collected automatically",
      body: [
        "Like most websites, our hosting provider records standard technical information when a page is requested — IP address, browser and device type, the page requested, and the date and time. These logs are used to keep the site available and secure, and to diagnose faults.",
      ],
    },
    {
      heading: "Cookies and tracking",
      body: [
        "This site does not use advertising cookies, third-party analytics, or cross-site tracking of any kind. We do not build profiles of visitors and we do not run a consent banner because there is nothing to consent to. If that changes, this policy will be updated before the change goes live.",
      ],
    },
    {
      heading: "How we use your information",
      body: [
        "To reply to your enquiry and to continue a conversation you have started with us; to operate, secure, and improve this website; and to comply with any legal obligation that applies to us.",
        "We do not sell your personal information, and we do not use it to send marketing you did not ask for.",
      ],
    },
    {
      heading: "Who else sees it",
      body: [
        "Our website host and our email provider process this data on our behalf so that the site can be served and your message can reach us. They act on our instructions and are not permitted to use your information for their own purposes.",
        "We may disclose information where we are required to by law, or where it is necessary to establish, exercise, or defend a legal claim.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Enquiries are kept for as long as needed to deal with them and for a reasonable period afterwards as a business record. Server logs are kept for a short operational period. You can ask us to delete your enquiry sooner.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask us for a copy of the personal information we hold about you, ask us to correct it if it is wrong, ask us to delete it, or withdraw a consent you have given. Write to the email address below and we will respond within a reasonable period.",
      ],
    },
    {
      heading: "Security",
      body: [
        "This site is served over HTTPS and we take reasonable technical and organisational measures to protect the information we hold. No method of transmission over the internet is completely secure, so please do not send sensitive personal information through the contact form.",
      ],
    },
    {
      heading: "Children",
      body: [
        "This site is intended for a business audience and is not directed at children. We do not knowingly collect personal information from children.",
      ],
    },
    {
      heading: "Changes and contact",
      body: [
        "We may update this policy from time to time. Questions, requests, or complaints about privacy can be sent to us at:",
        CONTACT_LINE,
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  id: "terms",
  title: "Terms of Use",
  intro:
    "These terms apply to your use of this website, operated by Mirai Innovations Private Limited. By browsing the site you accept them. If you do not accept them, please do not use the site.",
  sections: [
    {
      heading: "What this site is",
      body: [
        "This website describes Mirai’s products and the company behind them. It is provided for general information. Nothing on it is an offer, a quotation, or a commitment to supply, and nothing on it should be treated as professional advice.",
        "The demonstrations on this site — including the try-on selector and the recorded footage — illustrate how the product works using prepared examples. They are illustrative, not a guarantee of the output, accuracy, or performance you will obtain in a particular deployment.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        "You may view and share this site for lawful, personal, or internal business purposes. You may not attempt to gain unauthorised access to it or to any system behind it, interfere with its operation, scrape or systematically extract its contents, introduce malicious code, or use it in any way that breaks the law or infringes someone else’s rights.",
        "The contact form is for genuine enquiries. Do not use it to send unsolicited advertising or unlawful content.",
      ],
    },
    {
      heading: "Intellectual property",
      body: [
        "The Mirai name and logo, the site’s design, text, photography, and video, and the software behind the product are owned by Mirai Innovations Private Limited or used with permission. You may not copy, reproduce, or adapt them without our written consent, except for ordinary quotation with attribution.",
        "Third-party names, garments, and brands that appear in the demonstration images remain the property of their respective owners and are shown for illustration only.",
      ],
    },
    {
      heading: "Links to other sites",
      body: [
        "This site links to third-party sites, including professional profiles on LinkedIn. Those sites are outside our control and we are not responsible for their content or their privacy practices.",
      ],
    },
    {
      heading: "Availability and accuracy",
      body: [
        "We try to keep the site accurate and available, but we do not warrant that it will be uninterrupted, error-free, or up to date at every moment. We may change, suspend, or withdraw any part of it without notice.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "To the fullest extent permitted by law, Mirai is not liable for any indirect or consequential loss, or for any loss of profit, revenue, data, or business, arising out of your use of this website. Nothing in these terms limits any liability that cannot lawfully be limited.",
      ],
    },
    {
      heading: "Privacy",
      body: [
        "Our Privacy Policy explains how we handle personal information collected through this site, and forms part of these terms.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of India, and the courts at Chennai, Tamil Nadu shall have exclusive jurisdiction over any dispute arising from them or from your use of this site.",
      ],
    },
    {
      heading: "Changes and contact",
      body: [
        "We may revise these terms, and continued use of the site after a change means you accept the revised terms. Questions can be sent to:",
        CONTACT_LINE,
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: PRIVACY,
  terms: TERMS,
};
