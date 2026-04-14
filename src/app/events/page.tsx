"use client";

import EventCard from "@/components/EventCard";
import SectionHeading from "@/components/SectionHeading";
import { events } from "@/data/events";
import { eventsPageData, motionTokens } from "@/data/quickLinks";
import type { EventType } from "@/lib/types";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventType>(eventsPageData.tabs[0]?.value ?? "upcoming");
  const prefersReducedMotion = useReducedMotion();
  const HeroIcon = eventsPageData.pageHero.badgeIcon;

  const filtered = useMemo(() => {
    const list = events.filter((e) => e.type === activeTab);
    return list.slice().sort((a, b) => a.date.localeCompare(b.date));
  }, [activeTab]);

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
            <span>{eventsPageData.pageHero.badgeLabel}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{eventsPageData.pageHero.title}</h1>
          {eventsPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-200/80 sm:text-base">
              {eventsPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>
      </motion.section>

      <SectionHeading title={eventsPageData.pageTitle} subtitle={eventsPageData.pageHero.subtitle} align="center" />

      <div className="flex justify-center">
        <div className="inline-flex w-fit rounded-full bg-slate-100 p-1">
          {eventsPageData.tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={clsx(
                "relative rounded-full px-6 py-2 text-sm font-semibold",
                "transition-colors",
                activeTab === tab.value ? "text-white" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {activeTab === tab.value ? (
                <motion.div
                  layoutId="eventTab"
                  className="absolute inset-0 rounded-full bg-blue-600"
                  transition={
                    prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }
                  }
                />
              ) : null}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 italic">{eventsPageData.emptyStateText}</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((eventItem, index) => (
            <motion.div
              key={`${eventItem.title}-${eventItem.date}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
              }
            >
              <EventCard event={eventItem} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
