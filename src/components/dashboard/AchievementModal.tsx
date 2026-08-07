import { useState, useRef } from "react"
import { Upload, X, Loader2, FileText, CheckCircle, Award } from "lucide-react"

interface AchievementModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AchievementModal({ onClose, onSuccess }: AchievementModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    category: "Hackathon",
    eventName: "",
    date: "",
    position: "Participation",
    description: "",
    proofFileUrl: "",
    proofFileName: ""
  })
  
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      if (f.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setFile(f)
      setFormData(prev => ({ ...prev, proofFileName: f.name }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert("Please upload a certificate or proof document.")
    
    setLoading(true)
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.includes(",") ? result.split(",")[1] : result)
        }
        reader.onerror = error => reject(error)
      })
      reader.readAsDataURL(file)
      const proofFileB64 = await base64Promise
      
      // 2. Submit to API
      const payload = { 
        ...formData, 
        proofFileB64, 
        proofMimeType: file.type 
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Certificate / Proof (Max 5MB)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-green-700">{file.name}</p>
                    <p className="text-xs text-green-600">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click to upload certificate</p>
                    <p className="text-xs text-slate-500">PDF, JPG, PNG allowed</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,image/jpeg,image/png" 
                  className="hidden" 
                />
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
