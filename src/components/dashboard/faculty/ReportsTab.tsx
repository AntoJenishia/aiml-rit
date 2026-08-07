import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Users, FileText, Award, BarChart3, Download, Printer, Calendar, Shield, MonitorPlay, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function ReportsTab({ students, odRequests, achievements, classId, facultyName }: any) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  
  // Presentation Mode State
  const [isPresentationOpen, setIsPresentationOpen] = useState(false)
  const [showIntroVideo, setShowIntroVideo] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 4

  // Handle keyboard navigation for presentation
  useEffect(() => {
    if (!isPresentationOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPresentationOpen(false)
      if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1)
      if (e.key === 'ArrowLeft' && currentSlide > 0) setCurrentSlide(prev => prev - 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPresentationOpen, currentSlide])

  // Filter Data based on dates
  const filteredODs = odRequests.filter((od: any) => {
    if (!startDate && !endDate) return true
    const odDate = new Date(od.startDate)
    const sDate = startDate ? new Date(startDate) : new Date("2000-01-01")
    const eDate = endDate ? new Date(endDate) : new Date("2100-01-01")
    return odDate >= sDate && odDate <= eDate
  })

  const filteredAch = achievements.filter((ach: any) => {
    if (!startDate && !endDate) return true
    const achDate = new Date(ach.date)
    const sDate = startDate ? new Date(startDate) : new Date("2000-01-01")
    const eDate = endDate ? new Date(endDate) : new Date("2100-01-01")
    return achDate >= sDate && achDate <= eDate
  })

  // Metrics Calculation
  const totalStudents = students.length
  const totalODs = filteredODs.length
  const verifiedAch = filteredAch.filter((a: any) => a.status === "VERIFIED").length
  const approvedODs = filteredODs.filter((o: any) => ["VERIFIED", "COMPLETED", "ACTIVITY_COMPLETED"].includes(o.status)).length
  const approvalRate = totalODs > 0 ? Math.round((approvedODs / totalODs) * 100) : 0

  // OD Breakdowns
  const eventTypeBreakdown: Record<string, number> = {}
  filteredODs.forEach((od: any) => {
    eventTypeBreakdown[od.eventType] = (eventTypeBreakdown[od.eventType] || 0) + 1
  })

  // Leaderboards
  const studentODCounts: Record<string, {name: string, count: number}> = {}
  filteredODs.forEach((od: any) => {
    const stu = students.find((s: any) => s.uid === od.studentUid) || {} as any
    if (!studentODCounts[od.studentUid]) studentODCounts[od.studentUid] = { name: stu.name || "Unknown", count: 0 }
    studentODCounts[od.studentUid].count += 1
  })
  const topODStudents = Object.values(studentODCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  const studentAchCounts: Record<string, {name: string, count: number}> = {}
  filteredAch.filter((a: any) => a.status === "VERIFIED").forEach((ach: any) => {
    const stu = students.find((s: any) => s.uid === ach.studentUid) || {} as any
    if (!studentAchCounts[ach.studentUid]) studentAchCounts[ach.studentUid] = { name: stu.name || ach.studentName || "Unknown", count: 0 }
    studentAchCounts[ach.studentUid].count += 1
  })
  const topAchStudents = Object.values(studentAchCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ── Screen Only: Controls ── */}
      <div className="print:hidden bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-[#003087]" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-[#003087]" />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => { setIsPresentationOpen(true); setShowIntroVideo(true); setCurrentSlide(0); }} className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded font-bold shadow-sm hover:bg-slate-800 transition-colors flex-1 md:flex-none justify-center">
            <MonitorPlay className="h-4 w-4" /> Present
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded font-bold shadow-sm hover:bg-[#002266] transition-colors flex-1 md:flex-none justify-center">
            <Printer className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Print Only: Official Header ── */}
      <div className="hidden print:block mb-8 border-b-2 border-[#003087] pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 w-full">
            <img src="/new-logo.png" alt="RIT Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-bold text-slate-500">Report Type:</span> Class Performance & Analytics</p>
            <p><span className="font-bold text-slate-500">Class:</span> {classId || "—"}</p>
          </div>
          <div className="text-right">
            <p><span className="font-bold text-slate-500">Class Incharge:</span> {facultyName || "—"}</p>
            <p><span className="font-bold text-slate-500">Date Range:</span> {startDate ? new Date(startDate).toLocaleDateString() : "All Time"} to {endDate ? new Date(endDate).toLocaleDateString() : "All Time"}</p>
          </div>
        </div>
      </div>

      {/* ── Dashboard Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Total Students</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">ODs Processed</h3>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{totalODs}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Approval Rate</h3>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{approvalRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Achievements</h3>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{verifiedAch}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdowns */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4">OD Event Types</h3>
          <div className="space-y-3">
            {Object.entries(eventTypeBreakdown).length === 0 ? <p className="text-xs text-slate-500">No data available.</p> : null}
            {Object.entries(eventTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{type}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboards */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm print:shadow-none print:border-slate-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Top Achievers</h3>
          <div className="space-y-3">
            {topAchStudents.length === 0 ? <p className="text-xs text-slate-500">No data available.</p> : null}
            {topAchStudents.map((stu, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{stu.name}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                  <Award className="h-3 w-3" /> {stu.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Detailed Print Table (ODs) ── */}
      <div className="mt-8 bg-white rounded-lg border border-[#E2E8F0] shadow-sm print:shadow-none print:border-none print:mt-12 break-before-page">
        <div className="px-5 py-4 border-b border-[#E2E8F0] print:border-slate-800 print:px-0">
          <h3 className="text-sm font-bold text-slate-800 print:text-lg">Detailed OD Report</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] print:bg-slate-100 print:border-slate-400">
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Student Name</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Reg No</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Event Details</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Date Range</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] print:divide-slate-300">
              {filteredODs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No OD requests found in this date range.</td>
                </tr>
              ) : (
                filteredODs.map((od: any) => {
                  const stu = students.find((s: any) => s.uid === od.studentUid) || {} as any;
                  return (
                    <tr key={od.id}>
                      <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{stu.name || "Unknown"}</td>
                      <td className="px-5 py-3 font-mono text-slate-600 text-xs whitespace-nowrap">{stu.registerNumber || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{od.eventName} <br/><span className="text-xs text-slate-500">{od.organiser} · {od.eventType}</span></td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{od.startDate}{od.startDate !== od.endDate ? ` to ${od.endDate}` : ""}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${["VERIFIED", "COMPLETED", "ACTIVITY_COMPLETED"].includes(od.status) ? "bg-green-100 text-green-700 print:border print:border-green-600 print:bg-transparent" : od.status === "REJECTED" ? "bg-red-100 text-red-700 print:border print:border-red-600 print:bg-transparent" : "bg-slate-100 text-slate-600 print:border print:border-slate-400 print:bg-transparent"}`}>
                        {od.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detailed Print Table (Achievements) ── */}
      <div className="mt-8 bg-white rounded-lg border border-[#E2E8F0] shadow-sm print:shadow-none print:border-none print:mt-12 break-before-page">
        <div className="px-5 py-4 border-b border-[#E2E8F0] print:border-slate-800 print:px-0">
          <h3 className="text-sm font-bold text-slate-800 print:text-lg">Detailed Achievements Report</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] print:bg-slate-100 print:border-slate-400">
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Student Name</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Reg No</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Event / Achievement</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Date</th>
                <th className="px-5 py-3 font-bold text-slate-500 uppercase text-xs print:text-slate-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] print:divide-slate-300">
              {filteredAch.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No achievements found in this date range.</td>
                </tr>
              ) : (
                filteredAch.map((ach: any) => (
                  <tr key={ach.id}>
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{ach.studentName}</td>
                    <td className="px-5 py-3 font-mono text-slate-600 text-xs whitespace-nowrap">{ach.registerNumber}</td>
                    <td className="px-5 py-3 text-slate-700">{ach.title} <br/><span className="text-xs text-slate-500">{ach.eventName}</span></td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{ach.date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${ach.status === "VERIFIED" ? "bg-green-100 text-green-700 print:border print:border-green-600 print:bg-transparent" : "bg-slate-100 text-slate-600 print:border print:border-slate-400 print:bg-transparent"}`}>
                        {ach.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ── Presentation Viewer Overlay ── */}
      {isPresentationOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col animate-in fade-in duration-300 print:hidden">
          {/* Top Bar */}
          <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 relative z-20">
            <div className="flex items-center gap-4">
              {!showIntroVideo && <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300">Slide {currentSlide + 1} of {totalSlides}</span>}
              <h2 className="text-sm font-semibold text-white">Class Analytics Presentation</h2>
            </div>
            <div className="flex items-center gap-4">
              {showIntroVideo && (
                <button onClick={() => setShowIntroVideo(false)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Skip Intro
                </button>
              )}
              <button onClick={() => setIsPresentationOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Slide Content Area */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#020617]">
            {showIntroVideo ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video 
                  src="/intro_animation.mp4" 
                  autoPlay 
                  className="w-full h-full object-contain"
                  onEnded={() => setShowIntroVideo(false)}
                />
              </div>
            ) : (
              <>
                {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Left Nav */}
            <button 
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="absolute left-4 md:left-8 p-3 md:p-4 rounded-full bg-slate-800/50 text-white hover:bg-slate-700 disabled:opacity-0 transition-all z-10 backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Slides container */}
            <div className="w-full h-full max-w-5xl max-h-[75vh] bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
              
              {/* Slide 1: Title */}
              {currentSlide === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-700">
                  <div className="bg-white/90 p-4 rounded-2xl mb-8 shadow-2xl backdrop-blur-sm">
                    <img src="/new-logo.png" alt="RIT Logo" className="h-16 md:h-20 w-auto object-contain" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-indigo-300 mb-4 drop-shadow-sm">Class Analytics</h1>
                  <p className="text-xl md:text-2xl font-medium text-slate-300 mb-6 tracking-wide">Class {classId}</p>
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-blue-200 backdrop-blur-md shadow-inner">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-semibold tracking-wide">{startDate ? new Date(startDate).toLocaleDateString() : "All Time"} &mdash; {endDate ? new Date(endDate).toLocaleDateString() : "Present"}</span>
                  </div>
                </div>
              )}

              {/* Slide 2: Overview */}
              {currentSlide === 1 && (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 fade-in duration-700 overflow-y-auto">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 md:mb-8 text-center tracking-tight shrink-0">Performance Snapshot</h2>
                  <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl pb-4">
                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-blue-500/20 text-center shadow-lg transform transition-transform hover:scale-105">
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-400 mx-auto mb-2 opacity-80" />
                      <p className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{totalStudents}</p>
                      <p className="text-[10px] md:text-xs text-blue-200 font-bold uppercase tracking-widest">Total Students</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-950/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-500/20 text-center shadow-lg transform transition-transform hover:scale-105">
                      <FileText className="h-6 w-6 md:h-8 md:w-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                      <p className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{totalODs}</p>
                      <p className="text-[10px] md:text-xs text-indigo-200 font-bold uppercase tracking-widest">ODs Processed</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-500/20 text-center shadow-lg transform transition-transform hover:scale-105">
                      <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <p className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{approvalRate}%</p>
                      <p className="text-[10px] md:text-xs text-emerald-200 font-bold uppercase tracking-widest">Approval Rate</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-500/20 text-center shadow-lg transform transition-transform hover:scale-105">
                      <Award className="h-6 w-6 md:h-8 md:w-8 text-amber-400 mx-auto mb-2 opacity-80" />
                      <p className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{verifiedAch}</p>
                      <p className="text-[10px] md:text-xs text-amber-200 font-bold uppercase tracking-widest">Achievements</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3: OD Breakdown */}
              {currentSlide === 2 && (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 fade-in duration-700">
                  <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8 md:mb-12 text-center tracking-tight">Event Distribution</h2>
                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto pr-2" style={{ maxHeight: '50vh' }}>
                    {Object.entries(eventTypeBreakdown).map(([type, count], i) => (
                      <div key={type} className="flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md">
                        <span className="text-lg md:text-xl font-semibold text-slate-200">{type}</span>
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                          <span className="text-2xl md:text-3xl font-black text-blue-300">{count}</span>
                        </div>
                      </div>
                    ))}
                    {Object.entries(eventTypeBreakdown).length === 0 && (
                      <div className="col-span-1 md:col-span-2 text-center text-slate-500 py-8 text-lg">No OD data available.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Slide 4: Leaderboards */}
              {currentSlide === 3 && (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 fade-in duration-700">
                  <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8 md:mb-10 text-center tracking-tight">Top Performers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-5xl">
                    <div className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-3xl p-6 md:p-8 border border-amber-500/20 relative overflow-hidden flex flex-col max-h-[55vh]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50" />
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <Award className="h-8 w-8 text-amber-400 drop-shadow-md" />
                        <h3 className="text-2xl font-black text-white tracking-tight">Top Achievers</h3>
                      </div>
                      <div className="space-y-3 overflow-y-auto pr-2">
                        {topAchStudents.map((stu, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${i === 0 ? 'bg-amber-400 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'}`}>
                              {i + 1}
                            </div>
                            <span className="text-lg font-bold text-slate-100 flex-1 truncate">{stu.name}</span>
                            <span className="text-2xl font-black text-amber-400">{stu.count}</span>
                          </div>
                        ))}
                        {topAchStudents.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-b from-blue-500/10 to-transparent rounded-3xl p-6 md:p-8 border border-blue-500/20 relative overflow-hidden flex flex-col max-h-[55vh]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <FileText className="h-8 w-8 text-blue-400 drop-shadow-md" />
                        <h3 className="text-2xl font-black text-white tracking-tight">Most Active (ODs)</h3>
                      </div>
                      <div className="space-y-3 overflow-y-auto pr-2">
                        {topODStudents.map((stu, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-black text-white text-sm shrink-0 border border-white/10">{i + 1}</div>
                            <span className="text-lg font-bold text-slate-100 flex-1 truncate">{stu.name}</span>
                            <span className="text-2xl font-black text-blue-400">{stu.count}</span>
                          </div>
                        ))}
                        {topODStudents.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Nav */}
            <button 
              onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="absolute right-4 md:right-8 p-3 md:p-4 rounded-full bg-slate-800/50 text-white hover:bg-slate-700 disabled:opacity-0 transition-all z-10 backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
