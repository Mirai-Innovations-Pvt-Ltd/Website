"use client";

import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "sending" | "sent" | "error";

const FALLBACK_ERROR =
  "Something went wrong — please try again, or email hello@miraiinnovations.tech.";

/*
  §5.4/§5.6: the sitewide CTA doubles as the real form submit.

  Delivery is Netlify Forms, not a server route of our own. Netlify
  intercepts the POST at the edge, stores the submission against the
  site (browsable and exportable in the dashboard), runs it through
  spam filtering, and emails the notification address configured under
  Forms > Form notifications — set that to hello@miraiinnovations.tech.

  Three details are load-bearing and none of them are obvious:

    1. The POST goes to /__forms.html, NOT to this page's own URL.
       That file (public/__forms.html) is the static declaration
       Netlify parsed at deploy time; posting anywhere else 404s,
       because a React-rendered form is invisible to the detector.

    2. The body must be url-encoded, not JSON. Netlify's form handler
       does not parse a JSON body — it would accept the request and
       record an empty submission.

    3. form-name must be present in the body and must match the form
       declared in __forms.html, or Netlify cannot route the
       submission to a form.

  bot-field is a honeypot: hidden from people, filled in by naive
  bots, and Netlify discards anything that arrives with it populated.
  It is wrapped in a class rather than `hidden` so assistive tech is
  told to skip it (aria-hidden + tabIndex) instead of a real user
  being asked to leave a field blank.

  In local `next dev` there is no Netlify edge, so submitting here
  will fail — that is expected. Test it on a deploy preview.
*/
const FORM_NAME = "contact";

export default function ContactSection() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState(FALLBACK_ERROR);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return; // belt-and-braces against double submits

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as string[][]).toString(),
      });
      if (!res.ok) {
        /* Keep the entered data so nothing the user typed is lost. */
        setErrorMessage(FALLBACK_ERROR);
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

        <form
          className="contact-form"
          name={FORM_NAME}
          method="post"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value={FORM_NAME} />

          <p className="form-honeypot" aria-hidden="true">
            <label>
              Leave this field empty
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

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
