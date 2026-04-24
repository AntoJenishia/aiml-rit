"use client";

import { events, archiveEvents } from "@/data/events";
import { eventsPageData } from "@/data/quickLinks";
import type { EventType, EventTag, ArchiveEvent } from "@/lib/types";
import clsx from "clsx";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";

const TAG_STYLES: Record<EventTag, string> = {
  Workshop: "bg-blue-100 text-blue-700",
  Hackathon: "bg-orange-100 text-orange-700",
  Seminar: "bg-purple-100 text-purple-700",
  "Guest Lecture": "bg-teal-100 text-teal-700",
  FDP: "bg-green-100 text-green-700",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleString("en", { month: "short" }).toUpperCase(),
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventType>("upcoming");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [selectedArchive, setSelectedArchive] = useState<ArchiveEvent | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => e.type === activeTab).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeTab]);

  const archiveYears = useMemo(() => {
    const years = [...new Set(archiveEvents.map((e) => e.year))].sort((a, b) => b - a);
    return ["All", ...years.map(String)];
  }, []);

  const filteredArchive = useMemo(() => {
    if (yearFilter === "All") return archiveEvents;
    return archiveEvents.filter((e) => e.year === Number(yearFilter));
  }, [yearFilter]);

  /* Close lightbox on Escape */
  const closeLightbox = useCallback(() => setSelectedArchive(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    if (selectedArchive) {
      window.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [selectedArchive, closeLightbox]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            {eventsPageData.pageHero.badgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {eventsPageData.pageHero.title}
          </h1>
          {eventsPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
              {eventsPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {eventsPageData.tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200",
                  activeTab === tab.value
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event cards */}
        {filtered.length === 0 ? (
          <p className="text-center italic text-[#64748b]">{eventsPageData.emptyStateText}</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((ev) => {
              const date = formatDate(ev.date);
              const isUpcoming = ev.type === "upcoming";
              return (
                <div
                  key={`${ev.title}-${ev.date}`}
                  className={clsx(
                    "bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-5 transition-all duration-200 hover:shadow-md",
                    isUpcoming ? "border-l-4 border-l-blue-500" : "opacity-80 grayscale-[20%]"
                  )}
                >
                  {/* Date box */}
                  <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-xl bg-[#2563eb] text-white flex-col items-center justify-center">
                    <span className="text-xl font-extrabold leading-none">{date.day}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{date.month}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-semibold text-[#1e3a8a]">{ev.title}</p>
                      <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", TAG_STYLES[ev.tag])}>
                        {ev.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{ev.description}</p>
                    <p className="mt-2 text-xs text-slate-400 sm:hidden">{date.full}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── VISUAL ARCHIVE ─── */}
        <section className="pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">Visual Archive</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#1e3a8a]">Events That Shaped Us</h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          {/* Year filter pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {archiveYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYearFilter(y)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  yearFilter === y
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Archive grid */}
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArchive.map((archEv) => (
              <button
                key={archEv.id}
                type="button"
                onClick={() => setSelectedArchive(archEv)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={archEv.imageUrl}
                    alt={archEv.title}
                    fill
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Year chip */}
                  <span className="absolute top-3 right-3 rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                    {archEv.year}
                  </span>
                  {/* Hover overlay */}
                  <div className="archive-overlay rounded-t-2xl">
                    <span className="text-sm font-semibold text-white">View Details</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase", TAG_STYLES[archEv.category])}>
                    {archEv.category}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{archEv.title}</p>
                  <p className="mt-1.5 text-sm text-[#64748b] line-clamp-2">{archEv.description}</p>

                  {/* Highlights */}
                  <div className="mt-3 flex flex-col gap-1">
                    {archEv.highlights.slice(0, 3).map((h) => (
                      <span key={h} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" aria-hidden="true" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ─── LIGHTBOX ─── */}
      {selectedArchive ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={selectedArchive.title}
        >
          <div
            className="relative bg-white max-w-2xl w-full rounded-2xl overflow-hidden animate-scaleIn shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="relative aspect-video">
              <Image
                src={selectedArchive.imageUrl}
                alt={selectedArchive.title}
                fill
                sizes="672px"
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", TAG_STYLES[selectedArchive.category])}>
                  {selectedArchive.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedArchive.year}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-[#1e3a8a]">{selectedArchive.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{selectedArchive.description}</p>
              <div className="mt-5 flex flex-col gap-2">
                {selectedArchive.highlights.map((h) => (
                  <span key={h} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" aria-hidden="true" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
