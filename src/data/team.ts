/**
 * Team (§5.2). Real names, roles, headshots, and LinkedIn
 * profile URLs are in place. Launch QA note (§5.2): each profile
 * should list Mirai Innovations as current employment before the
 * application review — reviewers click through.
 */

export interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
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
  {
    name: "Blesson Reji",
    role: "Product Head",
    linkedin: "https://www.linkedin.com/in/blesson-reji101",
    photo: "/images/team/blesson-reji.jpeg",
    photoPosition: "50% 30%",
  },
  {
    name: "Yakssendra Kishore Kumar",
    role: "Technical Head",
    linkedin: "https://www.linkedin.com/in/yakssendra-kishorekumar-4a4507323/",
    photo: "/images/team/yakssendra-kishore-kumar.jpeg",
  },
];
