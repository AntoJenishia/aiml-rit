"use client";

import AchievementCard from "@/components/AchievementCard";
import SectionHeading from "@/components/SectionHeading";
import { achievements } from "@/data/achievements";
import { achievementsPageData, motionTokens } from "@/data/quickLinks";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { Trophy } from "lucide-react";

export default function AchievementsPage() {
  const prefersReducedMotion = useReducedMotion();
  const HeroIcon = achievementsPageData.pageHero.badgeIcon;

  const student = achievements.filter((a) => a.category === "student");
  const department = achievements.filter((a) => a.category === "department");

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
            <span>{achievementsPageData.pageHero.badgeLabel}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{achievementsPageData.pageHero.title}</h1>
          {achievementsPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-200/80 sm:text-base">
              {achievementsPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>
      </motion.section>

      <SectionHeading title={achievementsPageData.pageTitle} subtitle={achievementsPageData.pageHero.subtitle} />

      <section className="grid gap-6">
        <SectionHeading
          title={achievementsPageData.studentSectionTitle}
          subtitle={achievementsPageData.studentSectionSubtitle}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {student.map((item, index) => (
            <motion.div
              key={`${item.title}-${item.year}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
              }
            >
              <AchievementCard achievement={item} />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
        <div className={clsx("rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 text-white shadow-lg")}>
          <Trophy className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
      </div>

      <section className="grid gap-6">
        <SectionHeading
          title={achievementsPageData.departmentSectionTitle}
          subtitle={achievementsPageData.departmentSectionSubtitle}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {department.map((item, index) => (
            <motion.div
              key={`${item.title}-${item.year}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
              }
            >
              <AchievementCard achievement={item} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
