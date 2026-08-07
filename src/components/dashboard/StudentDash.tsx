"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Bell, ExternalLink, CheckCircle, Clock, X, Loader2,
  GraduationCap, Users, FileText, PlusCircle,
  Upload, AlertCircle, XCircle, Download, User,
  Award, CalendarDays, FolderOpen, Hash, Building2,
  Activity, Shield,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string; referenceNumber: string; eventName: string; eventType: string
  organiser: string; venue: string; startDate: string; endDate: string; reason: string
  status: "DRAFT"|"SUBMITTED"|"AWAITING_SIGNED_LETTER"|"FACULTY_VERIFICATION"|"VERIFIED"|"CORRECTION_REQUIRED"|"REJECTED"|"ACTIVITY_COMPLETED"|"COMPLETED"
  signedLetterUrl?: string;
  postProofUrls?: string[];
  gpsLocation?: { lat: number; lng: number; accuracy: number; timestamp: number }
  facultyRejectReason?: string;
  createdAt?: any;
}

const OD_EVENT_TYPES = ["Competition / Hackathon","Workshop / Seminar","Industrial Visit","College / Department Event","Meeting","Official Department Work","Club / Technical Activity","Other"]

const TAG_COLORS: Record<string,string> = {
  "Competition / Hackathon":"bg-red-100 text-red-700",
  "Workshop / Seminar":"bg-purple-100 text-purple-700",
  "Industrial Visit":"bg-teal-100 text-teal-700",
  "College / Department Event":"bg-blue-100 text-blue-700",
  "Meeting":"bg-amber-100 text-amber-700",
  "Official Department Work":"bg-indigo-100 text-indigo-700",
  "Club / Technical Activity":"bg-rose-100 text-rose-700",
  "Other":"bg-slate-100 text-slate-700"
}

