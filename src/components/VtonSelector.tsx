"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Gender,
  getGarments,
  getResultImage,
  getSubjects,
} from "@/data/vton";

/* The frosted plate that lifts above a card on hover. Purely
   decorative — it magnifies the image the card already shows, and
   the card's own alt text already names it, so this is hidden from
   assistive tech rather than announced a second time. */
function CardZoom({
  src,
  position,
  sizes,
}: {
  src: string;
  position?: string;
  sizes: string;
}) {
  return (
    <span className="card-zoom" aria-hidden="true">
      <span className="card-zoom-frame">
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          style={position ? { objectPosition: position } : undefined}
        />
      </span>
    </span>
  );
}

export default function VtonSelector() {
  const [gender, setGender] = useState<Gender>("male");
  const [subjectId, setSubjectId] = useState<string>("m1");
  const [garmentId, setGarmentId] = useState<string>("m_g1");

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);

  function handleGenderChange(nextGender: Gender) {
    setGender(nextGender);
    const subList = getSubjects(nextGender);
    const garmList = getGarments(nextGender);
    setSubjectId(subList[0]?.id ?? "m1");
    setGarmentId(garmList[0]?.id ?? "m_g1");
    setRenderedImage(null);
  }

  function handleSubjectChange(id: string) {
    setSubjectId(id);
    setRenderedImage(null);
  }

  function handleGarmentChange(id: string) {
    setGarmentId(id);
    setRenderedImage(null);
  }

  function handleRender() {
    setIsRendering(true);
    const img = getResultImage(gender, subjectId, garmentId);
    setTimeout(() => {
      setIsRendering(false);
      setRenderedImage(img);
    }, 2000);
  }

  const activeSubjects = getSubjects(gender);
  const activeGarments = getGarments(gender);

  return (
    <div className="container selector" id="try-it-on">
      {/* The heading lives INSIDE the left column rather than above the
          grid — that is what lets the renderer window start at the
          heading's cap-height and run all the way to the bottom of the
          garment row, so both columns share one top and one baseline. */}
      <div className="selector-body">
        <div className="selector-controls">
          <div className="selector-header">
            <h2 className="selector-title">Find your perfect fit</h2>
          </div>

          <div className="gender-toggle" role="group" aria-label="Choose subject gender">
            <button
              type="button"
              className={gender === "male" ? "active" : ""}
              aria-pressed={gender === "male"}
              onClick={() => handleGenderChange("male")}
            >
              Male
            </button>
            <button
              type="button"
              className={gender === "female" ? "active" : ""}
              aria-pressed={gender === "female"}
              onClick={() => handleGenderChange("female")}
            >
              Female
            </button>
          </div>

          <div className="control-group">
            <h3>Select Model</h3>
            <div className="subject-grid" role="group" aria-label="Select model">
              {activeSubjects.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`subject-card ${sub.id === subjectId ? "selected" : ""}`}
                  aria-pressed={sub.id === subjectId}
                  onClick={() => handleSubjectChange(sub.id)}
                >
                  <div className="subject-thumb-wrap">
                    <Image
                      src={sub.image}
                      alt={sub.label}
                      fill
                      sizes="9rem"
                      className="subject-thumb-img"
                      style={
                        sub.thumbPosition
                          ? { objectPosition: sub.thumbPosition }
                          : undefined
                      }
                    />
                  </div>
                  <CardZoom
                    src={sub.image}
                    position={sub.thumbPosition}
                    sizes="14rem"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <h3>Select Garment</h3>
            <div className="garment-grid" role="group" aria-label="Select garment">
              {activeGarments.map((garm) => (
                <button
                  key={garm.id}
                  type="button"
                  className={`garment-card ${garm.id === garmentId ? "selected" : ""}`}
                  aria-pressed={garm.id === garmentId}
                  onClick={() => handleGarmentChange(garm.id)}
                >
                  <div className="garment-thumb-wrap">
                    <Image
                      src={garm.image}
                      alt={garm.label}
                      fill
                      sizes="7.5rem"
                      className="garment-thumb-img"
                    />
                  </div>
                  <CardZoom src={garm.image} sizes="12rem" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Renderer Window */}
        <div className="renderer-box">
          <div className="renderer-window">
            {isRendering ? (
              <div className="rendering-state">
                <div className="render-spinner"></div>
                <span className="rendering-text">Rendering your style</span>
              </div>
            ) : renderedImage ? (
              /* Two layers of the same frame: a blurred, cover-cropped
                 backdrop that fills the window edge to edge, and the
                 result itself CONTAINED on top so the model is never
                 cropped at the head or the hem — the window's height is
                 driven by the controls column, so its ratio can't be
                 matched to the photographs' and any cover-crop would
                 cut a different part of each subject. */
              <div className="rendered-result">
                <Image
                  src={renderedImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="28rem"
                  className="rendered-result-backdrop"
                />
                <Image
                  src={renderedImage}
                  alt="Try-on Result"
                  fill
                  sizes="28rem"
                  className="rendered-result-img"
                  priority
                />
              </div>
            ) : (
              <div className="render-action-state">
                <button
                  type="button"
                  className="btn-render-trigger"
                  onClick={handleRender}
                >
                  <svg className="render-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                  </svg>
                  <span>Render Try-On</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
