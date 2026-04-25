"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { motionTokens } from "@/data/quickLinks";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  index?: number;
}

export default function StatCard({ icon: Icon, label, value, suffix, index = 0 }: StatCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  const target = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setDisplay(target); return; }

    const dur = motionTokens.countUpDurationMs;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduced]);

  return (
    <motion.div
      ref={ref}
      className="glass-card card-accent p-8 text-center cursor-default"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={reduced ? undefined : { y: -6, scale: 1.02 }}
    >
      {/* Blue top accent is from the card-accent::after pseudo */}
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-4xl font-extrabold tracking-tight text-slate-900">
        {display}{suffix ?? ""}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
    </motion.div>
  );
}
