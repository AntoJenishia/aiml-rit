"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import AnimatedBlob from "@/components/AnimatedBlob";

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
  secondaryCtaHref
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = title.split(" ");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-6 py-14 text-white sm:px-10">
      <AnimatedBlob color="blue" size="lg" position="tl" />
      <AnimatedBlob color="violet" size="lg" position="br" />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {prefersReducedMotion ? (
            title
          ) : (
            <span className="inline-flex flex-wrap gap-x-2">
              {words.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.6, ease: "easeOut" }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          )}
        </h1>

        <motion.p
          className="mt-6 text-lg leading-relaxed text-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.6, duration: 0.6, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18 }}
          >
            <Link
              href={ctaHref}
              className={clsx(
                "inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold text-white",
                "bg-gradient-to-r from-blue-500 to-blue-400 shadow-xl shadow-blue-900/20"
              )}
            >
              {ctaText}
            </Link>
          </motion.div>

          {secondaryCtaText && secondaryCtaHref ? (
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18 }}
            >
              <Link
                href={secondaryCtaHref}
                className={clsx(
                  "inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold text-white",
                  "border-2 border-white/40 bg-white/0 hover:bg-white/10"
                )}
              >
                {secondaryCtaText}
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
