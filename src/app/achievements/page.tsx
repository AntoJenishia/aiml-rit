"use client";

import { achievements } from "@/data/achievements";
import { achievementsPageData } from "@/data/quickLinks";
import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import { Star, Trophy } from "lucide-react";
import clsx from "clsx";

export default function AchievementsPage() {
  const student    = achievements.filter((a) => a.category === "student");
  const department = achievements.filter((a) => a.category === "department");

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-14">

          <RevealSection>
            <SectionHeading eyebrow={achievementsPageData.pageHero.badgeLabel}
              title={achievementsPageData.pageHero.title}
              subtitle={achievementsPageData.pageHero.subtitle} />
          </RevealSection>

          {/* Student achievements */}
          <section>
            <RevealSection>
              <SectionHeading eyebrow="STUDENT WINS"
                title={achievementsPageData.studentSectionTitle}
                subtitle={achievementsPageData.studentSectionSubtitle} />
            </RevealSection>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {student.map((item, i) => (
                <CardReveal key={`${item.title}-${i}`} delay={i * 70}>
                  <div className="premium-card group relative h-full p-6">
                    <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-1 font-mono text-[10px] font-bold text-white">
                      {item.year}
                    </span>
                    <div className="inline-flex rounded-xl bg-amber-50 p-3 text-amber-500 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/30">
                      <Star className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700 pr-16">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                    <div className="mt-4 h-px origin-left scale-x-0 rounded-full bg-gradient-to-r from-amber-400 to-blue-500 transition-transform duration-300 group-hover:scale-x-100" />
                  </div>
                </CardReveal>
              ))}
            </div>
          </section>

          {/* Department timeline */}
          <section>
            <RevealSection delayMs={120}>
              <SectionHeading eyebrow="DEPARTMENT TIMELINE"
                title={achievementsPageData.departmentSectionTitle}
                subtitle={achievementsPageData.departmentSectionSubtitle} />
            </RevealSection>

            <div className="relative mt-10">
              <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-blue-100 via-blue-400 to-blue-100" />
              <div className="space-y-10">
                {department.map((item, i) => {
                  const isLeft = i % 2 === 0;
                  return (
                    <CardReveal key={`${item.title}-${i}`} delay={i * 80}>
                      <div className="relative">
                        <div className="absolute left-1/2 top-8 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-blue-600 ring-4 ring-blue-100 shadow-md shadow-blue-600/30" />
                        <div className={clsx("w-full lg:w-1/2", isLeft ? "lg:mr-auto lg:pr-12" : "lg:ml-auto lg:pl-12")}>
                          <p className="mb-2 font-mono text-xs font-bold tracking-widest text-blue-600">{item.year}</p>
                          <div className="premium-card group p-5">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                                {item.title}
                              </h3>
                              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-blue-300 transition-colors duration-300 group-hover:text-blue-600" />
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardReveal>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
