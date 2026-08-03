"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useAuth } from "@/lib/hooks/useAuth"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import {
  Users, CheckCircle, XCircle, FileText, ChevronRight,
  BookOpen, TrendingUp, Clock, AlertCircle, Loader2,
  ExternalLink, Download, X, Send, Award, FileUp, Briefcase, Plus,
  Mail, Shield, Phone, User, Hash, CalendarDays, Megaphone
} from "lucide-react"

import { getAnnouncements, type Announcement } from "@/lib/db/announcements"
import { getAdminEvents, type AdminEvent } from "@/lib/db/events"

// ── Types ────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string
  referenceNumber: string
  studentName?: string
  studentUid: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  status: string
  pdfUrl?: string
  finalPdfUrl?: string
  createdAt?: any
  postODProofsUrl?: string
  postODDescription?: string
  postRejectReason?: string
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
  title: string
  type: string
  date: string
  description: string
  link: string
  status: string
}

// ── Reject Reason Modal ───────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#111827]">Reject {od.status === "post_pending_faculty" ? "Post-Event Proof" : "OD Request"}</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">{od.studentName} — {od.eventName}</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Reason for Rejection <span className="text-[#EF4444]">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide a clear reason so the student can resubmit…" rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#EF4444] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main StaffDash ────────────────────────────────────────────────────────────
import { Suspense } from "react"

