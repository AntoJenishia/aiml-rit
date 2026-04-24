import { aboutData, aboutIconData } from "@/data/about";
import { hodData } from "@/data/hod";
import Link from "next/link";

export default function AboutPage() {
  const VisionIcon = aboutIconData.vision;
  const MissionIcon = aboutIconData.mission;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-12">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            {aboutData.pageHeroBadgeLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {aboutData.pageHeroTitle}
          </h1>
        </div>

        {/* Vision / Mission cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vision */}
          <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-[#2563eb] p-8 overflow-hidden">
            <span className="pointer-events-none absolute -top-4 -left-2 text-8xl font-extrabold text-[#93c5fd] opacity-20 select-none" aria-hidden="true">
              &ldquo;
            </span>
            <div className="relative flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                <VisionIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1e3a8a]">{aboutData.visionTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{aboutData.visionText}</p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-[#2563eb] p-8 overflow-hidden">
            <span className="pointer-events-none absolute -top-4 -left-2 text-8xl font-extrabold text-[#93c5fd] opacity-20 select-none" aria-hidden="true">
              &ldquo;
            </span>
            <div className="relative flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                <MissionIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1e3a8a]">{aboutData.missionTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{aboutData.missionText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Programme Outcomes */}
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-3xl">
            {aboutData.programmeOutcomesTitle}
          </h2>
          <p className="mt-2 text-sm text-[#64748b] sm:text-base">{aboutData.programmeOutcomesSubtitle}</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {aboutData.programmeOutcomes.map((po, index) => (
              <div
                key={po.code}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 transition-all duration-200 hover:bg-blue-50"
              >
                {/* Number badge */}
                <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-[#2563eb] text-white text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">{po.code}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{po.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOD Teaser */}
        <section className="bg-[#1e3a8a] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">{aboutData.hodTeaserLabel}</p>
            <p className="mt-2 text-2xl font-extrabold text-white">{aboutData.hodTeaserTitle}</p>
            <p className="mt-2 text-sm text-blue-200">
              <span className="font-semibold">{hodData.name}</span> · {hodData.designation}
            </p>
          </div>
          <Link
            href={aboutData.hodTeaserHref}
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1e3a8a] transition-all duration-200 hover:bg-blue-50 active:scale-95"
          >
            {aboutData.hodTeaserButtonText}
          </Link>
        </section>
      </div>
    </div>
  );
}
