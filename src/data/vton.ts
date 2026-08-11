export type Gender = "male" | "female";

export interface SubjectOption {
  id: string;
  label: string;
  gender: Gender;
  image: string;
  /* Per-subject crop anchor for the 3:4 thumbnail. The default
     (top-anchored, set in CSS) suits the male frames, where the
     subject starts near the top edge. The female frame is a much
     taller crop whose upper third is empty street, so anchoring it
     to the top fills the card with background and cuts the subject
     off — it anchors low instead. */
  thumbPosition?: string;
}

export interface GarmentOption {
  id: string;
  label: string;
  gender: Gender;
  image: string;
}

export interface VtonResult {
  gender: Gender;
  subjectId: string;
  garmentId: string;
  resultImage: string;
}

export const SUBJECTS: SubjectOption[] = [
  { id: "m1", label: "Subject 1", gender: "male", image: "/images/vton/subject-m1.jpg" },
  { id: "m2", label: "Subject 2", gender: "male", image: "/images/vton/subject-m2.png" },
  {
    id: "w1",
    label: "Woman",
    gender: "female",
    image: "/images/vton/subject-w1.png",
    thumbPosition: "center 88%",
  },
];

export const GARMENTS: GarmentOption[] = [
  { id: "m_g1", label: "Simple Hoodie", gender: "male", image: "/images/vton/garment-m1.jpg" },
  /* Re-plated onto a 3:4 canvas: the original export was a near-square
     crop that ran edge to edge, so the card cropped its sleeves off and
     it read visibly larger than every other garment in the row. */
  { id: "m_g2", label: "Leather Jacket", gender: "male", image: "/images/vton/garment-m2.png" },
  { id: "m_g3", label: "Simple Jeans", gender: "male", image: "/images/vton/garment-m3.jpg" },

  { id: "w_g2", label: "Ringer T-Shirt", gender: "female", image: "/images/vton/garment-w2.png" },
  { id: "w_g1", label: "Dress", gender: "female", image: "/images/vton/garment-w1.jpg" },
  { id: "w_g3", label: "Formals", gender: "female", image: "/images/vton/garment-w3.png" },
];

export const RESULTS: VtonResult[] = [
  { gender: "male", subjectId: "m1", garmentId: "m_g1", resultImage: "/images/vton/result-m1-g1.png" },
  { gender: "male", subjectId: "m1", garmentId: "m_g2", resultImage: "/images/vton/result-m1-g2.png" },
  { gender: "male", subjectId: "m1", garmentId: "m_g3", resultImage: "/images/vton/result-m1-g3.png" },

  { gender: "male", subjectId: "m2", garmentId: "m_g1", resultImage: "/images/vton/result-m2-g1.webp" },
  { gender: "male", subjectId: "m2", garmentId: "m_g2", resultImage: "/images/vton/result-m2-g2.png" },
  { gender: "male", subjectId: "m2", garmentId: "m_g3", resultImage: "/images/vton/result-m2-g3.png" },

  { gender: "female", subjectId: "w1", garmentId: "w_g1", resultImage: "/images/vton/result-w1-g1.png" },
  { gender: "female", subjectId: "w1", garmentId: "w_g2", resultImage: "/images/vton/result-w1-g2.png" },
  { gender: "female", subjectId: "w1", garmentId: "w_g3", resultImage: "/images/vton/result-w1-g3.png" },
];

export function getSubjects(gender: Gender): SubjectOption[] {
  return SUBJECTS.filter((s) => s.gender === gender);
}

export function getGarments(gender: Gender): GarmentOption[] {
  return GARMENTS.filter((g) => g.gender === gender);
}

export function getResultImage(gender: Gender, subjectId: string, garmentId: string): string | null {
  const match = RESULTS.find(
    (r) => r.gender === gender && r.subjectId === subjectId && r.garmentId === garmentId
  );
  return match ? match.resultImage : null;
}
