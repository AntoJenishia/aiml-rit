"use client"
import { ODStatus } from "@/lib/odStatus"
import { useUser } from "@/lib/hooks/useUser"
import { useAuth } from "@/lib/hooks/useAuth"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from "react"
import { formatDate } from "@/lib/dateUtils"
import {
  Users, CheckCircle, XCircle, FileText, ChevronRight,
  BookOpen, TrendingUp, Clock, AlertCircle, Loader2, Award,
  ExternalLink, Download, X, Send, FileUp, Briefcase, Plus,
  Mail, Shield, Phone, User, Hash, Megaphone, Activity,
  LayoutDashboard, CalendarDays, BarChart3, Bell, Search, Upload
} from "lucide-react"

import AchievementModal from "./AchievementModal"
import FacultyProfileTab from "./faculty/FacultyProfileTab"
import ReportsTab from "./faculty/ReportsTab"

// ── Constants ──────────────────────────────────────────────────────────────
const OD_EVENT_TYPES = [
  "Workshop", "Hackathon", "Seminar", "Guest Lecture", 
  "FDP", "Symposium", "Internship", "Conference", "Meeting", 
  "Official Department Work", "Other"
]

const TAG_COLORS: Record<string, string> = {
  Workshop: "bg-blue-100 text-blue-700",
  Hackathon: "bg-purple-100 text-purple-700",
  Seminar: "bg-teal-100 text-teal-700",
  "Guest Lecture": "bg-amber-100 text-amber-700",
  FDP: "bg-rose-100 text-rose-700",
  Symposium: "bg-indigo-100 text-indigo-700",
  Internship: "bg-emerald-100 text-emerald-700",
  Conference: "bg-cyan-100 text-cyan-700",
  Other: "bg-slate-100 text-slate-700",
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string
  referenceNumber: string
  studentName: string
  studentUid: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  status: string
  department?: string
  pdfUrl?: string
  finalPdfUrl?: string
  postODProofsUrl?: string
  postODDescription?: string
  createdAt?: any
  signedLetterUrl?: string
}

interface Student {
  uid: string
  name: string
  registerNumber?: string
  batch?: string
  section?: string
  cgpa?: string
  classId?: string
  email?: string
  phone?: string
  currentYear?: string
  semester?: number
}

