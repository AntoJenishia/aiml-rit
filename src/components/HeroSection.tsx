"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  /* Split title for the gradient treatment on "Machine Learning" */
  const line1 = "Artificial Intelligence &";
  const line2 = "Machine Learning";

  return (
    <section className="relative overflow-hidden bg-[#0f172a]">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 dot-grid opacity-40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        {/* College logo */}
        <div className="mb-8 animate-fadeIn">
          <div className="inline-block rounded-xl bg-white/10 p-2 backdrop-blur-sm">
            <Image
              src="/rit-header.png"
              alt="RIT College of Engineering"
              width={180}
              height={48}
              className="h-10 w-auto object-contain sm:h-12"
              priority
            />
          </div>
        </div>

        <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
          <span className="block animate-fadeUp">{line1}</span>
          <span className="block animate-fadeUp delay-200 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {line2}
          </span>
        </h1>

        <p className="mt-6 max-w-xl animate-fadeUp delay-400 text-base leading-relaxed text-slate-300 sm:text-lg">
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col gap-3 animate-fadeUp delay-600 sm:flex-row sm:items-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all duration-200 hover:bg-blue-700 active:scale-95"
          >
            {ctaText}
          </Link>

          {secondaryCtaText && secondaryCtaHref ? (
            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
            >
              {secondaryCtaText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
