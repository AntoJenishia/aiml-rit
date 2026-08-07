import { useState, useEffect } from "react"
import { Award, FileText, CheckCircle, Search, Filter, Loader2, XCircle } from "lucide-react"

function EmptyState({ icon: Icon, title, subtitle, accent="#003087", accentBg="bg-[#003087]/5" }: any) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 ${accentBg}`}>
      <div className={`p-4 rounded-full mb-4`} style={{ backgroundColor: `${accent}15`, color: accent }}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md">{subtitle}</p>
    </div>
  )
}

export default function HodAchievementsTab({ previewDoc }: { previewDoc: (url: string) => void }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("/api/admin/achievements")
        if (res.ok) setAchievements(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAchievements()
  }, [])

  const filteredAch = achievements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          a.registerNumber.includes(search)
    const matchesCategory = filterCategory === "All" || a.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Department Achievements</h2>
          <p className="text-xs text-slate-500 mt-0.5">Global view of all student awards and publications</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, reg no..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded text-sm outline-none focus:border-[#003087]"
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded text-sm outline-none focus:border-[#003087]"
          >
            <option value="All">All Categories</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Paper Publication">Paper Publication</option>
            <option value="Sports">Sports</option>
            <option value="Project Exhibition">Project Exhibition</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#003087] animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Loading achievements...</p>
        </div>
      ) : filteredAch.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
          <div className="p-12 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4"><Award className="h-8 w-8" /></div>
            <h3 className="text-base font-bold text-slate-800">No achievements found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-[#E2E8F0]">
            {filteredAch.map((ach: any) => {
              const isVerified = ach.status === "VERIFIED"
              const isPending = ach.status === "PENDING_VERIFICATION"
              const isRejected = ach.status === "REJECTED"

              return (
                <div key={ach.id} className="p-4 sm:p-6 flex flex-col lg:flex-row gap-6 hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-800">{ach.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{ach.category}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{ach.position}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Student</p><p className="text-sm font-semibold text-slate-700">{ach.studentName}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Reg No</p><p className="text-sm font-semibold text-slate-700">{ach.registerNumber}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Event / Organizer</p><p className="text-sm font-semibold text-slate-700">{ach.eventName}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Class</p><p className="text-sm font-semibold text-slate-700">{ach.classId?.toUpperCase()}</p></div>
                    </div>
                    {ach.description && <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{ach.description}</div>}
                  </div>
                  <div className="flex lg:flex-col items-end gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold ${
                      isVerified ? "bg-green-100 text-green-700" :
                      isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending"}
                    </div>
                    {ach.proofFileUrl && (
                      <button onClick={() => previewDoc(ach.proofFileUrl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-xs font-bold text-[#003087] hover:bg-slate-200 transition-colors">
                        <FileText className="h-4 w-4" /> View Proof
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
