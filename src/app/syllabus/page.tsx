"use client";

import SectionHeading from "@/components/SectionHeading";
import { syllabus } from "@/data/syllabus";
import { syllabusPageData } from "@/data/quickLinks";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function SyllabusPage() {
  /* ✅ FIX: Set<number> for independently toggleable accordions */
  const [openSems, setOpenSems] = useState<Set<number>>(new Set([1]));

  const sorted = useMemo(() => [...syllabus].sort((a, b) => a.semester - b.semester), []);

  const toggle = (sem: number) => {
    setOpenSems((prev) => {
      const next = new Set(prev);
      if (next.has(sem)) next.delete(sem);
      else next.add(sem);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            {syllabusPageData.pageHero.badgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {syllabusPageData.pageHero.title}
          </h1>
          {syllabusPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
              {syllabusPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>

        {/* Accordion list */}
        <div className="grid gap-3">
          {sorted.map((sem) => {
            const isOpen = openSems.has(sem.semester);
            const semLabel = String(sem.semester).padStart(2, "0");

            return (
              <div
                key={sem.semester}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => toggle(sem.semester)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200",
                    isOpen && "bg-blue-50/60"
                  )}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-[#2563eb] px-3.5 py-1 font-mono text-xs font-bold text-white">
                      {syllabusPageData.semesterLabelPrefix} {semLabel}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {syllabusPageData.semesterTitlePrefix} {sem.semester}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        {sem.subjects.length} {syllabusPageData.subjectCountLabel}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={clsx(
                      "h-5 w-5 text-slate-500 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* Content — CSS max-height transition */}
                <div
                  className={clsx(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="border-l-4 border-blue-200 ml-4 pl-4 py-2">
                    {sem.subjects.map((subj, rowIndex) => (
                      <div
                        key={subj.code}
                        className={clsx(
                          "grid grid-cols-[100px,1fr] gap-4 px-3 py-2.5 rounded-lg",
                          rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                        )}
                      >
                        <span className="font-mono text-sm font-semibold text-[#2563eb]">{subj.code}</span>
                        <span className="text-sm text-slate-700">{subj.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
