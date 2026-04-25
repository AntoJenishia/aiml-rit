"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen, Bell, CalendarDays, Trophy, TrendingUp,
  ExternalLink, CheckCircle2, Clock, Megaphone, X,
} from "lucide-react"
import { getAnnouncements, type Announcement } from "@/lib/db/announcements"
import { getAdminEvents, type AdminEvent } from "@/lib/db/events"

/* ─── stat cards ──────────────────────────────────────────── */
const stats = [
  { label: "Current Semester", value: "6",  icon: BookOpen,    color: "blue"   },
  { label: "CGPA",             value: "3.8", icon: TrendingUp,  color: "emerald"},
  { label: "Enrolled Courses", value: "4",   icon: BookOpen,    color: "violet" },
  { label: "Achievements",     value: "5",   icon: Trophy,      color: "amber"  },
]

const colorMap: Record<string, string> = {
  blue:    "border-blue-200    bg-blue-50/60    text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
  violet:  "border-violet-200  bg-violet-50/60  text-violet-700",
  amber:   "border-amber-200   bg-amber-50/60   text-amber-700",
}

const TAG_COLORS: Record<string, string> = {
  "Workshop":      "bg-violet-100 text-violet-700 border-violet-200",
  "Hackathon":     "bg-rose-100   text-rose-700   border-rose-200",
  "Guest Lecture": "bg-amber-100  text-amber-700  border-amber-200",
  "Seminar":       "bg-teal-100   text-teal-700   border-teal-200",
  "FDP":           "bg-sky-100    text-sky-700    border-sky-200",
}

/* ─── enrolled courses (static for now) ──────────────────── */
const courses = [
  "Machine Learning Fundamentals",
  "Deep Learning & Neural Networks",
  "Computer Vision",
  "NLP & Transformers",
]

export default function StudentDash() {
  const { name, email, image, role } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events,        setEvents]        = useState<AdminEvent[]>([])
  const [registered,    setRegistered]    = useState<Set<string>>(new Set())
  const [loadingData,   setLoadingData]   = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [ann, ev] = await Promise.all([getAnnouncements(), getAdminEvents()])
        // Only show announcements targeted at all or students
        setAnnouncements(ann.filter((a) => a.target === "all" || a.target === "students"))
        setEvents(ev)
      } catch { /* silently fail – Firestore not yet connected */ }
      setLoadingData(false)
    }
    load()
  }, [])

  const toggleRegister = (id: string) =>
    setRegistered((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="p-6 lg:p-8 max-w-6xl">

      {/* ── Profile header ──────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4">
        {image ? (
          <Image src={image} alt={name} width={60} height={60}
            className="rounded-2xl ring-4 ring-blue-100 shadow-md" />
        ) : (
          <div className="h-15 w-15 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {name?.[0] ?? "S"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            {role}
          </span>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label}
            className={`rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg bg-white/80 ${colorMap[s.color]}`}>
            <s.icon className="h-5 w-5 mb-3 opacity-60" />
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── LEFT: courses + quick links ─────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Courses */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> My Courses
            </h2>
            <div className="space-y-2.5">
              {courses.map((c, i) => (
                <div key={c} className="flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{c}</p>
                    <p className="text-xs text-slate-400">Semester 6 · Active</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Events to register */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Upcoming Events
            </h2>
            <p className="text-xs text-slate-400 mb-4">Click an event to register your interest</p>

            {loadingData ? (
              <div className="flex justify-center py-6">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <CalendarDays className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No events posted yet</p>
                <p className="text-slate-300 text-xs mt-0.5">Check back later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const isReg = registered.has(ev.id!)
                  return (
                    <div key={ev.id}
                      className={`rounded-xl border p-4 transition-all cursor-pointer
                        ${isReg
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-100 bg-slate-50/60 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{ev.title}</p>
                          {ev.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[ev.tag] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              {ev.tag}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="h-3 w-3" /> {ev.date}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleRegister(ev.id!) }}
                          className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                            ${isReg
                              ? "bg-emerald-500 text-white"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                            }`}
                        >
                          {isReg
                            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Registered</>
                            : "Register"
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: announcements + quick links ──────────── */}
        <div className="space-y-5">

          {/* Announcements */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-500" /> Announcements
            </h2>

            {loadingData ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center">
                <Bell className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-slate-400 text-xs">No announcements</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((a) => (
                  <div key={a.id}
                    className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                    <p className="text-[10px] text-amber-600 font-medium mt-1.5">
                      Posted by {a.postedBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-3">Quick Links</h2>
            <div className="space-y-2">
              {[
                { label: "Department Events", href: "/events",       icon: CalendarDays },
                { label: "View Faculty",       href: "/faculty",      icon: ExternalLink },
                { label: "Syllabus",           href: "/syllabus",     icon: BookOpen     },
                { label: "Achievements",       href: "/achievements", icon: Trophy       },
              ].map((l) => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-2.5 text-sm font-medium text-slate-600 rounded-xl px-3 py-2.5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all">
                  <l.icon className="h-4 w-4 text-blue-500 shrink-0" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Event detail modal ──────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedEvent(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[selectedEvent.tag] ?? ""}`}>
                  {selectedEvent.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <Clock className="h-4 w-4" /> {selectedEvent.date}
            </div>

            {selectedEvent.description && (
              <p className="text-sm text-slate-600 leading-relaxed mb-5">{selectedEvent.description}</p>
            )}

            <button
              onClick={() => { toggleRegister(selectedEvent.id!); setSelectedEvent(null) }}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95
                ${registered.has(selectedEvent.id!)
                  ? "bg-slate-100 text-slate-500 border border-slate-200"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                }`}
            >
              {registered.has(selectedEvent.id!) ? "✓ Already Registered — Click to Cancel" : "Register for this Event"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