function StaffDashInner() {
  const { name, image, isClassIncharge, classId, uid, email: userEmail } = useUser()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || (isClassIncharge ? "class" : "portfolio")

  const [profileData, setProfileData] = useState<any>(null)

  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const [loadingOD, setLoadingOD] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [odSubTab, setOdSubTab] = useState<"requests" | "proofs">("requests")

  const [showAddPortfolio, setShowAddPortfolio] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({ title: "", type: "Research Paper", date: "", description: "", link: "" })
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    // Portfolios, Events, Announcements
    setLoadingPortfolio(true)
    try {
      const [pRes, evRes, annRes] = await Promise.all([
        fetch("/api/faculty/portfolio"),
        fetch("/api/events"),
        fetch("/api/announcements")
      ])
      if (pRes.ok) setPortfolios(await pRes.json())
      if (evRes.ok) {
        const ev = await evRes.json()
        const todayStr = new Date().toISOString().split("T")[0]
        setEvents(ev.filter((e: AdminEvent) => e.startDate >= todayStr))
      }
      if (annRes.ok) {
        const ann = await annRes.json()
        setAnnouncements(ann.filter((a: Announcement) => a.target === "all" || a.target === "staff"))
      }
    } catch { }
    setLoadingPortfolio(false)

    // ODs & Students (only if incharge)
    if (isClassIncharge) {
      setLoadingOD(true)
      setLoadingStudents(true)
      try {
        const [oRes, sRes] = await Promise.all([
          fetch("/api/od"),
          fetch("/api/users")
        ])
        if (oRes.ok) setOdRequests(await oRes.json())
        if (sRes.ok) {
          const allUsers = await sRes.json()
          let myStudents = allUsers.filter((u: any) => u.role === "student" && u.classId === classId)
          myStudents = myStudents.sort((a: any, b: any) => {
            const regA = a.registerNumber || ""
            const regB = b.registerNumber || ""
            return regA.localeCompare(regB)
          })
          setStudents(myStudents)
        }
      } catch { }
      setLoadingOD(false)
      setLoadingStudents(false)
    }
  }, [isClassIncharge, classId])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    if (res.ok) { showToast(`✓ Approved OD for ${od.studentName}`); await loadData() } 
    else { showToast(`Error: Failed to approve`) }
    setActionLoading(null)
  }

  const handleReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    if (res.ok) { showToast(`Rejected OD for ${od.studentName}`); await loadData() }
    setActionLoading(null)
  }

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!portfolioForm.title || !portfolioForm.type) return
    setPortfolioSubmitting(true)
    try {
      const res = await fetch("/api/faculty/portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioForm)
      })
      if (res.ok) {
        showToast("✓ Portfolio item submitted successfully")
        setShowAddPortfolio(false)
        setPortfolioForm({ title: "", type: "Research Paper", date: "", description: "", link: "" })
        await loadData()
      } else {
        showToast("Failed to submit portfolio")
      }
    } catch { showToast("Network error") }
    setPortfolioSubmitting(false)
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    const res = await fetch(`/api/faculty/portfolio?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      showToast("✓ Item deleted")
      await loadData()
    }
  }

  const TAG_COLORS: Record<string, string> = {
    "Workshop": "bg-purple-100 text-purple-700",
    "Hackathon": "bg-red-100 text-red-700",
    "Guest Lecture": "bg-amber-100 text-amber-700",
    "Symposium": "bg-indigo-100 text-indigo-700",
    "Conference": "bg-rose-100 text-rose-700",
    "Internship": "bg-teal-100 text-teal-700",
  }

  return (
    <div className="min-h-full space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 animate-slideUp">
          {toast}
        </div>
      )}

      {rejectTarget && <RejectModal od={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={(reason) => handleReject(rejectTarget, reason)} />}

      {/* Add Portfolio Modal */}
      {showAddPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowAddPortfolio(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Submit Portfolio Item</h2>
                <p className="text-xs text-[#6B7280] mt-1">Add research papers, certifications, or awards.</p>
              </div>
              <button onClick={() => setShowAddPortfolio(false)} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddPortfolio} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-1.5">Title <span className="text-[#EF4444]">*</span></label>
                  <input type="text" required placeholder="e.g. Deep Learning in Healthcare" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-1.5">Category <span className="text-[#EF4444]">*</span></label>
                  <select required value={portfolioForm.type} onChange={e => setPortfolioForm({ ...portfolioForm, type: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20">
                    <option value="Research Paper">Research Paper</option>
                    <option value="Patent">Patent</option>
                    <option value="Book Published">Book Published</option>
                    <option value="Certification">Certification</option>
                    <option value="Award">Award</option>
                    <option value="Other">Other Works</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-1.5">Date</label>
                  <input type="date" value={portfolioForm.date} onChange={e => setPortfolioForm({ ...portfolioForm, date: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-1.5">Description (Optional)</label>
                  <textarea rows={3} placeholder="Brief details..." value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#111827] mb-1.5">Reference Link (Optional)</label>
                  <input type="url" placeholder="https://..." value={portfolioForm.link} onChange={e => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddPortfolio(false)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="submit" disabled={portfolioSubmitting} className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB] flex items-center justify-center gap-2 disabled:opacity-60">
                  {portfolioSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9cdb 100%)" }}>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7C3AED]/30 blur-2xl" />
        </div>
        <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {image ? (
              <Image src={image} alt={name || ""} width={72} height={72} className="rounded-2xl ring-4 ring-white/20 w-14 h-14 md:w-16 md:h-16 object-cover shrink-0" />
            ) : (
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl font-black ring-4 ring-white/20 shrink-0">
                {name?.[0] ?? "F"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/75 bg-white/10 px-2 py-0.5 rounded-full">Faculty Portal</span>
                {isClassIncharge && <span className="px-2.5 py-0.5 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase">Class Incharge</span>}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">Welcome, {name || "Faculty"}</h1>
              <p className="text-white/80 text-sm mt-0.5">AIML Department</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-2xl font-black text-white">{loadingPortfolio ? "…" : portfolios.length}</p>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">Portfolios</p>
            </div>
            {isClassIncharge && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-amber-100">{loadingOD ? "…" : odRequests.length}</p>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">Pending OD</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB 1: My Class (Only if incharge) */}
          {isClassIncharge && activeTab === "class" && (
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
          )}

          {/* TAB 2: OD Approvals (Only if incharge) */}
          {isClassIncharge && activeTab === "od" && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6">
              <div className="mb-5">
                <h2 className="text-base font-bold text-[#111827]">OD Approvals</h2>
                <p className="text-xs text-[#6B7280]">Review and approve student OD requests for your class.</p>
              </div>

              {/* Sub-tab switcher */}
              {(() => {
                const reqList   = odRequests.filter(od => od.status === "pending_faculty")
                const proofList = odRequests.filter(od => od.status === "post_pending_faculty")
                const list = odSubTab === "requests" ? reqList : proofList
                return (
                  <>
                    <div className="flex bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1 mb-5">
                      <button onClick={() => setOdSubTab("requests")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          odSubTab === "requests" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"
                        }`}>
                        OD Requests {reqList.length > 0 && <span className="h-4 w-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center">{reqList.length}</span>}
                      </button>
                      <button onClick={() => setOdSubTab("proofs")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          odSubTab === "proofs" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"
                        }`}>
                        Proof Approvals {proofList.length > 0 && <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">{proofList.length}</span>}
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
                          {odSubTab === "requests" ? "No pending OD requests from your students." : "No post-event proofs awaiting your review."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {list.map(od => {
                          const isActioning = actionLoading === od.id
                          const isProof = od.status === "post_pending_faculty"
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
                                  <p className="text-xs text-[#6B7280] mt-0.5">{od.startDate}{od.startDate !== od.endDate ? ` – ${od.endDate}` : ""}</p>

                                  {isProof && (
                                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Post-Event Proof Submitted</p>
                                      <p className="text-xs text-blue-900 mb-2 italic">"{od.postODDescription}"</p>
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
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => setRejectTarget(od)} disabled={isActioning} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                                    {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} {isProof ? "Reject Proof" : "Reject"}
                                  </button>
                                  <button onClick={() => handleApprove(od)} disabled={isActioning} className="flex items-center gap-1.5 px-3 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803d] transition-all">
                                    {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} {isProof ? "Approve Proof" : "Approve"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* TAB 3: My Portfolio */}
          {activeTab === "portfolio" && (
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
                          <span className="text-[10px] text-[#6B7280]">{item.date ? new Date(item.date).toLocaleDateString() : "No Date"}</span>
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
          )}

          {/* TAB 4: My Profile */}
          {activeTab === "profile" && (
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
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <p className="text-xs text-slate-400">Signed in via <span className="text-white font-semibold">Google OAuth</span> · RIT Institutional Account</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Events & Announcements */}
        <div className="space-y-6">
          {/* Events */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#16A34A]" />
                <h2 className="text-base font-bold text-[#111827]">Upcoming Events</h2>
              </div>
            </div>
            {events.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-[#94A3B8]">No upcoming events</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {events.slice(0, 3).map(ev => (
                  <div key={ev.id} className="p-5 hover:bg-[#F5F6FA] transition-colors flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-[#111827] truncate">{ev.title}</p>
                      </div>
                      <p className="text-xs text-[#6B7280]">{ev.startDate}{ev.startDate !== ev.endDate ? ` - ${ev.endDate}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-[#111827]">Announcements</h2>
            </div>
            {announcements.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-[#94A3B8]">No announcements</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {announcements.slice(0, 4).map(a => (
                  <div key={a.id} className="px-5 py-3.5 hover:bg-[#F5F6FA] transition-colors">
                    <p className="text-sm font-bold text-[#111827]">{a.title}</p>
                    {a.body && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{a.body}</p>}
                    {a.postedBy && (
                      <p className="text-[10px] font-bold text-[#94A3B8] mt-1">
                        — {a.postedBy}
                        {a.createdAt && ` on ${new Date(a.createdAt.seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffDash() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <StaffDashInner />
    </Suspense>
  )
}

