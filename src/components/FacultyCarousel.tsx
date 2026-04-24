"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Cpu, Mail } from "lucide-react";
import type { Faculty } from "@/lib/types";

/* One vivid accent per slot — used for the card's top bar + ring, NOT full bg */
const ACCENTS = [
  { bar: "#2563eb", ring: "rgba(37,99,235,0.35)",  tag: "#2563eb" },
  { bar: "#7c3aed", ring: "rgba(124,58,237,0.35)", tag: "#7c3aed" },
  { bar: "#0d9488", ring: "rgba(13,148,136,0.35)", tag: "#0d9488" },
  { bar: "#db2777", ring: "rgba(219,39,119,0.35)", tag: "#db2777" },
  { bar: "#d97706", ring: "rgba(217,119,6,0.35)",  tag: "#d97706" },
  { bar: "#0891b2", ring: "rgba(8,145,178,0.35)",  tag: "#0891b2" },
  { bar: "#16a34a", ring: "rgba(22,163,74,0.35)",  tag: "#16a34a" },
  { bar: "#9333ea", ring: "rgba(147,51,234,0.35)", tag: "#9333ea" },
];

const CARD_W    = 220;
const CARD_H    = 280;
const GAP       = 18;
const SPEED     = 0.55;

/** Generates avatar text from name */
function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

interface FacultyCarouselProps { faculty: Faculty[] }

export default function FacultyCarousel({ faculty }: FacultyCarouselProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const xRef      = useRef(0);
  const rafRef    = useRef<number>(0);
  const paused    = useRef(false);
  const [selected, setSelected] = useState<{ member: Faculty; accent: typeof ACCENTS[0]; idx: number } | null>(null);

  /* Triple the list for seamless loop */
  const items = [...faculty, ...faculty, ...faculty].map((f, i) => ({
    ...f, accent: ACCENTS[i % ACCENTS.length], uid: i,
  }));
  const loopW = faculty.length * (CARD_W + GAP);

  const scroll = useCallback(() => {
    if (!paused.current) {
      xRef.current += SPEED;
      if (xRef.current >= loopW) xRef.current -= loopW;
      if (trackRef.current) trackRef.current.style.transform = `translateX(-${xRef.current}px)`;
    }
    rafRef.current = requestAnimationFrame(scroll);
  }, [loopW]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scroll]);

  useEffect(() => {
    if (!selected) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [selected]);

  const open = (member: Faculty, i: number) =>
    setSelected({ member, accent: ACCENTS[i % ACCENTS.length], idx: i });

  const goDir = (dir: 1 | -1) => {
    if (!selected) return;
    const next = (selected.idx + dir + faculty.length) % faculty.length;
    open(faculty[next], next);
  };

  return (
    <>
      {/* ── Carousel ── */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
        style={{ height: CARD_H + 16 }}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent" />

        <div
          ref={trackRef}
          className="absolute top-2 flex will-change-transform"
          style={{ gap: GAP, left: 0 }}
        >
          {items.map((member) => (
            <button
              key={member.uid}
              type="button"
              onClick={() => open(member, member.uid % faculty.length)}
              className="group relative shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              style={{
                width: CARD_W,
                height: CARD_H,
                boxShadow: "0 2px 12px -4px rgba(15,23,42,0.10)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 0 0 2px ${member.accent.bar}, 0 12px 32px -8px ${member.accent.ring}, 0 4px 16px -4px rgba(15,23,42,0.15)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px -4px rgba(15,23,42,0.10)";
              }}
            >
              {/* Top coloured accent bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: member.accent.bar }}
              />

              {/* Avatar — large initials circle with accent colour */}
              <div className="flex flex-col items-center pt-8 pb-5 px-4">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-black shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${member.accent.bar}dd, ${member.accent.bar}88)` }}
                >
                  {initials(member.name)}
                </div>

                <p className="mt-4 text-center text-sm font-bold text-slate-900 leading-tight">
                  {member.name}
                </p>
                <p className="mt-1 text-center text-xs font-medium text-slate-500">
                  {member.qualification}
                </p>

                {/* Specialization pill */}
                <span
                  className="mt-3 rounded-full px-3 py-1 text-[10px] font-bold text-white"
                  style={{ background: member.accent.bar }}
                >
                  {member.specialization}
                </span>

                {/* Experience */}
                <p className="mt-3 text-xs text-slate-400 font-medium">
                  {member.experience}+ yrs experience
                </p>
              </div>

              {/* Hover hint */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-slate-900/10 px-3 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur-sm">
                  View Profile →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-[fadeSlideUp_0.35s_ease-out_both]"
            onClick={e => e.stopPropagation()}
          >
            {/* Coloured header */}
            <div
              className="relative flex flex-col items-center pt-10 pb-7 px-6"
              style={{ background: `linear-gradient(145deg, ${selected.accent.bar}22, ${selected.accent.bar}08)` }}
            >
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-white text-3xl font-black shadow-xl"
                style={{ background: `linear-gradient(135deg, ${selected.accent.bar}, ${selected.accent.bar}bb)` }}
              >
                {initials(selected.member.name)}
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-900 text-center">
                {selected.member.name}
              </h3>
              <span
                className="mt-2 rounded-full px-4 py-1 text-xs font-bold text-white"
                style={{ background: selected.accent.bar }}
              >
                {selected.member.qualification}
              </span>

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-700 transition hover:bg-black/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Info rows */}
            <div className="px-6 pb-6 pt-4 space-y-2.5">
              {[
                { Icon: Cpu,          label: "Specialization", value: selected.member.specialization },
                { Icon: Briefcase,    label: "Experience",     value: `${selected.member.experience}+ Years` },
                { Icon: GraduationCap,label: "Qualification",  value: selected.member.qualification },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: selected.accent.bar }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={() => goDir(-1)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button type="button" onClick={() => goDir(1)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition"
                style={{ background: selected.accent.bar }}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
