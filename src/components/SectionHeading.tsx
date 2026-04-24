"use client";

import clsx from "clsx";
import { useRevealOnScroll } from "@/lib/hooks/useInView";
import type { RefObject } from "react";

type HeadingAlign = "left" | "center";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: HeadingAlign;
  eyebrow?: string;
}

export default function SectionHeading({ title, subtitle, align = "left", eyebrow }: SectionHeadingProps) {
  const ref = useRevealOnScroll() as RefObject<HTMLDivElement>;

  return (
    <div ref={ref} className={clsx("reveal", align === "center" ? "text-center" : "text-left")}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#2563eb]">{eyebrow}</p>
      ) : null}

      <h2
        className={clsx(
          "text-2xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-3xl"
        )}
      >
        {title}
      </h2>

      <div
        aria-hidden="true"
        className={clsx(
          "mt-3 h-1 w-16 rounded-full bg-[#2563eb]",
          align === "center" ? "mx-auto" : "mx-0"
        )}
      />

      {subtitle ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
