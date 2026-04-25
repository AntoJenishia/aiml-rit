"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Mail, Shield, User, ArrowLeft, Pencil, Check, X } from "lucide-react"

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  student: { label: "Student",            color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  staff:   { label: "Faculty / Staff",    color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"    },
  hod:     { label: "Head of Department", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200"   },
  guest:   { label: "Guest",              color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200"   },
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  const [editing, setEditing]       = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [saved, setSaved]           = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    )
  }

  const role = user?.role ?? "guest"
  const rc   = ROLE_CONFIG[role] ?? ROLE_CONFIG.guest
  const name = displayName || user?.name || ""

  const handleEdit = () => {
    setDisplayName(user?.name ?? "")
    setEditing(true)
    setSaved(false)
  }

  const handleSave = () => {
    // In production: persist to Firestore with updateDoc on the users collection
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    setDisplayName("")
    setEditing(false)
  }

  return (
    <div className="min-h-screen p-8"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Saved toast */}
        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check className="h-4 w-4" /> Display name updated successfully
          </div>
        )}

        {/* Profile card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">

          {/* Cover gradient */}
          <div className="h-32 w-full"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)" }} />

          {/* Avatar + edit button */}
          <div className="px-8 pb-8">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="relative">
                {user?.image ? (
                  <Image src={user.image} alt={name} width={80} height={80}
                    className="rounded-2xl ring-4 ring-white shadow-xl" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white shadow-xl flex items-center justify-center text-white text-2xl font-bold">
                    {name?.[0] ?? <User className="h-8 w-8" />}
                  </div>
                )}
              </div>

              {!editing ? (
                <button onClick={handleEdit}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all">
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-all">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all">
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              )}
            </div>

            {/* Name — editable */}
            <div className="mb-6">
              {editing ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel() }}
                  className="text-2xl font-bold text-slate-800 w-full rounded-xl border-2 border-blue-400 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
              )}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mt-2 ${rc.color} ${rc.bg} ${rc.border}`}>
                <Shield className="h-3 w-3" />
                {rc.label}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 capitalize">{role}</p>
                </div>
              </div>

              {user?.uid && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">User ID</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5 break-all">{user.uid}</p>
                  </div>
                </div>
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
