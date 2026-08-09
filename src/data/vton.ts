/**
 * Interactive Selector data (§5.1b). Fully data-driven — the 9
 * combinations live in one array, never as separate hardcoded
 * markup blocks, so extending the matrix later (more subjects,
 * more garments) is a data change, not a rebuild.
 *
 * No real generated imagery exists yet, so the result frame
 * shows a labeled reserved state rather than a fabricated photo
 * — same "reserve the slot, never fake the asset" principle
 * used for the video and screenshots.
 */

export type Gender = "male" | "female";

export interface VtonResult {
  gender: Gender;
  subject: string;
  garment: string;
}

export const RESULTS: VtonResult[] = [
  { gender: "male", subject: "Subject A", garment: "Kurta — Slate" },
  { gender: "male", subject: "Subject A", garment: "Bomber — Rust" },
  { gender: "male", subject: "Subject A", garment: "Shirt — Ivory" },
  { gender: "male", subject: "Subject B", garment: "Kurta — Slate" },
  { gender: "male", subject: "Subject B", garment: "Bomber — Rust" },
  { gender: "male", subject: "Subject B", garment: "Shirt — Ivory" },
  { gender: "female", subject: "Subject C", garment: "Saree — Teal" },
  { gender: "female", subject: "Subject C", garment: "Kurti — Rose" },
  { gender: "female", subject: "Subject C", garment: "Dress — Ivory" },
];

export function subjectsFor(gender: Gender): string[] {
  const seen: string[] = [];
  for (const r of RESULTS) {
    if (r.gender === gender && !seen.includes(r.subject)) seen.push(r.subject);
  }
  return seen;
}

export function garmentsFor(gender: Gender): string[] {
  const seen: string[] = [];
  for (const r of RESULTS) {
    if (r.gender === gender && !seen.includes(r.garment)) seen.push(r.garment);
  }
  return seen;
}

/**
 * Exact initials derivation from the prototype's renderThumbnails:
 * first character of each word, joined, first two characters,
 * uppercased — e.g. "Subject A" → "SA", "Kurta — Slate" → "K—".
 */
export function thumbnailInitials(label: string): string {
  return label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
