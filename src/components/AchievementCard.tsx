import { Building2, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import type { Achievement, AchievementCategory } from "@/lib/types";

interface AchievementCardProps {
  achievement: Achievement;
}

const ACCENT_CLASS: Record<AchievementCategory, string> = {
  student: "bg-gradient-to-b from-blue-500 to-violet-500",
  department: "bg-gradient-to-b from-amber-500 to-orange-500"
};

const CATEGORY_ICON: Record<AchievementCategory, typeof GraduationCap> = {
  student: GraduationCap,
  department: Building2
};

const CATEGORY_ICON_BG: Record<AchievementCategory, string> = {
  student: "from-blue-500 to-violet-500",
  department: "from-amber-500 to-orange-500"
};

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = CATEGORY_ICON[achievement.category];

  return (
    <motion.div
      className={clsx(GLASS_CARD_CLASS, "group relative overflow-hidden p-6 will-change-transform")}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className={clsx("absolute left-0 top-0 h-full w-1", ACCENT_CLASS[achievement.category])} aria-hidden="true" />

      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-0",
          "bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.55),transparent)]",
          "bg-[length:200%_100%] group-hover:opacity-100",
          "motion-safe:group-hover:animate-shimmer"
        )}
        aria-hidden="true"
      />

      <div className="relative pl-3">
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white",
              CATEGORY_ICON_BG[achievement.category]
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-lg font-bold text-slate-900">{achievement.title}</p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                {achievement.year}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{achievement.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
