"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, AlertCircle, LogOut } from "lucide-react"

export default function MandatoryPasswordChangeModal() {
  const { data: session, update } = useSession()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Validation checks
  const isLengthValid = newPassword.length >= 8
  const hasLetter = /[a-zA-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isLengthValid) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (!hasLetter || !hasNumber) {
      setError("Password must contain both letters and numbers.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.")
      }

      setSuccess(true)

      // Refresh session so mustChangePassword becomes false in the JWT
      await update({ mustChangePassword: false })

      // Small delay for smooth transition, then navigate directly to student dashboard
      setTimeout(() => {
        window.location.href = "/dashboard/student"
      }, 1000)
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-8">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Mandatory Password Change
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            For security reasons, your account is currently using the default college password. Please set a new personal password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 font-medium">
              Password changed successfully! Refreshing dashboard access...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 8 characters"
                required
                disabled={loading || success}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-10 text-sm placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:bg-slate-50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                disabled={loading || success}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:bg-slate-50 transition"
              />
            </div>
          </div>

          {/* Requirement hints */}
          <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
            <div className={`flex items-center gap-1.5 ${isLengthValid ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${isLengthValid ? "text-emerald-600" : "text-slate-300"}`} />
              At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${(hasLetter && hasNumber) ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${(hasLetter && hasNumber) ? "text-emerald-600" : "text-slate-300"}`} />
              Contains both letters & numbers
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <CheckCircle2 className={`h-3.5 w-3.5 ${isMatch ? "text-emerald-600" : "text-slate-300"}`} />
              Passwords match
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || success || !isLengthValid || !isMatch}
            className="w-full rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating Password...
              </>
            ) : (
              "Save New Password"
            )}
          </button>
        </form>

        {/* Sign Out Option */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out and change later
          </button>
        </div>

      </div>
    </div>
  )
}

