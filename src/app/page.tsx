"use client";

import HeroSection from "@/components/HeroSection";
import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import Link from "next/link";
import { homeData, quickLinks } from "@/data/quickLinks";
import { statItems } from "@/data/stats";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/lib/hooks/useInView";
import type { LucideIcon } from "lucide-react";



function StatCard({ icon: Icon, label, value, suffix, delay = 0 }: {
  icon: LucideIcon; label: string; value: string; suffix?: string; delay?: number;
}) {
  const [ref, visible] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const [count, setCount]   = useState(0);
  const rafId  = useRef<number | null>(null);
  const target = useMemo(() => Number(value || 0), [value]);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now() + delay;
    const ease  = (p: number) => 1 - Math.pow(1 - p, 4);
    const step  = (now: number) => {
      if (now < start) { rafId.current = requestAnimationFrame(step); return; }
      const p = Math.min((now - start) / 1800, 1);
      setCount(Math.round(target * ease(p)));
      if (p < 1) rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [visible, target, delay]);

  return (
    <CardReveal delay={delay}>
      {/* Premium stat card */}
      <div
        ref={ref}
        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2"
        style={{
          boxShadow: "0 2px 14px -4px rgba(15,23,42,0.08)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 2px #bfdbfe, 0 0 28px 6px rgba(59,130,246,0.15), 0 18px 40px -12px rgba(37,99,235,0.25)";
          (e.currentTarget as HTMLElement).style.borderColor = "#93c5fd";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px -4px rgba(15,23,42,0.08)";
          (e.currentTarget as HTMLElement).style.borderColor = "";
        }}
      >
        {/* Decorative arc bg */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-60" />

        {/* Icon */}
        <div className="relative mb-5 inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-3 text-white shadow-lg shadow-blue-600/30 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>

        {/* Number — Space Grotesk, gradient */}
        <p
          className="font-display text-5xl font-bold leading-none tracking-tight"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {count}<span className="text-3xl">{suffix ?? ""}</span>
        </p>

        {/* Label */}
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors duration-300 group-hover:text-blue-600">
          {label}
        </p>

        {/* Bottom accent line */}
        <div className="mt-4 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-300 transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </CardReveal>
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



      {/* ── Stats ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <RevealSection>
            <SectionHeading
              eyebrow="DEPARTMENT SNAPSHOT"
              title="Department at a Glance"
              subtitle="Key numbers defining our commitment to excellence in AI & ML education."
              align="center"
            />
          </RevealSection>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, i) => (
              <StatCard key={item.label} icon={item.icon} label={item.label}
                value={item.value} suffix={item.suffix} delay={i * 100} />
            ))}
            {statItems.length < 4 && (
              <StatCard icon={statItems[0].icon} label="Research Projects" value="24" delay={300} />
            )}
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6">
          <CardReveal>
            <div className="premium-card p-8 sm:p-12">
              <SectionHeading title={homeData.introTitle} subtitle={homeData.introText} />
            </div>
          </CardReveal>
        </div>
      </section>

      {/* ── Quick links ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <RevealSection>
            <SectionHeading eyebrow="EXPLORE" title={homeData.quickLinksTitle}
              subtitle={homeData.quickLinksSubtitle} align="center" />
          </RevealSection>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <CardReveal key={item.href} delay={i * 75}>
                  <Link href={item.href} className="premium-card group block h-full p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-600/30">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-px origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-300 transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </CardReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
