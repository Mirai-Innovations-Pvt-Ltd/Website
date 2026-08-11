/**
 * Team (§5.2). Real names, roles, headshots, and LinkedIn
 * profile URLs are in place. Launch QA note (§5.2): each profile
 * should list Mirai Innovations as current employment before the
 * application review — reviewers click through.
 */

export interface TeamMember {
  name: string;
  role: string;
  /**
   * Optional: a card renders without the link rather than pointing at a
   * guess. §2 treats these as verifiable third-party corroboration, so
   * a wrong URL is worse here than a missing one. All four are on file.
   */
  linkedin?: string;
  photo: string;
  /** Optional object-position override so the square crop frames the face well. */
  photoPosition?: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Dhakshesh Sivakesh",
    role: "Executive / Business Head",
    linkedin: "https://www.linkedin.com/in/dhakshesh-sivakesh/",
    photo: "/images/team/dhakshesh-sivakesh.jpeg",
  },
  /* Order here IS the on-page order: TeamSection splits this array in
     half, so entries 1-2 orbit the photograph on the left and 3-4 on
     the right. Yakssendra and Blesson were swapped at the founder's
     direction to change which side each appears on. */
  {
    name: "Yakssendra Kishore Kumar",
    role: "Technical Head",
    linkedin: "https://www.linkedin.com/in/yakssendra-kishorekumar-4a4507323/",
    photo: "/images/team/yakssendra-kishore-kumar.jpeg",
  },
  {
    name: "Blesson Reji",
    role: "Product Head",
    linkedin: "https://www.linkedin.com/in/blesson-reji101",
    photo: "/images/team/blesson-reji.jpeg",
    photoPosition: "50% 30%",
  },
  {
    name: "Nishtha Vats",
    role: "UX & Brand Design Lead",
    linkedin: "https://www.linkedin.com/in/nishtha-vats-80898431b/",
    photo: "/images/team/nishtha-vats.jpg",
  },
];
