import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import type { Faculty } from "@/lib/types";
import { facultyCardData } from "@/data/faculty";

interface FacultyCardProps {
  faculty: Faculty;
}

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function FacultyCard({ faculty }: FacultyCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={clsx(GLASS_CARD_CLASS, "group relative overflow-hidden p-6 will-change-transform")}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 20 }}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-blue-200 transition-colors duration-300 group-hover:ring-blue-500">
          <Image
            src={faculty.photo}
            alt={faculty.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{faculty.name}</p>
          <p className="mt-1 text-sm text-slate-600">{faculty.qualification}</p>
          <p className="mt-3 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {facultyCardData.experienceLabel}
            </span>{" "}
            <span className="font-semibold text-slate-900">{faculty.experience}</span>{" "}
            <span className="text-slate-600">{facultyCardData.experienceUnit}</span>
          </p>
        </div>
      </div>

      <div
        className={clsx(
          "absolute inset-x-0 bottom-0",
          "translate-y-2 opacity-0 transition-all duration-300",
          "group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        <div className="rounded-b-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white">
          {faculty.specialization}
        </div>
      </div>
    </motion.div>
  );
}
