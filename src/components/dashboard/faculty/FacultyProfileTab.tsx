"use client"
import { useState, useEffect } from "react"
import { useUser } from "@/lib/hooks/useUser"
import {
  Briefcase, FileText, Plus, Trash2, Award, Calendar,
  ExternalLink, Loader2, Edit3, User, BookOpen, CheckCircle,
  GraduationCap, Code2, Phone, Mail, MapPin, Building2,
  Users, Shield, AlertCircle, X
} from "lucide-react"

interface PortfolioItem {
  id?: string
  title: string
  type: string
  date: string
  description: string
  link: string
  status?: string
}

interface FacultyProfileData {
  name: string
  staffCode: string
  department: string
  designation: string
  email: string
  phone: string
  gender: string
  roomLocation: string
  profile: string
  photoURL: string
  role: string
  isClassIncharge: boolean
  classId: string | null
  bio: string
  qualification: string
  experience: string
  specialization: string
}

function ProfileField({ label, value, locked = true }: { label: string; value: string; locked?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        {locked && <span className="text-[9px] font-medium text-slate-400 border border-slate-200 px-1.5 py-0.2 rounded">Institutional</span>}
      </div>
      <p className="text-sm font-semibold text-slate-800 bg-slate-50/80 border border-[#E2E8F0] px-3 py-2 rounded-lg break-all">
        {value || "—"}
      </p>
    </div>
  )
}

