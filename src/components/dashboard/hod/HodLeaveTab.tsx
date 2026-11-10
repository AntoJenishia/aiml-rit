"use client"
import { useState, useEffect } from "react"
import {
  FileText, CheckCircle, XCircle, Clock,
  ExternalLink, Search, Loader2, AlertCircle,
  CalendarDays, User, ShieldCheck, X, Eye
} from "lucide-react"
import LeaveReviewModal from "../LeaveReviewModal"

export default function HodLeaveTab() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<"PENDING_HOD" | "PENDING_INCHARGE" | "ALL" | "APPROVED" | "REJECTED">("PENDING_HOD")
  const [search, setSearch] = useState<string>("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // In-page leave document review modal target
  const [reviewTarget, setReviewTarget] = useState<any | null>(null)

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState<string>("")

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/leave")
      if (res.ok) {
        const json = await res.json()
        setLeaves(json.leaves || [])
      }
    } catch (err) {
      console.error("[HodLeaveTab] fetch error:", err)
      showToast("Failed to fetch leave requests", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleApprove = async (leave: any, customNotes?: string) => {
    setActionLoading(leave.id)
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leave.id,
          action: "approve",
          reviewNotes: customNotes || "Final approval granted by Head of Department.",
        }),
      })

      const data = await res.json()
      if (res.ok) {
        showToast(`Leave for ${leave.studentName} received final HOD approval.`, "success")
        await fetchLeaves()
      } else {
        showToast(data.error || "Approval failed", "error")
      }
    } catch (err: any) {
      showToast(err.message || "Failed to approve leave", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (targetLeave?: any, customReason?: string) => {
    const target = targetLeave || rejectTarget
    if (!target) return
    setActionLoading(target.id)
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: target.id,
          action: "reject",
          reviewNotes: customReason || rejectReason.trim() || "Rejected by Head of Department.",
        }),
      })

      const data = await res.json()
      if (res.ok) {
        showToast(`Leave request rejected for ${target.studentName}.`, "success")
        setRejectTarget(null)
        setRejectReason("")
        await fetchLeaves()
      } else {
        showToast(data.error || "Rejection failed", "error")
      }
    } catch (err: any) {
      showToast(err.message || "Failed to reject leave", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const pendingHodCount = leaves.filter((l) => l.status === "PENDING_HOD").length
  const pendingInchargeCount = leaves.filter((l) => l.status === "PENDING_INCHARGE" || l.status === "PENDING").length

  const filteredLeaves = leaves.filter((l) => {
    if (filter === "PENDING_HOD" && l.status !== "PENDING_HOD") return false
    if (filter === "PENDING_INCHARGE" && l.status !== "PENDING_INCHARGE" && l.status !== "PENDING") return false
    if (filter === "APPROVED" && l.status !== "APPROVED") return false
    if (filter === "REJECTED" && l.status !== "REJECTED") return false

    if (search) {
      const q = search.toLowerCase()
      return (
        (l.studentName || "").toLowerCase().includes(q) ||
        (l.registerNumber || "").toLowerCase().includes(q) ||
        (l.batch || "").toLowerCase().includes(q) ||
        (l.section || "").toLowerCase().includes(q) ||
        (l.category || "").toLowerCase().includes(q) ||
        (l.classInchargeName || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-in fade-in duration-300 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#003087]/10 text-[#003087]">
              Two-Tier Approval
            </span>
            <span className="text-xs font-bold text-slate-500">
              Dr. Selvakumaran S. · Final Authority
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#003087]" /> Student Advance Leave Approvals
          </h2>
          <p className="text-xs text-slate-500">
            Leaves recommended by Class Incharges require HOD final verification to officially excuse attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#003087]"
            />
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold flex-wrap gap-1">
            <button
              onClick={() => setFilter("PENDING_HOD")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filter === "PENDING_HOD" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Pending Sign-off
              {pendingHodCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {pendingHodCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("PENDING_INCHARGE")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filter === "PENDING_INCHARGE" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              With Incharge
              {pendingInchargeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                  {pendingInchargeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === "ALL" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Requests ({leaves.length})
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === "APPROVED" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === "REJECTED" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* ── Table of Leaves ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading leave applications...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">
            No leave applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-5 py-3.5 min-w-[220px]">Student Details</th>
                  <th className="px-4 py-3.5 min-w-[150px]">Dates &amp; Category</th>
                  <th className="px-5 py-3.5 min-w-[200px]">Reason &amp; Recommendation</th>
                  <th className="px-4 py-3.5 text-center min-w-[180px]">Approval Status</th>
                  <th className="px-5 py-3.5 text-center min-w-[200px]">HOD Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLeaves.map((leave) => {
                  const isPendingHod = leave.status === "PENDING_HOD"
                  const isApproved = leave.status === "APPROVED"
                  const isRejected = leave.status === "REJECTED"
                  const isPendingIncharge = leave.status === "PENDING_INCHARGE" || leave.status === "PENDING"

                  // Calculate days duration
                  let durationDays = 1
                  if (leave.startDate && leave.endDate) {
                    const s = new Date(leave.startDate).getTime()
                    const e = new Date(leave.endDate).getTime()
                    if (!isNaN(s) && !isNaN(e) && e >= s) {
                      durationDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
                    }
                  }

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. Student Details */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-[#003087] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                            {leave.studentPhoto || leave.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={leave.studentPhoto || leave.photoURL}
                                alt={leave.studentName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none"
                                }}
                              />
                            ) : (
                              leave.studentName?.[0] || "S"
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm block truncate">
                              {leave.studentName}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mt-0.5">
                              {leave.registerNumber && (
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {leave.registerNumber}
                                </span>
                              )}
                              <span>Batch {leave.batch || "—"}</span>
                              {leave.section && <span>(Sec {leave.section})</span>}
                              {leave.hosteler !== undefined && leave.hosteler !== null && leave.hosteler !== "" && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                  {String(leave.hosteler) === "1" || String(leave.hosteler).toLowerCase() === "hosteler" ? "Hostel" : "Day"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {leave.studentPhone && (
                                <a
                                  href={`tel:${leave.studentPhone}`}
                                  className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200"
                                >
                                  📞 {leave.studentPhone}
                                </a>
                              )}
                              {leave.leaveSequence && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  🎯 {leave.leaveSequence === 1 ? "1st Leave" : leave.leaveSequence === 2 ? "2nd Leave" : `${leave.leaveSequence}th Leave`}
                                </span>
                              )}
                              {typeof leave.attendancePercentage === "number" && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  leave.attendancePercentage >= 75
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200 font-black"
                                }`}>
                                  {leave.attendancePercentage}% Attd
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Dates & Category */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-[#003087]" />
                          {leave.startDate} {leave.startDate !== leave.endDate ? `to ${leave.endDate}` : ""}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                            {leave.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            ({durationDays} {durationDays === 1 ? "day" : "days"})
                          </span>
                        </div>
                      </td>

                      {/* 3. Reason & Recommendation */}
                      <td className="px-5 py-3.5 align-middle max-w-xs">
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          &ldquo;{leave.reason}&rdquo;
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          {leave.attachmentUrl ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              <FileText className="w-3 h-3 text-[#003087]" /> Proof Attached
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No document attached
                            </span>
                          )}
                        </div>
                        {leave.inchargeApprovedBy && (
                          <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-indigo-700 font-semibold flex items-center gap-1 flex-wrap">
                            <span>Verified by: {leave.inchargeApprovedBy}</span>
                            {leave.inchargeNotes && <span className="text-slate-500 italic">(&ldquo;{leave.inchargeNotes}&rdquo;)</span>}
                          </div>
                        )}
                        {leave.rejectReason && (
                          <p className="text-[10px] text-rose-600 italic mt-1">
                            Rejection note ({leave.rejectedBy}): &ldquo;{leave.rejectReason}&rdquo;
                          </p>
                        )}
                      </td>

                      {/* 4. Approval Status (Centered) */}
                      <td className="px-4 py-3.5 align-middle text-center">
                        {isApproved ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> HOD Approved
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Officially Sanctioned
                            </span>
                          </div>
                        ) : isPendingHod ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending HOD Approval
                            </span>
                            {leave.inchargeApprovedBy && (
                              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                Recommended by Incharge
                              </span>
                            )}
                          </div>
                        ) : isRejected ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-slate-500" /> With Class Incharge
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Awaiting Incharge Review
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 5. HOD Action (Centered) */}
                      <td className="px-5 py-3.5 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPendingHod ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setReviewTarget(leave)}
                                className="px-3 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                title="Open full evaluation with student attendance %, leave count & embedded proof doc"
                              >
                                <Eye className="w-3.5 h-3.5" /> Review &amp; Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(leave)}
                                disabled={actionLoading === leave.id}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                title="Quick Final Approve without opening review"
                              >
                                {actionLoading === leave.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectTarget(leave)
                                  setRejectReason("")
                                }}
                                disabled={actionLoading === leave.id}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                title="Quick Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : isPendingIncharge ? (
                            <button
                              type="button"
                              onClick={() => setReviewTarget(leave)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Inspect application (Class Incharge has not yet verified)"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" /> Inspect
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewTarget(leave)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" /> View Record
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── In-Page Leave Document & Live Stats Review Modal ── */}
      {reviewTarget && (
        <LeaveReviewModal
          leave={reviewTarget}
          role="hod"
          onClose={() => setReviewTarget(null)}
          onApprove={async (l, notes) => {
            await handleApprove(l, notes)
          }}
          onReject={async (l, reason) => {
            await handleReject(l, reason)
          }}
        />
      )}

      {/* ── Rejection Modal ── */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003087] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Reject Student Leave</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  {rejectTarget.studentName} · {rejectTarget.startDate} to {rejectTarget.endDate}
                </p>
              </div>
              <button onClick={() => setRejectTarget(null)} className="text-white/70 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Official HOD Remarks for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Attendance is below minimum Anna University criteria (75%)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003087] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading === rejectTarget.id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading === rejectTarget.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

