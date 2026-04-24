"use client";

import SectionHeading from "@/components/SectionHeading";
import HodTeaserCard from "@/components/HodTeaserCard";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import { aboutData, aboutIconData } from "@/data/about";
import { hodData } from "@/data/hod";

export default function AboutPage() {
  const VisionIcon  = aboutIconData.vision;
  const MissionIcon = aboutIconData.mission;

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-9">

          <RevealSection>
            <SectionHeading eyebrow={aboutData.pageHeroBadgeLabel} title={aboutData.pageHeroTitle} />
          </RevealSection>

          {/* Vision & Mission */}
          <div className="grid gap-4 lg:grid-cols-2">
            <CardReveal delay={0}>
              <div className="premium-card group h-full p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 transition-transform duration-300 group-hover:scale-110">
                    <VisionIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#1e3a8a]">{aboutData.visionTitle}</h3>
                </div>
                <div className="border-l-2 border-blue-200 pl-4 transition-colors duration-300 group-hover:border-blue-500">
                  <p className="text-sm leading-relaxed text-slate-600">{aboutData.visionText}</p>
                </div>
              </div>
            </CardReveal>

            <CardReveal delay={100}>
              <div className="premium-card group h-full p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 transition-transform duration-300 group-hover:scale-110">
                    <MissionIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#1e3a8a]">{aboutData.missionTitle}</h3>
                </div>
                <div className="border-l-2 border-blue-200 pl-4 transition-colors duration-300 group-hover:border-blue-500">
                  <p className="text-sm leading-relaxed text-slate-600">{aboutData.missionText}</p>
                </div>
              </div>
            </CardReveal>
          </div>

          {/* Programme Outcomes */}
          <section>
            <RevealSection>
              <SectionHeading eyebrow="PROGRAMME OUTCOMES" title={aboutData.programmeOutcomesTitle}
                subtitle={aboutData.programmeOutcomesSubtitle} />
            </RevealSection>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {aboutData.programmeOutcomes.map((po, i) => (
                <CardReveal key={po.code} delay={i * 50}>
                  <div className="premium-card group relative h-full p-4">
                    {/* Blue left accent */}
                    <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-2xl bg-blue-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-6 shrink-0 items-center justify-center rounded-md border border-blue-100 bg-blue-50 font-mono text-[10px] font-black text-blue-500 transition-all duration-200 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">{po.code}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{po.text}</p>
                      </div>
                    </div>
                  </div>
                </CardReveal>
              ))}
            </div>
          </section>

          {/* HOD Teaser */}
          <CardReveal>
            <HodTeaserCard
              label={aboutData.hodTeaserLabel}
              title={aboutData.hodTeaserTitle}
              name={hodData.name}
              designation={hodData.designation}
              href={aboutData.hodTeaserHref}
              buttonText={aboutData.hodTeaserButtonText}
            />
          </CardReveal>
        </div>
      </div>
    </div>
  );
}
