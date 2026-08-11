"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LEGAL_DOCS, type LegalDocId } from "@/data/legal";

/*
  The footer's Privacy Policy / Terms of Use links open a centred
  overlay instead of navigating away — the reader is mid-page, and
  sending them to a separate route to read a policy costs them their
  place on the site.

  Built on the native <dialog> element rather than a div with a fixed
  overlay, because showModal() gives four things for free that a div
  would have to reimplement (and usually reimplements badly): the rest
  of the page becomes inert, focus is trapped inside and restored to
  the trigger on close, Escape closes, and ::backdrop is a real
  paintable layer rather than a sibling element to keep in sync.

  The links live in two places in the footer, so the DOCUMENTS are
  rendered once here by the provider and the links are buttons that
  ask for one by id. Rendering a dialog per link would duplicate the
  full text of both policies in the DOM four times over.
*/

type OpenLegal = (id: LegalDocId) => void;

const LegalContext = createContext<OpenLegal | null>(null);

export function useLegalOverlay(): OpenLegal {
  const open = useContext(LegalContext);
  if (!open) {
    throw new Error("useLegalOverlay must be used inside <LegalProvider>");
  }
  return open;
}

export function LegalLink({
  doc,
  className,
  children,
}: {
  doc: LegalDocId;
  className?: string;
  children: ReactNode;
}) {
  const open = useLegalOverlay();
  return (
    <button
      type="button"
      className={className ? `legal-link ${className}` : "legal-link"}
      onClick={() => open(doc)}
    >
      {children}
    </button>
  );
}

export function LegalProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<LegalDocId | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback<OpenLegal>((id) => setActiveId(id), []);
  const close = useCallback(() => setActiveId(null), []);

  /* React state is the source of truth; the dialog's own open/closed
     state is driven from it. Guarding on dialog.open matters —
     calling showModal() on an already-open dialog throws. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeId && !dialog.open) {
      dialog.showModal();
    } else if (!activeId && dialog.open) {
      dialog.close();
    }
  }, [activeId]);

  const doc = activeId ? LEGAL_DOCS[activeId] : null;

  return (
    <LegalContext.Provider value={open}>
      {children}

      <dialog
        ref={dialogRef}
        className="legal-dialog"
        aria-labelledby={doc ? `legal-title-${doc.id}` : undefined}
        /* Fires for Escape and for the form-method=dialog close button
           alike, so state can never drift out of sync with the DOM. */
        onClose={close}
        /* "Click anywhere else on screen to get out": the backdrop is
           painted by the dialog element itself, so a click whose target
           IS the dialog landed outside the panel inside it. */
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {doc && (
          <article className="legal-panel">
            <header className="legal-panel-head">
              <h2 id={`legal-title-${doc.id}`}>{doc.title}</h2>
              <button
                type="button"
                className="legal-close"
                onClick={close}
                aria-label={`Close ${doc.title}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div className="legal-panel-body">
              <p className="legal-intro">{doc.intro}</p>
              {doc.sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </article>
        )}
      </dialog>
    </LegalContext.Provider>
  );
}
