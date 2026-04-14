"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { motionTokens } from "@/data/quickLinks";

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
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className={clsx(
        "relative overflow-hidden rounded-2xl px-8 py-6",
        "bg-gradient-to-r from-blue-900 to-violet-800 shadow-2xl shadow-blue-200/30"
      )}
      initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }
      }
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{title}</p>
          <p className="mt-2 text-sm text-blue-200">
            <span className="font-semibold">{name}</span> • {designation}
          </p>
        </div>

        <motion.div
          whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 18 }}
        >
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 font-semibold text-blue-900"
          >
            {buttonText}
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

