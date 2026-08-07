import type { Faculty, FacultyCardData } from "@/lib/types";

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff&size=256`;

export const faculty: Faculty[] = [
  {
    uid: "dummy-1",
    name: "Dr. S. Karthikeyan",
    qualification: "Ph.D., M.E.",
    specialization: "Deep Learning",
    experience: 14,
    photo: avatarUrl("S Karthikeyan")
  },
  {
    uid: "dummy-2",
    name: "Dr. P. Nandhini",
    qualification: "Ph.D., M.Tech.",
    specialization: "NLP",
    experience: 11,
    photo: avatarUrl("P Nandhini")
  },
  {
    uid: "dummy-3",
    name: "Mr. V. Arun Kumar",
    qualification: "M.E.",
    specialization: "Computer Vision",
    experience: 9,
    photo: avatarUrl("V Arun Kumar")
  },
  {
    uid: "dummy-4",
    name: "Dr. M. Priyanka",
    qualification: "Ph.D., M.E.",
    specialization: "Data Science",
    experience: 12,
    photo: avatarUrl("M Priyanka")
  },
  {
    uid: "dummy-5",
    name: "Ms. A. Shalini",
    qualification: "M.Tech.",
    specialization: "Reinforcement Learning",
    experience: 7,
    photo: avatarUrl("A Shalini")
  },
  {
    uid: "dummy-6",
    name: "Dr. K. Suresh",
    qualification: "Ph.D., M.E.",
    specialization: "AI Ethics",
    experience: 15,
    photo: avatarUrl("K Suresh")
  },
  {
    uid: "dummy-7",
    name: "Mr. R. Naveen",
    qualification: "M.E.",
    specialization: "IoT & AI",
    experience: 8,
    photo: avatarUrl("R Naveen")
  },
  {
    uid: "dummy-8",
    name: "Ms. T. Divya",
    qualification: "M.Tech.",
    specialization: "Cloud ML",
    experience: 6,
    photo: avatarUrl("T Divya")
  }
];

export const facultyCardData: FacultyCardData = {
  experienceLabel: "Experience",
  experienceUnit: "years"
};
