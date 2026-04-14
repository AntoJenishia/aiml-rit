"use client";

import SectionHeading from "@/components/SectionHeading";
import { syllabus } from "@/data/syllabus";
import { syllabusPageData, motionTokens } from "@/data/quickLinks";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function SyllabusPage() {
  const [openSemester, setOpenSemester] = useState<number | null>(1);
  const prefersReducedMotion = useReducedMotion();
  const HeroIcon = syllabusPageData.pageHero.badgeIcon;

  const sorted = useMemo(() => [...syllabus].sort((a, b) => a.semester - b.semester), []);

  return (
    <div className="grid gap-10">
      <motion.section
        className="relative flex h-48 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-8"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-200">
            <HeroIcon className="h-4 w-4" aria-hidden="true" />
            <span>{syllabusPageData.pageHero.badgeLabel}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{syllabusPageData.pageHero.title}</h1>
          {syllabusPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-200/80 sm:text-base">
              {syllabusPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>
      </motion.section>

      <SectionHeading title={syllabusPageData.pageTitle} subtitle={syllabusPageData.pageHero.subtitle} />

      <div className="grid gap-3">
        {sorted.map((sem, index) => {
          const isOpen = openSemester === sem.semester;
          const semLabel = String(sem.semester).padStart(2, "0");
          return (
            <motion.div
              key={sem.semester}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
              }
              className="bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenSemester((prev) => (prev === sem.semester ? null : sem.semester))}
                className={clsx(
                  "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
                  isOpen && "bg-blue-50/70"
                )}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-1.5 font-mono text-sm font-bold text-white">
                    {syllabusPageData.semesterLabelPrefix} {semLabel}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {syllabusPageData.semesterTitlePrefix} {sem.semester}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {sem.subjects.length} {syllabusPageData.subjectCountLabel}
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-slate-700" aria-hidden="true" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="border-t border-white/50">
                      <div className="divide-y divide-slate-100/80">
                        {sem.subjects.map((subj, rowIndex) => (
                          <div
                            key={subj.code}
                            className={clsx(
                              "grid grid-cols-[120px,1fr] gap-4 px-5 py-3",
                              rowIndex % 2 === 0 ? "bg-white/60" : "bg-slate-50/50"
                            )}
                          >
                            <span className="font-mono text-sm font-semibold text-blue-600">{subj.code}</span>
                            <span className="text-sm text-slate-700">{subj.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
