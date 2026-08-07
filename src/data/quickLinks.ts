import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Home,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import type {
  AchievementsPageData,
  ContactData,
  EventsPageData,
  FacultyPageData,
  FooterData,
  HomeData,
  MotionTokens,
  NavLink,
  QuickLinkItem,
  SyllabusPageData
} from "@/lib/types";

export const motionTokens: MotionTokens = {
  sectionFadeInY: 32,
  sectionFadeInDuration: 0.6,
  cardStaggerDelay: 0.1,
  countUpDurationMs: 1200
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Departments", href: "/departments", icon: BookOpenText },
  { label: "Faculty", href: "/faculty", icon: Users },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Research", href: "/research", icon: ShieldCheck },
  { label: "Activities", href: "/activities", icon: Users },
  { label: "Contact", href: "/contact", icon: Phone }
];

export const homeData: HomeData = {
  heroTitle: "Artificial Intelligence & Machine Learning and Data Science",
  heroSubtitle:
    "A vibrant academic ecosystem focused on Deep Learning, NLP, Computer Vision, and Responsible AI—powered by strong fundamentals and real-world problem solving.",
  primaryCtaText: "Explore the Department",
  primaryCtaHref: "/about",
  secondaryCtaText: "Meet the HOD",
  secondaryCtaHref: "/hod",
  introTitle: "Shaping Future AI Engineers",
  introText:
    "The AI&ML and AI&DS departments nurture future-ready engineers with a strong foundation in mathematics, computing, and intelligent decision-making. Students learn by building through modern labs, projects, and research exposure, preparing them for high-impact careers and higher studies.",
  quickLinksTitle: "Quick Links",
  quickLinksSubtitle: "Explore academics, people, and activities in one place."
};

export const quickLinks: QuickLinkItem[] = [
  {
    icon: Info,
    label: "About Departments",
    href: "/about",
    description: "Vision, mission, programme outcomes, and department overview."
  },
  {
    icon: ShieldCheck,
    label: "Head of Department",
    href: "/hod",
    description: "A dedicated profile with message, highlights, and expertise."
  },
  {
    icon: Users,
    label: "Faculty",
    href: "/faculty",
    description: "Meet our experienced and research-focused teaching team."
  },
  {
    icon: BookOpenText,
    label: "Syllabus",
    href: "/syllabus",
    description: "Semester-wise curriculum with subject codes and titles."
  },
  {
    icon: CalendarDays,
    label: "Events",
    href: "/events",
    description: "Workshops, hackathons, guest lectures, seminars, and FDPs."
  },
  {
    icon: Trophy,
    label: "Achievements",
    href: "/achievements",
    description: "Student and department milestones and recognitions."
  }
];

export const footerData: FooterData = {
  departmentName: "Departments of AI&ML and AI&DS",
  tagline: "Building intelligent systems, shaping responsible innovators.",
  quickLinksTitle: "Quick Links",
  contactTitle: "Contact Us",
  emailLabel: "Email",
  rightsText: "© 2025 AIML Department",
  socialLinks: [
    { label: "Email", href: "mailto:aiml.department@rit.edu.in", icon: Mail },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Users },
    { label: "Admissions", href: "/contact", icon: Phone }
  ]
};

export const contactData: ContactData = {
  pageTitle: "Contact",
  pageHeroTitle: "Contact Us",
  pageHeroSubtitle: "Reach out for admissions, research collaborations, workshops, and department queries.",
  officeTitle: "Department Office",
  formTitle: "Send a Message",
  formSubtitle: "Share your query and we will respond at the earliest.",
  addressLines: [
    "Department of AIML, Rajalakshmi Institute of Technology",
    "Kuthambakkam, Chembarabakkam, Chennai, Tamil Nadu 600124",
    "India"
  ],
  phoneLabel: "Phone",
  phone: "+91 44 4000 1234",
  emailLabel: "Email",
  email: "aiml.department@rit.edu.in",
  mapEmbedTitle: "AIML Department Location Map",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3886.9596138459974!2d80.0428186!3d13.0382427!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528bae35449d29%3A0x37d13f08d672385b!2sRajalakshmi%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1777059037956!5m2!1sen!2sin",
  formNameLabel: "Name",
  formNamePlaceholder: "Your full name",
  formEmailLabel: "Email",
  formEmailPlaceholder: "name@example.com",
  formMessageLabel: "Message",
  formMessagePlaceholder: "Write your message...",
  submitText: "Submit",
  submittingText: "Submitting...",
  successTitle: "Message sent",
  successText: "Thanks for reaching out. We will get back to you soon."
};

export const facultyPageData: FacultyPageData = {
  pageTitle: "Faculty",
  pageHero: {
    title: "Faculty",
    subtitle: "A team of dedicated educators and researchers guiding modern AIML learning.",
    badgeIcon: Users,
    badgeLabel: "Faculty"
  }
};

export const syllabusPageData: SyllabusPageData = {
  pageTitle: "Syllabus",
  pageHero: {
    title: "Syllabus",
    subtitle: "Semester-wise curriculum with subject codes and titles.",
    badgeIcon: BookOpenText,
    badgeLabel: "Academics"
  },
  semesterLabelPrefix: "SEM",
  semesterTitlePrefix: "Semester",
  subjectCountLabel: "subjects"
};

export const eventsPageData: EventsPageData = {
  pageTitle: "Events",
  pageHero: {
    title: "Events",
    subtitle: "Workshops, seminars, hackathons, and lectures that keep us future-ready.",
    badgeIcon: CalendarDays,
    badgeLabel: "Community"
  },
  tabs: [
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" }
  ],
  emptyStateText: "No events to show right now."
};

export const achievementsPageData: AchievementsPageData = {
  pageTitle: "Achievements",
  pageHero: {
    title: "Achievements",
    subtitle: "Milestones that reflect excellence in learning, research, and impact.",
    badgeIcon: Trophy,
    badgeLabel: "Highlights"
  },
  studentSectionTitle: "Student Achievements",
  studentSectionSubtitle: "Competitions, placements, and publications by our students.",
  departmentSectionTitle: "Department Achievements",
  departmentSectionSubtitle: "Accreditations, rankings, awards, and strategic collaborations."
};
