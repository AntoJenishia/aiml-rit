"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useAuth } from "@/lib/hooks/useAuth"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback, Suspense } from "react"
import {
  Users, CheckCircle, XCircle, FileText,
  Clock, AlertCircle, Loader2, Award,
  ExternalLink, Download, X, Briefcase, Plus,
  Mail, Shield, User, Activity, LayoutDashboard, CalendarDays,
  BarChart3, Bell, Search
} from "lucide-react"

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
  signedLetterUrl?: string
  postODProofsUrl?: string
  createdAt?: any
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

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, accent="#3B5BFF", accentBg="bg-blue-50" }: any) {
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

  if (!time) return <div className="h-12"></div> // Placeholder

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
function DocumentPreviewModal({url, title, onClose}: {url: string, title: string, onClose: ()=>void}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50 shrink-0">
          <div><h2 className="text-lg font-bold text-slate-800">{title}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors"><X className="h-5 w-5"/></button>
        </div>
        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden relative">
          <iframe 
            src={url.includes('drive.google.com') ? url.replace('/view', '/preview') : url} 
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
  const { name, image, isClassIncharge, classId, uid, department } = useUser()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "dashboard"

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch Students
      const stuRes = await fetch("/api/faculty/students")
      if (stuRes.ok) setStudents(await stuRes.json())

      // 2. Fetch ODs
      const odRes = await fetch("/api/faculty/ods")
      if (odRes.ok) setOdRequests(await odRes.json())

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const pendingODs = odRequests.filter(o => o.status === "FACULTY_VERIFICATION")
  const approvedODs = odRequests.filter(o => ["VERIFIED", "COMPLETED", "ACTIVITY_COMPLETED"].includes(o.status))

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

  // Helper render components
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
          <p className="text-2xl font-black text-slate-800">0</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Upcoming Activities</h3>
            <CalendarDays className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
        </div>
        <EmptyState icon={Activity} title="No recent activity" subtitle="Check back later for updates." />
      </div>
    </div>
  )

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
        {loading ? (
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
                      <button className="text-[#003087] font-bold text-xs hover:underline">View Profile</button>
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

  const renderODRequests = () => (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">OD Requests</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review and verify On-Duty requests from your students.</p>
      </div>
      
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#003087]" /></div>
        ) : pendingODs.length === 0 ? (
          <EmptyState icon={CheckCircle} title="All caught up" subtitle="There are no pending OD requests awaiting your verification." accent="#16A34A" accentBg="bg-green-50" />
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {pendingODs.map(od => (
              <div key={od.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{od.eventType}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {od.referenceNumber}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{od.studentName}</h3>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{od.eventName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{od.organiser} · {od.venue}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{od.startDate}{od.startDate !== od.endDate ? ` – ${od.endDate}` : ""}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    {od.signedLetterUrl && (
                      <button onClick={() => setPreviewUrl(od.signedLetterUrl!)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-xs font-bold text-[#003087] hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm">
                        <FileText className="h-4 w-4" /> View Signed Letter
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setRejectTarget(od)} disabled={actionLoading === od.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded text-xs font-bold hover:bg-rose-50 transition-colors shadow-sm disabled:opacity-50">
                        {actionLoading === od.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />} Reject
                      </button>
                      <button onClick={() => handleApprove(od)} disabled={actionLoading === od.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] text-white rounded text-xs font-bold hover:bg-[#15803d] transition-colors shadow-sm disabled:opacity-50">
                        {actionLoading === od.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Verify OD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderComingSoon = (title: string, icon: any, desc: string) => (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
      <EmptyState icon={icon} title={title} subtitle={desc} />
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Reject Modal */}
      {rejectTarget && <RejectModal od={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={(reason) => handleReject(rejectTarget, reason)} />}
      
      {/* Preview Modal */}
      {previewUrl && <DocumentPreviewModal url={previewUrl} title="Document Preview" onClose={() => setPreviewUrl(null)} />}

      {/* Header Banner */}
      <div className="bg-[#003087] rounded-lg shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-white -translate-y-12 translate-x-4" />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-black shrink-0 ring-4 ring-white/10 relative z-10">
            {name?.[0] ?? "F"}
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium">Good Morning,</p>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">{name || "Faculty Name"} 👋</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded">Faculty</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded">{department || "AIML"}</span>
            </div>
          </div>
        </div>

        <LiveClock />
      </div>

      {/* Tabs Layout */}
      {activeTab === "dashboard" && renderDashboardOverview()}
      {activeTab === "students" && renderMyStudents()}
      {activeTab === "od" && renderODRequests()}
      {activeTab === "profile" && renderComingSoon("My Profile", User, "Faculty portfolio management is coming soon.")}
      {activeTab === "achievements" && renderComingSoon("Achievements", Award, "Review student achievements here. Coming soon.")}
      {activeTab === "events" && renderComingSoon("Events & Activities", CalendarDays, "Department events and activities will be listed here.")}
      {activeTab === "reports" && renderComingSoon("Reports", BarChart3, "Analytics and activity reports are under construction.")}
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
