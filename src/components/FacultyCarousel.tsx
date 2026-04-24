"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Cpu } from "lucide-react";
import type { Faculty } from "@/lib/types";

/* Vivid card accent colours — one per card, cycling */
const CARD_ACCENTS = [
  { bg: "from-blue-600 to-blue-800",    ring: "ring-blue-400",   label: "bg-blue-500" },
  { bg: "from-violet-600 to-purple-800",ring: "ring-violet-400", label: "bg-violet-500" },
  { bg: "from-rose-500 to-pink-700",    ring: "ring-rose-400",   label: "bg-rose-500" },
  { bg: "from-teal-500 to-emerald-700", ring: "ring-teal-400",   label: "bg-teal-500" },
  { bg: "from-amber-500 to-orange-600", ring: "ring-amber-400",  label: "bg-amber-500" },
  { bg: "from-sky-500 to-cyan-700",     ring: "ring-sky-400",    label: "bg-sky-500" },
  { bg: "from-indigo-600 to-blue-800",  ring: "ring-indigo-400", label: "bg-indigo-500" },
  { bg: "from-fuchsia-600 to-pink-700", ring: "ring-fuchsia-400",label: "bg-fuchsia-500" },
];

const CARD_W = 240;   // px width of each card including gap
const CARD_GAP = 20;
const SCROLL_SPEED = 0.7; // px per frame
const PAUSE_ON_HOVER = true;

interface FacultyCarouselProps {
  faculty: Faculty[];
}

export default function FacultyCarousel({ faculty }: FacultyCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isPaused = useRef(false);
  const [selected, setSelected] = useState<(Faculty & { accent: typeof CARD_ACCENTS[0] }) | null>(null);

  /* Tripled list for seamless infinite loop */
  const items = [...faculty, ...faculty, ...faculty].map((f, i) => ({
    ...f,
    accent: CARD_ACCENTS[i % CARD_ACCENTS.length],
    uid: i,
  }));

  const totalW = faculty.length * (CARD_W + CARD_GAP);

  const scroll = useCallback(() => {
    if (!isPaused.current) {
      xRef.current += SCROLL_SPEED;
      if (xRef.current >= totalW) xRef.current -= totalW;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${xRef.current}px)`;
      }
    }
    rafRef.current = requestAnimationFrame(scroll);
  }, [totalW]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scroll]);

  /* Keyboard close */
  useEffect(() => {
    if (!selected) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [selected]);

  /* Manual prev/next while modal open */
  const openIdx = selected ? faculty.findIndex(f => f.name === selected.name) : -1;
  const goNext = () => { const n = (openIdx + 1) % faculty.length; const f = faculty[n]; setSelected({ ...f, accent: CARD_ACCENTS[n % CARD_ACCENTS.length] }); };
  const goPrev = () => { const n = (openIdx - 1 + faculty.length) % faculty.length; const f = faculty[n]; setSelected({ ...f, accent: CARD_ACCENTS[n % CARD_ACCENTS.length] }); };

  return (
    <>
      {/* ── Carousel strip ── */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => PAUSE_ON_HOVER && (isPaused.current = true)}
        onMouseLeave={() => PAUSE_ON_HOVER && (isPaused.current = false)}
      >
        {/* Left/right fade gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50 to-transparent" />

        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: CARD_GAP, width: `${items.length * (CARD_W + CARD_GAP)}px` }}
        >
          {items.map((member) => (
            <button
              key={member.uid}
              type="button"
              onClick={() => setSelected({ ...member })}
              className="group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ width: CARD_W, height: 300 }}
            >
              {/* Coloured gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.accent.bg} opacity-90 transition-opacity duration-300 group-hover:opacity-100`} />

              {/* Photo */}
              <div className="absolute inset-0 flex items-center justify-center pt-6">
                <div className={`h-28 w-28 overflow-hidden rounded-full ring-4 ${member.accent.ring} ring-offset-2 shadow-xl`}
                  style={{ ringOffsetColor: "transparent" }}>
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Info overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-12">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                  {member.specialization}
                </p>
                <p className="mt-0.5 text-base font-black text-white leading-tight">
                  {member.name}
                </p>
                <p className="mt-1 text-xs text-white/60">{member.qualification}</p>
              </div>

              {/* Hover "click" hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  View Profile
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Zoom modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top coloured header */}
            <div className={`relative h-52 bg-gradient-to-br ${selected.accent.bg} flex items-center justify-center`}>
              <div className={`h-32 w-32 overflow-hidden rounded-full ring-4 ${selected.accent.ring} ring-offset-2 shadow-2xl`}>
                <Image
                  src={selected.photo}
                  alt={selected.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Close */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/45"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-white px-8 py-6">
              <h3 className="text-2xl font-black text-slate-900">{selected.name}</h3>
              <span className={`mt-2 inline-block rounded-full ${selected.accent.label} px-3 py-1 text-xs font-bold text-white shadow-sm`}>
                {selected.qualification}
              </span>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Cpu className="h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Specialization</p>
                    <p className="text-sm font-bold text-slate-800">{selected.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Briefcase className="h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Experience</p>
                    <p className="text-sm font-bold text-slate-800">{selected.experience}+ Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <GraduationCap className="h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Qualification</p>
                    <p className="text-sm font-bold text-slate-800">{selected.qualification}</p>
                  </div>
                </div>
              </div>

              {/* Prev / Next */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
