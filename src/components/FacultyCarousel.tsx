"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Cpu, Mail } from "lucide-react";
import type { Faculty } from "@/lib/types";
import Link from "next/link";

const ACADEMIC_THEME = {
  primary: "#003087", // RIT Blue
  secondary: "#1e293b", // slate-800
  light: "#f1f5f9", // slate-100
  border: "#e2e8f0", // slate-200
  hoverRing: "rgba(0, 48, 135, 0.15)",
};

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
  const items = faculty.map((f, i) => ({
    ...f, uid: f.uid || i.toString(),
  }));

  return (
    <>
      {/* ── Carousel ── */}
      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 md:w-16 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 md:w-16 bg-gradient-to-l from-slate-50 to-transparent" />

        <div className="flex gap-4 md:gap-6 overflow-x-auto py-6 px-4 md:px-8 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((member) => (
            <Link
              key={member.uid}
              href={`/faculty/${member.uid}`}
              className="group relative shrink-0 overflow-hidden rounded-xl bg-white text-left border border-slate-200 transition-all duration-300 hover:border-[#003087] hover:shadow-lg snap-start block"
              style={{ width: CARD_W, height: CARD_H }}
            >
              {/* Top coloured accent bar */}
              <div
                className="h-1 w-full bg-slate-200 group-hover:bg-[#003087] transition-colors duration-300"
              />

              {/* Avatar — Professional Initials Circle */}
              <div className="flex flex-col items-center pt-8 pb-5 px-4">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-[#003087] text-2xl font-black transition-all duration-300 group-hover:bg-[#003087] group-hover:text-white"
                >
                  {initials(member.name)}
                </div>

                <p className="mt-4 text-center text-sm font-bold text-slate-800 leading-tight group-hover:text-[#003087] transition-colors">
                  {member.name}
                </p>
                <p className="mt-1 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {member.qualification || <span className="text-slate-400 lowercase normal-case italic">Profile pending</span>}
                </p>

                {/* Specialization pill */}
                {member.specialization && (
                  <span
                    className="mt-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600 transition-colors group-hover:border-[#003087]/20 group-hover:bg-[#003087]/5"
                  >
                    {member.specialization}
                  </span>
                )}

                {/* Experience */}
                {member.experience > 0 && (
                  <p className="mt-3 text-xs text-slate-400 font-medium">
                    {member.experience}+ years exp.
                  </p>
                )}
              </div>

              {/* Hover hint */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-slate-900/10 px-3 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur-sm">
                  View Profile →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
