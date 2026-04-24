"use client";

import SectionHeading from "@/components/SectionHeading";
import { useInView } from "@/lib/hooks/useInView";
import { syllabus } from "@/data/syllabus";
import { syllabusPageData } from "@/data/quickLinks";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

function SyllabusAccordion() {
  const [openSems, setOpenSems] = useState<Set<number>>(new Set());
  const [ref, visible] = useInView<HTMLDivElement>({ threshold: 0.04, once: true });

  const sorted = useMemo(() => [...syllabus].sort((a, b) => a.semester - b.semester), []);

  function toggle(sem: number) {
    setOpenSems((prev) => {
      const next = new Set(prev);
      next.has(sem) ? next.delete(sem) : next.add(sem);
      return next;
    });
  }

  return (
    <div ref={ref} className="grid gap-3">
      {sorted.map((sem, i) => {
        const isOpen = openSems.has(sem.semester);
        return (
          <div
            key={sem.semester}
            className={clsx(
              "overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm transition-all duration-300",
              isOpen
                ? "border-blue-300 shadow-[0_0_0_2px_#bfdbfe,0_8px_24px_-8px_rgba(37,99,235,0.18)]"
                : "border-slate-200/80 hover:border-blue-200 hover:shadow-[0_0_0_1.5px_#bfdbfe,0_6px_20px_-8px_rgba(59,130,246,0.12)]",
              visible ? "reveal-item" : "opacity-0"
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggle(sem.semester)}
              className={clsx(
                "flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors duration-200",
                isOpen ? "bg-blue-50/60" : "hover:bg-slate-50/80"
              )}
            >
              <span className="min-w-[68px] rounded-lg bg-blue-600 px-3 py-1.5 text-center font-mono text-[11px] font-bold text-white shadow-sm shadow-blue-600/20">
                SEM {sem.semester}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Semester {sem.semester}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    — {sem.subjects.length} subjects
                  </span>
                </p>
              </div>
              <ChevronDown
                className={clsx(
                  "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                  isOpen && "rotate-180 text-blue-500"
                )}
              />
            </button>

            {/* Body — smooth height transition */}
            <div
              className={clsx(
                "overflow-hidden transition-all duration-500 ease-in-out",
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-t border-slate-100">
                {sem.subjects.map((subj, rowIdx) => (
                  <div
                    key={subj.code}
                    className={clsx(
                      "group flex items-center gap-0 border-b border-slate-50 px-5 py-3 last:border-0 transition-colors duration-150",
                      rowIdx % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-slate-50/60 hover:bg-blue-50/50"
                    )}
                  >
                    <span className="w-28 shrink-0 font-mono text-xs font-bold text-blue-600 transition-colors group-hover:text-blue-700">
                      {subj.code}
                    </span>
                    <span className="mx-4 h-4 w-px bg-slate-200" />
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
  );
}

export default function SyllabusPage() {
  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8">
          <SectionHeading
            eyebrow={syllabusPageData.pageHero.badgeLabel}
            title={syllabusPageData.pageHero.title}
            subtitle={syllabusPageData.pageHero.subtitle}
          />
          <SyllabusAccordion />
        </div>
      </div>
    </div>
  );
}
