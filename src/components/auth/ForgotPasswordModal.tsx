"use client"

import { useState } from "react"
import { KeyRound, Send, AlertCircle, CheckCircle2, X, Mail, Phone, ShieldCheck } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = "",
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail.includes("@") ? initialEmail : "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ message: string; inchargeName: string } | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter your valid College Email address.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessData(null)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.")
      }

      setSuccessData({
        message: data.message,
        inchargeName: data.inchargeName || "Class Incharge",
      })
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-7">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003087] border border-blue-100 shadow-xs">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Forgot Password?</h3>
            <p className="text-xs text-slate-500">Student Password Recovery Escalation</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs sm:text-sm text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Request Escalated Successfully
              </div>
              <p className="text-emerald-700 leading-relaxed text-xs">
                {successData.message}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#003087]" />
                What happens next?
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-500">
                <li>Your Class Incharge ({successData.inchargeName}) reviews and verifies your request.</li>
                <li>Once approved, your login password will temporarily reset to your registered <strong>Mobile Number</strong>.</li>
                <li>Upon logging in with your mobile number, you will be prompted to set a new personal password.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#003087] py-2.5 px-4 text-xs sm:text-sm font-semibold text-white shadow hover:bg-[#002266] transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your official <strong>College Email</strong> address. A verification ticket will be forwarded to your assigned <strong>Class Incharge</strong> for approval.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname.aiml@ritchennai.edu.in"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs sm:text-sm placeholder-slate-400 focus:border-[#003087] focus:outline-none focus:ring-2 focus:ring-[#003087]/20 disabled:bg-slate-50 transition"
                />
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-900 border border-blue-100/80 flex items-start gap-2">
              <Phone className="h-4 w-4 text-[#003087] shrink-0 mt-0.5" />
              <span>
                Upon approval by your Class Incharge, your password will be reset to your registered <strong>Mobile Number</strong>.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 rounded-xl bg-[#003087] py-2.5 px-4 text-xs font-semibold text-white shadow hover:bg-[#002266] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send to Incharge
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

