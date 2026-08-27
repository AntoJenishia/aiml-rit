"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Building2, Loader2, X, CheckCircle, XCircle, Download, ExternalLink, UsersRound } from "lucide-react"
import { type AdminEvent, addAdminEvent, updateAdminEvent, deleteAdminEvent } from "@/lib/db/events"
import { type Announcement, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/db/announcements"
import { formatDate } from "@/lib/dateUtils"
import HodOverviewTab from "./hod/HodOverviewTab"
import HodStaffTab from "./hod/HodStaffTab"
import HodStudentsTab from "./hod/HodStudentsTab"
import HodOdTab from "./hod/HodOdTab"
import HodAchievementsTab from "./hod/HodAchievementsTab"
import HodFacultyPortfoliosTab from "./hod/HodFacultyPortfoliosTab"

// ── Types ─────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string
  referenceNumber: string
  studentName?: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  status: string
  pdfUrl?: string
  finalPdfUrl?: string
  postODProofsUrl?: string
  postODDescription?: string
  postRejectReason?: string
}

// ── Main HOD Dashboard ────────────────────────────────────────────────────────
function HodDashInner() {
  const { name } = useUser()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "dashboard"

  // Department filter (HEAD)
  const [departmentFilter, setDepartmentFilter] = useState<"ALL" | "AIML" | "AIDS">("ALL")
  const [metrics, setMetrics] = useState<any>(null)

  // Events & Announcements state (incoming branch)
  const [evForm, setEvForm] = useState<Partial<AdminEvent>>({ title: "", description: "", startDate: "", endDate: "", venue: "", type: "Workshop" })
  const [annForm, setAnnForm] = useState<Partial<Announcement>>({ title: "", body: "", target: "all" })
  const [evLoading, setEvLoading] = useState(false)
  const [annLoading, setAnnLoading] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
  const [editEvForm, setEditEvForm] = useState<Partial<AdminEvent>>({})
  const [editEvLoading, setEditEvLoading] = useState(false)
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
  const [editAnnForm, setEditAnnForm] = useState<Partial<Announcement>>({})
  const [editAnnLoading, setEditAnnLoading] = useState(false)
  const [annList, setAnnList] = useState<Announcement[]>([])
  const [eventsList, setEventsList] = useState<AdminEvent[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null)

  // OD state (incoming branch)
  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  const [odProofSubTab, setOdProofSubTab] = useState<"requests" | "proofs">("requests")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  // Shared state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // Events & Announcements handlers
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!evForm.title || !evForm.startDate || !evForm.endDate || !evForm.type || !evForm.venue || !evForm.description) return
    const today = new Date().toISOString().split("T")[0]
    if (evForm.startDate < today) { showToast("Start date cannot be in the past."); return }
    setEvLoading(true)
    try {
      await addAdminEvent({ ...(evForm as Omit<AdminEvent, "id">), createdBy: name })
      setEvForm({ title: "", description: "", startDate: "", endDate: "", venue: "", type: "Workshop" })
      showToast("Event created successfully!")
    } catch (err: any) { showToast("Failed to create event: " + err.message) }
    setEvLoading(false)
  }

  const handlePostAnn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annForm.title || !annForm.body || !annForm.target) return
    setAnnLoading(true)
    try {
      await addAnnouncement({ ...(annForm as Omit<Announcement, "id">), postedBy: name })
      setAnnForm({ title: "", body: "", target: "all" })
      showToast("Announcement posted successfully!")
    } catch (err: any) { showToast("Failed to post announcement: " + err.message) }
    setAnnLoading(false)
  }

  const reloadEventsAndAnns = async () => {
    const [evRes, annRes] = await Promise.all([fetch("/api/events"), fetch("/api/announcements")])
    if (evRes.ok) setEventsList(await evRes.json())
    if (annRes.ok) setAnnList(await annRes.json())
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return
    try { await deleteAdminEvent(id); showToast("Event deleted."); reloadEventsAndAnns() }
    catch { showToast("Failed to delete event.") }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent?.id) return
    setEditEvLoading(true)
    try {
      await updateAdminEvent(editingEvent.id, editEvForm)
      showToast("Event updated.")
      setEditingEvent(null)
      reloadEventsAndAnns()
    } catch { showToast("Failed to update event.") }
    setEditEvLoading(false)
  }

  const handleDeleteAnn = async (id: string) => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return
    try { await deleteAnnouncement(id); showToast("Announcement deleted."); reloadEventsAndAnns() }
    catch { showToast("Failed to delete announcement.") }
  }

  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnn?.id) return
    setEditAnnLoading(true)
    try {
      await updateAnnouncement(editingAnn.id, editAnnForm)
      showToast("Announcement updated.")
      setEditingAnn(null)
      reloadEventsAndAnns()
    } catch { showToast("Failed to update announcement.") }
    setEditAnnLoading(false)
  }

  // OD handlers
  const loadAllData = async () => {
    setLoading(true)
    try {
      const [metricsRes, odRes, evRes, annRes, regRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/od"),
        fetch("/api/events"),
        fetch("/api/announcements"),
        fetch("/api/registrations"),
      ])
      if (metricsRes.ok) { setMetrics(await metricsRes.json()); setError(null) }
      else { const e = await metricsRes.json().catch(() => ({})); setError(e.error || "Failed to load metrics") }
      if (odRes.ok) setOdRequests(await odRes.json())
      if (evRes.ok) setEventsList(await evRes.json())
      if (annRes.ok) setAnnList(await annRes.json())
      if (regRes.ok) setRegistrations(await regRes.json())
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleHODApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    if (res.ok) { showToast(`Approved OD for ${od.studentName}`); loadAllData() }
    setActionLoading(null)
  }

  const handleHODReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    if (res.ok) { showToast(`Rejected OD for ${od.studentName}`); loadAllData() }
    setActionLoading(null)
  }

  useEffect(() => {
    let mounted = true
    loadAllData().finally(() => { if (!mounted) return })
    return () => { mounted = false }
  }, [])

  // Derived display metrics
  const displayMetrics = metrics ? {
    ...metrics,
    totalStudents: departmentFilter === "ALL" ? metrics.totalStudents : (departmentFilter === "AIML" ? metrics.aiml?.students : metrics.aids?.students),
    totalFaculty: departmentFilter === "ALL" ? metrics.totalFaculty : (departmentFilter === "AIML" ? metrics.aiml?.faculty : metrics.aids?.faculty),
    pendingOD: departmentFilter === "ALL" ? metrics.pendingOD : (departmentFilter === "AIML" ? metrics.aiml?.pendingOD : metrics.aids?.pendingOD),
    pendingAchievements: departmentFilter === "ALL" ? metrics.pendingAchievements : (departmentFilter === "AIML" ? metrics.aiml?.achievements : metrics.aids?.achievements),
  } : null

  // OD derived lists
  const odRequestPending = odRequests.filter(od => od.status === "pending_hod")
  const proofPending = odRequests.filter(od => od.status === "post_pending_hod")

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 animate-slideUp">
            {toast}
          </div>
        )}

        {/* Reject OD Modal */}
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setRejectTarget(null)}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#111827]">Reject {rejectTarget.status === "post_pending_hod" ? "Post-Event Proof" : "OD"}</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">{rejectTarget.studentName} &middot; {rejectTarget.eventName}</p>
                </div>
                <button onClick={() => setRejectTarget(null)} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required)..." rows={3}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#EF4444] focus:outline-none resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => setRejectTarget(null)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                  <button
                    onClick={async () => { await handleHODReject(rejectTarget, rejectReason); setRejectTarget(null); setRejectReason("") }}
                    disabled={!rejectReason.trim() || actionLoading === rejectTarget.id}
                    className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-50">
                    {actionLoading === rejectTarget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Portal Banner */}
        <div className="bg-[#003087] rounded border border-[#002266] shadow-sm p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Building2 className="w-40 h-40 text-white -translate-y-8 translate-x-4" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">Academic Dashboard</p>
            <h1 className="text-2xl font-black text-white">Welcome, Dr. {name || "HOD"}</h1>
            <p className="text-blue-100 text-sm mt-1">Head of Department &bull; AIML &amp; AI&amp;DS</p>
          </div>
          <div className="relative z-10 flex items-center gap-1 bg-white/10 p-1 rounded border border-white/20 self-start md:self-auto">
            {(["ALL", "AIML", "AIDS"] as const).map(dept => (
              <button key={dept} onClick={() => setDepartmentFilter(dept)}
                className={`px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${departmentFilter === dept ? "bg-white text-[#003087] shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"}`}>
                {dept === "ALL" ? "Global View" : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Routing */}
        {activeTab === "dashboard" ? (
          loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : error || !displayMetrics ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-bold shadow-sm border border-red-100">
              Error loading dashboard data: {error || "Unknown error"}
            </div>
          ) : (
            <HodOverviewTab departmentFilter={departmentFilter} metrics={displayMetrics} />
          )
        ) : activeTab === "staff" ? (
          <HodStaffTab departmentFilter={departmentFilter} />
        ) : activeTab === "students" ? (
          <HodStudentsTab departmentFilter={departmentFilter} />
        ) : activeTab === "od" ? (
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6 space-y-4">
            <div className="border-b border-[#E5E7EB] pb-4">
              <h2 className="text-base font-bold text-[#111827]">OD Approvals</h2>
              <p className="text-xs text-[#6B7280]">Process student On-Duty requests</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
            ) : (
              <>
                <div className="flex bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1 mb-4">
                  <button onClick={() => setOdProofSubTab("requests")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${odProofSubTab === "requests" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"}`}>
                    OD Requests {odRequestPending.length > 0 && <span className="h-4 w-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center">{odRequestPending.length}</span>}
                  </button>
                  <button onClick={() => setOdProofSubTab("proofs")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${odProofSubTab === "proofs" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"}`}>
                    Proof Approvals {proofPending.length > 0 && <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">{proofPending.length}</span>}
                  </button>
                </div>
                {(() => {
                  const list = odProofSubTab === "requests" ? odRequestPending : proofPending
                  if (list.length === 0) return (
                    <div className="text-center py-12 text-xs font-semibold text-[#6B7280]">
                      {odProofSubTab === "requests" ? "No OD requests pending your approval." : "No post-event proofs awaiting your review."}
                    </div>
                  )
                  return (
                    <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden">
                      {list.map(od => {
                        const isActioning = actionLoading === od.id
                        const isProof = od.status === "post_pending_hod"
                        return (
                          <div key={od.id} className="px-5 py-4 hover:bg-[#F5F6FA] transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-sm font-bold text-[#111827]">{od.studentName || "Student"}</p>
                                  {!isProof && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] uppercase">Faculty Approved</span>}
                                  {isProof && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">Proof Approved by Faculty</span>}
                                </div>
                                <p className="text-sm font-semibold text-[#111827] mb-0.5">{od.eventName}</p>
                                <p className="text-xs text-[#6B7280]">{od.organiser} &middot; {od.startDate} &ndash; {od.endDate}</p>
                                <span className="text-[10px] font-mono text-[#94A3B8] block mt-1">Ref: {od.referenceNumber}</span>

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

                                {isProof ? (
                                  od.finalPdfUrl && (
                                    <a href={od.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] hover:underline mt-1.5">
                                      <Download className="h-3 w-3" /> View Approved Letter
                                    </a>
                                  )
                                ) : (
                                  od.pdfUrl && (
                                    <a href={od.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline mt-1.5">
                                      <Download className="h-3 w-3" /> View Draft PDF
                                    </a>
                                  )
                                )}
                                <a href={`/verify/${od.referenceNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:underline mt-1.5">
                                  <ExternalLink className="h-3 w-3" /> Verify
                                </a>
                              </div>
                              <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                                <button onClick={() => { setRejectTarget(od); setRejectReason("") }} disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all">
                                  <XCircle className="h-3.5 w-3.5" /> {isProof ? "Reject Proof" : "Reject"}
                                </button>
                                <button onClick={() => handleHODApprove(od)} disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803d] transition-all">
                                  <CheckCircle className="h-3.5 w-3.5" /> {isProof ? "Approve Proof" : "Final Approve"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        ) : activeTab === "achievements" ? (
          <HodAchievementsTab previewDoc={(url) => window.open(url, "_blank")} />
        ) : activeTab === "faculty-portfolios" ? (
          <HodFacultyPortfoliosTab departmentFilter={departmentFilter} />
        ) : activeTab === "events" ? (
          <div className="space-y-6">
            {/* Create Event */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#111827]">Create Upcoming Event</h2>
                <p className="text-xs text-[#6B7280]">Add a new event that will appear on the public site and dashboards.</p>
              </div>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Event Title</label>
                    <input required type="text" value={evForm.title} onChange={e => setEvForm({...evForm, title: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" placeholder="e.g. AI Hackathon 2026" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Event Type</label>
                    <select required value={evForm.type} onChange={e => setEvForm({...evForm, type: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]">
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Guest Lecture">Guest Lecture</option>
                      <option value="Seminar">Seminar</option>
                      <option value="FDP">FDP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Start Date</label>
                    <input required type="date" min={new Date().toISOString().split("T")[0]} value={evForm.startDate} onChange={e => setEvForm({...evForm, startDate: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">End Date</label>
                    <input required type="date" min={evForm.startDate || new Date().toISOString().split("T")[0]} value={evForm.endDate} onChange={e => setEvForm({...evForm, endDate: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Venue</label>
                    <input required type="text" value={evForm.venue} onChange={e => setEvForm({...evForm, venue: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" placeholder="e.g. Main Auditorium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Description</label>
                    <textarea required value={evForm.description} onChange={e => setEvForm({...evForm, description: e.target.value})} rows={3} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" placeholder="Brief description of the event..." />
                  </div>
                </div>
                <button type="submit" disabled={evLoading} className="mt-2 px-6 py-2.5 bg-[#3B5BFF] text-white rounded-xl text-sm font-bold hover:bg-[#2563EB] transition-all disabled:opacity-50">
                  {evLoading ? "Creating..." : "Create Event"}
                </button>
              </form>
            </div>

            {/* Manage Events & Registrations */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#111827]">Manage Events &amp; Registrations</h2>
                <p className="text-xs text-[#6B7280]">View upcoming events and track student registrations.</p>
              </div>
              {eventsList.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No events found.</p>
              ) : (
                <div className="space-y-4">
                  {eventsList.map(ev => {
                    const evRegs = registrations.filter(r => r.eventId === ev.id)
                    const isViewing = viewingRegistrations === ev.id
                    return (
                      <div key={ev.id} className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
                        <div className="bg-[#F5F6FA] px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ev.type}</span>
                              <h3 className="text-sm font-bold text-[#111827]">{ev.title}</h3>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                              {formatDate(ev.startDate)}{ev.startDate !== ev.endDate ? ` \u2013 ${formatDate(ev.endDate)}` : ""} &middot; {ev.venue}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg">
                              <UsersRound className="h-4 w-4 text-[#6B7280]" />
                              <span className="text-xs font-bold text-[#111827]">{evRegs.length}</span>
                            </div>
                            <button onClick={() => setViewingRegistrations(isViewing ? null : ev.id!)}
                              className="px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#3B5BFF] hover:bg-blue-50 transition-colors">
                              {isViewing ? "Hide Students" : "View Students"}
                            </button>
                            <button
                              onClick={() => { setEditingEvent(ev); setEditEvForm({ title: ev.title, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, venue: ev.venue, type: ev.type }) }}
                              className="p-1.5 text-[#6B7280] hover:text-[#3B5BFF] hover:bg-blue-50 rounded-lg transition-colors" title="Edit event">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.83a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteEvent(ev.id!)}
                              className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" title="Delete event">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {isViewing && (
                          <div className="px-5 py-4 bg-white border-t border-[#E5E7EB]">
                            {evRegs.length === 0 ? (
                              <p className="text-xs text-[#94A3B8] text-center py-4">No students have registered yet.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-[#E5E7EB]">
                                      <th className="py-2 px-3 text-[10px] font-bold text-[#6B7280] uppercase">Name</th>
                                      <th className="py-2 px-3 text-[10px] font-bold text-[#6B7280] uppercase">Reg No</th>
                                      <th className="py-2 px-3 text-[10px] font-bold text-[#6B7280] uppercase">Year</th>
                                      <th className="py-2 px-3 text-[10px] font-bold text-[#6B7280] uppercase">Email</th>
                                      <th className="py-2 px-3 text-[10px] font-bold text-[#6B7280] uppercase">Registered At</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E5E7EB]">
                                    {evRegs.map(r => (
                                      <tr key={r.id} className="hover:bg-[#F5F6FA]">
                                        <td className="py-2 px-3 text-xs font-semibold text-[#111827]">{r.name}</td>
                                        <td className="py-2 px-3 text-xs text-[#4B5563]">{r.registerNumber || "\u2014"}</td>
                                        <td className="py-2 px-3 text-xs text-[#4B5563]">{r.currentYear || "\u2014"}</td>
                                        <td className="py-2 px-3 text-xs text-[#4B5563]">{r.email}</td>
                                        <td className="py-2 px-3 text-[10px] text-[#94A3B8]">{formatDate(r.registeredAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Post Announcement */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#111827]">Post Announcement</h2>
                <p className="text-xs text-[#6B7280]">Broadcast a message to students and/or faculty dashboards.</p>
              </div>
              <form onSubmit={handlePostAnn} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Announcement Title</label>
                    <input required type="text" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" placeholder="e.g. Upcoming Holiday" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Target Audience</label>
                    <select required value={annForm.target} onChange={e => setAnnForm({...annForm, target: e.target.value as any})} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]">
                      <option value="all">All (Students &amp; Faculty)</option>
                      <option value="students">Students Only</option>
                      <option value="staff">Faculty Only</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#4B5563] mb-1">Message Body</label>
                    <textarea required value={annForm.body} onChange={e => setAnnForm({...annForm, body: e.target.value})} rows={3} className="w-full bg-[#F5F6FA] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3B5BFF]" placeholder="Detailed message..." />
                  </div>
                </div>
                <button type="submit" disabled={annLoading} className="mt-2 px-6 py-2.5 bg-[#D97706] text-white rounded-xl text-sm font-bold hover:bg-[#B45309] transition-all disabled:opacity-50">
                  {annLoading ? "Posting..." : "Post Announcement"}
                </button>
              </form>
            </div>

            {/* Manage Announcements */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#111827]">Manage Announcements</h2>
                <p className="text-xs text-[#6B7280]">Edit or delete previously posted announcements.</p>
              </div>
              {annList.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {annList.map(ann => (
                    <div key={ann.id} className="border border-[#E5E7EB] rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-[#111827]">{ann.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ann.target === "students" ? "bg-green-100 text-green-700" : ann.target === "staff" ? "bg-purple-100 text-purple-700" : "bg-[#F5F6FA] text-[#6B7280]"}`}>
                            {ann.target === "students" ? "Students" : ann.target === "staff" ? "Faculty" : "All"}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563] line-clamp-2">{ann.body}</p>
                        {ann.createdAt && <p className="text-[10px] text-[#94A3B8] mt-1">Posted {formatDate(ann.createdAt)}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setEditingAnn(ann); setEditAnnForm({ title: ann.title, body: ann.body, target: ann.target }) }}
                          className="p-1.5 text-[#6B7280] hover:text-[#3B5BFF] hover:bg-blue-50 rounded-lg transition-colors" title="Edit announcement">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.83a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteAnn(ann.id!)}
                          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" title="Delete announcement">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 capitalize">{activeTab.replace("-", " ")} Module</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              This module is part of the HOD Master Dashboard Phase 2+ implementation plan.
            </p>
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setEditingEvent(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Edit Event</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{editingEvent.title}</p>
              </div>
              <button onClick={() => setEditingEvent(null)} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveEvent} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Title</label>
                  <input required type="text" value={editEvForm.title || ""} onChange={e => setEditEvForm({...editEvForm, title: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Type</label>
                  <select value={editEvForm.type || "Workshop"} onChange={e => setEditEvForm({...editEvForm, type: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm">
                    <option>Workshop</option><option>Hackathon</option><option>Guest Lecture</option><option>Seminar</option><option>FDP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Venue</label>
                  <input type="text" value={editEvForm.venue || ""} onChange={e => setEditEvForm({...editEvForm, venue: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Start Date</label>
                  <input type="date" value={editEvForm.startDate || ""} onChange={e => setEditEvForm({...editEvForm, startDate: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">End Date</label>
                  <input type="date" value={editEvForm.endDate || ""} onChange={e => setEditEvForm({...editEvForm, endDate: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Description</label>
                  <textarea value={editEvForm.description || ""} onChange={e => setEditEvForm({...editEvForm, description: e.target.value})} rows={3} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingEvent(null)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="submit" disabled={editEvLoading} className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB] disabled:opacity-60 flex items-center justify-center gap-2">
                  {editEvLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setEditingAnn(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Edit Announcement</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{editingAnn.title}</p>
              </div>
              <button onClick={() => setEditingAnn(null)} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveAnn} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Title</label>
                <input required type="text" value={editAnnForm.title || ""} onChange={e => setEditAnnForm({...editAnnForm, title: e.target.value})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Target Audience</label>
                <select value={editAnnForm.target || "all"} onChange={e => setEditAnnForm({...editAnnForm, target: e.target.value as any})} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm">
                  <option value="all">All (Students &amp; Faculty)</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Faculty Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Message Body</label>
                <textarea required value={editAnnForm.body || ""} onChange={e => setEditAnnForm({...editAnnForm, body: e.target.value})} rows={4} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingAnn(null)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="submit" disabled={editAnnLoading} className="flex-1 py-2.5 rounded-xl bg-[#D97706] text-white text-sm font-bold hover:bg-[#B45309] disabled:opacity-60 flex items-center justify-center gap-2">
                  {editAnnLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function HodDash() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
      <HodDashInner />
    </Suspense>
  )
}
