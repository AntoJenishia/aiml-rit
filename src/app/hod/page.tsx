"use client";

import AnimatedBlob from "@/components/AnimatedBlob";
import SectionHeading from "@/components/SectionHeading";
import { hodData, hodPageData } from "@/data/hod";
import { motionTokens } from "@/data/quickLinks";
import clsx from "clsx";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronRight, Mail, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

function useCountUp(targetText: string) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState<string>(targetText);

  const parts = useMemo(() => {
    const match = targetText.match(/^(\d+)(.*)$/);
    if (!match) return { n: null as number | null, suffix: "" };
    return { n: Number(match[1]), suffix: match[2] ?? "" };
  }, [targetText]);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion || parts.n === null || !Number.isFinite(parts.n)) {
      setValue(targetText);
      return;
    }

    const n = parts.n;
    const durationMs = 1500;
    const start = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = Math.round(n * t);
      setValue(`${next}${parts.suffix}`);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, parts.n, parts.suffix, prefersReducedMotion, targetText]);

  return { ref, value };
}

export default function HodPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid gap-0">
      <section className="relative flex min-h-[40vh] items-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-6 py-14 sm:px-10">
        <AnimatedBlob color="blue" size="lg" position="tl" />
        <AnimatedBlob color="violet" size="lg" position="br" />

        <motion.div
          className="relative z-10 max-w-3xl"
          initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm text-blue-300/70">
            <Link href="/" className="transition-colors hover:text-blue-200">
              {hodPageData.breadcrumbHome}
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <Link href="/about" className="transition-colors hover:text-blue-200">
              {hodPageData.breadcrumbAbout}
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>{hodPageData.breadcrumbHod}</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {hodPageData.heroTitle}
          </h1>
          <p className="mt-4 text-lg italic text-blue-200/80">{hodPageData.heroSubtitle}</p>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 w-full max-w-5xl px-1">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <motion.div
            className={clsx(GLASS_CARD_CLASS, "lg:col-span-2 p-8 text-center")}
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          >
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full ring-4 ring-blue-200 shadow-2xl">
              <Image src={hodData.photo} alt={hodData.name} width={160} height={160} className="h-full w-full object-cover" />
            </div>
            <p className="mt-5 text-2xl font-bold text-slate-800">{hodData.name}</p>
            <span className="mt-3 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
              {hodData.designation}
            </span>
            <p className="mt-3 text-sm text-slate-500">{hodData.qualification}</p>
            <p className="mt-2 text-sm text-slate-500">{hodData.experience}</p>
            <p className="mt-2 text-sm text-slate-500">{hodData.specialization}</p>

            <div className="my-6 h-px bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" />

            <div className="grid gap-3 text-sm">
              <a
                href={`mailto:${hodData.email}`}
                className="flex items-center justify-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>{hodData.email}</span>
              </a>
              <a
                href={hodData.linkedin}
                className="flex items-center justify-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                <span>{hodPageData.linkedinLabel}</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            className={clsx(GLASS_CARD_CLASS, "lg:col-span-3 rounded-3xl p-10")}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: "easeOut", delay: 0.15 }
            }
          >
            <Quote className="h-16 w-16 text-blue-100" aria-hidden="true" />
            <p className="mt-6 text-lg font-light italic leading-loose text-slate-700">
              {hodData.message}
            </p>
            <div className="mt-6 flex justify-end">
              <Quote className="h-10 w-10 rotate-180 text-blue-100" aria-hidden="true" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-12 bg-gradient-to-r from-blue-50 to-violet-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={hodPageData.highlightsSectionTitle} align="center" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hodData.highlights.map((item, index) => (
              <HighlightCard key={item.label} label={item.label} value={item.value} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={hodPageData.expertiseSectionTitle} align="center" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {hodData.expertise.map((text, index) => (
              <motion.span
                key={text}
                className={clsx(
                  "rounded-full border border-blue-200/50 px-5 py-2.5 text-sm font-medium",
                  "bg-gradient-to-r from-blue-50 to-violet-50 text-blue-800",
                  "transition-colors duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-violet-600 hover:text-white"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.6, ease: "easeOut", delay: index * 0.08 }
                }
              >
                {text}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-violet-900 py-16 text-center text-white">
        <AnimatedBlob color="blue" size="md" position="center" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          >
            {hodPageData.ctaTitle}
          </motion.h2>
          <motion.p
            className="mt-4 text-blue-200"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            {hodPageData.ctaSubtitle}
          </motion.p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ActionButton href={hodPageData.ctaPrimaryHref} variant="primary" text={hodPageData.ctaPrimaryText} />
            <ActionButton href={hodPageData.ctaSecondaryHref} variant="secondary" text={hodPageData.ctaSecondaryText} />
          </div>
        </div>
      </section>
    </div>
  );
}

function HighlightCard({ label, value, index }: { label: string; value: string; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, value: display } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        GLASS_CARD_CLASS,
        "p-6 text-center will-change-transform",
        "transition-shadow duration-300 hover:shadow-2xl hover:shadow-blue-200/50"
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.03 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: "easeOut", delay: index * motionTokens.cardStaggerDelay }
      }
    >
      <div className="text-5xl font-black bg-gradient-to-r from-blue-900 via-blue-600 to-violet-600 bg-clip-text text-transparent">
        {display}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-widest text-slate-500">{label}</div>
    </motion.div>
  );
}

function ActionButton({ href, text, variant }: { href: string; text: string; variant: "primary" | "secondary" }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 18 }}
    >
      <Link
        href={href}
        className={clsx(
          "inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold",
          variant === "primary" ? "bg-white text-blue-900" : "border-2 border-white/40 text-white hover:bg-white/10"
        )}
      >
        {text}
      </Link>
    </motion.div>
  );
}
