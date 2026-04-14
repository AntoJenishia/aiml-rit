import { CalendarClock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import type { Event, EventTag } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

const tagStyles: Record<EventTag, string> = {
  Workshop: "from-blue-500 to-blue-700",
  Hackathon: "from-orange-500 to-rose-500",
  Seminar: "from-emerald-500 to-teal-600",
  "Guest Lecture": "from-violet-500 to-purple-700",
  FDP: "from-yellow-500 to-amber-600"
};

const GLASS_CARD_CLASS =
  "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl";

export default function EventCard({ event }: EventCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUpcoming = event.type === "upcoming";

  return (
    <motion.div
      className={clsx(GLASS_CARD_CLASS, "p-6", !isUpcoming && "opacity-90")}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -4 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-slate-900">{event.title}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-blue-700" aria-hidden="true" />
            {isUpcoming ? (
              <span className="inline-flex items-center">
                <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" aria-hidden="true" />
                <span className="text-slate-700">{event.date}</span>
              </span>
            ) : (
              <span className="text-slate-400">{event.date}</span>
            )}
          </div>
        </div>
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white",
            "bg-gradient-to-r",
            tagStyles[event.tag]
          )}
        >
          {event.tag}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{event.description}</p>
    </motion.div>
  );
}
