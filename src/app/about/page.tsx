"use client";

import SectionHeading from "@/components/SectionHeading";
import HodTeaserCard from "@/components/HodTeaserCard";
import RevealSection from "@/components/RevealSection";
import { aboutData, aboutIconData } from "@/data/about";
import { hodData } from "@/data/hod";

export default function AboutPage() {
  const VisionIcon = aboutIconData.vision;
  const MissionIcon = aboutIconData.mission;

  return (
    <div className="page-surface">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24">
        <SectionHeading
          eyebrow={aboutData.pageHeroBadgeLabel}
          title={aboutData.pageHeroTitle}
        />

        {/* Vision & Mission cards */}
        <RevealSection>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="premium-card group rounded-3xl p-10 transition-all duration-300 hover:border-blue-200">
              <span className="-mb-8 block select-none text-[64px] font-black leading-none text-blue-100 transition-colors group-hover:text-blue-200">&ldquo;</span>
              <div className="mb-4 inline-flex rounded-xl bg-blue-600 p-2 text-white shadow-md shadow-blue-600/30">
                <VisionIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-xl font-bold text-[#1e3a8a]">{aboutData.visionTitle}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{aboutData.visionText}</p>
              </div>
            </div>

            <div className="premium-card group rounded-3xl p-10 transition-all duration-300 hover:border-blue-200">
              <span className="-mb-8 block select-none text-[64px] font-black leading-none text-blue-100 transition-colors group-hover:text-blue-200">&ldquo;</span>
              <div className="mb-4 inline-flex rounded-xl bg-blue-600 p-2 text-white shadow-md shadow-blue-600/30">
                <MissionIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-xl font-bold text-[#1e3a8a]">{aboutData.missionTitle}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{aboutData.missionText}</p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* Programme Outcomes */}
        <section>
          <RevealSection>
            <SectionHeading
              eyebrow="PROGRAMME OUTCOMES"
              title={aboutData.programmeOutcomesTitle}
              subtitle={aboutData.programmeOutcomesSubtitle}
            />
          </RevealSection>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {aboutData.programmeOutcomes.map((po, i) => (
              <div
                key={po.code}
                className="card-reveal premium-card group relative rounded-xl p-5"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* Hover left accent */}
                <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-gradient-to-b from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-start gap-3">
                  {/* Small compact number badge */}
                  <span className="mt-0.5 flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 font-mono text-[11px] font-black text-blue-400 transition-all duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{po.code}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{po.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOD Teaser */}
        <RevealSection delayMs={150}>
          <HodTeaserCard
            label={aboutData.hodTeaserLabel}
            title={aboutData.hodTeaserTitle}
            name={hodData.name}
            designation={hodData.designation}
            href={aboutData.hodTeaserHref}
            buttonText={aboutData.hodTeaserButtonText}
          />
        </RevealSection>
      </div>
    </div>
  );
}
