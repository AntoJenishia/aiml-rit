import type { LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { motionTokens } from "@/data/quickLinks";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
}

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function StatCard({ icon: Icon, label, value, suffix }: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [displayValue, setDisplayValue] = useState<number>(0);

  const targetValue = useMemo(() => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [value]);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    const durationMs = motionTokens.countUpDurationMs;
    const start = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = Math.round(targetValue * t);
      setDisplayValue(next);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, prefersReducedMotion, targetValue]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        GLASS_CARD_CLASS,
        "p-6",
        "transition-shadow duration-300",
        "will-change-transform"
      )}
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.02 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 22 }
      }
    >
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 p-3 text-white shadow-lg shadow-blue-200/40">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {displayValue}
            {suffix ?? ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
