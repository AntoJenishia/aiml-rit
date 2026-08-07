import { useState, useEffect } from "react"
import { useUser } from "@/lib/hooks/useUser"
import { Briefcase, FileText, Plus, Trash2, Award, Calendar, ExternalLink, Loader2, Edit3, User, BookOpen, CheckCircle, GraduationCap, Code2, Link as LinkIcon } from "lucide-react"

interface PortfolioItem {
  id?: string
  title: string
  type: string
  date: string
  description: string
  link: string
  status?: string
}

export default function FacultyProfileTab() {
  const { name, email, uid } = useUser()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [bioData, setBioData] = useState({
    bio: "", qualification: "", designation: "", experience: "", specialization: ""
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioForm, setBioForm] = useState({
    bio: "", qualification: "", designation: "", experience: "", specialization: ""
  })
  
  const [form, setForm] = useState({
    title: "",
    type: "Experience",
    date: "",
    description: "",
    link: ""
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    setLoading(true)
    try {
      const [portRes, bioRes] = await Promise.all([
        fetch("/api/faculty/portfolio"),
        fetch("/api/faculty/bio")
      ])
      if (portRes.ok) setItems(await portRes.json())
      if (bioRes.ok) {
        const d = await bioRes.json()
        setBioData(d)
        setBioForm(d)
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
        body: JSON.stringify(bioForm)
      })
      if (res.ok) {
        setBioData(bioForm)
        setIsEditingBio(false)
      } else {
        const d = await res.json()
        alert(d.error || "Failed to update bio.")
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
        await fetchPortfolio()
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

  // Render Helpers
  const renderTimeline = (title: string, icon: any, data: PortfolioItem[], isEducation = false) => {
    const Icon = icon
    return (
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#003087]" />
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">
          {data.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-4">No {title.toLowerCase()} added yet.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8">
              {data.map((item, idx) => (
                <div key={item.id} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-slate-200 border-2 border-white group-hover:bg-[#003087] transition-colors" />
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                      {item.description && <p className="text-sm font-semibold text-slate-600 mt-0.5">{item.description}</p>}
                      {item.date && <p className="text-xs text-slate-500 mt-1">{item.date}</p>}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#003087] mt-2 hover:underline">
                          <ExternalLink className="h-3 w-3" /> View Document / Link
                        </a>
                      )}
                    </div>
                    <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderGridSection = (title: string, icon: any, data: PortfolioItem[], emptyMsg: string) => {
    const Icon = icon
    return (
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#003087]" />
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <span className="ml-auto bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{data.length}</span>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {data.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">{emptyMsg}</div>
          ) : (
            data.map(item => (
              <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> {item.date || "No Date"}
                  </p>
                  {item.description && <p className="text-sm text-slate-600 mb-2">{item.description}</p>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#003087] hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Details
                    </a>
                  )}
                </div>
                <button onClick={() => handleDelete(item.id!)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderSkills = () => {
    return (
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-[#003087]" />
          <h3 className="text-base font-bold text-slate-800">Skills</h3>
        </div>
        <div className="p-6">
          {skills.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-2">No skills added yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <div key={skill.id} className="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                  {skill.title}
                  <button onClick={() => handleDelete(skill.id!)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Helper for dynamic labels in Modal
  const getDynamicLabels = () => {
    switch (form.type) {
      case "Education":
        return { title: "Degree (e.g. Ph.D. in Computer Science)", desc: "Institution Name", date: "Duration / Year of Passing", showDesc: true, showDate: true }
      case "Experience":
        return { title: "Designation / Role", desc: "Organization / Company", date: "Duration (e.g. 2018 - Present)", showDesc: true, showDate: true }
      case "Skill":
        return { title: "Skill Name (e.g. Python, Machine Learning)", desc: "", date: "", showDesc: false, showDate: false }
      default:
        return { title: "Title", desc: "Description", date: "Date", showDesc: true, showDate: true }
    }
  }
  const dynamicLabels = getDynamicLabels()

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Profile Summary (LinkedIn Style Intro Card) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#003087] to-blue-500 relative">
          <button onClick={() => setIsAdding(true)} className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-bold rounded-lg transition-colors border border-white/20">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="px-6 pb-6 pt-4 relative">
          <div className="absolute -top-16 left-6 h-28 w-28 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
            <div className="h-full w-full rounded-full bg-[#003087]/10 flex items-center justify-center text-[#003087] text-5xl font-black">
              {name?.[0] ?? "F"}
            </div>
          </div>
          
          <div className="flex justify-end mb-2">
            <button onClick={() => setIsEditingBio(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold rounded-lg transition-colors">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          </div>
          
          <div className="mt-2 space-y-1">
            <h2 className="text-2xl font-black text-slate-800">{name || "Faculty Name"}</h2>
            <p className="text-base font-bold text-slate-700">{bioData.designation || "Faculty Member"}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
              <Briefcase className="h-4 w-4" /> {bioData.experience ? `${bioData.experience} Years Experience` : "Experience not added"}
              <span className="text-slate-300">•</span>
              <Award className="h-4 w-4" /> {bioData.qualification || "Qualification not added"}
            </div>
          </div>
          
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {bioData.bio || "No bio added yet. Click edit profile to add your bio and background."}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#003087] animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Loading profile data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (Timeline & Major items) */}
          <div className="lg:col-span-2 space-y-6">
            {experience.length > 0 && renderTimeline("Experience", Briefcase, experience)}
            {education.length > 0 && renderTimeline("Education", GraduationCap, education, true)}
            {renderGridSection("Publications & Journals", FileText, publications, "No publications added yet.")}
            {renderGridSection("Projects & Research", Briefcase, projects, "No projects added yet.")}
          </div>
          
          {/* Sidebar Column (Skills & Certifications) */}
          <div className="space-y-6">
            {renderSkills()}
            {renderGridSection("Certifications & Awards", Award, certifications, "No certifications added yet.")}
            {others.length > 0 && renderGridSection("Other Activities", FileText, others, "")}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setIsAdding(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Add to Profile</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none font-semibold text-slate-700">
                  <optgroup label="Profile Core">
                    <option value="Experience">Experience</option>
                    <option value="Education">Education</option>
                    <option value="Skill">Skill</option>
                  </optgroup>
                  <optgroup label="Accomplishments">
                    <option value="Publication">Publication</option>
                    <option value="Journal">Journal</option>
                    <option value="Project">Project</option>
                    <option value="Research">Research</option>
                    <option value="Certification">Certification</option>
                    <option value="Award">Award</option>
                    <option value="Other">Other</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{dynamicLabels.title} *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder={`Enter ${dynamicLabels.title.toLowerCase()}`} />
              </div>

              {dynamicLabels.showDesc && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{dynamicLabels.desc}</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none resize-none" placeholder={`Enter ${dynamicLabels.desc.toLowerCase()}`} />
                </div>
              )}

              {dynamicLabels.showDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{dynamicLabels.date}</label>
                  <input type="text" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="e.g. 2018 - 2022" />
                </div>
              )}
              
              {form.type !== "Skill" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Link / URL (Optional)</label>
                  <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="https://..." />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-[#003087] text-white text-sm font-bold rounded-lg hover:bg-[#002266] transition-colors disabled:opacity-70">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {isEditingBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setIsEditingBio(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Edit Intro</h2>
            </div>
            <form onSubmit={handleSaveBio} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Designation</label>
                  <input value={bioForm.designation} onChange={e => setBioForm({...bioForm, designation: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="e.g. Assistant Professor" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Highest Qualification</label>
                  <input value={bioForm.qualification} onChange={e => setBioForm({...bioForm, qualification: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="e.g. Ph.D." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Total Experience</label>
                  <input type="number" value={bioForm.experience} onChange={e => setBioForm({...bioForm, experience: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specialization</label>
                  <input value={bioForm.specialization} onChange={e => setBioForm({...bioForm, specialization: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none" placeholder="e.g. Machine Learning" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">About / Bio</label>
                <textarea value={bioForm.bio} onChange={e => setBioForm({...bioForm, bio: e.target.value})} rows={4} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#003087] outline-none resize-none" placeholder="A brief description about your professional background..." />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setIsEditingBio(false); setBioForm(bioData); }} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-[#003087] text-white text-sm font-bold rounded-lg hover:bg-[#002266] transition-colors disabled:opacity-70">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
