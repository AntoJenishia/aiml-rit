"use client";

import SectionHeading from "@/components/SectionHeading";
import FacultyCarousel from "@/components/FacultyCarousel";
import RevealSection from "@/components/RevealSection";
import { faculty } from "@/data/faculty";
import { facultyPageData } from "@/data/quickLinks";

export default function FacultyPage() {
  return (
    <div className="page-surface">
      {/* Header — constrained width */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <SectionHeading
          eyebrow={facultyPageData.pageHero.badgeLabel}
          title={facultyPageData.pageHero.title}
          subtitle={facultyPageData.pageHero.subtitle}
        />
      </div>

      {/* Carousel — full viewport width, no side padding */}
      <RevealSection>
        <div className="w-full overflow-hidden">
          <FacultyCarousel faculty={faculty} />
        </div>
      </RevealSection>
    </div>
  );
}
