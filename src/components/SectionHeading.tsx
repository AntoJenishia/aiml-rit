"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  eyebrow?: string;
}

export default function SectionHeading({ title, subtitle, align = "left", eyebrow }: SectionHeadingProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={clsx(align === "center" ? "text-center" : "text-left")}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-blue-600">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <motion.div
        aria-hidden="true"
        className={clsx(
          "mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600",
          align === "center" ? "mx-auto" : ""
        )}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: align === "center" ? "center" : "left" }}
      />
      {subtitle && (
        <p className={clsx(
          "mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base",
          align === "center" ? "mx-auto" : ""
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
