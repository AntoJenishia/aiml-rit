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
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0f1e]">

      {/* ── Full-width header image ── */}
      <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: "clamp(80px, 14vw, 160px)" }}>
        <Image
          src="/rit-header.png"
          alt="RIT College of Engineering"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Soft fade at the bottom so it blends into the dark hero */}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: "linear-gradient(to bottom, transparent, #0a0f1e)" }}
        />
      </div>

      {/* ── Announcements bar ── */}
      <div className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-100">
          <span>AIML Department — RIT</span>
          <span className="hidden sm:inline">Admissions Open 2026</span>
          <span>Innovate • Build • Lead</span>
        </div>
      </div>

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
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-20">

        {/* Eyebrow */}
        <p
          className="hero-fadein mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-400"
          style={{ animationDelay: "0ms" }}
        >
          <span className="inline-block h-px w-10 bg-gradient-to-r from-blue-500 to-transparent" />
          Department of AI &amp; ML
          <span className="inline-block h-px w-10 bg-gradient-to-l from-blue-500 to-transparent" />
        </p>

        {/* Title */}
        <h1
          className="hero-fadein text-5xl font-black leading-[1.06] tracking-tighter text-white sm:text-6xl lg:text-8xl"
          style={{ animationDelay: "150ms" }}
        >
          Artificial
          <br />
          <span className="hero-gradient-text">Intelligence</span>
        </h1>
        <h2
          className="hero-fadein mt-1 text-5xl font-black leading-[1.06] tracking-tighter text-white/80 sm:text-6xl lg:text-8xl"
          style={{ animationDelay: "280ms" }}
        >
          &amp; Machine Learning
        </h2>

        {/* Sub-text */}
        <p
          className="hero-fadein mt-8 max-w-xl text-lg leading-relaxed text-slate-400"
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

        {/* Floating tech pills */}
        <div
          className="hero-fadein mt-14 flex flex-wrap gap-2.5"
          style={{ animationDelay: "720ms" }}
        >
          {["TensorFlow", "PyTorch", "LangChain", "OpenCV", "Hugging Face", "CUDA"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300 backdrop-blur-sm transition hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-200"
            >
              {t}
            </span>
          ))}
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
