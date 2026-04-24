"use client";

import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import { syllabus } from "@/data/syllabus";
import { syllabusPageData } from "@/data/quickLinks";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function SyllabusPage() {
  const [openSems, setOpenSems] = useState<Set<number>>(new Set());

  const sorted = useMemo(() => [...syllabus].sort((a, b) => a.semester - b.semester), []);

  function toggle(sem: number) {
    setOpenSems((prev) => {
      const next = new Set(prev);
      next.has(sem) ? next.delete(sem) : next.add(sem);
      return next;
    });
  }

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-14">
          <SectionHeading
            eyebrow={syllabusPageData.pageHero.badgeLabel}
            title={syllabusPageData.pageHero.title}
            subtitle={syllabusPageData.pageHero.subtitle}
          />

          <RevealSection>
            <div className="grid gap-3">
              {sorted.map((sem, i) => {
                const isOpen = openSems.has(sem.semester);
                return (
                  <div
                    key={sem.semester}
                    className={clsx(
                      "card-reveal overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300",
                      isOpen
                        ? "border-blue-200 shadow-blue-100 shadow-md"
                        : "border-slate-100 hover:border-blue-100 hover:shadow-md"
                    )}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Accordion header */}
                    <button
                      type="button"
                      onClick={() => toggle(sem.semester)}
                      className={clsx(
                        "flex w-full cursor-pointer items-center gap-4 p-5 text-left transition-colors duration-200",
                        isOpen ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                      )}
                    >
                      {/* Semester badge */}
                      <span className="min-w-[72px] rounded-lg bg-blue-600 px-3 py-1.5 text-center font-mono text-xs font-bold text-white shadow-sm shadow-blue-600/20">
                        {syllabusPageData.semesterLabelPrefix} {sem.semester}
                      </span>

                      <div className="flex-1">
                        <p className="text-base font-semibold text-slate-800">
                          {syllabusPageData.semesterTitlePrefix} {sem.semester}
                          <span className="ml-2 text-xs font-normal text-slate-400">
                            {sem.subjects.length} {syllabusPageData.subjectCountLabel}
                          </span>
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronDown
                        className={clsx(
                          "ml-auto h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300",
                          isOpen && "rotate-180 text-blue-500"
                        )}
                      />
                    </button>

                    {/* Accordion body */}
                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="border-t border-slate-100">
                        {sem.subjects.map((subj, rowIndex) => (
                          <div
                            key={subj.code}
                            className={clsx(
                              "group flex items-center border-b border-slate-50 px-6 py-3.5 last:border-0 transition-colors duration-150",
                              rowIndex % 2 === 0
                                ? "bg-white hover:bg-blue-50/50"
                                : "bg-slate-50/60 hover:bg-blue-50/50"
                            )}
                          >
                            <span className="w-28 shrink-0 font-mono text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
                              {subj.code}
                            </span>
                            <span className="mx-4 h-5 w-px bg-slate-200" />
                            <span className="text-sm text-slate-700 transition-colors group-hover:text-slate-900">
                              {subj.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}
