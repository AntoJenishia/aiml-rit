"use client";

import { Building2, GraduationCap, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import type { Achievement, AchievementCategory } from "@/lib/types";

interface AchievementCardProps {
  achievement: Achievement;
  index?: number;
}

const CATEGORY_ICON = {
  student: GraduationCap,
  department: Building2,
};

export default function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const reduced = useReducedMotion();
  const Icon = CATEGORY_ICON[achievement.category];

  return (
    <motion.div
      className="glass-card card-accent group relative p-7"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      whileHover={reduced ? undefined : { y: -5, scale: 1.02 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col items-end">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {achievement.category}
          </span>
          <span className="mt-2 font-mono text-xs font-bold text-blue-600">
            {achievement.year}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {achievement.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 line-clamp-3">
          {achievement.description}
        </p>
      </div>

      {/* Decorative icon in background */}
      <Trophy className="absolute -bottom-2 -right-2 h-16 w-16 text-blue-600/5 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" aria-hidden="true" />
    </motion.div>
  );
}
