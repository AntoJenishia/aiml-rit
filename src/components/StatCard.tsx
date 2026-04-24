"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/lib/hooks/useInView";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
}

export default function StatCard({ icon: Icon, label, value, suffix }: StatCardProps) {
  const { ref, inView } = useInView({ threshold: 0.3 });
  const [displayValue, setDisplayValue] = useState<number>(0);

  const targetValue = useMemo(() => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [value]);

  useEffect(() => {
    if (!inView) return;
    const durationMs = 1200;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      /* ease-out quad */
      const eased = 1 - (1 - t) * (1 - t);
      setDisplayValue(Math.round(targetValue * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, targetValue]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-blue-600 p-6 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-3xl font-extrabold text-[#1e3a8a]">
          {displayValue}
          {suffix ?? ""}
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">{label}</p>
      </div>
    </div>
  );
}
