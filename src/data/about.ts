import { Eye, Target } from "lucide-react";
import type { AboutData } from "@/lib/types";

export const aboutData: AboutData = {
  pageTitle: "About",
  pageHeroTitle: "About the Department",
  pageHeroBadgeLabel: "About",
  visionTitle: "Vision",
  visionText:
    "To be a leading centre of excellence in Artificial Intelligence and Machine Learning education and research, producing globally competent graduates with strong ethical grounding and a passion for innovation.",
  missionTitle: "Mission",
  missionText:
    "To deliver rigorous, industry-relevant education through outcome-based learning, modern computing laboratories, and research-driven mentoring; to cultivate critical thinking and responsible AI practices; and to build strong partnerships with industry and academia for internships, projects, and lifelong learning.",
  programmeOutcomesTitle: "Programme Outcomes",
  programmeOutcomesSubtitle: "PO1–PO12 define the competencies our graduates are expected to achieve.",
  programmeOutcomes: [
    { code: "PO1", text: "Apply engineering knowledge to solve complex computing problems." },
    { code: "PO2", text: "Identify, formulate, and analyze AI/ML problems using scientific principles." },
    { code: "PO3", text: "Design and evaluate AI/ML solutions that meet specified needs and constraints." },
    { code: "PO4", text: "Use research-based knowledge to conduct investigations and interpret data." },
    { code: "PO5", text: "Select and apply modern tools for modelling, simulation, and deployment." },
    { code: "PO6", text: "Assess societal, health, safety, legal, and cultural issues in AI solutions." },
    { code: "PO7", text: "Understand sustainability and the impact of intelligent systems on the environment." },
    { code: "PO8", text: "Commit to professional ethics, fairness, privacy, and responsible AI conduct." },
    { code: "PO9", text: "Function effectively as an individual and as a member/leader in teams." },
    { code: "PO10", text: "Communicate effectively through reports, presentations, and documentation." },
    { code: "PO11", text: "Demonstrate project management and finance principles in solution delivery." },
    { code: "PO12", text: "Engage in independent learning and adapt to emerging technologies." }
  ],
  hodTeaserLabel: "MEET THE HOD",
  hodTeaserTitle: "Meet the Leader Guiding AIML Excellence",
  hodTeaserButtonText: "View Full Profile →",
  hodTeaserHref: "/hod"
};

export const aboutIconData = {
  vision: Eye,
  mission: Target
};
