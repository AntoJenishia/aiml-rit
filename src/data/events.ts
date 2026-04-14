import type { Event } from "@/lib/types";

export const events: Event[] = [
  {
    title: "Hands-on Workshop: Building ML Pipelines with Python",
    date: "2026-05-10",
    description:
      "A practical workshop covering data preparation, model training, evaluation, and reproducible pipelines using scikit-learn and ML best practices.",
    tag: "Workshop",
    type: "upcoming"
  },
  {
    title: "AIML HackSprint 2026",
    date: "2026-06-15",
    description:
      "A 24-hour hackathon where teams build AI-driven prototypes addressing real-world challenges in healthcare, education, and sustainability.",
    tag: "Hackathon",
    type: "upcoming"
  },
  {
    title: "Guest Lecture: Responsible AI in Industry",
    date: "2026-04-28",
    description:
      "Industry expert talk on bias, fairness, explainability, and governance practices used to ship safe AI systems at scale.",
    tag: "Guest Lecture",
    type: "upcoming"
  },
  {
    title: "Seminar: Transformers and Modern NLP",
    date: "2025-11-12",
    description:
      "Seminar on attention mechanisms, transformers, fine-tuning strategies, and evaluation methods for NLP applications.",
    tag: "Seminar",
    type: "past"
  },
  {
    title: "FDP: MLOps and Model Deployment Essentials",
    date: "2025-09-05",
    description:
      "Faculty Development Programme on CI/CD for ML, model packaging, monitoring, drift detection, and production deployment patterns.",
    tag: "FDP",
    type: "past"
  },
  {
    title: "Guest Lecture: Computer Vision for Smart Mobility",
    date: "2025-08-20",
    description:
      "Talk on perception pipelines, object detection, and edge deployment considerations for intelligent transportation systems.",
    tag: "Guest Lecture",
    type: "past"
  }
];
