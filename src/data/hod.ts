import type { HODData, HodPageData } from "@/lib/types";

export const hodData: HODData = {
  name: "Dr. R. Meenakshi",
  designation: "Head of Department — AIML",
  qualification: "Ph.D. in Artificial Intelligence",
  experience: "22+ Years",
  specialization: "Deep Learning & Neural Architectures",
  photo:
    "https://ui-avatars.com/api/?name=R+Meenakshi&background=1e3a8a&color=fff&size=256",
  message:
    "Welcome to the Department of Artificial Intelligence and Machine Learning. Our vision is to empower students with strong fundamentals, hands-on practice, and a mindset of responsible innovation. We emphasize learning by building—through labs, projects, and real-world problem solving with modern AI techniques. As AI continues to transform every domain, we focus equally on technical excellence and ethics, ensuring our graduates create solutions that are fair, safe, and impactful. I invite you to explore our programmes, engage with our community, and be part of shaping the future with AI and ML.",
  highlights: [
    { label: "Experience", value: "22+" },
    { label: "Publications", value: "35+" },
    { label: "PhD Scholars", value: "8" },
    { label: "Projects Guided", value: "120+" }
  ],
  expertise: [
    "Deep Learning",
    "Neural Networks",
    "Computer Vision",
    "NLP",
    "AI Ethics",
    "Federated Learning"
  ],
  email: "hod.aiml@college.edu",
  linkedin: "https://linkedin.com"
};

export const hodPageData: HodPageData = {
  pageTitle: "HOD",
  breadcrumbHome: "Home",
  breadcrumbAbout: "About",
  breadcrumbHod: "HOD",
  heroTitle: "Head of Department",
  heroSubtitle: "Meet the mind shaping the future of AI & ML",
  profileSectionTitle: "Profile",
  highlightsSectionTitle: "Highlights",
  expertiseSectionTitle: "Areas of Expertise",
  linkedinLabel: "LinkedIn",
  ctaTitle: "Explore the Department",
  ctaSubtitle: "Learn more about our vision and meet the faculty shaping student success.",
  ctaPrimaryText: "View About Page",
  ctaPrimaryHref: "/about",
  ctaSecondaryText: "Meet Our Faculty",
  ctaSecondaryHref: "/faculty"
};
