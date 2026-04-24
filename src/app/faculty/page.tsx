"use client";

import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
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
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-14">
          <SectionHeading
            eyebrow={facultyPageData.pageHero.badgeLabel}
            title={facultyPageData.pageHero.title}
            subtitle={facultyPageData.pageHero.subtitle}
          />

          {/* Filter pills */}
          <RevealSection>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setFilter(spec)}
                  className={clsx(
                    "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
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

          {/* Faculty grid — each card individually staggered */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member, i) => (
              <div
                key={member.name}
                className="card-reveal premium-card group overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Photo header */}
                <div className="relative bg-gradient-to-br from-blue-50 to-slate-50 p-6 text-center transition-colors duration-300 group-hover:from-blue-100 group-hover:to-blue-50">
                  {/* Coloured ring glow on hover */}
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-md transition-shadow duration-300 group-hover:shadow-[0_0_0_4px_rgba(37,99,235,0.2)] group-hover:ring-blue-100">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-4 text-lg font-bold text-[#1e3a8a]">{member.name}</p>
                  <span className="mt-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs text-white shadow-sm shadow-blue-600/30">
                    {member.qualification}
                  </span>
                </div>

                {/* Details */}
                <div className="border-t border-slate-100 p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{member.specialization}</span>
                  </div>
                  <p className="mt-3 font-mono text-sm font-semibold text-blue-600">
                    {member.experience}+ yrs experience
                  </p>
                  {/* Animated underline */}
                  <div className="mt-4 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
