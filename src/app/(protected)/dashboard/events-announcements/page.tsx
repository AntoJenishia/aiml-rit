"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEffect, useState } from "react"
import { CalendarDays, Megaphone, Loader2 } from "lucide-react"
import { getAnnouncements, type Announcement } from "@/lib/db/announcements"
import { getAdminEvents, type AdminEvent } from "@/lib/db/events"
import { getRegistrationsByUser, registerForEvent, unregisterFromEvent } from "@/lib/db/registrations"

export default function EventsAnnouncementsPage() {
  const { uid, name, email } = useUser()
  const { user } = useAuth()
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events,        setEvents]        = useState<AdminEvent[]>([])
  const [registered,    setRegistered]    = useState<Set<string>>(new Set())
  const [regLoading,    setRegLoading]    = useState<Set<string>>(new Set())
  const [loadingData,   setLoadingData]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ann, ev] = await Promise.all([getAnnouncements(), getAdminEvents()])
        
        // Filter announcements based on role if needed, or just show relevant ones
        // Existing logic in StudentDash showed 'all' or 'students'
        // Existing logic in StaffDash showed 'all' or 'staff'
        const role = user?.role || "student"
        setAnnouncements(ann.filter(a => a.target === "all" || a.target === (role === "student" ? "students" : "staff")))
        
        const todayStr = new Date().toISOString().split("T")[0]
        setEvents(ev.filter(e => e.startDate >= todayStr))
        
        if (uid && role === "student") {
          const regs = await getRegistrationsByUser(uid)
          setRegistered(new Set(regs.map(r => r.eventId)))
        }
      } catch { /* silently fail */ }
      setLoadingData(false)
    }
    load()
  }, [uid, user?.role])

  const toggleRegister = async (eventId: string) => {
    if (!uid || regLoading.has(eventId) || user?.role !== "student") return
    setRegLoading(prev => new Set(prev).add(eventId))
    try {
      if (registered.has(eventId)) {
        await unregisterFromEvent(eventId, uid)
        setRegistered(prev => { const n = new Set(prev); n.delete(eventId); return n })
      } else {
        await registerForEvent(eventId, uid, name, email)
        setRegistered(prev => new Set(prev).add(eventId))
      }
    } catch { /* silently fail */ }
    setRegLoading(prev => { const n = new Set(prev); n.delete(eventId); return n })
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#111827]">Events & Announcements</h1>
        <p className="text-sm text-[#6B7280]">View upcoming department events and important announcements.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Events Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#16A34A]" /> Upcoming Events
            </h2>
          </div>
          {loadingData ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#3B5BFF]" /></div>
          ) : events.length === 0 ? (
            <div className="px-6 py-8 text-center text-xs text-[#94A3B8]">No upcoming events</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {events.map(ev => {
                const isReg = registered.has(ev.id!)
                const isLoading = regLoading.has(ev.id!)
                return (
                  <div key={ev.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#F5F6FA] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-[#111827] truncate">{ev.title}</p>
                      </div>
                      <p className="text-xs text-[#6B7280]">{ev.startDate}{ev.startDate !== ev.endDate ? ` - ${ev.endDate}` : ""}</p>
                    </div>
                    {user?.role === "student" && (
                      <button onClick={() => toggleRegister(ev.id!)} disabled={isLoading}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReg ? "bg-[#16A34A]/10 text-[#16A34A] hover:bg-red-50 hover:text-[#EF4444]" : "bg-[#3B5BFF] text-white hover:bg-[#2563EB]"}`}>
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isReg ? "Registered ✓" : "Register"}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Announcements Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#D97706]" />
            <h2 className="text-base font-bold text-[#111827]">Announcements</h2>
          </div>
          {loadingData ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#3B5BFF]" /></div>
          ) : announcements.length === 0 ? (
            <div className="px-5 py-6 text-center text-xs text-[#94A3B8]">No announcements</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {announcements.map(a => (
                <div key={a.id} className="px-5 py-3.5 hover:bg-[#F5F6FA] transition-colors">
                  <p className="text-sm font-bold text-[#111827]">{a.title}</p>
                  {a.body && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{a.body}</p>}
                  {a.postedBy && (
                    <p className="text-[10px] font-bold text-[#94A3B8] mt-1">
                      — {a.postedBy}
                      {a.createdAt && ` on ${new Date(a.createdAt.seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
