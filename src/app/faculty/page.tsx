"use client";

import SectionHeading from "@/components/SectionHeading";
import FacultyCarousel from "@/components/FacultyCarousel";
import RevealSection from "@/components/RevealSection";
import { faculty } from "@/data/faculty";
import { facultyPageData } from "@/data/quickLinks";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function FacultyPage() {
  const [filter, setFilter] = useState("All");

  const specializations = useMemo(() => {
    const set = new Set(faculty.map((f) => f.specialization));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return faculty;
    return faculty.filter((f) => f.specialization === filter);
  }, [filter]);

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8">
          <SectionHeading
            eyebrow={facultyPageData.pageHero.badgeLabel}
            title={facultyPageData.pageHero.title}
            subtitle={facultyPageData.pageHero.subtitle}
          />

          {/* Horizontal auto-scroll carousel — full bleed */}
          <RevealSection>
            <div className="-mx-6">
              <FacultyCarousel faculty={filter === "All" ? faculty : filtered} />
            </div>
          </RevealSection>

          {/* Filter pills */}
          <RevealSection>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setFilter(spec)}
                  className={clsx(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                    filter === spec
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "border border-slate-200 bg-white/80 text-slate-600 backdrop-blur-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>
          </RevealSection>

          <p className="text-sm text-slate-400 -mt-4">
            Click any card to view full profile • Auto-scrolls continuously
          </p>
        </div>
      </div>
    </div>
  );
}
