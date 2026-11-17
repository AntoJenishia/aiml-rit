"use client"

import { useState, useEffect } from "react"
import { Bell, KeyRound, Check, X, ShieldAlert, Clock, User, Phone, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface PasswordResetItem {
  id: string
  studentId: string
  studentName: string
  registerNumber: string
  studentEmail: string
  studentPhone: string
  studentClass: string
  inchargeName: string
  status: "pending" | "approved" | "denied"
  createdAt: string | null
  reviewedBy?: string
}

export default function FacultyNotificationsTab() {
  const [requests, setRequests] = useState<PasswordResetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/faculty/password-resets")
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (err) {
      console.error("Failed to fetch password reset notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (requestId: string, action: "approve" | "deny") => {
    try {
      setActionLoading(requestId)
      setMessage(null)

      const res = await fetch("/api/faculty/password-resets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update request.")
      }

      setMessage({ text: data.message, type: "success" })
      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: action === "approve" ? "approved" : "denied" } : r
        )
      )
    } catch (err: any) {
      setMessage({ text: err?.message || "An error occurred.", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const pastRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#003087] border border-blue-100">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Notification Center</h2>
            <p className="text-xs text-slate-500">
              Review student password recovery escalations & approval requests
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            Pending Password Reset Requests
            {pendingRequests.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {pendingRequests.length} pending
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center border border-slate-200/80">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-[#003087]" />
            <p className="mt-2 text-xs text-slate-500 font-medium">Checking for requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center border border-dashed border-slate-200">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No pending password reset requests</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When a student from your class forgets their password, their request will appear here for your verification.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl bg-white p-5 border border-amber-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg">
                  Action Required
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#003087] flex items-center justify-center font-bold text-sm border border-blue-100">
                      {req.studentName?.[0] || "S"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {req.studentName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Reg No: {req.registerNumber || "—"} {req.studentClass ? `· ${req.studentClass}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Reset Target: <strong className="text-slate-800">{req.studentPhone}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Requested: {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Recently"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(req.id, "deny")}
                    disabled={actionLoading === req.id}
                    className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <X className="h-3.5 w-3.5 text-red-600" />
                    Deny
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={actionLoading === req.id}
                    className="flex-1 rounded-xl bg-[#003087] py-2 px-3 text-xs font-semibold text-white shadow hover:bg-[#002266] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading === req.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Approve & Reset
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past / Reviewed Requests */}
      {pastRequests.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resolved Escalations ({pastRequests.length})
          </h3>
          <div className="divide-y divide-slate-100 rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            {pastRequests.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                      req.status === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {req.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{req.studentName}</span>{" "}
                    <span className="text-slate-500">({req.registerNumber})</span>
                    <div className="text-[11px] text-slate-400">
                      Mobile: {req.studentPhone} · {req.status === "approved" ? "Password reset to mobile" : "Request rejected"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