interface PortfolioItem {
  id: string
  type: string
  title: string
  description?: string
  link?: string
  date?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning,"
  if (hour < 17) return "Good Afternoon,"
  return "Good Evening,"
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, accent = "#3B5BFF", accentBg = "bg-blue-50" }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`h-16 w-16 rounded-2xl ${accentBg} flex items-center justify-center mb-4 ring-8 ring-white shadow-sm`}>
        <Icon className="h-8 w-8" style={{ color: accent }} />
      </div>
      <h3 className="text-base font-black text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
    </div>
  )
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ od, onClose, onConfirm }: { od: ODRequest, onClose: () => void, onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!reason.trim()) { setError("A rejection reason is required."); return }
    setLoading(true)
    await onConfirm(reason)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Reject Request</h2>
            <p className="text-xs text-slate-500 mt-0.5">{od.studentName} — {od.eventName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded px-4 py-3 text-sm text-[#EF4444]"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Rejection <span className="text-[#EF4444]">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide a clear reason..." rows={3}
              className="w-full rounded border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#003087] focus:outline-none focus:ring-1 focus:ring-[#003087] resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded border border-[#E2E8F0] bg-white text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2 rounded bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return <div className="h-12"></div>

  return (
    <div className="flex flex-col items-end justify-center bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 shadow-sm relative z-10 shrink-0">
      <div className="text-xl md:text-2xl font-mono font-black text-white tracking-widest leading-none mb-1">
        {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest leading-none">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  )
}

// ── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreviewModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
  let finalUrl = url;
  if (url.includes('drive.google.com/drive/folders/')) {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
    }
  } else if (url.includes('drive.google.com')) {
    finalUrl = url.replace('/view', '/preview');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50 shrink-0">
          <div><h2 className="text-lg font-bold text-slate-800">{title}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden relative">
          <iframe
            src={finalUrl}
            className="w-full h-full rounded shadow-sm border-0 bg-white"
            title="Document Preview"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
function StaffDashInner() {
  const { name, image, isClassIncharge, classId, uid } = useUser()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "dashboard"

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingOD, setLoadingOD] = useState(true)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)

  const [odSubTab, setOdSubTab] = useState<"requests" | "proofs" | "history">("requests")
  const [showAddPortfolio, setShowAddPortfolio] = useState(false)

  // Student Profile Modal State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null)

  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [rejectAchievementTarget, setRejectAchievementTarget] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Reports Tab State
  const [reportStartDate, setReportStartDate] = useState<string>("")
  const [reportEndDate, setReportEndDate] = useState<string>("")

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadingStudents(true)
    setLoadingOD(true)
    setLoadingPortfolio(true)
    try {
      const [stuRes, odRes, achRes, annRes, evRes, portRes] = await Promise.allSettled([
        fetch("/api/faculty/students"),
        fetch("/api/faculty/ods"),
        fetch("/api/faculty/achievements"),
        fetch("/api/announcements"),
        fetch("/api/events"),
        fetch("/api/faculty/portfolio"),
      ])

      if (stuRes.status === "fulfilled" && stuRes.value.ok) setStudents(await stuRes.value.json())
      if (odRes.status === "fulfilled" && odRes.value.ok) setOdRequests(await odRes.value.json())
      if (achRes.status === "fulfilled" && achRes.value.ok) setAchievements(await achRes.value.json())
      if (annRes.status === "fulfilled" && annRes.value.ok) {
        const anns = await annRes.value.json()
        setAnnouncements(anns.filter((a: any) => a.target === "all" || a.target === "staff"))
      }
      if (evRes.status === "fulfilled" && evRes.value.ok) {
        const evs = await evRes.value.json()
        const today = new Date().toISOString().split("T")[0]
        setUpcomingEvents(evs.filter((e: any) => e.startDate >= today).sort((a: any, b: any) => a.startDate.localeCompare(b.startDate)))
      }
      if (portRes.status === "fulfilled" && portRes.value.ok) setPortfolios(await portRes.value.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingStudents(false)
      setLoadingOD(false)
      setLoadingPortfolio(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const pendingODs = odRequests.filter(o => o.status === ODStatus.PENDING_FACULTY || o.status === ODStatus.PROOF_PENDING_FACULTY)

  // Generate Recent Activities
  const recentActivities = useMemo(() => {
    const ods = odRequests.map(od => ({
      id: od.id,
      type: 'OD',
      title: od.eventName,
      studentName: od.studentName,
      status: od.status,
      date: od.createdAt ? new Date(od.createdAt._seconds ? od.createdAt._seconds * 1000 : od.createdAt).getTime() : 0
    }));

    const achs = achievements.map(ach => ({
      id: ach.id,
      type: 'Achievement',
      title: ach.title,
      studentName: ach.studentName,
      status: ach.status,
      date: ach.createdAt ? new Date(ach.createdAt._seconds ? ach.createdAt._seconds * 1000 : ach.createdAt).getTime() : 0
    }));

    return [...ods, ...achs]
      .filter(item => item.date > 0)
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  }, [odRequests, achievements]);

  const handleApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/faculty/ods/${od.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    if (res.ok) await loadData()
    setActionLoading(null)
  }

  const handleReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/faculty/ods/${od.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    if (res.ok) await loadData()
    setActionLoading(null)
  }

  const handleApproveAchievement = async (ach: any) => {
    setActionLoading(ach.id)
    const res = await fetch(`/api/faculty/achievements/${ach.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    if (res.ok) await loadData()
    setActionLoading(null)
  }

  const handleRejectAchievement = async (ach: any, reason: string) => {
    setActionLoading(ach.id)
    const res = await fetch(`/api/faculty/achievements/${ach.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    if (res.ok) await loadData()
    setActionLoading(null)
  }

  const handleDeletePortfolio = async (id: string) => {
    const res = await fetch(`/api/faculty/portfolio/${id}`, { method: "DELETE" })
    if (res.ok) await loadData()
  }

  // ── Overview ────────────────────────────────────────────────────────────
  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Assigned Students</h3>
            <Users className="h-4 w-4 text-[#003087]" />
          </div>
          <p className="text-2xl font-black text-slate-800">{students.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Pending OD</h3>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{pendingODs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Pending Achievements</h3>
            <Award className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{achievements.filter(a => a.status === "PENDING_VERIFICATION").length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Upcoming Activities</h3>
            <CalendarDays className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{upcomingEvents.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
        </div>
        {recentActivities.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" subtitle="Check back later for updates." />
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {recentActivities.map(activity => (
              <div key={`${activity.type}-${activity.id}`} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`mt-0.5 p-2 rounded-full shrink-0 ${activity.type === 'OD' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                  {activity.type === 'OD' ? <FileText className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted by {activity.studentName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${activity.status === ODStatus.APPROVED || activity.status === ODStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                      activity.status === ODStatus.REJECTED_FACULTY || activity.status === ODStatus.REJECTED_HOD ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {activity.status.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )

  // ── Events & Announcements Tab ──────────────────────────────────────────
  const renderEventsTab = () => (
    <div className="space-y-6">
      {/* Announcements */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#D97706]" />
          <h2 className="text-sm font-bold text-[#111827]">Announcements</h2>
        </div>
        {announcements.length === 0 ? (
          <div className="px-6 py-8 text-center text-xs text-[#94A3B8]">No announcements at this time.</div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="px-6 py-4 hover:bg-[#F5F6FA] transition-colors">
                <p className="text-sm font-bold text-[#111827]">{ann.title}</p>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{ann.body}</p>
                {ann.createdAt && (
                  <p className="text-[10px] font-bold text-[#94A3B8] mt-2 uppercase tracking-wide">Posted {formatDate(ann.createdAt)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#3B5BFF]" />
          <h2 className="text-sm font-bold text-[#111827]">Upcoming Events</h2>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="px-6 py-8 text-center text-xs text-[#94A3B8]">No upcoming events.</div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {upcomingEvents.map((ev: any) => (
              <div key={ev.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#F5F6FA] transition-colors">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#3B5BFF]/10 text-[#3B5BFF]">
                  <span className="text-lg font-black leading-none">{new Date(ev.startDate).getDate()}</span>
                  <span className="text-[9px] uppercase font-bold">{new Date(ev.startDate).toLocaleString("en", { month: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#111827]">{ev.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[ev.type] || "bg-[#F5F6FA] text-[#6B7280]"}`}>{ev.type}</span>
                  </div>
                  <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">{ev.description}</p>
                  <p className="text-[10px] font-bold text-[#6B7280] mt-1.5">{ev.venue} · {formatDate(ev.startDate)}{ev.startDate !== ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── My Students ─────────────────────────────────────────────────────────
  const renderMyStudents = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Students</h2>
          <p className="text-xs text-slate-500 mt-0.5">{isClassIncharge ? `Class Incharge: ${classId}` : "Assigned responsibilities"}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search register no..." className="pl-9 pr-4 py-2 rounded border border-slate-200 text-sm focus:border-[#003087] focus:ring-1 focus:ring-[#003087] outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loadingStudents ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#003087]" /></div>
        ) : students.length === 0 ? (
          <EmptyState icon={Users} title="No students assigned" subtitle="You currently do not have any students assigned to your profile." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0]">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Register No</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Class</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {students.map(s => (
                  <tr key={s.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-600">{s.registerNumber || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.classId || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{s.email || "—"}</td>
                    <td className="px-5 py-3.5 text-sm">
                      <button onClick={() => setSelectedStudentProfile(s)} className="text-[#003087] font-bold text-xs hover:underline">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  // ── My Class (grid card variant, shown when class incharge) ───────────────
  const renderMyClassGrid = () => (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111827]">My Class Students</h2>
          <p className="text-xs text-[#6B7280]">Class: {classId}</p>
        </div>
        <div className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-bold">
          {students.length} Students
        </div>
      </div>
      {loadingStudents ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-[#6B7280] text-sm">No students found in your class.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map(s => (
            <div key={s.uid} className="p-5 rounded-3xl border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#3B5BFF] font-black text-xl ring-4 ring-white shadow-sm shrink-0">
                  {s.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#111827] truncate">{s.name}</p>
                  <p className="text-xs font-bold text-[#3B5BFF] font-mono mt-0.5">{s.registerNumber || "No Reg No"}</p>
                </div>
                {s.cgpa && (
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase">CGPA</span>
                    <p className="text-sm font-black text-[#16A34A]">{s.cgpa}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F6FA] rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Email</span>
                  <p className="text-xs font-semibold text-[#111827] truncate">{s.email || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Phone</span>
                  <p className="text-xs font-semibold text-[#111827] truncate">{s.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Year / Sem</span>
                  <p className="text-xs font-semibold text-[#111827] truncate">{s.currentYear || "—"} / {s.semester || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Batch</span>
                  <p className="text-xs font-semibold text-[#111827] truncate">{s.batch || "—"} ({s.section || "—"})</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── OD Requests / Proof Approvals (Requests+Proofs sub-tab partition) ─────
  const renderODRequests = () => {
    const reqList = odRequests.filter(od => od.status === ODStatus.PENDING_FACULTY)
    const proofList = odRequests.filter(od => od.status === ODStatus.PROOF_PENDING_FACULTY)
    const historyList = odRequests.filter(od =>
      od.status !== ODStatus.PENDING_FACULTY && od.status !== ODStatus.PROOF_PENDING_FACULTY
    )
    const list = odSubTab === "requests" ? reqList : odSubTab === "proofs" ? proofList : historyList

    return (
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-[#111827]">OD Approvals</h2>
          <p className="text-xs text-[#6B7280]">Review and approve student OD requests{isClassIncharge ? " for your class" : ""}.</p>
        </div>

        <div className="flex bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1 mb-5">
          <button onClick={() => setOdSubTab("requests")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${odSubTab === "requests" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"}`}>
            OD Requests {reqList.length > 0 && <span className="h-4 w-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center">{reqList.length}</span>}
          </button>
          <button onClick={() => setOdSubTab("proofs")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${odSubTab === "proofs" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"}`}>
            Post-OD Proof {proofList.length > 0 && <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">{proofList.length}</span>}
          </button>
          <button onClick={() => setOdSubTab("history")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${odSubTab === "history" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"}`}>
            All History
          </button>
        </div>

        {loadingOD ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center border-2 border-dashed border-[#E5E7EB] rounded-2xl">
            <div className="h-14 w-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mb-3">
              <CheckCircle className="h-7 w-7 text-[#16A34A]" />
            </div>
            <p className="text-sm font-bold text-[#111827]">All clear!</p>
            <p className="text-xs text-[#6B7280] mt-1">
              {odSubTab === "requests" ? "No pending OD requests from your students." : odSubTab === "proofs" ? "No post-event proofs awaiting your review." : "No OD history found for your class."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(od => {
              const isActioning = actionLoading === od.id
              const isProof = od.status === ODStatus.PROOF_PENDING_FACULTY
              return (
                <div key={od.id} className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[od.eventType] || "bg-[#F5F6FA] text-[#6B7280]"}`}>{od.eventType}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">Ref: {od.referenceNumber}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#111827]">{od.studentName}</h3>
                      <p className="text-sm font-semibold text-[#111827] mt-1">{od.eventName}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{od.organiser} · {od.venue}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(od.startDate)}{od.startDate !== od.endDate ? ` – ${formatDate(od.endDate)}` : ""}</p>

                      {isProof && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Post-Event Proof Submitted</p>
                          {od.postODDescription && <p className="text-xs text-blue-900 mb-2 italic">"{od.postODDescription}"</p>}
                          {od.postODProofsUrl && (
                            <a href={od.postODProofsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline bg-white px-2 py-1 rounded border border-blue-200 shadow-sm">
                              <ExternalLink className="h-3 w-3" /> View Proof Files
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 mt-3">
                        {isProof ? (
                          od.finalPdfUrl && (
                            <a href={od.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] hover:underline">
                              <Download className="h-3 w-3" /> View Approved Letter
                            </a>
                          )
                        ) : (
                          od.pdfUrl && (
                            <a href={od.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline">
                              <Download className="h-3 w-3" /> View Draft
                            </a>
                          )
                        )}
                        <a href={`/verify/${od.referenceNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:underline">
                          <ExternalLink className="h-3 w-3" /> Verify
                        </a>
                      </div>
                    </div>
                    {odSubTab === "history" ? (
                      <div className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase
                        ${od.status === ODStatus.APPROVED || od.status === ODStatus.COMPLETED ? "bg-green-100 text-green-700"
                          : od.status === ODStatus.REJECTED_FACULTY || od.status === ODStatus.REJECTED_HOD ? "bg-red-100 text-red-700"
                          : od.status === ODStatus.PENDING_HOD ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"}`}>
                        {od.status.replace(/_/g, " ")}
                      </div>
                    ) : (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setRejectTarget(od)} disabled={isActioning} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} {isProof ? "Reject Proof" : "Reject"}
                      </button>
                      <button onClick={() => handleApprove(od)} disabled={isActioning} className="flex items-center gap-1.5 px-3 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803d] transition-all">
                        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} {isProof ? "Approve Proof" : "Approve"}
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Achievements ────────────────────────────────────────────────────────
  const renderAchievements = () => {
    const pendingAch = achievements.filter(a => a.status === "PENDING_VERIFICATION")
    const verifiedAch = achievements.filter(a => a.status === "VERIFIED")

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-xl font-black text-slate-800">Student Achievements</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Review and verify student awards and publications.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#003087] animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500">Loading achievements...</p>
          </div>
        ) : achievements.length === 0 ? (
          <EmptyState icon={Award} title="No achievements found" subtitle="Your students have not logged any achievements yet." />
        ) : (
          <div className="space-y-6">
            {pendingAch.length > 0 && (
              <div className="bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-amber-900">Pending Verification</h3>
                    <p className="text-xs text-amber-700">Needs your review</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-xs font-bold">{pendingAch.length} Pending</span>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {pendingAch.map((ach: any) => (
                    <div key={ach.id} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-slate-800">{ach.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{ach.category}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{ach.position}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Student</p><p className="text-sm font-semibold text-slate-700">{ach.studentName}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Reg No</p><p className="text-sm font-semibold text-slate-700">{ach.registerNumber}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Event / Organizer</p><p className="text-sm font-semibold text-slate-700">{ach.eventName}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Date</p><p className="text-sm font-semibold text-slate-700">{formatDate(ach.date)}</p></div>
                        </div>
                        {ach.description && (
                          <div className="bg-slate-50 rounded p-3 text-sm text-slate-600 border border-slate-100">{ach.description}</div>
                        )}
                        <div className="flex items-center gap-4">
                          {ach.proofFileUrl && (
                            <button onClick={() => setPreviewUrl(ach.proofFileUrl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-xs font-bold text-[#003087] hover:bg-slate-200 transition-colors">
                              <FileText className="h-4 w-4" /> View Proof
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-3 shrink-0">
                        <button onClick={() => handleApproveAchievement(ach)} disabled={actionLoading === ach.id} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded shadow-sm hover:bg-[#15803D] transition-colors disabled:opacity-70">
                          {actionLoading === ach.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
                        </button>
                        <button onClick={() => setRejectAchievementTarget(ach)} disabled={actionLoading === ach.id} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#EF4444] text-[#EF4444] text-sm font-bold rounded hover:bg-red-50 transition-colors disabled:opacity-70">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {verifiedAch.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Verified Achievements</h3>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {verifiedAch.map((ach: any) => (
                    <div key={ach.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 transition-colors justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-slate-800">{ach.title}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{ach.category}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">Verified</span>
                        </div>
                        <p className="text-xs text-slate-500">{ach.studentName} ({ach.registerNumber}) · {ach.eventName} · {formatDate(ach.date)}</p>
                      </div>
                      {ach.proofFileUrl && (
                        <button onClick={() => setPreviewUrl(ach.proofFileUrl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-xs font-bold text-[#003087] hover:bg-slate-200 transition-colors">
                          <FileText className="h-4 w-4" /> View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Portfolio ───────────────────────────────────────────────────────────
  const renderPortfolio = () => (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-base font-bold text-[#111827]">My Portfolio</h2>
          <p className="text-xs text-[#6B7280]">Track your research, publications, and achievements.</p>
        </div>
        <button onClick={() => setShowAddPortfolio(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3B5BFF] text-white rounded-xl text-xs font-bold hover:bg-[#2563EB] transition-all">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {loadingPortfolio ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-2xl">
          <Briefcase className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#111827]">Your portfolio is empty</p>
          <p className="text-xs text-[#6B7280] mt-1">Submit your first research paper or certification.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolios.map(item => (
            <div key={item.id} className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F5F6FA] flex flex-col sm:flex-row gap-4 justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{item.type}</span>
                  <span className="text-[10px] text-[#6B7280]">{item.date ? formatDate(item.date) : "No Date"}</span>
                </div>
                <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                {item.description && <p className="text-xs text-[#6B7280] mt-1">{item.description}</p>}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#3B5BFF] hover:underline">
                    <ExternalLink className="h-3 w-3" /> View Reference
                  </a>
                )}
              </div>
              <button onClick={() => handleDeletePortfolio(item.id)} className="shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all self-start">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Inline Profile (used only if FacultyProfileTab is unavailable) ────────
  const renderInlineProfile = () => (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="h-28 w-full" style={{ background: "linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9cdb 100%)" }} />
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-5 flex items-end gap-4">
          {image ? (
            <Image src={image} alt={name} width={80} height={80}
              className="rounded-2xl ring-4 ring-white shadow-md w-20 h-20 object-cover shrink-0" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-[#3B5BFF] ring-4 ring-white shadow-md flex items-center justify-center text-white text-3xl font-black shrink-0">
              {name?.[0] ?? "F"}
            </div>
          )}
        </div>
        <h2 className="text-xl font-black text-[#111827]">{name}</h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mt-2 bg-blue-50 text-blue-700 border border-blue-200">
          <Shield className="h-3 w-3" /> Faculty / Staff
        </span>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
            <Mail className="h-4 w-4 text-[#94A3B8] shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
            <Shield className="h-4 w-4 text-[#94A3B8] shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Role</p>
              <p className="text-sm font-semibold text-[#111827] mt-0.5 capitalize">Faculty / Staff</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
            <User className="h-4 w-4 text-[#94A3B8] shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Department</p>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">Artificial Intelligence &amp; Machine Learning</p>
            </div>
          </div>
          {isClassIncharge && classId && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
              <Users className="h-4 w-4 text-[#94A3B8] shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Class Assigned</p>
                <p className="text-sm font-semibold text-[#111827] mt-0.5">{classId}</p>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <p className="text-xs text-slate-400">Signed in via <span className="text-white font-semibold">Google OAuth</span> · RIT Institutional Account</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderComingSoon = (title: string, icon: any, desc: string) => (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
      <EmptyState icon={icon} title={title} subtitle={desc} />
    </div>
  )

  // ── Student Profile modal (Portfolio view for a given student) ──────────
  const renderStudentModal = () => {
    if (!selectedStudentProfile) return null;
    const stuODs = odRequests.filter(od => od.studentUid === selectedStudentProfile.uid);
    const stuAch = achievements.filter(ach => ach.studentUid === selectedStudentProfile.uid);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setSelectedStudentProfile(null)}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="bg-[#003087] px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-white">Student Portfolio</h2>
            <button onClick={() => setSelectedStudentProfile(null)} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-100 pb-6 mb-6">
              <div className="h-24 w-24 rounded-full bg-[#003087]/10 text-[#003087] flex items-center justify-center text-4xl font-black shrink-0 border-4 border-white shadow-sm">
                {selectedStudentProfile.name?.[0] || "S"}
              </div>
              <div className="flex-1 text-center md:text-left space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{selectedStudentProfile.name}</h3>
                <p className="text-sm font-medium text-slate-500">{selectedStudentProfile.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Reg: {selectedStudentProfile.registerNumber || "—"}</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Class: {selectedStudentProfile.classId || "—"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-blue-700">{stuODs.length}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Total ODs</p>
              </div>
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-green-700">{stuAch.length}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Achievements</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#003087]" /> OD History
              </h4>
              {stuODs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-medium text-slate-500">No OD requests found for this student.</div>
              ) : (
                <div className="space-y-3">
                  {stuODs.map(od => (
                    <div key={od.id} className="p-4 border border-[#E2E8F0] rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{od.eventName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{od.organiser} • {formatDate(od.startDate)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${od.status === ODStatus.APPROVED || od.status === ODStatus.COMPLETED ? "bg-green-100 text-green-700" : od.status === ODStatus.REJECTED_FACULTY || od.status === ODStatus.REJECTED_HOD ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                          {od.status.replace(/_/g, " ")}
                        </span>
                        {od.finalPdfUrl && (
                          <button onClick={() => setPreviewUrl(od.finalPdfUrl!)} className="p-1.5 bg-slate-100 text-[#003087] hover:bg-slate-200 rounded transition-colors" title="View Signed Letter">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        {od.postODProofsUrl && (
                          <button onClick={() => setPreviewUrl(od.postODProofsUrl!)} className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors" title="View Event Proof">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#003087]" /> Achievements
              </h4>
              {stuAch.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-medium text-slate-500">No achievements found for this student.</div>
              ) : (
                <div className="space-y-3">
                  {stuAch.map(ach => (
                    <div key={ach.id} className="p-4 border border-[#E2E8F0] rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{ach.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{ach.eventName} • {formatDate(ach.date)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${ach.status === "VERIFIED" ? "bg-green-100 text-green-700" : ach.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                          {ach.status || "PENDING"}
                        </span>
                        {ach.proofFileUrl && (
                          <button onClick={() => setPreviewUrl(ach.proofFileUrl)} className="p-1.5 bg-slate-100 text-[#003087] hover:bg-slate-200 rounded transition-colors" title="View Document">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Reject Modals */}
      {rejectTarget && <RejectModal od={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={(reason) => handleReject(rejectTarget, reason)} />}
      {rejectAchievementTarget && (
        <RejectModal
          od={rejectAchievementTarget}
          onClose={() => setRejectAchievementTarget(null)}
          onConfirm={(reason) => handleRejectAchievement(rejectAchievementTarget, reason)}
        />
      )}

      {/* Faculty OD submission removed — Phase 1 */}

      {/* Preview Modal */}
      {previewUrl && <DocumentPreviewModal url={previewUrl} title="Document Preview" onClose={() => setPreviewUrl(null)} />}

      {/* Student Profile Modal */}
      {renderStudentModal()}

      {/* Header Banner */}
      <div className="bg-[#003087] rounded-lg shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-white -translate-y-12 translate-x-4" />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-black shrink-0 ring-4 ring-white/10 relative z-10">
            {name?.[0] ?? "F"}
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">{name || "Faculty Name"} 👋</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded">Faculty</span>
              <span className="text-[10px] uppercase font-bold text-white bg-white/20 px-2 py-0.5 rounded">AIML</span>
            </div>
          </div>
        </div>

        <LiveClock />
      </div>

      {/* Tabs */}
      {activeTab === "dashboard" && renderDashboardOverview()}
      {activeTab === "students" && renderMyStudents()}
      {activeTab === "class" && isClassIncharge && renderMyClassGrid()}
      {activeTab === "od" && renderODRequests()}
      {activeTab === "profile" && (FacultyProfileTab ? <FacultyProfileTab /> : renderInlineProfile())}
      {activeTab === "achievements" && renderAchievements()}
      {activeTab === "portfolio" && renderPortfolio()}
      {activeTab === "events" && renderEventsTab()}
      {activeTab === "reports" && <ReportsTab students={students} odRequests={odRequests} achievements={achievements} classId={classId} facultyName={name} />}
      {activeTab === "notifications" && renderComingSoon("Notifications", Bell, "Your notification center is empty.")}
    </div>
  )
}

export default function StaffDash() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#003087]" /></div>}>
      <StaffDashInner />
    </Suspense>
  )
}
