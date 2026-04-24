import type { Event, ArchiveEvent } from "@/lib/types";

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

export const archiveEvents: ArchiveEvent[] = [
  {
    id: "arch-1",
    title: "AI Innovation Summit 2024",
    year: 2024,
    category: "Seminar",
    description: "A flagship departmental event featuring keynotes from industry leaders on the future of generative AI, responsible AI practices, and emerging career paths.",
    imageUrl: "https://picsum.photos/seed/arch1/600/400",
    highlights: ["200+ attendees", "5 keynote speakers", "Industry panel discussion"],
  },
  {
    id: "arch-2",
    title: "HackAIthon 2024 — 36-Hour Sprint",
    year: 2024,
    category: "Hackathon",
    description: "Students built AI prototypes tackling healthcare accessibility, climate prediction, and smart agriculture in a non-stop 36-hour coding marathon.",
    imageUrl: "https://picsum.photos/seed/arch2/600/400",
    highlights: ["24 teams participated", "₹50K prize pool", "Industry mentor support"],
  },
  {
    id: "arch-3",
    title: "Deep Learning Workshop with TensorFlow",
    year: 2023,
    category: "Workshop",
    description: "Intensive hands-on workshop covering CNNs, transfer learning, and model deployment pipelines using TensorFlow and Keras.",
    imageUrl: "https://picsum.photos/seed/arch3/600/400",
    highlights: ["3-day workshop", "Hands-on labs", "Google Dev Expert session"],
  },
  {
    id: "arch-4",
    title: "Guest Lecture: Ethics in Autonomous Systems",
    year: 2023,
    category: "Guest Lecture",
    description: "Distinguished professor from IIT Madras discussed moral frameworks, trolley problems in self-driving AI, and bias mitigation strategies.",
    imageUrl: "https://picsum.photos/seed/arch4/600/400",
    highlights: ["IIT Madras faculty", "Interactive Q&A", "Ethics case studies"],
  },
  {
    id: "arch-5",
    title: "NLP Bootcamp: From Basics to Transformers",
    year: 2022,
    category: "Workshop",
    description: "Comprehensive bootcamp taking students from text preprocessing and embeddings all the way to fine-tuning BERT and GPT models for real tasks.",
    imageUrl: "https://picsum.photos/seed/arch5/600/400",
    highlights: ["5-day bootcamp", "Hugging Face integration", "Capstone projects"],
  },
  {
    id: "arch-6",
    title: "Smart India Hackathon — Campus Round",
    year: 2022,
    category: "Hackathon",
    description: "Internal selection round for SIH where 15 teams pitched AI solutions for government challenge statements on education and healthcare.",
    imageUrl: "https://picsum.photos/seed/arch6/600/400",
    highlights: ["15 teams shortlisted", "3 teams advanced to national", "Ministry-level problems"],
  },
];
