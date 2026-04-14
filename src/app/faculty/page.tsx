"use client";

import FacultyCard from "@/components/FacultyCard";
import SectionHeading from "@/components/SectionHeading";
import { faculty } from "@/data/faculty";
import { facultyPageData, motionTokens } from "@/data/quickLinks";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

export default function FacultyPage() {
  const prefersReducedMotion = useReducedMotion();
  const HeroIcon = facultyPageData.pageHero.badgeIcon;

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
            <span>{facultyPageData.pageHero.badgeLabel}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{facultyPageData.pageHero.title}</h1>
          {facultyPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-200/80 sm:text-base">
              {facultyPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>
      </motion.section>

      <SectionHeading title={facultyPageData.pageTitle} subtitle={facultyPageData.pageHero.subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {faculty.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
            }
            className={clsx("will-change-transform")}
          >
            <FacultyCard faculty={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
