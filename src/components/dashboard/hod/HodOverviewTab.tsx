"use client"
import { Users, GraduationCap, FileText, Award, CalendarDays, TrendingUp, Building2, ChevronRight } from "lucide-react"

interface HodOverviewProps {
  departmentFilter: "ALL" | "AIML" | "AIDS"
  metrics: {
    totalStudents: number
    totalFaculty: number
    totalBatches: number
    activeSections: number
    pendingOD: number
    pendingAchievements: number
    pendingPortfolios: number
    upcomingEvents: number
    aiml: { students: number, faculty: number, pendingOD: number, achievements: number }
    aids: { students: number, faculty: number, pendingOD: number, achievements: number }
  }
}

export default function HodOverviewTab({ departmentFilter, metrics }: HodOverviewProps) {
  return (
    <div className="space-y-6">
      {/* ── High Level Metrics ── */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
        <div className="bg-[#003087] px-4 py-2.5 flex items-center justify-between border-b border-[#002266]">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Core Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</span>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.totalStudents}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Active Enrollments</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Faculty</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.totalFaculty}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Active Staff</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending OD</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.pendingOD}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Requires Approval</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Achievements</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.pendingAchievements}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Department Comparison Overview ── */}
      {departmentFilter === "ALL" && (
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* AIML Card */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            <div className="bg-[#003087] px-4 py-2.5 flex items-center justify-between border-b border-[#002266]">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                AIML Department
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Students</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aiml.students}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Faculty</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aiml.faculty}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending OD</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aiml.pendingOD}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Achievements</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aiml.achievements}</p>
              </div>
            </div>
          </div>

          {/* AIDS Card */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            <div className="bg-[#312e81] px-4 py-2.5 flex items-center justify-between border-b border-[#1e1b4b]">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-300" />
                AI&DS Department
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Students</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aids.students}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Faculty</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aids.faculty}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending OD</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aids.pendingOD}</p>
              </div>
              <div className="bg-white p-3 hover:bg-slate-50 transition-colors">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Achievements</p>
                <p className="text-xl font-black text-[#0A192F]">{metrics.aids.achievements}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Academic Overview & Action Required ── */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#003087]" /> Academic Structure
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Active Batches</span>
              <span className="text-sm font-black text-slate-800">{metrics.totalBatches}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Active Sections</span>
              <span className="text-sm font-black text-slate-800">{metrics.activeSections}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Upcoming Events</span>
              <span className="text-sm font-black text-slate-800">{metrics.upcomingEvents}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pending Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">OD Verifications</p>
                  <p className="text-xs text-slate-500">Requires final HOD override</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black">{metrics.pendingOD}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><Award className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Achievement Approvals</p>
                  <p className="text-xs text-slate-500">Pending public publication</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">{metrics.pendingAchievements}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Faculty Portfolios</p>
                  <p className="text-xs text-slate-500">Awaiting profile update approval</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">{metrics.pendingPortfolios}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
