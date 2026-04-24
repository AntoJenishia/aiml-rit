"use client";

import HeroSection from "@/components/HeroSection";
import SectionHeading from "@/components/SectionHeading";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { homeData, quickLinks } from "@/data/quickLinks";
import { statItems } from "@/data/stats";

const MARQUEE_ITEMS = [
  "TensorFlow", "PyTorch", "LLMs", "NLP", "Computer Vision",
  "Reinforcement Learning", "GANs", "Transformers", "Deep Learning",
  "Edge AI", "MLOps", "Federated Learning",
];

export default function HomePage() {
  return (
    <div>
      {/* ─── HERO ─── */}
      <HeroSection
        title={homeData.heroTitle}
        subtitle={homeData.heroSubtitle}
        ctaText={homeData.primaryCtaText}
        ctaHref={homeData.primaryCtaHref}
        secondaryCtaText={homeData.secondaryCtaText}
        secondaryCtaHref={homeData.secondaryCtaHref}
      />

      {/* ─── MARQUEE STRIP ─── */}
      <div className="bg-[#f8fafc] py-4 border-b border-slate-100 overflow-hidden select-none">
        <div className="marquee-container">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center shrink-0 px-4 text-sm font-semibold text-[#2563eb]">
                {item}
                <span className="ml-4 text-slate-300" aria-hidden="true">·</span>
              </span>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center shrink-0 px-4 text-sm font-semibold text-[#2563eb]">
                {item}
                <span className="ml-4 text-slate-300" aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Department at a Glance"
            subtitle="Key metrics that define our commitment to excellence."
            align="center"
          />
          <div className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {statItems.map((item) => (
              <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} suffix={item.suffix} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTRO ─── */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12">
            <SectionHeading title={homeData.introTitle} subtitle={homeData.introText} />
          </div>
        </div>
      </section>

      {/* ─── QUICK LINKS ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={homeData.quickLinksTitle}
            subtitle={homeData.quickLinksSubtitle}
            align="center"
          />
          <div className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] transition-colors duration-200 group-hover:bg-[#2563eb] group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#1e3a8a]">{item.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
