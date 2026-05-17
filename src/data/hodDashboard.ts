// HOD dashboard stat cards & quick actions — imported by admin/page.tsx
import { Users, GraduationCap, Briefcase, Megaphone, Activity } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface DashStat {
  label: string
  value: string
  change: string
  icon: LucideIcon
  color: "blue" | "emerald" | "violet" | "amber"
}

export const hodStats: DashStat[] = [
  { label: "Total Students",   value: "250", change: "+15", icon: GraduationCap, color: "blue"    },
  { label: "Active Batches",   value: "4",   change: "0",   icon: Users,         color: "emerald" },
  { label: "Staff Members",    value: "15",  change: "+1",  icon: Briefcase,     color: "violet"  },
  { label: "Announcements",    value: "12",  change: "+3",  icon: Megaphone,     color: "amber"   },
]

export interface QuickAction {
  label: string
  href: string
  icon: LucideIcon
}

export const quickActions: QuickAction[] = [
  { label: "Manage Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Manage Users",         href: "/admin/users",         icon: Users      },
  { label: "Manage Events",        href: "/admin/events",        icon: Activity   },
]

export const colorMap: Record<string, { card: string; badge: string }> = {
  blue:    { card: "border-blue-200 bg-blue-50/60",       badge: "bg-blue-600"    },
  emerald: { card: "border-emerald-200 bg-emerald-50/60", badge: "bg-emerald-600" },
  violet:  { card: "border-violet-200 bg-violet-50/60",   badge: "bg-violet-600"  },
  amber:   { card: "border-amber-200 bg-amber-50/60",     badge: "bg-amber-500"   },
}

// Batch metadata for the batch selector tabs
export interface BatchInfo {
  batch: string
  label: string
  yearRoman: string
}

export const batches: BatchInfo[] = [
  { batch: "2025", label: "2025–29", yearRoman: "I"   },
  { batch: "2024", label: "2024–28", yearRoman: "II"  },
  { batch: "2023", label: "2023–27", yearRoman: "III" },
  { batch: "2022", label: "2022–26", yearRoman: "IV"  },
]
