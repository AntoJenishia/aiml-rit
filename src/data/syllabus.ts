import type { SemesterSyllabus } from "@/lib/types";

export const syllabus: SemesterSyllabus[] = [
  {
    semester: 1,
    subjects: [
      { code: "MA3151", name: "Matrices and Calculus" },
      { code: "PH3151", name: "Engineering Physics" },
      { code: "CY3151", name: "Engineering Chemistry" },
      { code: "GE3151", name: "Problem Solving and Python Programming" },
      { code: "GE3152", name: "Heritage of Tamil" }
    ]
  },
  {
    semester: 2,
    subjects: [
      { code: "MA3251", name: "Statistics and Numerical Methods" },
      { code: "BE3251", name: "Basic Electrical and Electronics Engineering" },
      { code: "GE3251", name: "Engineering Graphics" },
      { code: "CS3251", name: "Programming in C" },
      { code: "GE3252", name: "Tamils and Technology" }
    ]
  },
  {
    semester: 3,
    subjects: [
      { code: "CS3351", name: "Data Structures" },
      { code: "CS3352", name: "Foundations of Artificial Intelligence" },
      { code: "MA3354", name: "Linear Algebra and Probability for AI" },
      { code: "EC3353", name: "Digital Logic and Design" },
      { code: "GE3361", name: "Professional Development" }
    ]
  },
  {
    semester: 4,
    subjects: [
      { code: "CS3451", name: "Design and Analysis of Algorithms" },
      { code: "CS3452", name: "Database Management Systems" },
      { code: "CS3453", name: "Operating Systems" },
      { code: "CS3454", name: "Machine Learning Fundamentals" },
      { code: "GE3451", name: "Environmental Sciences and Sustainability" }
    ]
  },
  {
    semester: 5,
    subjects: [
      { code: "CS3501", name: "Machine Learning" },
      { code: "CS3502", name: "Deep Learning" },
      { code: "CS3503", name: "Natural Language Processing" },
      { code: "CS3504", name: "Computer Vision" },
      { code: "CS3551", name: "Cloud Computing for AI" }
    ]
  },
  {
    semester: 6,
    subjects: [
      { code: "CS3601", name: "Reinforcement Learning" },
      { code: "CS3602", name: "MLOps and Model Deployment" },
      { code: "CS3603", name: "AI Ethics, Privacy and Governance" },
      { code: "CS3651", name: "Big Data Analytics" },
      { code: "CS3691", name: "Mini Project" }
    ]
  },
  {
    semester: 7,
    subjects: [
      { code: "CS4701", name: "Generative AI" },
      { code: "CS4702", name: "AI in Healthcare" },
      { code: "CS4703", name: "Edge AI and IoT Analytics" },
      { code: "CS4704", name: "Information Retrieval and Search" },
      { code: "CS4791", name: "Industry Internship / Seminar" }
    ]
  },
  {
    semester: 8,
    subjects: [
      { code: "CS4801", name: "AI Product Engineering" },
      { code: "CS4802", name: "Advanced Topics in AI" },
      { code: "CS4891", name: "Project Work" },
      { code: "MG4951", name: "Principles of Management" }
    ]
  }
];
