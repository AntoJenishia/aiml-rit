"use client"
import { useState } from "react"
import {
  X, CheckCircle, XCircle, Clock, CalendarDays,
  User, FileText, AlertCircle, ExternalLink,
  ShieldCheck, Loader2, ZoomIn, Info
} from "lucide-react"

interface LeaveReviewModalProps {
  leave: any
  role: "staff" | "hod"
  onClose: () => void
  onApprove: (leave: any, reviewNotes?: string) => Promise<void>
  onReject: (leave: any, rejectReason: string) => Promise<void>
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function LeaveReviewModal({
  leave,
  role,
  onClose,
  onApprove,
  onReject,
}: LeaveReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)

  if (!leave) return null

  const isHod = role === "hod"
  const isPendingHod = leave.status === "PENDING_HOD"
  const isPendingIncharge = leave.status === "PENDING_INCHARGE" || leave.status === "PENDING"
  const isApproved = leave.status === "APPROVED"
  const isRejected = leave.status === "REJECTED"

  const attRate = typeof leave.attendancePercentage === "number" ? leave.attendancePercentage : 100
  const isAttEligible = attRate >= 75
  const seqNum = leave.leaveSequence || 1

  const url = leave.attachmentUrl || ""
  const isPdf = url.toLowerCase().includes(".pdf")
  const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url) || (!isPdf && url.startsWith("http"))

  const handleApproveClick = async () => {
    setActionLoading(true)
    try {
      await onApprove(leave, reviewNotes.trim())
      onClose()
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectClick = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    try {
      await onReject(leave, rejectReason.trim())
      onClose()
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate days count
  let daysCount = 1
  if (leave.startDate && leave.endDate) {
    const s = new Date(leave.startDate).getTime()
    const e = new Date(leave.endDate).getTime()
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      daysCount = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Top Header ── */}
        <div className="bg-[#003087] px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  {isHod ? "HOD Final Evaluation" : "Class Incharge Review"}
                </span>
                <span className="text-[11px] text-blue-200 font-bold">
                  {leave.category}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                Leave Request Application
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. Student Identity & Live Stats Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#003087] text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0 overflow-hidden border-2 border-white">
                {leave.studentPhoto || leave.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={leave.studentPhoto || leave.photoURL}
                    alt={leave.studentName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  leave.studentName?.[0] || "S"
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-slate-900">
                    {leave.studentName}
                  </h4>
                  {leave.registerNumber && (
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300/60">
                      {leave.registerNumber}
                    </span>
                  )}
                  {leave.hosteler !== undefined && leave.hosteler !== null && leave.hosteler !== "" && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      String(leave.hosteler) === "1" || String(leave.hosteler).toLowerCase() === "hosteler"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-slate-200 text-slate-700 border-slate-300"
                    }`}>
                      {String(leave.hosteler) === "1" || String(leave.hosteler).toLowerCase() === "hosteler" ? "🏠 Hosteller" : "🚌 Day Scholar"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  Batch: {leave.batch || "—"} {leave.section ? `· Section ${leave.section}` : ""}
                  {leave.classTitle ? ` · ${leave.classTitle}` : ""}
                  {leave.classInchargeName && ` · Incharge: ${leave.classInchargeName}`}
                </p>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  {leave.studentPhone && (
                    <a
                      href={`tel:${leave.studentPhone}`}
                      className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors"
                      title="Call student / parent"
                    >
                      📞 {leave.studentPhone}
                    </a>
                  )}
                  {leave.studentEmail && (
                    <a
                      href={`mailto:${leave.studentEmail}`}
                      className="text-[11px] font-mono text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                    >
                      ✉️ {leave.studentEmail}
                    </a>
                  )}
                  {leave.gender && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      {leave.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key Evaluation Pills */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Leave Sequence Badge */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Leave Frequency
                </span>
                <span className="text-sm font-black text-indigo-950 flex items-center justify-center gap-1">
                  🎯 {getOrdinal(seqNum)} Leave
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 block">
                  ({leave.totalLeavesCount || 1} total applied)
                </span>
              </div>

              {/* Attendance Rate Badge */}
              <div
                className={`rounded-xl px-3.5 py-2 text-center shrink-0 border ${
                  isAttEligible
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isAttEligible ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  Live Attendance Rate
                </span>
                <span
                  className={`text-sm font-black flex items-center justify-center gap-1 ${
                    isAttEligible ? "text-emerald-900" : "text-rose-900"
                  }`}
                >
                  {isAttEligible ? "📈" : "⚠️"} {attRate}%
                </span>
                <span
                  className={`text-[10px] font-semibold block ${
                    isAttEligible ? "text-emerald-700" : "text-rose-700 font-bold"
                  }`}
                >
                  {isAttEligible ? "Eligible (≥75%)" : "Shortage Alert (<75%)"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Leave Dates & Duration Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Start Date
              </span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#003087]" /> {leave.startDate}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                End Date
              </span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#003087]" /> {leave.endDate}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Duration & Category
              </span>
              <span className="text-sm font-black text-[#003087] mt-0.5 block">
                {daysCount} {daysCount === 1 ? "Day" : "Days"} · {leave.category}
              </span>
            </div>
          </div>

          {/* 3. Student's Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Student Statement &amp; Reason:
            </span>
            <p className="text-sm text-slate-800 font-medium leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
              &ldquo;{leave.reason}&rdquo;
            </p>
          </div>

          {/* 4. Incharge Review Details (if available) */}
          {leave.inchargeApprovedBy && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  Recommended by Class Incharge: {leave.inchargeApprovedBy}
                </span>
                {leave.inchargeNotes && (
                  <p className="text-xs text-indigo-800 italic mt-0.5">
                    &ldquo;{leave.inchargeNotes}&rdquo;
                  </p>
                )}
                {leave.inchargeApprovedAt && (
                  <span className="text-[10px] text-indigo-500 font-semibold block mt-1">
                    Verified on: {new Date(leave.inchargeApprovedAt).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 5. In-Page Document Preview (Right inside this modal) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#003087]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Verification Document / Proof
                </span>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-[#003087] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open Full Screen
                </a>
              )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col items-center justify-center min-h-[220px]">
              {url ? (
                isPdf ? (
                  <div className="w-full">
                    <iframe
                      src={url}
                      title="Uploaded Proof PDF"
                      className="w-full h-96 rounded-xl border border-slate-300 bg-white shadow-inner"
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative max-h-96 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Uploaded Proof"
                        className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-600">No document attached</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Student submitted this leave request under self-explained grounds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 6. Current Status Badge if already processed */}
          {(isApproved || isRejected) && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                isApproved
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {isApproved ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  Status: {isApproved ? "Approved by HOD" : "Rejected"}
                </span>
                {leave.reviewNotes && (
                  <p className="text-xs italic mt-0.5">&ldquo;{leave.reviewNotes}&rdquo;</p>
                )}
              </div>
            </div>
          )}

          {/* 7. Action Decision Box (Shown if pending review) */}
          {(isPendingIncharge || isPendingHod) && !rejecting && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {isHod ? "HOD Approval Remarks (Optional)" : "Class Incharge Recommendation Notes (Optional)"}
              </label>
              <textarea
                rows={2}
                placeholder={
                  isHod
                    ? "e.g., Officially sanctioned. Attendance to be marked excused..."
                    : "e.g., Parent confirmed via phone call. Verified and recommended..."
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003087] resize-none"
              />
            </div>
          )}

          {/* Rejection Prompt Box */}
          {rejecting && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600" /> State Rejection Reason
              </div>
              <textarea
                rows={2}
                required
                placeholder="Explain why this leave application is being rejected (e.g., Attendance is critically low / Invalid certificate)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600 resize-none"
              />
            </div>
          )}
        </div>

        {/* ── Modal Footer Action Bar ── */}
        <div className="sticky bottom-0 bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>

          {(isPendingIncharge || isPendingHod) && (
            <div className="flex items-center gap-2.5">
              {!rejecting ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveClick}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {isHod ? "Grant Final HOD Approval" : "Verify & Forward to HOD"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(false)
                      setRejectReason("")
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectClick}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

