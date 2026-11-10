import { useState, useRef } from "react"
import { Link2, X, Loader2, CheckCircle, Award, ExternalLink } from "lucide-react"

interface AchievementModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AchievementModal({ onClose, onSuccess }: AchievementModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [isPublicAccess, setIsPublicAccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    category: "Hackathon",
    eventName: "",
    date: "",
    position: "Participation",
    description: "",
    proofFileUrl: "",
    proofFileName: "Google Drive Proof"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.proofFileUrl.trim()) {
      alert("Please provide the Google Drive link to your certificate / proof.")
      return
    }
    if (!isPublicAccess) {
      alert("Please confirm that the file is uploaded and the link is set to public access.")
      return
    }
    
    setLoading(true)
    try {
      const payload = { 
        ...formData,
        proofFileUrl: formData.proofFileUrl.trim()
      }
      
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to submit achievement")
      }
      
      setStep(2) // Success step
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Achievement Logged!</h2>
          <p className="text-sm text-slate-500 mb-6">Your achievement has been submitted to your Class Incharge for verification.</p>
          <button onClick={() => { onSuccess(); onClose() }} className="w-full py-3 bg-[#003087] text-white font-bold rounded-xl hover:bg-[#002266] transition-all">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#003087]">
            <Award className="h-5 w-5" />
            <h2 className="text-lg font-bold">Log New Achievement</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Achievement Title</label>
              <input required type="text" placeholder="e.g. 1st Place in AI Hackathon" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="Hackathon">Hackathon</option>
                <option value="Paper Publication">Paper Publication</option>
                <option value="Sports">Sports</option>
                <option value="Project Exhibition">Project Exhibition</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Position / Rank</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
                <option value="Winner">Winner (1st Place)</option>
                <option value="Runner Up">Runner Up (2nd/3rd Place)</option>
                <option value="Participation">Participation</option>
                <option value="Published">Published</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event / Organizer</label>
              <input required type="text" placeholder="e.g. NIT Trichy" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none" value={formData.eventName} onChange={e => setFormData({ ...formData, eventName: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date of Achievement</label>
              <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brief Description (Optional)</label>
              <textarea placeholder="Describe your project, paper, or experience..." rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Google Drive Link to Certificate / Proof <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all outline-none"
                  value={formData.proofFileUrl}
                  onChange={e => setFormData({ ...formData, proofFileUrl: e.target.value })}
                />
              </div>

              {/* Public access confirmation checkbox */}
              <div className="mt-3 flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="achievement-public-access"
                  checked={isPublicAccess}
                  onChange={e => setIsPublicAccess(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#003087] focus:ring-[#003087] cursor-pointer"
                />
                <label htmlFor="achievement-public-access" className="text-xs text-slate-600 font-medium cursor-pointer select-none leading-relaxed">
                  The file is uploaded and the link is set to public access (<span className="font-semibold text-slate-800">"Anyone with the link can view"</span>)
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 bg-[#003087] text-white text-sm font-bold rounded-full hover:bg-[#002266] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
              {loading ? "Submitting..." : "Submit Achievement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
