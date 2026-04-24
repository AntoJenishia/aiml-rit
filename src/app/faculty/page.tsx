"use client";

import Image from "next/image";
import { faculty } from "@/data/faculty";
import { facultyPageData } from "@/data/quickLinks";
import { facultyCardData } from "@/data/faculty";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function FacultyPage() {
  const [filter, setFilter] = useState("All");

  const specializations = useMemo(() => {
    const set = new Set(faculty.map((f) => f.specialization));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return faculty;
    return faculty.filter((f) => f.specialization === filter);
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            {facultyPageData.pageHero.badgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {facultyPageData.pageHero.title}
          </h1>
          {facultyPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
              {facultyPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setFilter(spec)}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                filter === spec
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Faculty grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <div
              key={member.name}
              className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1 card-slide-rule"
            >
              <div className="p-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-slate-100 transition-all duration-200 group-hover:ring-blue-300">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-[#1e3a8a]">{member.name}</p>
                  <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {member.qualification}
                  </span>
                  <div className="mt-3">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {member.specialization}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-[#64748b]">
                    <span className="uppercase tracking-widest">{facultyCardData.experienceLabel}</span>{" "}
                    <span className="font-semibold text-slate-800">{member.experience}</span>{" "}
                    {facultyCardData.experienceUnit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