const OD_STATUS: Record<string,{label:string;color:string;bg:string;icon:any}> = {
  DRAFT:{label:"Draft",color:"text-slate-600",bg:"bg-slate-100",icon:FileText},
  SUBMITTED:{label:"Submitted",color:"text-blue-600",bg:"bg-blue-50",icon:Upload},
  AWAITING_SIGNED_LETTER:{label:"Awaiting Signed Letter",color:"text-amber-600",bg:"bg-amber-50",icon:AlertCircle},
  FACULTY_VERIFICATION:{label:"Pending Verification",color:"text-[#3B5BFF]",bg:"bg-blue-50",icon:Clock},
  VERIFIED:{label:"Verified",color:"text-[#16A34A]",bg:"bg-green-50",icon:CheckCircle},
  CORRECTION_REQUIRED:{label:"Correction Required",color:"text-amber-600",bg:"bg-amber-50",icon:AlertCircle},
  REJECTED:{label:"Rejected",color:"text-[#EF4444]",bg:"bg-red-50",icon:XCircle},
  ACTIVITY_COMPLETED:{label:"Activity Completed",color:"text-indigo-600",bg:"bg-indigo-50",icon:CheckCircle},
  COMPLETED:{label:"Completed",color:"text-[#16A34A]",bg:"bg-green-50",icon:CheckCircle},
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({icon:Icon,title,subtitle,accent="#003087",accentBg="bg-[#003087]/5"}:{
  icon:any;title:string;subtitle:string;accent?:string;accentBg?:string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`h-12 w-12 rounded-lg ${accentBg} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="h-6 w-6" style={{color:accent}}/>
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-1">{title}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{subtitle}</p>
    </div>
  )
}

// ── Profile Field ─────────────────────────────────────────────────────────────
function ProfileField({label,value,locked=true}:{label:string;value:string;locked?:boolean}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        {locked&&<span className="text-[9px] font-medium text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">Read-only</span>}
      </div>
      <p className="text-sm font-medium text-slate-800 bg-slate-50 border border-[#E2E8F0] px-3 py-2 rounded break-all">{value||"—"}</p>
    </div>
  )
}

// ── Summary Card (institutional — left-border accent style) ─────────────────
function SummaryCard({icon:Icon,label,value,borderColor="border-[#003087]",iconColor="text-[#003087]"}:{
  icon:any;label:string;value:string;borderColor?:string;iconColor?:string
}) {
  return (
    <div className={`bg-white rounded-lg border border-[#E2E8F0] border-l-4 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <Icon className={`h-4 w-4 ${iconColor} opacity-60`}/>
      </div>
      <p className="text-base font-bold text-slate-800 leading-snug break-all">{value||"—"}</p>
    </div>
  )
}

// ── OD Modal ──────────────────────────────────────────────────────────────────
function ODModal({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}) {
  const [form,setForm] = useState({
    eventName:"",eventType:OD_EVENT_TYPES[0],organiser:"",venue:"",
    startDate:"",endDate:"",reason:"",
  })
  const [proofFile,setProofFile] = useState<File|null>(null)
  const [uploading,setUploading] = useState(false)
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k:string,v:any) => setForm(f => ({...f,[k]:v}))

  const fetchLocation = (): Promise<{lat:number,lng:number,accuracy:number,timestamp:number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."))
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            })
          },
          (err) => {
            reject(new Error("Failed to get location: " + err.message))
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      }
    })
  }

  const handleSubmit = async () => {
    setError("")
    if(!form.eventName||!form.organiser||!form.venue||!form.startDate||!form.endDate||!form.reason){setError("Please fill all required fields.");return}
    if(!proofFile){setError("Please upload the signed OD letter.");return}
    
    setUploading(true)
    let gpsLocation;
    try {
      gpsLocation = await fetchLocation();
    } catch(err:any) {
      setError(err.message || "GPS location is required to submit an OD request.");
      setUploading(false);
      return;
    }

    let proofFileB64="",proofFileName="",proofMimeType=""
    try {
      const toBase64=(f:File):Promise<string>=>new Promise((res,rej)=>{
        const r=new FileReader();r.readAsDataURL(f)
        r.onload=()=>res((r.result as string).split(",")[1]);r.onerror=rej
      })
      proofFileB64=await toBase64(proofFile);proofFileName=proofFile.name;proofMimeType=proofFile.type
    } catch{setError("Failed to process file.");setUploading(false);return}
    setUploading(false);setSubmitting(true)
    
    const res=await fetch("/api/od",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...form,proofFileB64,proofFileName,proofMimeType, gpsLocation})
    })
    const data=await res.json()
    if(!res.ok){setError(data.error||"Submission failed.");setSubmitting(false);return}
    setSubmitting(false);onSuccess();onClose()
  }

  const inp="w-full rounded border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#003087] focus:outline-none focus:ring-1 focus:ring-[#003087]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Apply for On-Duty (OD)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload your manually signed OD letter to track it digitally</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error&&<div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Name *</label><input value={form.eventName} onChange={e=>set("eventName",e.target.value)} placeholder="e.g. NIT Hackathon 2026" className={inp}/></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Type *</label><select value={form.eventType} onChange={e=>set("eventType",e.target.value)} className={inp}>{OD_EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Organiser *</label><input value={form.organiser} onChange={e=>set("organiser",e.target.value)} placeholder="e.g. IIT Madras" className={inp}/></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">Venue *</label><input value={form.venue} onChange={e=>set("venue",e.target.value)} placeholder="e.g. IIT Madras Campus, Chennai" className={inp}/></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date *</label><input type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)} className={inp}/></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date *</label><input type="date" value={form.endDate} onChange={e=>set("endDate",e.target.value)} className={inp}/></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason / Purpose *</label><textarea value={form.reason} onChange={e=>set("reason",e.target.value)} placeholder="Briefly explain why you need this OD..." rows={3} className={`${inp} resize-none`}/></div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Signed OD Letter <span className="text-red-500">*</span></label>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={e=>setProofFile(e.target.files?.[0]??null)}/>
            <button onClick={()=>fileRef.current?.click()} className={`w-full flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed py-5 text-sm font-semibold transition-all ${proofFile?"border-[#16A34A] bg-green-50 text-[#16A34A]":"border-[#E2E8F0] bg-slate-50 text-slate-500 hover:border-[#003087] hover:text-[#003087]"}`}>
              {proofFile?<CheckCircle className="h-5 w-5"/>:<Upload className="h-5 w-5"/>}
              {proofFile?proofFile.name:"Click to upload signed letter"}
            </button>
            <p className="text-[10px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1"><Shield className="h-3 w-3"/> GPS location will be captured securely on submit</p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2 rounded border border-[#E2E8F0] bg-white text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={uploading||submitting} className="flex-1 py-2 rounded bg-[#003087] text-white text-sm font-semibold hover:bg-[#002070] disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
            {(uploading||submitting)?<Loader2 className="h-4 w-4 animate-spin"/>:<CheckCircle className="h-4 w-4"/>}
            {uploading?"Capturing GPS...":submitting?"Submitting...":"Submit OD"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post OD Proof Modal ───────────────────────────────────────────────────────
function PostODProofModal({od,onClose,onSuccess}:{od:ODRequest;onClose:()=>void;onSuccess:()=>void}) {
  const [files,setFiles] = useState<File[]>([])
  const [uploading,setUploading] = useState(false)
  const [error,setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if(!files.length){setError("Please select at least one file.");return}
    setUploading(true);setError("")
    try {
      const toBase64=(f:File):Promise<string>=>new Promise((res,rej)=>{
        const r=new FileReader();r.readAsDataURL(f)
        r.onload=()=>res((r.result as string).split(",")[1]);r.onerror=rej
      })
      const b64files=await Promise.all(files.map(async f=>({base64:await toBase64(f),name:f.name,mimeType:f.type})))
      const res=await fetch(`/api/od/${od.id}/proof`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({files:b64files})})
      if(!res.ok){const d=await res.json();setError(d.error||"Submission failed.");setUploading(false);return}
      setUploading(false);onSuccess();onClose()
    } catch{setError("Something went wrong.");setUploading(false)}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div><h2 className="text-lg font-bold text-slate-800">Submit Post-Event Proof</h2><p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">{od.eventName}</p></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200"><X className="h-5 w-5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error&&<div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded px-4 py-3 text-sm text-[#EF4444]"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Files <span className="text-red-500">*</span></label>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
            <button onClick={()=>fileRef.current?.click()} className={`w-full flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed py-6 text-sm font-semibold transition-all ${files.length>0?"border-[#16A34A] bg-green-50 text-[#16A34A]":"border-[#E2E8F0] bg-slate-50 text-slate-500 hover:border-[#003087] hover:text-[#003087]"}`}>
              {files.length>0?<CheckCircle className="h-5 w-5"/>:<Upload className="h-5 w-5"/>}
              {files.length>0?`${files.length} file(s) selected`:"Click to upload photos or certificates"}
            </button>
            {files.length>0&&<ul className="mt-2 text-xs text-slate-500 space-y-1">{files.map(f=><li key={f.name} className="truncate">• {f.name}</li>)}</ul>}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2 rounded border border-[#E2E8F0] bg-white text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={uploading} className="flex-1 py-2 rounded bg-[#003087] text-white text-sm font-semibold hover:bg-[#002070] disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
            {uploading?<Loader2 className="h-4 w-4 animate-spin"/>:<CheckCircle className="h-4 w-4"/>}
            {uploading?"Uploading...":"Submit Proof"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreviewModal({url, title, onClose}: {url: string, title: string, onClose: ()=>void}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50 shrink-0">
          <div><h2 className="text-lg font-bold text-slate-800">{title}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors"><X className="h-5 w-5"/></button>
        </div>
        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden relative">
          <iframe 
            src={url.includes('drive.google.com') ? url.replace('/view', '/preview') : url} 
            className="w-full h-full rounded shadow-sm border-0 bg-white" 
            title="Document Preview"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  )
}

// ── Recent Activity ───────────────────────────────────────────────────────────
function RecentActivity({odRequests}:{odRequests:ODRequest[]}) {
  const activities = odRequests
    .filter(od=>od.createdAt)
    .sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))
    .slice(0,5)
    .map(od=>{
      const sc=OD_STATUS[od.status]||OD_STATUS.FACULTY_VERIFICATION
      return {
        id:od.id,text:`OD — ${od.eventName}`,sub:sc.label,color:sc.color,
        time:od.createdAt?.seconds?new Date(od.createdAt.seconds*1000).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}):""
      }
    })
  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-[#E2E8F0] bg-slate-50">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-slate-400"/> Recent Activity
        </h3>
      </div>
      {activities.length===0?(
        <EmptyState icon={Activity} title="No recent activity" subtitle="Your OD requests, achievements, and events will appear here once you start using the portal." accentBg="bg-slate-50" accent="#94A3B8"/>
      ):(
        <ul className="divide-y divide-[#E2E8F0]">
          {activities.map(a=>(
            <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0"/>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.text}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${a.color}`}>{a.sub}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">{a.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function StudentDash() {
  const {uid,name,email,image} = useUser()
  const [odRequests,setOdRequests] = useState<ODRequest[]>([])
  const [loadingOD,setLoadingOD] = useState(true)
  const [showODForm,setShowODForm] = useState(false)
  const [selectedODForProof,setSelectedODForProof] = useState<ODRequest|null>(null)
  const [previewUrl,setPreviewUrl] = useState<string|null>(null)
  const [profile,setProfile] = useState<any>(null)
  const [loadingProfile,setLoadingProfile] = useState(true)
  const [classInchargeName,setClassInchargeName] = useState<string>("—")
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab")||"dashboard"

  useEffect(()=>{
    async function load() {
      try {
        if(uid) {
          const pRes=await fetch(`/api/users?uid=${uid}`)
          if(pRes.ok){
            const p=await pRes.json();setProfile(p)
            if(p?.classId){
              const ir=await fetch(`/api/users?classId=${encodeURIComponent(p.classId)}`)
              if(ir.ok){const i=await ir.json();if(i?.name)setClassInchargeName(i.name)}
            }
          }
        }
      } catch{}
      setLoadingProfile(false)
    }
    load()
  },[uid])

  const loadODs=async()=>{
    if(!uid)return;setLoadingOD(true)
    try{const res=await fetch("/api/od");if(res.ok)setOdRequests(await res.json())}catch{}
    setLoadingOD(false)
  }
  useEffect(()=>{loadODs()},[uid])

  const pendingODs=odRequests.filter(o=>["SUBMITTED","AWAITING_SIGNED_LETTER","FACULTY_VERIFICATION","CORRECTION_REQUIRED"].includes(o.status)).length
  const approvedODs=odRequests.filter(o=>["VERIFIED","ACTIVITY_COMPLETED","COMPLETED"].includes(o.status)).length

  const displayName=profile?.name||name||"Student"
  const department=profile?.department||(profile?.deptCode?.toUpperCase())||"AIML"
  const deptShort=profile?.deptCode
    ? (profile.deptCode.toLowerCase()==="aids" ? "AI&DS" : "AIML")
    : (department.toLowerCase().includes("data") ? "AI&DS" : "AIML")
  const semesterNum=profile?.semester
  const semesterLabel=semesterNum?`Semester ${semesterNum}`:"—"
  const section=profile?.section||"—"
  const registerNumber=profile?.registerNumber||"—"
  const rollNumber=profile?.rollNumber||"—"
  const batch=profile?.batch||"—"
  const currentYear=profile?.currentYear||"—"
  const phone=profile?.phone||"—"
  const profileEmail=profile?.email||email||"—"

  return (
    <div className="min-h-full space-y-5">
      {showODForm&&<ODModal onClose={()=>setShowODForm(false)} onSuccess={loadODs}/>}
      {selectedODForProof&&<PostODProofModal od={selectedODForProof} onClose={()=>setSelectedODForProof(null)} onSuccess={loadODs}/>}
      {previewUrl&&<DocumentPreviewModal url={previewUrl} title="Document Preview" onClose={()=>setPreviewUrl(null)}/>}

      {currentTab==="dashboard"&&(
        <div className="space-y-5">

          {/* Page Header — clean institutional style */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Navy top bar */}
            <div className="bg-[#003087] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {image ? (
                  <Image src={image} alt={displayName} width={56} height={56}
                    className="rounded-full ring-2 ring-white/30 w-12 h-12 object-cover shrink-0"/>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/20 text-white flex items-center justify-center text-xl font-bold ring-2 ring-white/30 shrink-0">
                    {displayName[0]??"S"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-0.5">RIT — Student Portal</p>
                  <h1 className="text-lg font-bold text-white leading-tight">Welcome, {displayName.split(" ")[0]}</h1>
                  <p className="text-white/60 text-xs mt-0.5">{department} &nbsp;•&nbsp; {semesterLabel} &nbsp;•&nbsp; Section {section}</p>
                </div>
              </div>
              {/* Stat chips */}
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-center min-w-[80px]">
                  <p className="text-white/60 text-[9px] font-semibold uppercase tracking-wider">Class Incharge</p>
                  <p className="text-white font-semibold text-xs mt-1 truncate max-w-[110px]">{classInchargeName}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-center min-w-[70px]">
                  <p className="text-white/60 text-[9px] font-semibold uppercase tracking-wider">OD Requests</p>
                  <p className="text-white font-bold text-lg mt-0.5">{odRequests.length}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-center min-w-[70px]">
                  <p className="text-white/60 text-[9px] font-semibold uppercase tracking-wider">Approved</p>
                  <p className="text-white font-bold text-lg mt-0.5">{approvedODs}</p>
                </div>
              </div>
            </div>
            {/* Register number strip */}
            <div className="px-6 py-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span><span className="font-semibold text-slate-700">Reg. No:</span> {registerNumber}</span>
                <span><span className="font-semibold text-slate-700">Roll:</span> {rollNumber}</span>
                <span><span className="font-semibold text-slate-700">Batch:</span> {batch}</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 bg-[#003087]/10 text-[#003087] rounded">{deptShort}</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard icon={Building2}     label="Department"   value={deptShort}             borderColor="border-[#003087]" iconColor="text-[#003087]"/>
            <SummaryCard icon={GraduationCap} label="Semester"     value={semesterLabel}         borderColor="border-[#7C3AED]" iconColor="text-[#7C3AED]"/>
            <SummaryCard icon={Users}         label="Section"      value={`Sec. ${section}`}     borderColor="border-[#0891B2]" iconColor="text-[#0891B2]"/>
            <SummaryCard icon={Hash}          label="Register No." value={registerNumber}        borderColor="border-[#16A34A]" iconColor="text-[#16A34A]"/>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>setShowODForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#003087] text-white text-sm font-semibold hover:bg-[#002070] transition-colors">
                <FileText className="h-3.5 w-3.5"/> Apply for OD
              </button>
              <Link href="/dashboard/student?tab=profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#D1D5DB] text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                <User className="h-3.5 w-3.5"/> View Profile
              </Link>
              <Link href="/dashboard/student?tab=achievements"
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#D1D5DB] text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Award className="h-3.5 w-3.5"/> My Achievements
              </Link>
            </div>
          </div>

          <RecentActivity odRequests={odRequests}/>
        </div>
      )}

      {currentTab==="profile"&&(
        <div className="space-y-5">
          {/* Profile Header */}
          <div className="bg-[#003087] rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {image ? (
                <Image src={image} alt={displayName} width={80} height={80} className="rounded-full ring-4 ring-white/30 w-18 h-18 object-cover shadow-md shrink-0"/>
              ) : (
                <div className="h-18 w-18 rounded-full bg-white/20 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-white/30 shadow-md shrink-0" style={{width:72,height:72}}>
                  {displayName[0]}
                </div>
              )}
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">Student Profile</p>
                <h2 className="text-xl font-bold text-white leading-tight">{displayName}</h2>
                <p className="text-white/70 text-sm mt-1">{department} &nbsp;•&nbsp; {semesterLabel} &nbsp;•&nbsp; Section {section}</p>
                <p className="text-white/50 text-xs mt-1 font-mono">Reg. No: {registerNumber}</p>
              </div>
            </div>
          </div>
          {loadingProfile?(
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]"/></div>
          ):(
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-5 lg:p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                <User className="h-3.5 w-3.5"/> Academic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField label="Full Name"       value={displayName}                  locked={true}/>
                <ProfileField label="Register Number" value={registerNumber}               locked={true}/>
                <ProfileField label="Roll Number"     value={rollNumber}                   locked={true}/>
                <ProfileField label="College Email"   value={profileEmail}                 locked={true}/>
                <ProfileField label="Phone Number"    value={phone}                        locked={false}/>
                <ProfileField label="Department"      value={department}                   locked={true}/>
                <ProfileField label="Class"           value={profile?.class||"AIML"}       locked={true}/>
                <ProfileField label="Batch"           value={batch}                        locked={true}/>
                <ProfileField label="Current Year"    value={currentYear}                  locked={true}/>
                <ProfileField label="Semester"        value={String(semesterNum||"—")}     locked={true}/>
                <ProfileField label="Section"         value={section}                      locked={true}/>
                <ProfileField label="Class Incharge"  value={classInchargeName}            locked={true}/>
              </div>
              <div className="mt-5 p-3.5 rounded-lg border border-amber-200 bg-amber-50">
                <p className="text-xs text-amber-700 font-medium flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0"/>
                  Academic information (Register Number, Department, Semester, Section) is controlled by the department. For corrections, contact the department office or HOD.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY OD */}
      {currentTab==="od"&&(
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">My OD Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">{pendingODs>0?`${pendingODs} pending approval`:"All requests reviewed"}{approvedODs>0&&` · ${approvedODs} approved`}</p>
            </div>
            <button onClick={()=>setShowODForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded text-sm font-semibold hover:bg-[#002070] transition-colors shrink-0">
              <PlusCircle className="h-3.5 w-3.5"/> Apply for OD
            </button>
          </div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            {loadingOD?(
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]"/></div>
            ):odRequests.length===0?(
              <EmptyState icon={FileText} title="No OD requests yet" subtitle="Apply for On-Duty when you need to attend an external event, workshop, hackathon, or conference."/>
            ):(
              <div className="divide-y divide-[#E5E7EB]">
                {odRequests.map(od=>{
                  const sc=OD_STATUS[od.status]||OD_STATUS.FACULTY_VERIFICATION
                  const StatusIcon=sc.icon
                  const isRejected=od.status==="REJECTED"
                  const isApproved=od.status==="VERIFIED"||od.status==="ACTIVITY_COMPLETED"||od.status==="COMPLETED"
                  return (
                    <div key={od.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isRejected?"border-l-4 border-l-[#EF4444]":isApproved?"border-l-4 border-l-[#16A34A]":""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-bold text-slate-800">{od.eventName}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TAG_COLORS[od.eventType]||"bg-slate-100 text-slate-600"}`}>{od.eventType}</span>
                          </div>
                          <p className="text-xs text-slate-500">{od.organiser} · {od.startDate}{od.startDate!==od.endDate?` – ${od.endDate}`:""}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">Ref: {od.referenceNumber}</p>
                          {isRejected&&<p className="text-xs text-[#EF4444] mt-1 font-medium">Reason: {od.facultyRejectReason||"—"}</p>}
                          
                          {od.status==="VERIFIED"&&od.eventType!=="Meeting"&&od.eventType!=="Official Department Work"&&(
                            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 font-medium flex flex-col gap-2">
                              <span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4 shrink-0"/> You MUST upload post-event proof (certificate/photos) after attending this event.</span>
                              <button onClick={()=>setSelectedODForProof(od)} className="self-start px-3 py-1.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition-colors shadow-sm text-[10px]">
                                Upload Proof Now
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="h-3 w-3"/> {sc.label}
                          </div>
                          <div className="flex gap-2 items-center flex-wrap justify-end">
                            {od.signedLetterUrl&&<button onClick={()=>setPreviewUrl(od.signedLetterUrl!)} className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 text-[10px] font-bold text-[#003087] hover:bg-slate-200 transition-colors"><FileText className="h-3 w-3"/> Signed Letter</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab==="achievements"&&(
        <div className="space-y-4">
          <div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">My Achievements</h2><p className="text-xs text-slate-500 mt-0.5">Awards, recognitions, and competition results</p></div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
            <EmptyState icon={Award} title="No achievements added yet" subtitle="Your achievements, awards, and competition results will appear here once submitted and verified by the department." accent="#D97706" accentBg="bg-amber-100"/>
            <div className="px-5 pb-5"><div className="rounded border border-blue-100 bg-blue-50 p-3"><p className="text-xs font-medium text-blue-700 flex items-start gap-2"><AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0"/>Future fields: Achievement Title, Event, Position, Date, Organizer, Certificate, Verification Status. Only department-approved achievements become public.</p></div></div>
          </div>
        </div>
      )}

      {/* EVENTS */}
      {currentTab==="events"&&(
        <div className="space-y-4">
          <div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">My Events</h2><p className="text-xs text-slate-500 mt-0.5">Events you have participated in or registered for</p></div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
            <EmptyState icon={CalendarDays} title="No events recorded yet" subtitle="Events you participate in will appear here once linked by the department. Data will include event name, date, type, venue, and participation status." accent="#0891B2" accentBg="bg-sky-100"/>
          </div>
        </div>
      )}

      {/* CERTIFICATES */}
      {currentTab==="certificates"&&(
        <div className="space-y-4">
          <div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">My Certificates</h2><p className="text-xs text-slate-500 mt-0.5">Digital certificates from events, achievements, and department activities</p></div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
            <EmptyState icon={FolderOpen} title="No certificates available" subtitle="Certificates from your achievements, events, OD activities, and department activities will be stored and downloadable here once issued." accent="#7C3AED" accentBg="bg-violet-100"/>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {currentTab==="notifications"&&(
        <div className="space-y-4">
          <div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Notifications</h2><p className="text-xs text-slate-500 mt-0.5">Updates from the department, OD approvals, and announcements</p></div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
            <EmptyState icon={Bell} title="No notifications" subtitle="You are all caught up! OD status updates, achievement approvals, department announcements, and event reminders will appear here."/>
          </div>
        </div>
      )}

    </div>
  )
}
