import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { TERMS } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Use — Mirai Innovations",
  description:
    "The terms that apply to your use of the Mirai Innovations website.",
};

/* See the note in src/app/privacy/page.tsx — same arrangement. */
export default function TermsPage() {
  return <LegalDocument doc={TERMS} />;
}
