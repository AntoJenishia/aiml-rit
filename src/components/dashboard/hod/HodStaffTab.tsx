"use client"
import { useState, useEffect } from "react"
import {
  Users, Search, Mail, Phone, Loader2, Building2,
  Edit3, CheckCircle, FileSpreadsheet, X, MapPin,
  Shield, AlertCircle, RefreshCw, Eye, Award, Briefcase,
  ExternalLink, GraduationCap, BookOpen, Layers
} from "lucide-react"
import ExcelImportModal from "@/components/admin/ExcelImportModal"

interface FacultyUser {
  uid: string
  name: string
  email: string
  department: string
  designation: string
  staffCode?: string
  phone?: string
  gender?: string
  roomLocation?: string
  profile?: string
  role?: string
  qualification?: string
  specialization?: string
  experience?: number | string
  bio?: string
  isClassIncharge?: boolean
  inchargeClasses?: {
    batch: string
    section: string
    classTitle: string
    count: number
  }[]
}

interface PortfolioItem {
  id?: string
  title: string
  type: string
  date: string
  description?: string
  link?: string
}

export default function HodStaffTab({ departmentFilter }: { departmentFilter?: string } = {}) {
  const [faculty, setFaculty] = useState<FacultyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFacultyForView, setSelectedFacultyForView] = useState<FacultyUser | null>(null)
  const [facultyPortfolioItems, setFacultyPortfolioItems] = useState<PortfolioItem[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<FacultyUser | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    staffCode: "",
    designation: "",
    email: "",
    phone: "",
    gender: "",
    roomLocation: "",
    profile: ""
  })

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/staff")
      if (res.ok) {
        const data = await res.json()
        setFaculty(data)
      }
    } catch (err) {
      console.error("[HodStaffTab] fetchStaff error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // Open Full Portfolio / Profile View Modal on the Same Screen
  const handleOpenViewProfile = async (f: FacultyUser) => {
    setSelectedFacultyForView(f)
    setLoadingPortfolio(true)
    setFacultyPortfolioItems([])
    try {
      const res = await fetch(`/api/faculty/portfolio?uid=${f.uid}`)
      if (res.ok) {
        const items = await res.json()
        if (Array.isArray(items)) {
          setFacultyPortfolioItems(items)
        }
      }
    } catch (err) {
      console.error("[HodStaffTab] Error fetching portfolio items:", err)
    } finally {
      setLoadingPortfolio(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (f: FacultyUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingStaff(f)
    setEditForm({
      name: f.name || "",
      staffCode: f.staffCode || "",
      designation: f.designation || "Assistant Professor",
      email: f.email || "",
      phone: f.phone || "",
      gender: f.gender || "MALE",
      roomLocation: f.roomLocation || "",
      profile: f.profile || ""
    })
  }

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaff) return

    setSavingEdit(true)
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStaff.uid,
          ...editForm
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff")
      }

      // Optimistically update local state
      setFaculty(prev =>
        prev.map(f => {
          if (f.uid === editingStaff.uid) {
            return {
              ...f,
              name: editForm.name,
              staffCode: editForm.staffCode,
              designation: editForm.designation,
              email: editForm.email,
              phone: editForm.phone,
              gender: editForm.gender,
              roomLocation: editForm.roomLocation,
              profile: editForm.profile
            }
          }
          return f
        })
      )

      // If currently viewing this faculty in detail modal, update it too
      if (selectedFacultyForView && selectedFacultyForView.uid === editingStaff.uid) {
        setSelectedFacultyForView({
          ...selectedFacultyForView,
          name: editForm.name,
          staffCode: editForm.staffCode,
          designation: editForm.designation,
          email: editForm.email,
          phone: editForm.phone,
          gender: editForm.gender,
          roomLocation: editForm.roomLocation,
          profile: editForm.profile
        })
      }

      showToast(`Updated details for ${editForm.name} successfully!`, "success")
      setEditingStaff(null)
    } catch (err: any) {
      showToast(err.message || "Failed to update staff details.", "error")
    } finally {
      setSavingEdit(false)
    }
  }

  // Filter based on AIML and text search (exclude AI&DS)
  const filteredFaculty = faculty.filter(f => {
    const dept = (f.department || "").toLowerCase()
    if (dept.includes("aids") || dept.includes("data science")) {
      return false
    }

    const searchLower = search.toLowerCase()
    const matchesSearch =
      (f.name || "").toLowerCase().includes(searchLower) ||
      (f.email || "").toLowerCase().includes(searchLower) ||
      (f.staffCode || "").toLowerCase().includes(searchLower) ||
      (f.designation || "").toLowerCase().includes(searchLower) ||
      (f.roomLocation || "").toLowerCase().includes(searchLower)

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-in fade-in duration-300 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Toolbar Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">Faculty Directory &amp; Portfolios</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003087]">
              {faculty.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Click any faculty member to inspect their complete academic profile &amp; portfolio on this screen.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={fetchStaff}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
            title="Refresh Directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
        </div>
      </div>

      {/* ── Faculty List Table (Strictly fits inside the frame without horizontal overflow) ── */}
      <div className="w-full max-w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Faculty Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search ? "No faculty members match your search criteria." : "Click 'Import Excel' above to upload staff records."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-4 py-3">Faculty Member</th>
                  <th className="px-3 py-3">Staff Code</th>
                  <th className="px-3 py-3">Designation</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Cabin / Room</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredFaculty.map((f) => {
                  const isHod = f.staffCode?.toUpperCase() === "CS91" || f.role === "hod"

                  return (
                    <tr
                      key={f.uid}
                      onClick={() => handleOpenViewProfile(f)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Faculty Member Name & Avatar */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          {f.profile ? (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={f.profile}
                                alt={f.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none"
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#003087]/10 text-[#003087] flex items-center justify-center font-black text-xs border border-[#003087]/20 shrink-0">
                              {f.name?.[0] || "F"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#003087] transition-colors">
                              {f.name || "Unknown Name"}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                              {f.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Staff Code */}
                      <td className="px-3 py-3 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#003087] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                            {f.staffCode || "—"}
                          </span>
                          {isHod && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                              HOD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Designation */}
                      <td className="px-3 py-3 align-middle">
                        <div className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                          {f.designation || (isHod ? "Head of Department" : "Assistant Professor")}
                        </div>
                      </td>

                      {/* 4. Contact Details */}
                      <td className="px-3 py-3 align-middle">
                        {f.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono font-medium whitespace-nowrap">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{f.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* 5. Cabin / Room */}
                      <td className="px-3 py-3 align-middle">
                        {f.roomLocation ? (
                          <div className="flex items-center gap-1 text-xs text-slate-600 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate" title={f.roomLocation}>{f.roomLocation}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* 6. Actions (View & Edit buttons neatly fitted inside frame) */}
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenViewProfile(f)
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1"
                            title="View Full Profile & Portfolio"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Profile</span>
                          </button>

                          <button
                            onClick={(e) => handleOpenEdit(f, e)}
                            className="px-2.5 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1"
                            title={`Edit ${f.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal 1: Complete Faculty Profile & Portfolio (Same Screen View) ── */}
      {selectedFacultyForView && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-8 overflow-y-auto"
          onClick={() => setSelectedFacultyForView(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] my-auto overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Cover Header */}
            <div className="bg-gradient-to-r from-slate-950 via-[#003087] to-slate-900 p-6 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Building2 className="w-48 h-48 text-white -translate-y-12 translate-x-8" />
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {/* Photo Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-lg shrink-0 overflow-hidden border-2 border-white/20">
                    {selectedFacultyForView.profile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedFacultyForView.profile}
                        alt={selectedFacultyForView.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#003087] flex items-center justify-center font-black text-white text-2xl">
                        {selectedFacultyForView.name[0]}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {selectedFacultyForView.name}
                      </h3>
                      {selectedFacultyForView.staffCode && (
                        <span className="font-mono text-xs font-bold text-[#003087] bg-white px-2 py-0.5 rounded shadow-sm">
                          {selectedFacultyForView.staffCode}
                        </span>
                      )}
                      {selectedFacultyForView.staffCode?.toUpperCase() === "CS91" && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-300 px-2 py-0.5 rounded shadow-sm">
                          HOD • AIML
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-blue-200 mt-1">
                      {selectedFacultyForView.designation || "Assistant Professor"} · Department of Artificial Intelligence &amp; Machine Learning
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <button
                    onClick={() => {
                      const target = selectedFacultyForView
                      setSelectedFacultyForView(null)
                      handleOpenEdit(target)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors border border-white/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => setSelectedFacultyForView(null)}
                    className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Institutional Details Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#003087]" /> Institutional &amp; Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Official Email</span>
                    <p className="font-semibold text-slate-800 break-all mt-0.5">{selectedFacultyForView.email || "—"}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Contact Phone</span>
                    <p className="font-semibold text-slate-800 font-mono mt-0.5">{selectedFacultyForView.phone || "—"}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Room / Cabin</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedFacultyForView.roomLocation || "AIML Faculty Cabin"}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Gender</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedFacultyForView.gender || "—"}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Qualification</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedFacultyForView.qualification || "—"}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Specialization</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedFacultyForView.specialization || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Class Incharge Allocation & History */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#003087]" /> Class Incharge Allocation &amp; History
                  </h4>
                  {selectedFacultyForView.inchargeClasses && selectedFacultyForView.inchargeClasses.length > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Incharge
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      Not Assigned
                    </span>
                  )}
                </div>

                {selectedFacultyForView.inchargeClasses && selectedFacultyForView.inchargeClasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFacultyForView.inchargeClasses.map((cls, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-sm space-y-1.5 hover:border-[#003087] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-[#003087] text-white text-[10px] font-black uppercase tracking-wider">
                            Section {cls.section}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {cls.count} Students
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs">
                          {cls.classTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Batch: <span className="font-semibold text-slate-700">{cls.batch}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Not currently assigned as Class Incharge for any batch or section.
                  </p>
                )}
              </div>

              {/* Biography Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#003087]" /> Professional Statement &amp; Bio
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedFacultyForView.bio || "No professional biography recorded yet for this faculty member."}
                </div>
              </div>

              {/* Academic Portfolio Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#003087]" /> Academic Portfolio &amp; Accomplishments
                  </h4>
                  <span className="text-xs font-bold text-slate-400">
                    {facultyPortfolioItems.length} Records
                  </span>
                </div>

                {loadingPortfolio ? (
                  <div className="p-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-[#003087]" />
                  </div>
                ) : facultyPortfolioItems.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
                    No publications or portfolio items uploaded yet for this faculty member.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {facultyPortfolioItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-sm hover:border-blue-200 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#003087] border border-blue-100">
                              {item.type}
                            </span>
                            {item.date && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {item.date}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {item.title}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#003087] rounded-lg transition-colors shrink-0"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedFacultyForView(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Edit Faculty Details ── */}
      {editingStaff && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-8 overflow-y-auto"
          onClick={() => setEditingStaff(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] my-auto overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5" /> Edit Faculty Details
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Staff Code: {editingStaff.staffCode || "—"}
                </p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Profile Photo Preview */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center text-xl font-black text-[#003087] shrink-0">
                  {editForm.profile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editForm.profile} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    editForm.name?.[0] || "F"
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Profile Photo URL (IMS)
                  </label>
                  <input
                    type="text"
                    value={editForm.profile}
                    onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })}
                    placeholder="https://ims.ritchennai.edu.in/uploads/..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:border-[#003087] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:border-[#003087] outline-none"
                  />
                </div>

                {/* Staff Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.staffCode}
                    onChange={(e) => setEditForm({ ...editForm, staffCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono font-bold focus:border-[#003087] outline-none"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation
                  </label>
                  <select
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:border-[#003087] outline-none bg-white"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Adjunct Faculty">Adjunct Faculty</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:border-[#003087] outline-none bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official College Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:border-[#003087] outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:border-[#003087] outline-none"
                  />
                </div>
              </div>

              {/* Room Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Room / Cabin Location
                </label>
                <input
                  type="text"
                  value={editForm.roomLocation}
                  onChange={(e) => setEditForm({ ...editForm, roomLocation: e.target.value })}
                  placeholder="e.g. A Block, 3rd Floor, A305 staffroom"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:border-[#003087] outline-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#003087] hover:bg-[#002266] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Excel Import Modal ── */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="staff"
        onSuccess={() => {
          fetchStaff()
        }}
      />
    </div>
  )
}