export default function FacultyProfileTab() {
  const { name: sessionName, email: sessionEmail, image: sessionImage } = useUser()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [profileData, setProfileData] = useState<FacultyProfileData>({
    name: "",
    staffCode: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    gender: "",
    roomLocation: "",
    profile: "",
    photoURL: "",
    role: "staff",
    isClassIncharge: false,
    classId: null,
    bio: "",
    qualification: "",
    experience: "",
    specialization: ""
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)

  const [editForm, setEditForm] = useState({
    bio: "",
    qualification: "",
    designation: "",
    experience: "",
    specialization: "",
    phone: "",
    roomLocation: "",
  })

  const [form, setForm] = useState({
    title: "",
    type: "Experience",
    date: "",
    description: "",
    link: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const [portRes, bioRes] = await Promise.all([
        fetch("/api/faculty/portfolio"),
        fetch("/api/faculty/bio")
      ])
      if (portRes.ok) setItems(await portRes.json())
      if (bioRes.ok) {
        const d = await bioRes.json()
        setProfileData(d)
        setEditForm({
          bio: d.bio || "",
          qualification: d.qualification || "",
          designation: d.designation || "",
          experience: d.experience || "5",
          specialization: d.specialization || "",
          phone: d.phone || "",
          roomLocation: d.roomLocation || "",
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/faculty/bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setProfileData(prev => ({
          ...prev,
          ...editForm
        }))
        setIsEditingBio(false)
      } else {
        const d = await res.json()
        alert(d.error || "Failed to update profile.")
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/faculty/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        await fetchProfile()
        setIsAdding(false)
        setForm({ title: "", type: "Experience", date: "", description: "", link: "" })
      } else {
        const d = await res.json()
        alert(d.error || "Failed to add portfolio item.")
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      const res = await fetch(`/api/faculty/portfolio?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems(items.filter(i => i.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const experience = items.filter(i => i.type === "Experience")
  const education = items.filter(i => i.type === "Education")
  const skills = items.filter(i => i.type === "Skill")
  const publications = items.filter(i => i.type === "Publication" || i.type === "Journal")
  const projects = items.filter(i => i.type === "Project" || i.type === "Research")
  const certifications = items.filter(i => i.type === "Certification" || i.type === "Award")
  const others = items.filter(i => !["Experience", "Education", "Skill", "Publication", "Journal", "Project", "Research", "Certification", "Award"].includes(i.type))

  const displayName = profileData.name || sessionName || "Faculty Member"
  const displayEmail = profileData.email || sessionEmail || "—"
  const displayPhoto = profileData.profile || profileData.photoURL || sessionImage || ""
  const isHod = profileData.staffCode?.toUpperCase() === "CS91" || profileData.role === "hod"

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ── 1. Top Cover & Identity Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navy Header Banner */}
        <div className="h-32 sm:h-36 bg-[#003087] relative flex items-start justify-between p-4 sm:p-6 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Building2 className="w-56 h-56 text-white -translate-y-16 translate-x-12" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-white text-[11px] font-bold tracking-wider uppercase border border-white/20 relative z-10">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            {isHod ? "Head of Department (HOD)" : "Faculty Portal"}
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold rounded-lg transition-colors border border-white/20 shadow-sm active:scale-95 relative z-10"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        {/* Profile Info Area */}
        <div className="px-5 sm:px-6 pb-6 pt-3 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
            {/* Avatar Photo */}
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white p-1 border-4 border-white shadow-lg shrink-0 overflow-hidden relative z-10">
              {displayPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full rounded-full bg-[#003087]/10 flex items-center justify-center text-[#003087] text-4xl sm:text-5xl font-black">
                  {displayName[0] ?? "F"}
                </div>
              )}
            </div>

            {/* Edit Profile Button */}
            <div className="self-end sm:self-auto">
              <button
                onClick={() => setIsEditingBio(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-lg transition-colors border border-slate-200 shadow-sm active:scale-95"
              >
                <Edit3 className="h-4 w-4 text-[#003087]" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{displayName}</h1>
              {profileData.staffCode && (
                <span className="font-mono text-xs font-bold text-[#003087] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  {profileData.staffCode}
                </span>
              )}
              {isHod && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded">
                  HOD
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700">
              {profileData.designation || (isHod ? "Head of Department" : "Assistant Professor")}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {profileData.department || "Department of Artificial Intelligence & Machine Learning"}
            </p>

            {/* Quick meta tags */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
              {profileData.isClassIncharge && profileData.classId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-full">
                  <Users className="w-3.5 h-3.5" /> Class Incharge: {profileData.classId}
                </span>
              )}
              {profileData.qualification && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> {profileData.qualification}
                </span>
              )}
              {profileData.experience && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {profileData.experience} Years Experience
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Institutional Details Card (All Excel Imported Data) ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="h-4 w-4 text-[#003087]" /> Institutional &amp; Department Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField label="Full Name" value={displayName} locked={true} />
          <ProfileField label="Staff Code" value={profileData.staffCode} locked={true} />
          <ProfileField label="Official College Email" value={displayEmail} locked={true} />
          <ProfileField label="Department" value={profileData.department || "AI & Machine Learning"} locked={true} />
          <ProfileField label="Designation" value={profileData.designation || (isHod ? "Head of Department" : "Assistant Professor")} locked={true} />
          <ProfileField label="Contact Phone" value={profileData.phone || "—"} locked={false} />
          <ProfileField label="Gender" value={profileData.gender || "—"} locked={true} />
          <ProfileField label="Room / Cabin Location" value={profileData.roomLocation || "AIML Faculty Cabin"} locked={false} />
          <ProfileField label="Class Incharge Role" value={profileData.isClassIncharge ? `Incharge: ${profileData.classId}` : "Not Assigned"} locked={true} />
          <ProfileField label="Highest Qualification" value={profileData.qualification || "Assistant Professor"} locked={false} />
          <ProfileField label="Specialization" value={profileData.specialization || "Artificial Intelligence & Machine Learning"} locked={false} />
          <ProfileField label="Teaching Experience" value={profileData.experience ? `${profileData.experience} Years` : "5 Years"} locked={false} />
        </div>
      </div>

      {/* ── 3. Bio / About Section ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-[#003087]" /> Biography &amp; Professional Statement
          </h3>
          <button onClick={() => setIsEditingBio(true)} className="text-[#003087] text-xs font-bold hover:underline flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {profileData.bio || "No biography added yet. Click 'Edit Profile' to add your academic profile summary, research interests, and background."}
        </p>
      </div>

      {/* ── 4. Portfolio & Accomplishments ── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#003087] animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Loading portfolio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <Briefcase className="h-4 w-4 text-[#003087]" /> Experience
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{experience.length}</span>
              </div>
              <div className="p-5">
                {experience.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No experience items added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {experience.map(item => (
                      <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-b-0">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                          {item.date && <p className="text-[11px] text-slate-400 mt-1">{item.date}</p>}
                        </div>
                        <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Publications */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <FileText className="h-4 w-4 text-[#003087]" /> Publications &amp; Research Papers
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{publications.length}</span>
              </div>
              <div className="p-5">
                {publications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No publications added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {publications.map(item => (
                      <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-b-0">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#003087] font-bold mt-1 hover:underline">
                              <ExternalLink className="h-3 w-3" /> View Publication
                            </a>
                          )}
                        </div>
                        <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <Code2 className="h-4 w-4 text-[#003087]" /> Technical Skills
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{skills.length}</span>
              </div>
              <div className="p-5">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(item => (
                      <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                        {item.title}
                        <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <Award className="h-4 w-4 text-[#003087]" /> Certifications &amp; Awards
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{certifications.length}</span>
              </div>
              <div className="p-5">
                {certifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No certifications added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {certifications.map(item => (
                      <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5 last:border-b-0">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      {isEditingBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setIsEditingBio(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 bg-[#003087] flex items-center justify-between text-white">
              <h2 className="text-base font-bold">Edit Profile Details</h2>
              <button onClick={() => setIsEditingBio(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBio} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Biography</label>
                <textarea
                  rows={4}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                  placeholder="Tell students and peers about your background, research interests, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Highest Qualification</label>
                  <input
                    type="text"
                    value={editForm.qualification}
                    onChange={e => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                    placeholder="e.g. M.E., Ph.D."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Experience (Years)</label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specialization / Domain</label>
                <input
                  type="text"
                  value={editForm.specialization}
                  onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                  placeholder="e.g. Deep Learning, NLP, Computer Vision"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Room / Cabin Location</label>
                  <input
                    type="text"
                    value={editForm.roomLocation}
                    onChange={e => setEditForm({ ...editForm, roomLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] focus:bg-white outline-none"
                    placeholder="e.g. AIML Block Cabin 204"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-[#003087] text-white text-sm font-bold hover:bg-[#002266] disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setIsAdding(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 bg-[#003087] text-white flex items-center justify-between">
              <h2 className="text-base font-bold">Add Portfolio Item</h2>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none font-semibold text-slate-700"
                >
                  <option value="Experience">Experience</option>
                  <option value="Education">Education</option>
                  <option value="Skill">Skill</option>
                  <option value="Publication">Publication</option>
                  <option value="Project">Project / Research</option>
                  <option value="Certification">Certification / Award</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none"
                  placeholder="e.g. Assistant Professor, Ph.D., Machine Learning, Paper title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description / Organization</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none"
                  placeholder="e.g. Rajalakshmi Institute of Technology, Journal name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date / Duration</label>
                  <input
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none"
                    placeholder="e.g. 2020 - Present"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Document / Link</label>
                  <input
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-[#003087] text-white text-sm font-bold hover:bg-[#002266] disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Adding..." : "Add to Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
