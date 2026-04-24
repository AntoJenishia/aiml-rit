"use client";

import HeroSection from "@/components/HeroSection";
import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import Link from "next/link";
import { homeData, quickLinks } from "@/data/quickLinks";
import { statItems } from "@/data/stats";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/lib/hooks/useInView";
import type { LucideIcon } from "lucide-react";

const MARQUEE_ITEMS = [
  "TensorFlow", "PyTorch", "Scikit-learn", "OpenCV",
  "Hugging Face", "LangChain", "CUDA", "Keras",
  "JAX", "Pandas", "NLTK", "Stable Diffusion",
];

function StatCountCard({
  icon: Icon,
  label,
  value,
  suffix,
  delayMs = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  delayMs?: number;
}) {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const [count, setCount] = useState(0);
  const rafId = useRef<number | null>(null);
  const target = useMemo(() => Number(value || 0), [value]);

  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now() + delayMs;
    const duration = 2000;
    const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);
    const step = (now: number) => {
      if (now < start) { rafId.current = requestAnimationFrame(step); return; }
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(target * easeOutQuart(progress)));
      if (progress < 1) rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [isVisible, target, delayMs]);

  return (
    <div
      ref={ref}
      className="premium-card hover-glow group border-t-4 border-t-blue-500 p-8 text-center transition-all duration-300"
    >
      <div className="mx-auto mb-3 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-5xl font-black text-[#1e3a8a] transition-colors duration-300 group-hover:text-blue-600">
        {count}{suffix ?? ""}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSection
        title={homeData.heroTitle}
        subtitle={homeData.heroSubtitle}
        ctaText={homeData.primaryCtaText}
        ctaHref={homeData.primaryCtaHref}
        secondaryCtaText={homeData.secondaryCtaText}
        secondaryCtaHref={homeData.secondaryCtaHref}
      />

      {/* Marquee */}
      <div className="select-none overflow-hidden border-y border-slate-100 bg-white/80 py-4 backdrop-blur-sm">
        <div className="flex">
          {[0, 1].map((k) => (
            <div key={k} className="marquee-track" aria-hidden={k === 1}>
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="flex shrink-0 items-center whitespace-nowrap text-sm font-medium text-slate-400">
                  {item}
                  <span className="mx-4 text-blue-300" aria-hidden="true">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <RevealSection>
        <section className="bg-transparent py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="DEPARTMENT SNAPSHOT"
              title="Department at a Glance"
              subtitle="Key numbers that define our commitment to excellence in AI & ML education."
              align="center"
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statItems.map((item, i) => (
                <StatCountCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  suffix={item.suffix}
                  delayMs={i * 120}
                />
              ))}
              {statItems.length < 4 && (
                <StatCountCard
                  icon={statItems[0].icon}
                  label="Research Projects"
                  value="24"
                  delayMs={360}
                />
              )}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Intro */}
      <RevealSection delayMs={100}>
        <section className="bg-transparent py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="premium-card p-10 sm:p-14">
              <SectionHeading title={homeData.introTitle} subtitle={homeData.introText} />
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Quick links */}
      <RevealSection delayMs={150}>
        <section className="bg-transparent py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="EXPLORE"
              title={homeData.quickLinksTitle}
              subtitle={homeData.quickLinksSubtitle}
              align="center"
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="card-reveal premium-card group block p-7"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-600/30">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">{item.label}</p>
                        <p className="mt-2 text-base leading-7 text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
