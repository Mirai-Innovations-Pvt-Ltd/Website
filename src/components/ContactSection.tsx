"use client";

import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "sending" | "sent" | "error";

const FALLBACK_ERROR =
  "Something went wrong — please try again, or email hello@miraiinnovations.tech.";

/*
  §5.4/§5.6: the sitewide CTA doubles as the real form submit. The
  form posts (without reloading) to /api/contact, which delivers
  the enquiry to hello@miraiinnovations.tech via the configured
  email provider — see src/app/api/contact/route.ts and
  .env.example for the required environment variables. Until those
  are set, the API answers with an honest "not configured" error
  (shown below) rather than pretending the email was sent.
*/
export default function ContactSection() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState(FALLBACK_ERROR);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return; // belt-and-braces against double submits

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) {
        /* Keep the entered data; show the server's reason when it
           provides one (e.g. provider not configured yet). */
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErrorMessage(
          payload?.error && typeof payload.error === "string"
            ? payload.error
            : FALLBACK_ERROR,
        );
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setErrorMessage(FALLBACK_ERROR);
      setStatus("error");
    }
  }

  return (
    <section className="contact" aria-labelledby="contact-heading" id="contact">
      <div className="container contact-inner">
        <h2 id="contact-heading">Talk to us</h2>

        <form className="contact-form" method="post" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="contact-name">Name</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              autoComplete="name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" required></textarea>
          </div>
          <button
            type="submit"
            className="btn-primary self-start"
            disabled={status === "sending"}
          >
            Talk to us
          </button>
          <p className="contact-note">
            No pricing to discuss, no sales qualification — just a conversation.
          </p>
          {status !== "idle" && (
            <p className="contact-note" role="status">
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Thanks — your message has been sent. We'll get back to you."
                  : errorMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
