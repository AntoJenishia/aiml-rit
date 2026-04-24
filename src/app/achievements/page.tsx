import { achievements } from "@/data/achievements";
import { achievementsPageData } from "@/data/quickLinks";
import { Trophy, GraduationCap, Building2 } from "lucide-react";
import clsx from "clsx";

export default function AchievementsPage() {
  const student = achievements.filter((a) => a.category === "student");
  const department = achievements.filter((a) => a.category === "department");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-14">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            {achievementsPageData.pageHero.badgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {achievementsPageData.pageHero.title}
          </h1>
          {achievementsPageData.pageHero.subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
              {achievementsPageData.pageHero.subtitle}
            </p>
          ) : null}
        </div>

        {/* ─── Student Achievements ─── */}
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1e3a8a]">
            {achievementsPageData.studentSectionTitle}
          </h2>
          <p className="mt-1 text-sm text-[#64748b]">{achievementsPageData.studentSectionSubtitle}</p>
          <div className="mt-2 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {student.map((item) => (
              <div
                key={`${item.title}-${item.year}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-[#2563eb] px-2.5 py-1 text-xs font-semibold text-white">
                    {item.year}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#1e3a8a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-blue-200" />
          <div className="rounded-full bg-[#2563eb] p-3 text-white shrink-0">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="h-px flex-1 bg-blue-200" />
        </div>

        {/* ─── Department Achievements — Timeline ─── */}
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1e3a8a]">
            {achievementsPageData.departmentSectionTitle}
          </h2>
          <p className="mt-1 text-sm text-[#64748b]">{achievementsPageData.departmentSectionSubtitle}</p>
          <div className="mt-2 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          {/* Vertical timeline */}
          <div className="relative mt-10">
            {/* Center line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 lg:left-1/2 lg:-translate-x-1/2" aria-hidden="true" />

            <div className="grid gap-8">
              {department.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div
                    key={`${item.title}-${item.year}`}
                    className={clsx(
                      "relative pl-12 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-8",
                      isLeft ? "" : "lg:direction-rtl"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-[#2563eb] ring-4 ring-blue-100 lg:left-1/2 lg:-translate-x-1/2 z-10" />

                    {/* Card - alternating sides on desktop, left-aligned on mobile */}
                    <div className={clsx("lg:col-span-1", isLeft ? "lg:col-start-1 lg:text-right" : "lg:col-start-2 lg:text-left")}>
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-blue-50 p-2.5 text-[#2563eb] shrink-0">
                            <Building2 className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-[#1e3a8a]">{item.title}</h3>
                              <span className="text-xs font-semibold text-[#2563eb]">{item.year}</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
