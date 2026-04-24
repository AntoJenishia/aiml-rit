"use client";

import { useInView } from "@/lib/hooks/useInView";
import clsx from "clsx";
import type { ReactNode } from "react";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export default function RevealSection({ children, className, delayMs = 0 }: RevealSectionProps) {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.12, once: true });

  return (
    <div
      ref={ref}
      className={clsx(
        "transform-gpu transition-all duration-700",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-8 scale-[0.98] opacity-0",
        className
      )}
      style={{
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
