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

      {/* Caption */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-4">
        <p className="text-xs text-slate-400">
          Click any card to view full profile · Auto-scrolls continuously · Pauses on hover
        </p>
      </div>
    </div>
  );
}
