"use client";

import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import { events, archiveEvents } from "@/data/events";
import { eventsPageData } from "@/data/quickLinks";
import type { EventType, EventTag, ArchiveEvent } from "@/lib/types";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { useMemo, useState, useEffect, useCallback } from "react";

const TAG_CLASS: Record<EventTag, string> = {
  Workshop:       "tag-workshop",
  Hackathon:      "tag-hackathon",
  Seminar:        "tag-seminar",
  "Guest Lecture":"tag-guest",
  FDP:            "tag-fdp",
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return {
    day: dt.getDate().toString().padStart(2, "0"),
    mon: dt.toLocaleString("en", { month: "short" }).toUpperCase(),
  };
}

export default function EventsPage() {
  const [tab, setTab]             = useState<EventType>("upcoming");
  const [yearFilter, setYearFilter] = useState("All");
  const [selected, setSelected]   = useState<ArchiveEvent | null>(null);

  const filtered = useMemo(
    () => events.filter((e) => e.type === tab).sort((a, b) => a.date.localeCompare(b.date)),
    [tab]
  );

  const years = useMemo(() => {
    const s = [...new Set(archiveEvents.map((e) => e.year))].sort((a, b) => b - a);
    return ["All", ...s.map(String)];
  }, []);

  const archiveFiltered = useMemo(
    () => yearFilter === "All" ? archiveEvents : archiveEvents.filter((e) => e.year === +yearFilter),
    [yearFilter]
  );

  const close = useCallback(() => setSelected(null), []);
  useEffect(() => {
    if (!selected) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [selected, close]);

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10">

          <RevealSection>
            <SectionHeading eyebrow={eventsPageData.pageHero.badgeLabel}
              title={eventsPageData.pageHero.title}
              subtitle={eventsPageData.pageHero.subtitle} />
          </RevealSection>

          {/* Tab switcher */}
          <RevealSection>
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-slate-100/80 p-1.5 backdrop-blur-sm">
                {eventsPageData.tabs.map((t) => (
                  <button key={t.value} type="button" onClick={() => setTab(t.value)}
                    className={clsx(
                      "rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200",
                      tab === t.value
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-blue-600"
                    )}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* Event list */}
          <div className="grid gap-3">
            {filtered.length === 0
              ? <p className="text-center italic text-slate-400">{eventsPageData.emptyStateText}</p>
              : filtered.map((ev, i) => {
                  const d = fmtDate(ev.date);
                  return (
                    <CardReveal key={`${ev.title}-${ev.date}`} delay={i * 70}>
                      <div className={clsx(
                        "premium-card group flex items-start gap-5 p-5",
                        ev.type === "upcoming" && "border-l-4 border-l-blue-500"
                      )}>
                        {/* Date badge */}
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 transition-transform duration-300 group-hover:scale-105">
                          <span className="font-display text-xl font-bold leading-none">{d.day}</span>
                          <span className="text-[9px] uppercase tracking-wide opacity-80">{d.mon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-700">
                              {ev.title}
                            </p>
                            <span className={clsx("rounded-full px-3 py-1 text-[10px] font-semibold", TAG_CLASS[ev.tag])}>
                              {ev.tag}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{ev.description}</p>
                        </div>
                      </div>
                    </CardReveal>
                  );
                })
            }
          </div>

          {/* Archive */}
          <RevealSection delayMs={100}>
            <div className="pt-4">
              <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
              <SectionHeading eyebrow="VISUAL ARCHIVE" title="Events That Shaped Us"
                subtitle="A curated timeline of workshops, hackathons, and talks." align="center" />

              {/* Year filters */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {years.map((y) => (
                  <button key={y} type="button" onClick={() => setYearFilter(y)}
                    className={clsx(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
                      yearFilter === y
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "border border-slate-200 bg-white/80 text-slate-600 backdrop-blur-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    )}>
                    {y}
                  </button>
                ))}
              </div>

              {/* Archive grid */}
              <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {archiveFiltered.map((ev, i) => (
                  <CardReveal key={ev.id} delay={i * 65}>
                    <button type="button" onClick={() => setSelected(ev)}
                      className="premium-card group relative w-full text-left">
                      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                        <Image src={ev.imageUrl} alt={ev.title} fill
                          sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
                          {ev.year}
                        </span>
                        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="p-4">
                        <span className={clsx("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", TAG_CLASS[ev.category])}>
                          {ev.category}
                        </span>
                        <p className="mt-2 text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-700">
                          {ev.title}
                        </p>
                        <p className="line-clamp-2 mt-1 text-xs text-slate-500">{ev.description}</p>
                      </div>
                    </button>
                  </CardReveal>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
              onClick={close}>
              <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl modal-pop"
                onClick={e => e.stopPropagation()}>
                <button type="button" onClick={close} aria-label="Close"
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/40">
                  <X className="h-4 w-4" />
                </button>
                <div className="relative aspect-video">
                  <Image src={selected.imageUrl} alt={selected.title} fill sizes="672px" className="object-cover" />
                </div>
                <div className="p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={clsx("rounded-full px-3 py-1 text-[10px] font-semibold", TAG_CLASS[selected.category])}>
                      {selected.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] text-slate-600">
                      {selected.year}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900">{selected.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{selected.description}</p>
                  <div className="mt-4 space-y-2">
                    {selected.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2.5 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
