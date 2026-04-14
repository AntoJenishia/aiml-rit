"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import SectionHeading from "@/components/SectionHeading";
import HodTeaserCard from "@/components/HodTeaserCard";
import { aboutData, aboutIconData } from "@/data/about";
import { hodData } from "@/data/hod";
import { motionTokens } from "@/data/quickLinks";

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion();
  const VisionIcon = aboutIconData.vision;
  const MissionIcon = aboutIconData.mission;

  return (
    <div className="grid gap-10">
      <motion.section
        className="relative flex h-48 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-8"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
            {aboutData.pageHeroBadgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{aboutData.pageHeroTitle}</h1>
        </div>
      </motion.section>

      <motion.section
        className="grid gap-4 lg:grid-cols-2"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }}
      >
        <div className={clsx(GLASS_CARD_CLASS, "p-8", "border-l-4 border-blue-500")}>
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600/10 p-3 text-blue-700">
              <VisionIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <SectionHeading title={aboutData.visionTitle} />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{aboutData.visionText}</p>
            </div>
          </div>
        </div>

        <div className={clsx(GLASS_CARD_CLASS, "p-8", "border-l-4 border-violet-500")}>
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-600/10 p-3 text-violet-700">
              <MissionIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <SectionHeading title={aboutData.missionTitle} />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{aboutData.missionText}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }}
      >
        <SectionHeading title={aboutData.programmeOutcomesTitle} subtitle={aboutData.programmeOutcomesSubtitle} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {aboutData.programmeOutcomes.map((po, index) => (
            <motion.div
              key={po.code}
              className={clsx(GLASS_CARD_CLASS, "relative overflow-hidden p-6")}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }}
            >
              <div className="pointer-events-none absolute -right-2 -top-6 text-6xl font-black text-transparent opacity-10 [background:linear-gradient(90deg,#1e3a8a,#2563eb,#7c3aed)] bg-clip-text">
                {index + 1}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{po.code}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{po.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <HodTeaserCard
        label={aboutData.hodTeaserLabel}
        title={aboutData.hodTeaserTitle}
        name={hodData.name}
        designation={hodData.designation}
        href={aboutData.hodTeaserHref}
        buttonText={aboutData.hodTeaserButtonText}
      />
    </div>
  );
}
