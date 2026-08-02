"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import ParticleCanvas from "./ParticleCanvas";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export default function HeroSection({
  title: _title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-[100dvh] flex-col overflow-hidden bg-[#0a0f1e]">





      {/* ── Particle dot background (cursor-reactive) ── */}
      <ParticleCanvas className="pointer-events-auto" />

      {/* ── Ambient glow orbs ── */}
      <div
        className="pointer-events-none absolute left-[15%] top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[10%] top-[60%] h-[380px] w-[380px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ── Main hero content ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-0 pb-8 md:pt-0 md:pb-10">

        {/* Eyebrow */}
        <p
          className="hero-fadein mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-400"
          style={{ animationDelay: "0ms" }}
        >
          <span className="inline-block h-px w-10 bg-gradient-to-r from-blue-500 to-transparent" />
          Departments of AI&ML and AI&DS
          <span className="inline-block h-px w-10 bg-gradient-to-l from-blue-500 to-transparent" />
        </p>

        {/* Title */}
        <h1
          className="hero-fadein text-4xl font-black leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          style={{ animationDelay: "150ms" }}
        >
          Artificial <span className="hero-gradient-text">Intelligence</span>
        </h1>
        
        <div 
          className="hero-fadein mt-4 flex flex-col gap-2 border-l-4 border-blue-600 pl-5 md:mt-6 md:gap-3 md:pl-6" 
          style={{ animationDelay: "280ms" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white/90 sm:text-4xl lg:text-5xl">
            &amp; Machine Learning
          </h2>
          <h2 className="text-3xl font-bold tracking-tight text-white/90 sm:text-4xl lg:text-5xl">
            &amp; Data Science
          </h2>
        </div>

        {/* Sub-text */}
        <p
          className="hero-fadein mt-6 md:mt-8 max-w-xl text-base md:text-lg leading-relaxed text-slate-400"
          style={{ animationDelay: "440ms" }}
        >
          {subtitle}
        </p>

        {/* CTAs */}
        <div
          className="hero-fadein mt-12 flex flex-col gap-4 sm:flex-row"
          style={{ animationDelay: "580ms" }}
        >
          <Link
            href={ctaHref}
            id="hero-primary-cta"
            className="hero-btn-primary group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-9 py-4 text-sm font-bold text-white"
          >
            <span className="relative z-10">{ctaText}</span>
            <span className="hero-btn-shine" aria-hidden="true" />
          </Link>

          {secondaryCtaText && secondaryCtaHref && (
            <Link
              href={secondaryCtaHref}
              id="hero-secondary-cta"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-9 py-4 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-95"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>


      </div>

      {/* ── Scroll indicator ── */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-500">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
