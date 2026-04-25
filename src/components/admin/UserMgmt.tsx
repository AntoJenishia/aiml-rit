"use client"
import { useEffect, useState } from "react"
import { Users, Search, Shield, GraduationCap, Briefcase, AlertTriangle, RefreshCw } from "lucide-react"
import { getAllUsers, updateUserRole, type FirestoreUser } from "@/lib/db/users"
import type { UserRole } from "@/lib/auth"
import Image from "next/image"

const ROLE_STYLES: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700 border-emerald-200",
  staff:   "bg-blue-100   text-blue-700   border-blue-200",
  hod:     "bg-amber-100  text-amber-700  border-amber-200",
  guest:   "bg-slate-100  text-slate-600  border-slate-200",
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  student: <GraduationCap className="h-3 w-3" />,
  staff:   <Briefcase className="h-3 w-3" />,
  hod:     <Shield className="h-3 w-3" />,
}

const SETUP_HINT = "Firestore not connected. Go to Firebase Console → Firestore Database → Create database (test mode). Users appear here after their first sign-in."

export default function UserMgmt() {
  const [users, setUsers]       = useState<FirestoreUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await getAllUsers())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.")
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (uid: string, role: UserRole) => {
    setUpdating(uid)
    try {
      await updateUserRole(uid, role)
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role } : u))
    } catch {
      alert("Role update failed. Check Firestore connection.")
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" /> User Management
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          View and manage roles for <span className="text-blue-600 font-semibold">all registered users</span>
        </p>
      </div>

      {/* Firestore error / setup banner */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Firestore not connected</p>
            <p className="text-xs text-red-600 mt-0.5">{SETUP_HINT}</p>
          </div>
          <button onClick={load} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
          <p className="text-xs text-slate-400">Loading from Firestore…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No users found</p>
          <p className="text-slate-400 text-sm mt-1">
            {error ? "Check Firestore setup above." : "Users appear here after their first sign-in"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <Image src={u.photoURL} alt={u.name} width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {u.name?.[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_STYLES[u.role]}`}>
                      {ROLE_ICONS[u.role]} {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {updating === u.uid ? (
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                        Updating…
                      </span>
                    ) : (
                      <select value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="hod">HOD</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
