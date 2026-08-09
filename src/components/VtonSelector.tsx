"use client";

import { useEffect, useState } from "react";
import {
  RESULTS,
  garmentsFor,
  subjectsFor,
  thumbnailInitials,
  type Gender,
} from "@/data/vton";

interface SelectorState {
  gender: Gender;
  subject: string | null;
  garment: string | null;
}

/* Mirrors the prototype's renderControls() coercion: whenever the
   gender changes (or nothing is selected yet), subject/garment
   fall back to the first available option for that gender. */
function coerce(next: SelectorState): SelectorState {
  const subjects = subjectsFor(next.gender);
  const garments = garmentsFor(next.gender);
  return {
    gender: next.gender,
    subject:
      next.subject && subjects.includes(next.subject)
        ? next.subject
        : (subjects[0] ?? null),
    garment:
      next.garment && garments.includes(next.garment)
        ? next.garment
        : (garments[0] ?? null),
  };
}

type Caption = { subject: string; garment: string } | "no-selection";

/**
 * Interactive Selector (§5.1b) — "the most important component on
 * the site." State, thumbnails, and the result caption reproduce
 * the prototype's vanilla JS exactly, including the brief opacity
 * dip (90ms swap inside a 140ms CSS transition) on every update.
 */
export default function VtonSelector() {
  const [selection, setSelection] = useState<SelectorState>(() =>
    coerce({ gender: "male", subject: null, garment: null }),
  );

  /* The caption content is committed 90ms after the selection
     changes (matching the prototype's setTimeout), so the CSS
     opacity transition dips out and back in on each update.
     `selection` is a fresh object on every pick — like the
     prototype, re-picking the current option still re-runs the
     dip. */
  const [caption, setCaption] = useState<Caption | null>(null);
  const [captionVisible, setCaptionVisible] = useState(false);

  useEffect(() => {
    setCaptionVisible(false);
    const match = RESULTS.find(
      (r) =>
        r.gender === selection.gender &&
        r.subject === selection.subject &&
        r.garment === selection.garment,
    );
    const timer = window.setTimeout(() => {
      setCaption(
        match
          ? { subject: match.subject, garment: match.garment }
          : "no-selection",
      );
      setCaptionVisible(true);
    }, 90);
    return () => window.clearTimeout(timer);
  }, [selection]);

  const subjects = subjectsFor(selection.gender);
  const garments = garmentsFor(selection.gender);

  function pickGender(gender: Gender) {
    setSelection((prev) => coerce({ ...prev, gender }));
  }

  function pickSubject(subject: string) {
    setSelection((prev) => coerce({ ...prev, subject }));
  }

  function pickGarment(garment: string) {
    setSelection((prev) => coerce({ ...prev, garment }));
  }

  return (
    <div className="container selector" id="try-it-on">
      <div className="selector-header">
        <p className="selector-label">Try it on Mirai Layer</p>
        {/* Mandatory, persistent disclosure (§5.1b) — stays on screen
            for as long as the component is visible. */}
        <span className="selector-disclosure">
          Sample results generated with the Mirai Layer engine
        </span>
      </div>

      <div className="selector-body">
        <div className="selector-controls">
          <div className="gender-toggle" role="group" aria-label="Choose subject gender">
            <button
              type="button"
              aria-pressed={selection.gender === "male"}
              onClick={() => pickGender("male")}
            >
              Male
            </button>
            <button
              type="button"
              aria-pressed={selection.gender === "female"}
              onClick={() => pickGender("female")}
            >
              Female
            </button>
          </div>

          <div className="control-group">
            <h3 id="subject-heading">Subject</h3>
            <div className="thumbnail-row" role="group" aria-labelledby="subject-heading">
              {subjects.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="thumbnail"
                  aria-pressed={label === selection.subject}
                  aria-label={label}
                  onClick={() => pickSubject(label)}
                >
                  {thumbnailInitials(label)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <h3 id="garment-heading">Garment</h3>
            <div className="thumbnail-row" role="group" aria-labelledby="garment-heading">
              {garments.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="thumbnail"
                  aria-pressed={label === selection.garment}
                  aria-label={label}
                  onClick={() => pickGarment(label)}
                >
                  {thumbnailInitials(label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <figure className="result-frame" aria-live="polite">
          <figcaption
            className="result-frame-caption"
            style={{ opacity: captionVisible ? 1 : 0 }}
          >
            {caption === null ? null : caption === "no-selection" ? (
              <>
                <strong>Select a subject and garment</strong>
                Reserved result slot — pre-generated image will render here.
              </>
            ) : (
              <>
                <strong>
                  {caption.subject} — {caption.garment}
                </strong>
                Reserved result slot — replace with the pre-generated image for
                this combination.
              </>
            )}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
