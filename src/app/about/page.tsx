"use client";

import SectionHeading from "@/components/SectionHeading";
import HodTeaserCard from "@/components/HodTeaserCard";
import RevealSection from "@/components/RevealSection";
import { aboutData, aboutIconData } from "@/data/about";
import { hodData } from "@/data/hod";

/* Cycle through card colour variants for PO cards */
const PO_COLORS = ["card-blue", "card-violet", "card-rose", "card-teal", "card-amber"];

export default function AboutPage() {
  const VisionIcon = aboutIconData.vision;
  const MissionIcon = aboutIconData.mission;

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10">

          <SectionHeading
            eyebrow={aboutData.pageHeroBadgeLabel}
            title={aboutData.pageHeroTitle}
          />

          {/* Vision & Mission */}
          <RevealSection>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="premium-card card-blue group rounded-2xl p-8">
                <div className="mb-4 inline-flex rounded-xl bg-blue-600 p-2 text-white shadow-md shadow-blue-600/25 transition-transform duration-300 group-hover:scale-110">
                  <VisionIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="border-l-4 border-blue-500 pl-5">
                  <h3 className="text-lg font-bold text-[#1e3a8a]">{aboutData.visionTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{aboutData.visionText}</p>
                </div>
              </div>

              <div className="premium-card card-violet group rounded-2xl p-8">
                <div className="mb-4 inline-flex rounded-xl bg-violet-600 p-2 text-white shadow-md shadow-violet-600/25 transition-transform duration-300 group-hover:scale-110">
                  <MissionIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="border-l-4 border-violet-500 pl-5">
                  <h3 className="text-lg font-bold text-[#1e3a8a]">{aboutData.missionTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{aboutData.missionText}</p>
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {aboutData.programmeOutcomes.map((po, i) => (
                <div
                  key={po.code}
                  className={`card-reveal premium-card ${PO_COLORS[i % PO_COLORS.length]} group relative rounded-xl p-4`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Left hover accent bar */}
                  <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-current opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
                  <div className="flex items-start gap-3">
                    {/* Compact PO number — small badge, NOT huge */}
                    <span className="mt-0.5 flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600/10 font-mono text-[10px] font-black text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{po.code}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{po.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HOD Teaser */}
          <RevealSection>
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
    </div>
  );
}
