"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

interface HodTeaserCardProps {
  label: string;
  title: string;
  name: string;
  designation: string;
  href: string;
  buttonText: string;
}

export default function HodTeaserCard({
  label,
  title,
  name,
  designation,
  href,
  buttonText
}: HodTeaserCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      className={clsx(
        "relative overflow-hidden rounded-3xl p-8 sm:p-12",
        "bg-[#0f172a] shadow-2xl shadow-blue-900/20"
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
      <div 
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
            {label}
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px w-8 bg-blue-500" />
            <p className="text-base text-slate-300">
              <span className="font-bold text-white">{name}</span> · {designation}
            </p>
          </div>
        </div>

        <motion.div
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
        >
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-500"
          >
            {buttonText}
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
