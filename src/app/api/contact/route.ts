import { NextResponse } from "next/server";

/**
 * Contact form endpoint (§5.6/§11). Validates the submission and
 * delivers it to the company inbox via the Resend REST API —
 * called directly with fetch, so no email SDK dependency.
 *
 * Configuration (see .env.example; all server-side only):
 *   RESEND_API_KEY      — Resend API key (required for delivery)
 *   CONTACT_FROM_EMAIL  — verified sender, e.g.
 *                         "Mirai Website <noreply@miraiinnovations.tech>"
 *   CONTACT_TO_EMAIL    — optional recipient override
 *
 * Until both required variables are set, the route logs the
 * submission server-side and returns an honest 503 — it never
 * pretends an email was sent. Once configured, delivery must be
 * tested end-to-end from an external address (§5.6/§11 QA step).
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_RECIPIENT =
  process.env.CONTACT_TO_EMAIL ?? "hello@miraiinnovations.tech";

interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

function parseSubmission(body: unknown): ContactSubmission | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, message } = body as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return null;
  }
  const trimmed = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };
  if (trimmed.name.length === 0 || trimmed.name.length > 200) return null;
  if (!EMAIL_PATTERN.test(trimmed.email) || trimmed.email.length > 320)
    return null;
  if (trimmed.message.length === 0 || trimmed.message.length > 10000)
    return null;
  return trimmed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const submission = parseSubmission(body);
  if (!submission) {
    return NextResponse.json(
      { ok: false, error: "Name, a valid email, and a message are required." },
      { status: 400 },
    );
  }

  const receivedAt = new Date();

  // Always log server-side so no enquiry is lost while the email
  // provider is being configured (and as a delivery audit trail).
  console.log("[contact] submission received:", {
    ...submission,
    receivedAt: receivedAt.toISOString(),
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      "[contact] RESEND_API_KEY / CONTACT_FROM_EMAIL not set — submission logged but NOT emailed.",
    );
    return NextResponse.json(
      {
        ok: false,
        error: `The contact service is not configured yet — please email ${CONTACT_RECIPIENT} directly.`,
      },
      { status: 503 },
    );
  }

  const timestampIst = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "long",
  }).format(receivedAt);
  const safeName = submission.name.replace(/\s+/g, " ");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_RECIPIENT],
        // Replying to the received email goes straight back to the
        // person who submitted the form.
        reply_to: submission.email,
        subject: `Website enquiry — ${safeName}`,
        text: [
          "New enquiry from the Mirai Innovations website contact form.",
          "",
          `Name: ${safeName}`,
          `Email: ${submission.email}`,
          `Received: ${timestampIst} (${receivedAt.toISOString()})`,
          "",
          "Message:",
          submission.message,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[contact] email delivery failed:", res.status, detail);
      return NextResponse.json(
        {
          ok: false,
          error: `Delivery failed — please try again, or email ${CONTACT_RECIPIENT} directly.`,
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[contact] email delivery error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: `Delivery failed — please try again, or email ${CONTACT_RECIPIENT} directly.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
