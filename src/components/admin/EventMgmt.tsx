"use client"
import { useEffect, useState } from "react"
import { CalendarDays, Plus, Trash2, X, AlertTriangle, RefreshCw, Edit3, Users, ChevronDown, ChevronUp } from "lucide-react"
import { getAdminEvents, addAdminEvent, updateAdminEvent, deleteAdminEvent, type AdminEvent } from "@/lib/db/events"
import { getAllRegistrations, type EventRegistration } from "@/lib/db/registrations"
import { useUser } from "@/lib/hooks/useUser"

const TAGS = ["Workshop", "Hackathon", "Guest Lecture", "Seminar", "FDP"]

const TAG_COLORS: Record<string, string> = {
  "Workshop":      "bg-violet-100 text-violet-700 border-violet-200",
  "Hackathon":     "bg-rose-100   text-rose-700   border-rose-200",
  "Guest Lecture": "bg-amber-100  text-amber-700  border-amber-200",
  "Seminar":       "bg-teal-100   text-teal-700   border-teal-200",
  "FDP":           "bg-sky-100    text-sky-700    border-sky-200",
}

export default function EventMgmt() {
  const { name } = useUser()
  const [items, setItems]       = useState<AdminEvent[]>([])
  const [regs, setRegs]         = useState<EventRegistration[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<AdminEvent | null>(null)
  const [form, setForm]         = useState({ title: "", date: "", description: "", tag: "Workshop" })
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [events, allRegs] = await Promise.all([getAdminEvents(), getAllRegistrations()])
      setItems(events)
      setRegs(allRegs)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events.")
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const getRegCount = (eventId: string) => regs.filter((r) => r.eventId === eventId).length
  const getEventRegs = (eventId: string) => regs.filter((r) => r.eventId === eventId)

  const openCreateForm = () => {
    setEditItem(null)
    setForm({ title: "", date: "", description: "", tag: "Workshop" })
    setShowForm(true)
  }

  const openEditForm = (ev: AdminEvent) => {
    setEditItem(ev)
    setForm({ title: ev.title, date: ev.date, description: ev.description, tag: ev.tag })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    setSaving(true)
    setSaveError(null)
    try {
      if (editItem?.id) {
        await updateAdminEvent(editItem.id, form)
      } else {
        await addAdminEvent({ ...form, createdBy: name })
      }
      setForm({ title: "", date: "", description: "", tag: "Workshop" })
      setShowForm(false)
      setEditItem(null)
      await load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save. Check Firestore.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      await deleteAdminEvent(id)
      setItems((prev) => prev.filter((ev) => ev.id !== id))
    } catch {
      alert("Delete failed. Check Firestore connection.")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-blue-500" /> Event Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Create, edit and manage department events</p>
        </div>
        <button onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      {/* Firestore error banner */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Firestore not connected</p>
            <p className="text-xs text-red-600 mt-0.5">Go to Firebase Console → Firestore Database → Create database</p>
          </div>
          <button onClick={load} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Create/Edit Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Event" : "New Event"}</h2>
              <button onClick={() => { setShowForm(false); setSaveError(null); setEditItem(null) }} className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Event title…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Date</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category</label>
                  <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400">
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Brief description…" />
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setSaveError(null); setEditItem(null) }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 min-h-[44px] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-all">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving…
                    </span>
                  ) : editItem ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
          <p className="text-xs text-slate-400">Loading from Firestore…</p>
        </div>
      ) : items.length === 0 && !error ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No events yet</p>
          <p className="text-slate-400 text-sm mt-1">Click &quot;New Event&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ev) => {
            const count = getRegCount(ev.id!)
            const isExpanded = expandedEvents.has(ev.id!)
            const toggleExpand = () => setExpandedEvents((prev) => {
              const next = new Set(prev)
              next.has(ev.id!) ? next.delete(ev.id!) : next.add(ev.id!)
              return next
            })
            return (
              <div key={ev.id} className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm overflow-hidden">
                <div className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 text-sm">{ev.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditForm(ev)} className="text-slate-300 hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(ev.id!)} className="text-slate-300 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {ev.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{ev.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[ev.tag] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {ev.tag}
                      </span>
                      <span className="text-[10px] text-slate-400">{ev.date}</span>
                      <button
                        onClick={toggleExpand}
                        className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-all">
                        <Users className="h-3 w-3" />
                        {count} registered
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Expanded: show registered students with full details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                    {count === 0 ? (
                      <p className="text-xs text-slate-400 italic">No students registered yet</p>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-3">Registered Students ({count})</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-1.5 pr-3 font-semibold text-slate-500 w-8">#</th>
                                <th className="text-left py-1.5 pr-3 font-semibold text-slate-500">Name</th>
                                <th className="text-left py-1.5 pr-3 font-semibold text-slate-500">Reg No.</th>
                                <th className="text-left py-1.5 pr-3 font-semibold text-slate-500">Dept</th>
                                <th className="text-left py-1.5 font-semibold text-slate-500">Year</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getEventRegs(ev.id!).map((r, i) => (
                                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                                  <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                                  <td className="py-2 pr-3 font-medium text-slate-700">{r.name || "—"}</td>
                                  <td className="py-2 pr-3 text-slate-600 font-mono">{r.registerNumber || "—"}</td>
                                  <td className="py-2 pr-3 text-slate-500">{r.department || "—"}</td>
                                  <td className="py-2 text-slate-500">{r.currentYear || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
  )
}
