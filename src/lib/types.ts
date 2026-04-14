import type { LucideIcon } from "lucide-react";

export type EventTag = "Workshop" | "Hackathon" | "Guest Lecture" | "Seminar" | "FDP";
export type EventType = "upcoming" | "past";
export type AchievementCategory = "student" | "department";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
}

export interface QuickLinkItem {
  icon: LucideIcon;
  label: string;
  href: string;
  description: string;
}

export interface Faculty {
  name: string;
  qualification: string;
  specialization: string;
  experience: number;
  photo: string;
}

export interface Event {
  title: string;
  date: string;
  description: string;
  tag: EventTag;
  type: EventType;
}

export interface Achievement {
  title: string;
  description: string;
  year: number;
  category: AchievementCategory;
}

export interface SyllabusSubject {
  code: string;
  name: string;
}

export interface SemesterSyllabus {
  semester: number;
  subjects: SyllabusSubject[];
}

export interface ProgrammeOutcome {
  code: string;
  text: string;
}

export interface AboutData {
  pageTitle: string;
  pageHeroTitle: string;
  pageHeroBadgeLabel: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
  programmeOutcomesTitle: string;
  programmeOutcomesSubtitle: string;
  programmeOutcomes: ProgrammeOutcome[];
  hodTeaserTitle: string;
  hodTeaserButtonText: string;
  hodTeaserHref: string;
  hodTeaserLabel: string;
}

export interface HODHighlight {
  label: string;
  value: string;
}

export interface HODData {
  name: string;
  designation: string;
  qualification: string;
  experience: string;
  specialization: string;
  photo: string;
  message: string;
  highlights: HODHighlight[];
  expertise: string[];
  email: string;
  linkedin: string;
}

export interface HodPageData {
  pageTitle: string;
  breadcrumbHome: string;
  breadcrumbAbout: string;
  breadcrumbHod: string;
  heroTitle: string;
  heroSubtitle: string;
  profileSectionTitle: string;
  highlightsSectionTitle: string;
  expertiseSectionTitle: string;
  linkedinLabel: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
}

export interface FacultyCardData {
  experienceLabel: string;
  experienceUnit: string;
}

export interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  introTitle: string;
  introText: string;
  quickLinksTitle: string;
  quickLinksSubtitle: string;
}

export interface ContactData {
  pageTitle: string;
  pageHeroTitle: string;
  pageHeroSubtitle: string;
  officeTitle: string;
  formTitle: string;
  formSubtitle: string;
  addressLines: string[];
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  mapEmbedTitle: string;
  mapEmbedUrl: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formMessageLabel: string;
  formMessagePlaceholder: string;
  submitText: string;
  submittingText: string;
  successTitle: string;
  successText: string;
}

export interface FooterData {
  departmentName: string;
  tagline: string;
  quickLinksTitle: string;
  contactTitle: string;
  emailLabel: string;
  rightsText: string;
  socialLinks: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export interface PageHeroData {
  title: string;
  subtitle?: string;
  badgeIcon: LucideIcon;
  badgeLabel: string;
}

export interface FacultyPageData {
  pageTitle: string;
  pageHero: PageHeroData;
}

export interface SyllabusPageData {
  pageTitle: string;
  pageHero: PageHeroData;
  semesterLabelPrefix: string;
  semesterTitlePrefix: string;
  subjectCountLabel: string;
}

export interface EventsPageData {
  pageTitle: string;
  pageHero: PageHeroData;
  tabs: { label: string; value: EventType }[];
  emptyStateText: string;
}

export interface AchievementsPageData {
  pageTitle: string;
  pageHero: PageHeroData;
  studentSectionTitle: string;
  studentSectionSubtitle: string;
  departmentSectionTitle: string;
  departmentSectionSubtitle: string;
}

export interface MotionTokens {
  sectionFadeInY: number;
  sectionFadeInDuration: number;
  cardStaggerDelay: number;
  countUpDurationMs: number;
}
