"use client";

import HeroSection from "@/components/HeroSection";
import SectionHeading from "@/components/SectionHeading";
import StatCard from "@/components/StatCard";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { homeData, motionTokens, quickLinks } from "@/data/quickLinks";
import { statItems } from "@/data/stats";

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid gap-12">
      <HeroSection
        title={homeData.heroTitle}
        subtitle={homeData.heroSubtitle}
        ctaText={homeData.primaryCtaText}
        ctaHref={homeData.primaryCtaHref}
        secondaryCtaText={homeData.secondaryCtaText}
        secondaryCtaHref={homeData.secondaryCtaHref}
      />

      <motion.section
        className="grid gap-5 sm:grid-cols-3"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }
        }
      >
        {statItems.map((item) => (
          <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} suffix={item.suffix} />
        ))}
      </motion.section>

      <motion.section
        className={clsx(GLASS_CARD_CLASS, "p-8")}
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }
        }
      >
        <SectionHeading title={homeData.introTitle} subtitle={homeData.introText} />
      </motion.section>

      <motion.section
        className="grid gap-6"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }
        }
      >
        <SectionHeading title={homeData.quickLinksTitle} subtitle={homeData.quickLinksSubtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
                }
              >
                <Link
                  href={item.href}
                  className={clsx(
                    GLASS_CARD_CLASS,
                    "group block p-6",
                    "transition-shadow duration-300 hover:shadow-2xl hover:shadow-blue-200/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 text-white shadow-lg shadow-blue-200/30">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-slate-900">{item.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
