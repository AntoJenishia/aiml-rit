"use client"
import { ODStatus, OD_STATUS_LABELS, OD_STATUS_STYLES } from "@/lib/odStatus"
import { useUser } from "@/lib/hooks/useUser"
import { useState, useEffect, useRef, useCallback } from "react"
import { DocumentPreviewModal } from "@/components/shared/DocumentPreviewModal"
import { useSearchParams } from "next/navigation"
import { formatDate, timestampMs } from "@/lib/dateUtils"
import Image from "next/image"
import Link from "next/link"
import {
  Bell, ExternalLink, CheckCircle, Clock, X, Loader2,
  GraduationCap, Users, FileText, PlusCircle,
  Upload, AlertCircle, XCircle, Download, User,
  Award, CalendarDays, FolderOpen, Hash, Building2,
  Activity, Shield, Plus, BookOpen, Trophy, TrendingUp,
  CheckCircle2, Star, ChevronRight, Megaphone
} from "lucide-react"

import AchievementModal from "./AchievementModal"
import { ODLedgerTable } from "@/components/shared/ODLedgerTable"

// ── Types ─────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string; referenceNumber: string; eventName: string; eventType: string
  organiser: string; venue: string; startDate: string; endDate: string; reason: string
  status: string  // Always one of ODStatus enum values
  department?: string
  signedLetterUrl?: string;
  postProofUrls?: string[];
  postODProofsUrl?: string;
  pdfUrl?: string;
  finalPdfUrl?: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning,"
  if (hour < 17) return "Good Afternoon,"
  return "Good Evening,"
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return <div className="h-12"></div>

  return (
    <div className="flex flex-col items-end justify-center bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 shadow-sm relative z-10 shrink-0 hidden md:flex">
      <div className="text-xl md:text-2xl font-mono font-black text-white tracking-widest leading-none mb-1">
        {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest leading-none">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  )
}

// ── Profile Field ─────────────────────────────────────────────────────────────
function ProfileField({label,value,locked=true}:{label:string;value:string;locked?:boolean}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
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
function ODModal({onClose,onSuccess,initialData}:{onClose:()=>void;onSuccess:()=>void;initialData?:any}) {
  const [form,setForm] = useState({
    eventName: initialData?.eventName || "",
    eventType: initialData?.eventType || OD_EVENT_TYPES[0],
    organiser: initialData?.organiser || "",
    venue: initialData?.venue || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    odDays: initialData?.odDays || 1,
    reason: initialData?.reason || ""
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

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async () => {
    setError("")
    if(!form.eventName||!form.organiser||!form.venue||!form.startDate||!form.endDate||!form.reason){setError("Please fill all required fields.");return}
    if(form.startDate < today){setError("Start date cannot be in the past.");return}
    if(form.endDate < form.startDate){setError("End date cannot be before start date.");return}
    if(!proofFile){setError("Please upload your proof document (e.g. event brochure, registration confirmation).");return}
    
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
      body:JSON.stringify({...form, odDays: form.odDays, proofFileB64,proofFileName,proofMimeType, gpsLocation})
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
            <h2 className="text-lg font-bold text-slate-800">{initialData ? "Re-apply for OD" : "Apply for On-Duty (OD)"}</h2>
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
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date *</label><input type="date" min={today} value={form.startDate} onChange={e=>set("startDate",e.target.value)} className={inp}/></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date *</label><input type="date" min={form.startDate || today} value={form.endDate} onChange={e=>set("endDate",e.target.value)} className={inp}/></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of OD Days * <span className="font-normal text-slate-500">(max 3 working days)</span></label>
              <select value={form.odDays} onChange={e=>set("odDays",Number(e.target.value))} className={inp}>
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">If your OD spans weekends or holidays, enter only the number of actual working days requested.</p>
            </div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason / Purpose *</label><textarea value={form.reason} onChange={e=>set("reason",e.target.value)} placeholder="Briefly explain why you need this OD..." rows={3} className={`${inp} resize-none`}/></div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Proof Document <span className="text-red-500">*</span></label>
            <p className="text-[10px] text-slate-500 mb-2">Upload event brochure, registration confirmation, or invitation letter</p>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={e=>setProofFile(e.target.files?.[0]??null)}/>
            <button onClick={()=>fileRef.current?.click()} className={`w-full flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed py-5 text-sm font-semibold transition-all ${proofFile?"border-[#16A34A] bg-green-50 text-[#16A34A]":"border-[#E2E8F0] bg-slate-50 text-slate-500 hover:border-[#003087] hover:text-[#003087]"}`}>
              {proofFile?<CheckCircle className="h-5 w-5"/>:<Upload className="h-5 w-5"/>}
              {proofFile?proofFile.name:"Click to upload proof document"}
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


// ── Recent Activity ───────────────────────────────────────────────────────────
function RecentActivity({odRequests}:{odRequests:ODRequest[]}) {
  const activities = odRequests
    .filter(od => timestampMs(od.createdAt) > 0 || od.referenceNumber)
    .sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt))
    .slice(0, 5)
    .map(od => {
      const sc = OD_STATUS_STYLES[od.status as ODStatus] || { color: "text-[#6B7280]", bg: "bg-slate-100" }
      const label = OD_STATUS_LABELS[od.status as ODStatus] || od.status
      const created = timestampMs(od.createdAt)
      return {
        id: od.id, text: od.eventName, venue: od.venue, reason: od.reason,
        dateStr: od.startDate !== od.endDate ? `${formatDate(od.startDate)} - ${formatDate(od.endDate)}` : formatDate(od.startDate),
        sub: label, color: sc.color,
        time: created ? new Date(created).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""
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
            <li key={a.id} className="px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0 mt-1.5"/>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{a.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.venue} • {a.dateStr}</p>
                  <p className="text-xs text-slate-500 mt-0.5 italic line-clamp-1">"{a.reason}"</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${a.color}`}>{a.sub}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">{a.time}</span>
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
  const [odRequests,    setOdRequests]    = useState<ODRequest[]>([])
  const [loadingOD,     setLoadingOD]     = useState(true)
  const [showODForm,    setShowODForm]    = useState(false)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loadingAchievements, setLoadingAchievements] = useState(true)
  const [showAchievementForm, setShowAchievementForm] = useState(false)
  const [selectedODForProof, setSelectedODForProof] = useState<ODRequest | null>(null)
  const [activeTab,     setActiveTab]     = useState<"courses" | "od">("courses")
  const [profile,       setProfile]       = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [classInchargeName, setClassInchargeName] = useState<string>("—")
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [previewUrl,setPreviewUrl] = useState<string|null>(null)
  const [reapplyData, setReapplyData] = useState<any>(null)

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "dashboard"

  useEffect(() => {
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

  const loadODs=useCallback(async()=>{
    if(!uid)return;setLoadingOD(true)
    try{const res=await fetch("/api/od");if(res.ok)setOdRequests(await res.json())}catch{}
    setLoadingOD(false)
  },[uid])
  
  const loadAchievements = async () => {
    if(!uid)return;setLoadingAchievements(true)
    try{const res=await fetch("/api/achievements");if(res.ok)setAchievements(await res.json())}catch{}
    setLoadingAchievements(false)
  }

  useEffect(()=>{
    loadODs()
    loadAchievements()
  },[uid])

  // Load announcements + upcoming events (shared data, public to all roles)
  useEffect(() => {
    async function loadFeed() {
      try {
        const [annRes, evRes] = await Promise.all([
          fetch("/api/announcements"),
          fetch("/api/events"),
        ])
        if (annRes.ok) {
          const all: any[] = await annRes.json()
          setAnnouncements(all.filter((a: any) => a.target === "all" || a.target === "students"))
        }
        if (evRes.ok) {
          const all: any[] = await evRes.json()
          const today = new Date().toISOString().split("T")[0]
          setUpcomingEvents(all.filter((e: any) => e.startDate >= today).sort((a: any, b: any) => a.startDate.localeCompare(b.startDate)))
        }
      } catch { /* silently fail */ }
    }
    loadFeed()
  }, [])

  const realSemester      = profile?.semester ?? "—"
  const realCGPA          = profile?.cgpa ?? "—"
  const realSection       = profile?.section ?? ""
  const realBatch         = profile?.batch ?? ""

  const pendingODs=odRequests.filter(o=>[
    ODStatus.PENDING_FACULTY, ODStatus.PENDING_HOD,
    ODStatus.PROOF_PENDING_FACULTY, ODStatus.PROOF_PENDING_HOD,
    ODStatus.PENDING_PROOF
  ].includes(o.status as ODStatus)).length
  const approvedODs=odRequests.filter(o=>[
    ODStatus.APPROVED, ODStatus.COMPLETED
  ].includes(o.status as ODStatus)).length

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
      {reapplyData&&<ODModal onClose={()=>setReapplyData(null)} onSuccess={() => { setReapplyData(null); loadODs(); }} initialData={reapplyData}/>}
      {showAchievementForm&&<AchievementModal onClose={()=>setShowAchievementForm(false)} onSuccess={loadAchievements}/>}
      {selectedODForProof&&<PostODProofModal od={selectedODForProof} onClose={()=>setSelectedODForProof(null)} onSuccess={loadODs}/>}
      {previewUrl&&<DocumentPreviewModal url={previewUrl} title="Document Preview" onClose={()=>setPreviewUrl(null)}/>}

      {/* Header Banner */}
      <div className="bg-[#003087] rounded-lg shadow-md p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-white -translate-y-12 translate-x-4" />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          {image ? (
            <Image src={image} alt={displayName} width={56} height={56}
              className="rounded-full ring-4 ring-white/10 w-16 h-16 md:w-20 md:h-20 object-cover shrink-0 relative z-10"/>
          ) : (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-black shrink-0 ring-4 ring-white/10 relative z-10">
              {displayName[0]??"S"}
            </div>
          )}
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">{displayName} 👋</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded">Student</span>
              <span className="text-[10px] uppercase font-bold text-white bg-white/20 px-2 py-0.5 rounded">{deptShort}</span>
              {registerNumber && registerNumber !== "—" && <span className="text-[10px] uppercase font-bold text-white bg-white/20 px-2 py-0.5 rounded">{registerNumber}</span>}
              {semesterLabel && semesterLabel !== "—" && <span className="text-[10px] uppercase font-bold text-white bg-white/20 px-2 py-0.5 rounded">{semesterLabel} {section && section !== "—" ? `Sec ${section}` : ""}</span>}
            </div>
          </div>
        </div>

        <LiveClock />
      </div>

      {currentTab==="dashboard"&&(
        <div className="space-y-5">

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

          {/* ── Stat Cards (Awards/OD) ── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Awards",     value: achievements.length,      icon: Trophy,    border: "border-l-[#D97706]", iconBg: "bg-[#D97706]/10", iconColor: "text-[#D97706]", sub: "Achievements" },
              { label: "OD Pending", value: pendingODs, icon: FileText, border: "border-l-[#EF4444]", iconBg: "bg-[#EF4444]/10", iconColor: "text-[#EF4444]", sub: `${approvedODs} approved` },
            ].map(s => (
              <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB] border-l-4 ${s.border} hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                    <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#111827]">{s.value}</p>
                <p className="text-xs font-bold text-[#6B7280] mt-1">{s.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <RecentActivity odRequests={odRequests}/>
        </div>
      )}


      {/* ── Profile Tab ── */}
      {currentTab === "profile" && (
        <div className="space-y-5">
          {loadingProfile ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]"/></div>
          ) : (
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

      {/* ── Default / Dashboard Content: Announcements, Events, Courses/OD tabs ── */}
      {currentTab !== "profile" && currentTab !== "od" && currentTab !== "achievements" && currentTab !== "events" && currentTab !== "certificates" && currentTab !== "notifications" && (
        <div className="space-y-6">

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#D97706]" />
                <h2 className="text-sm font-bold text-[#111827]">Announcements</h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="px-6 py-4">
                    <p className="text-sm font-bold text-[#111827]">{ann.title}</p>
                    <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{ann.body}</p>
                    {ann.createdAt && (
                      <p className="text-[10px] text-[#94A3B8] mt-2">Posted {formatDate(ann.createdAt)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#3B5BFF]" />
                <h2 className="text-sm font-bold text-[#111827]">Upcoming Events</h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {upcomingEvents.map((ev: any) => (
                  <div key={ev.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#3B5BFF]/10 text-[#3B5BFF]">
                      <span className="text-lg font-black leading-none">{new Date(ev.startDate).getDate()}</span>
                      <span className="text-[9px] uppercase font-bold">{new Date(ev.startDate).toLocaleString("en", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#111827]">{ev.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[ev.type] || "bg-[#F5F6FA] text-[#6B7280]"}`}>{ev.type}</span>
                      </div>
                      <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">{ev.description}</p>
                      <p className="text-[10px] font-bold text-[#6B7280] mt-1.5">{ev.venue} · {formatDate(ev.startDate)}{ev.startDate !== ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab nav — Courses | OD */}
          <div className="flex gap-1 bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1">
            {(["courses", "od"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280] hover:text-[#111827]"
                }`}>
                {tab === "courses" ? <BookOpen className={`h-4 w-4 ${activeTab === tab ? "text-[#3B5BFF]" : "text-[#94A3B8]"}`} /> : <FileText className={`h-4 w-4 ${activeTab === tab ? "text-[#3B5BFF]" : "text-[#94A3B8]"}`} />}
                {tab === "courses" ? "My Courses" : "My OD Requests"}
                {tab === "od" && pendingODs > 0 && (
                  <span className="h-4 w-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center">
                    {pendingODs}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3B5BFF]" /> My Courses
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3B5BFF]/10 text-[#3B5BFF]">
                  Semester {realSemester}{realSection ? ` · Section ${realSection}` : ""}
                </span>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <BookOpen className="h-8 w-8 text-[#94A3B8] mb-3" />
                  <p className="text-sm font-bold text-[#111827]">Course data not available</p>
                  <p className="text-xs text-[#6B7280] mt-1">Your courses will appear here once linked by the department.</p>
                </div>
              </div>
            </div>
          )}

          {/* OD Tab (within default/dashboard view) */}
          {activeTab === "od" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3B5BFF]" /> My OD Requests
                </h2>
                <button onClick={()=>setShowODForm(true)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#003087] text-white rounded text-xs font-semibold hover:bg-[#002070] transition-colors">
                  <PlusCircle className="h-3.5 w-3.5"/> Apply for OD
                </button>
              </div>
              <div>
                {loadingOD?(
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]"/></div>
                ):odRequests.length===0?(
                  <EmptyState icon={FileText} title="No OD requests yet" subtitle="Apply for On-Duty when you need to attend an external event, workshop, hackathon, or conference."/>
                ):(
                  <div className="divide-y divide-[#E5E7EB]">
                    {odRequests.slice(0,5).map(od=>{
                      const sc = OD_STATUS_STYLES[od.status as ODStatus] || { color: "text-[#6B7280]", bg: "bg-[#F5F6FA]", border: "border-slate-200" }
                      const label = OD_STATUS_LABELS[od.status as ODStatus] || od.status
                      const dateStr = od.startDate !== od.endDate ? `${formatDate(od.startDate)} - ${formatDate(od.endDate)}` : formatDate(od.startDate)
                      return (
                        <div key={od.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{od.eventName}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{od.venue} • {dateStr}</p>
                            <p className="text-xs text-slate-500 mt-1 italic">"{od.reason}"</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${sc.bg} ${sc.color}`}>
                            {label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
          <div className="mt-4">
            {loadingOD?(
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]"/></div>
            ):(
              <ODLedgerTable 
                ods={odRequests}
                role="student"
                onPreviewDocument={setPreviewUrl}
                onReapply={setReapplyData}
                onUploadProof={setSelectedODForProof}
              />
            )}
          </div>
        </div>
      )}

      {currentTab==="achievements"&&(
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">My Achievements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Awards, recognitions, and competition results</p>
            </div>
            <button onClick={() => setShowAchievementForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white text-sm font-bold rounded-lg hover:bg-[#002266] transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Add Achievement
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            {loadingAchievements ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 text-[#003087] animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading achievements...</p>
              </div>
            ) : achievements.length === 0 ? (
              <EmptyState icon={Award} title="No achievements added yet" subtitle="Your achievements, awards, and competition results will appear here once submitted and verified by the department." accent="#D97706" accentBg="bg-amber-100"/>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {achievements.map((ach: any) => {
                  const isVerified = ach.status === "VERIFIED"
                  const isRejected = ach.status === "REJECTED"
                  
                  return (
                    <div key={ach.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isVerified ? "border-l-4 border-l-[#16A34A]" : isRejected ? "border-l-4 border-l-[#EF4444]" : "border-l-4 border-l-[#F59E0B]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-bold text-slate-800">{ach.title}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{ach.category}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{ach.position}</span>
                          </div>
                          <p className="text-xs text-slate-500">{ach.eventName} · {ach.date}</p>
                          {ach.description && <p className="text-xs text-slate-600 mt-2">{ach.description}</p>}
                          {isRejected && <p className="text-xs text-[#EF4444] mt-1 font-medium">Reason: {ach.facultyRemarks || "—"}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold ${
                            isVerified ? "bg-green-100 text-green-700" :
                            isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending Verification"}
                          </div>
                          {ach.proofFileUrl && (
                            <button onClick={() => setPreviewUrl(ach.proofFileUrl)} className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 text-[10px] font-bold text-[#003087] hover:bg-slate-200 transition-colors">
                              <FileText className="h-3 w-3" /> View Proof
                            </button>
                          )}
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
