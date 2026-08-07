"use client"
import { useState, useEffect } from "react"
import { Search, Loader2, Users, FileText, ArrowRight, ExternalLink, Briefcase } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FacultyPortfolioUser {
  uid: string
  name: string
  email: string
  department: string
  designation: string
  qualification?: string
  specialization?: string
  experience?: number
  image?: string
}

export default function HodFacultyPortfoliosTab({ departmentFilter }: { departmentFilter: string }) {
  const [faculty, setFaculty] = useState<FacultyPortfolioUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUid, setSelectedUid] = useState<string | null>(null)

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/staff")
      if (res.ok) {
        const data = await res.json()
        setFaculty(data)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // Filter based on Department Switcher AND text search
  const filteredFaculty = faculty.filter(f => {
    const matchesDept = departmentFilter === "ALL" 
      ? true 
      : (f.department || "").toLowerCase().includes(departmentFilter.toLowerCase() === "aids" ? "data science" : departmentFilter.toLowerCase())
    
    const searchLower = search.toLowerCase()
    const matchesSearch = (f.name || "").toLowerCase().includes(searchLower) || (f.specialization || "").toLowerCase().includes(searchLower)
    
    return matchesDept && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search faculty by name or specialization..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition-shadow shadow-sm"
          />
        </div>
      </div>

      {/* Portfolios Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm text-center py-20 px-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Faculty Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No faculty members match your current filters. Try adjusting the search or department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFaculty.map((member) => (
            <div 
              key={member.uid} 
              className="group flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#003087]/20 overflow-hidden"
            >
              {/* Card Header (Photo & Name) */}
              <div className="p-5 flex flex-col items-center text-center border-b border-slate-100">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-[#003087]/20 transition-all mb-4">
                  <Image
                    src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Faculty')}&background=1e3a8a&color=fff&size=256`}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <h3 className="font-bold text-slate-800 line-clamp-1">{member.name}</h3>
                <p className="text-xs font-semibold text-[#003087] mt-1 line-clamp-1">
                  {member.designation || "Faculty Member"}
                </p>
              </div>
              
              {/* Card Body (Details) */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500 min-w-[70px]">Qualification:</span>
                  <span className="text-slate-700 truncate">
                    {member.qualification || <span className="text-slate-400 italic">Not set</span>}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500 min-w-[70px]">Domain:</span>
                  {member.specialization ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium truncate">
                      {member.specialization}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs mt-auto pt-2 border-t border-slate-50">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-medium">
                    {member.experience ? `${member.experience}+ Years Exp.` : <span className="text-slate-400 italic">Exp. not set</span>}
                  </span>
                </div>
              </div>

              {/* Card Footer (Action) */}
              <div className="p-3 bg-slate-50 mt-auto">
                <Link
                  href={`/faculty/${member.uid}`}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-[#003087] hover:text-white hover:border-[#003087] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Portfolio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
