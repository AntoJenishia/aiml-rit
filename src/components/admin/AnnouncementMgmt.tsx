"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, Megaphone, X, AlertTriangle, RefreshCw } from "lucide-react"
import { getAnnouncements, addAnnouncement, deleteAnnouncement, type Announcement } from "@/lib/db/announcements"
import { useUser } from "@/lib/hooks/useUser"

const TARGET_OPTIONS = [
  { value: "all",      label: "Everyone" },
  { value: "students", label: "Students" },
  { value: "staff",    label: "Staff"    },
]

const SETUP_HINT = "Firestore database not set up. Go to Firebase Console → Firestore Database → Create database (test mode)."

export default function AnnouncementMgmt() {
  const { name } = useUser()
  const [items, setItems]       = useState<Announcement[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title: "", body: "", target: "all" as Announcement["target"] })
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getAnnouncements())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load. Check Firestore setup.")
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await addAnnouncement({ ...form, postedBy: name })
      setForm({ title: "", body: "", target: "all" })
      setShowForm(false)
      await load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to post. Check Firestore.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    try {
      await deleteAnnouncement(id)
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert("Delete failed. Check Firestore connection.")
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-amber-500" /> Announcements
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Broadcast messages to students and staff</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      {/* Firestore setup banner */}
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

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">New Announcement</h2>
              <button onClick={() => { setShowForm(false); setSaveError(null) }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Announcement title…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Message</label>
                <textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Write the announcement…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Audience</label>
                <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as Announcement["target"] })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {TARGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setSaveError(null) }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-all">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Posting…
                    </span>
                  ) : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="text-xs text-slate-400">Loading from Firestore…</p>
        </div>
      ) : items.length === 0 && !error ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No announcements yet</p>
          <p className="text-slate-400 text-sm mt-1">Click &quot;New Announcement&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{a.title}</h3>
                  <button onClick={() => handleDelete(a.id!)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">{a.body}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {a.target}
                  </span>
                  <span className="text-[10px] text-slate-400">by {a.postedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
