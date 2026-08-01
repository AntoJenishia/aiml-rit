"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { useUser } from "@/lib/hooks/useUser"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Mail, Shield, User, ArrowLeft, Check, Hash, BookOpen,
  Calendar, GraduationCap, QrCode, Loader2,
} from "lucide-react"
import type { FirestoreUser } from "@/lib/db/users"

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  student: { label: "Student",            color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  staff:   { label: "Faculty / Staff",    color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"    },
  hod:     { label: "Head of Department", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200"   },
  guest:   { label: "Guest",              color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200"   },
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const { uid, role } = useUser()

  const [profile, setProfile]           = useState<FirestoreUser | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [regNumber, setRegNumber]       = useState("")
  const [editingReg, setEditingReg]     = useState(false)
  const [savingReg, setSavingReg]       = useState(false)
  const [savedToast, setSavedToast]     = useState(false)

  // Fetch full profile from Firestore via API route
  useEffect(() => {
    if (!uid) return
    fetch(`/api/users?uid=${uid}`)
      .then((res) => res.ok ? res.json() : null)
      .then((p) => {
        setProfile(p)
        if (p?.registerNumber) setRegNumber(p.registerNumber)
        setLoadingProfile(false)
      }).catch(() => setLoadingProfile(false))
  }, [uid])

  const handleSaveReg = async () => {
    if (!regNumber.trim() || !uid) return
    setSavingReg(true)
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, registerNumber: regNumber.trim() }),
      })
      if (!res.ok) throw new Error("Failed")
      setProfile((prev) => prev ? { ...prev, registerNumber: regNumber.trim() } : prev)
      setEditingReg(false)
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 3000)
    } catch {
      alert("Failed to save. Try again.")
    }
    setSavingReg(false)
  }

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#3B5BFF]" />
      </div>
    )
  }

  const rc = ROLE_CONFIG[role] ?? ROLE_CONFIG.guest
  const name = profile?.name || user?.name || ""
  const isStudent = role === "student"
  const hasRegNumber = !!profile?.registerNumber

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#F5F6FA]">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#3B5BFF] mb-4 md:mb-6 transition-colors min-h-[44px]">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Saved toast */}
        {savedToast && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check className="h-4 w-4" /> Register number saved successfully
          </div>
        )}

        {/* Profile card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm overflow-hidden">

          {/* Cover bar (flat color instead of gradient) */}
          <div className="h-20 sm:h-32 w-full bg-[#3B5BFF]" />

          {/* Avatar */}
          <div className="px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="-mt-10 sm:-mt-12 mb-4 flex items-end gap-3">
              <div className="relative">
                {user?.image ? (
                  <Image src={user.image} alt={name} width={72} height={72}
                    className="rounded-full ring-4 ring-white shadow-sm w-16 h-16 sm:w-20 sm:h-20" />
                ) : (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#3B5BFF] ring-4 ring-white shadow-sm flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                    {name?.[0] ?? <User className="h-8 w-8" />}
                  </div>
                )}
              </div>
            </div>

            {/* Name + role */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{name}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mt-2 ${rc.color} ${rc.bg} ${rc.border}`}>
                <Shield className="h-3 w-3" />
                {rc.label}
              </span>
            </div>

            {/* Details — all read-only */}
            <div className="space-y-3">
              <ReadOnlyField icon={Mail} label="Email" value={user?.email ?? "—"} />

              {isStudent && (
                <>
                  <ReadOnlyField icon={BookOpen} label="Department" value={profile?.department ?? "—"} />
                  <ReadOnlyField icon={Calendar} label="Batch" value={profile?.batch ?? "—"} />
                  <ReadOnlyField icon={GraduationCap} label="Current Year" value={profile?.currentYear ?? "—"} />
                  
                  {/* Mocked Class Incharge - Real wiring in Phase 3 */}
                  <ReadOnlyField icon={User} label="Class Incharge" value="Dr. J. Alice" />

                  {/* Register Number — editable once */}
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-[#94A3B8] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Register Number</p>
                        {hasRegNumber && !editingReg ? (
                          <p className="text-sm font-medium text-[#111827] mt-0.5 font-mono">{profile?.registerNumber}</p>
                        ) : (
                          <div className="mt-1.5">
                            <input
                              value={regNumber}
                              onChange={(e) => setRegNumber(e.target.value)}
                              placeholder="e.g. 7376222CS101"
                              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-base sm:text-sm min-h-[44px] font-medium text-[#111827] focus:outline-none focus:border-[#3B5BFF] focus:ring-2 focus:ring-[#3B5BFF]/20"
                              disabled={hasRegNumber && !editingReg}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveReg}
                              disabled={!regNumber.trim() || savingReg}
                              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#3B5BFF] px-4 py-2 min-h-[44px] text-xs font-bold text-white hover:bg-[#2563EB] disabled:opacity-50 transition-all w-full sm:w-auto">
                              {savingReg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              {savingReg ? "Saving…" : "Save Register Number"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ID Card Status */}
                  <ReadOnlyField
                    icon={QrCode}
                    label="ID Card"
                    value={profile?.idCardData && profile.idCardData !== "manual-skip"
                      ? "✓ Linked"
                      : "Not linked"}
                  />
                </>
              )}

              {/* Role field */}
              <ReadOnlyField icon={Shield} label="Role" value={role} capitalize />

              {user?.uid && (
                <ReadOnlyField icon={User} label="User ID" value={user.uid} mono />
              )}
            </div>

            {/* Auth provider note */}
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3">
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
    </div>
  )
}

function ReadOnlyField({
  icon: Icon, label, value, mono, capitalize
}: {
  icon: React.ElementType; label: string; value: string; mono?: boolean; capitalize?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-3">
      <Icon className="h-4 w-4 text-[#94A3B8] shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold text-[#111827] mt-0.5 ${mono ? "font-mono text-xs break-all" : ""} ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
