import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { PRIVACY } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Mirai Innovations",
  description:
    "How Mirai Innovations Private Limited collects, uses, and protects personal information submitted through this website.",
};

/* The footer opens this document as an overlay, but the route stays —
   §5.3 requires the policy to be reachable, and a direct or shared
   link has to land somewhere real. Both render from src/data/legal.ts,
   so the two can't drift apart. */
export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY} />;
}
