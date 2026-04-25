"use client"
import { useUser } from "@/lib/hooks/useUser"
import { Users, GraduationCap, Briefcase, Megaphone, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Total Users",       value: "245", change: "+12", icon: Users,          color: "blue"   },
  { label: "Active Students",   value: "180", change: "+8",  icon: GraduationCap,  color: "emerald"},
  { label: "Staff Members",     value: "32",  change: "0",   icon: Briefcase,       color: "violet" },
  { label: "Announcements",     value: "12",  change: "+3",  icon: Megaphone,       color: "amber"  },
]

const colorMap: Record<string, { card: string; badge: string }> = {
  blue:    { card: "border-blue-200 bg-blue-50/60",    badge: "bg-blue-600"   },
  emerald: { card: "border-emerald-200 bg-emerald-50/60", badge: "bg-emerald-600" },
  violet:  { card: "border-violet-200 bg-violet-50/60",  badge: "bg-violet-600"  },
  amber:   { card: "border-amber-200 bg-amber-50/60",   badge: "bg-amber-500"   },
}

const quickActions = [
  { label: "Manage Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Manage Users",         href: "/admin/users",         icon: Users      },
  { label: "Manage Events",        href: "/admin/events",        icon: Activity   },
]

export default function AdminPage() {
  const { name } = useUser()

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">HOD</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {name} — here&apos;s a snapshot of the department.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const { card, badge } = colorMap[s.color]
          return (
            <div key={s.label} className={`rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${card}`}>
              <div className={`h-9 w-9 rounded-xl ${badge} flex items-center justify-center mb-3`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-800 font-display">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />{s.change} this month
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions + recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">
                <a.icon className="h-4 w-4 text-amber-500 shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity feed placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { event: "New student registered",        time: "2 hours ago",  dot: "bg-emerald-500" },
              { event: "Announcement posted",           time: "5 hours ago",  dot: "bg-amber-500"   },
              { event: "Event updated: Tech Symposium", time: "Yesterday",    dot: "bg-blue-500"    },
              { event: "Staff profile updated",         time: "2 days ago",   dot: "bg-violet-500"  },
            ].map((item) => (
              <div key={item.event} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-slate-50/60 border border-slate-100">
                <div className={`h-2 w-2 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{item.event}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
