"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  GraduationCap, 
  Cpu, 
  ArrowRight, 
  Play, 
  X,
  ShieldCheck,
  Briefcase,
  Award,
  BookOpen,
  CalendarCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  BarChart3
} from "lucide-react";

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<"student" | "faculty" | "admin">("student");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6ff] via-[#f8fbff] to-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
      
      {/* ── Background Subtle Tech Glows ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute right-[-100px] top-[-50px] h-[600px] w-[600px] rounded-full opacity-30 blur-[130px]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, #0284c7 40%, transparent 70%)" }}
        />
        <div 
          className="absolute left-[-150px] top-[15%] h-[450px] w-[450px] rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }}
        />
        {/* Dot pattern */}
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ════════════════ LEFT COLUMN: INSTITUTIONAL CONTENT ════════════════ */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Top Institutional Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 border border-blue-200/70 px-3.5 py-1.5 text-xs font-bold text-[#003087] shadow-xs w-fit mb-5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wide">RIT • DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; ML</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12] mb-5">
              Engineering the Future of <br className="hidden sm:inline" />
              <span className="text-[#003087]">Artificial Intelligence</span>
            </h1>

            {/* Institutional Subtitle */}
            <p className="max-w-xl text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed mb-7">
              Empowering future engineers with foundational deep learning, computer vision, natural language processing, and industry-grade autonomous systems at Rajalakshmi Institute of Technology.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-9">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#003087] hover:bg-[#002070] px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student Portal</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/ops"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-slate-400 hover:-translate-y-0.5 active:scale-95"
              >
                <Briefcase className="h-4 w-4 text-[#003087]" />
                <span>Faculty &amp; Staff (/ops)</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#003087] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#003087]">
                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                </div>
                <span>Overview Video</span>
              </button>
            </div>

            {/* 4 Department Trust Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80">
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-2xs">
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">400+</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">AIML Students</p>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-2xs">
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">25+</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Faculty Experts</p>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-2xs">
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">50+</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Research Papers</p>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 shadow-2xs">
                <p className="text-xl sm:text-2xl font-black text-emerald-700 leading-tight">98%</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Placement Record</p>
              </div>
            </div>

          </div>

          {/* ════════════════ RIGHT COLUMN: LIVE DEPARTMENT COMMAND HUB ════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0">
            
            <div className="w-full max-w-[560px] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,32,100,0.12)] overflow-hidden transition-all">
              
              {/* Hub Top Bar with Institution Details */}
              <div className="bg-[#002855] p-4 sm:p-5 text-white flex items-center justify-between border-b border-blue-900/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-md">
                    <div className="relative h-7 w-7">
                      <Image src="/new-logo.png" alt="RIT" fill className="object-contain" priority sizes="40px" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                        Department Command Center
                      </p>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      AIML Integrated Academic Portal
                    </h3>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md text-blue-100 border border-white/20">
                    AY 2024–2025
                  </span>
                </div>
              </div>

              {/* Portal Selector Tabs */}
              <div className="bg-slate-100/80 p-1.5 border-b border-slate-200 flex gap-1">
                <button
                  type="button"
                  onClick={() => setActivePortalTab("student")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePortalTab === "student"
                      ? "bg-white text-[#003087] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePortalTab("faculty")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePortalTab === "faculty"
                      ? "bg-white text-[#003087] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Faculty Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePortalTab("admin")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePortalTab === "admin"
                      ? "bg-white text-[#003087] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HOD Suite</span>
                </button>
              </div>

              {/* Interactive Showcase Content */}
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* 1. STUDENT PORTAL PREVIEW */}
                {activePortalTab === "student" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                          Student Academic Roster
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          Daily Attendance &amp; OD Request Engine
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Anna University 75% attendance criteria tracking, digital proof uploads &amp; verified achievements.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance Record</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">Automated Tracker</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">OD &amp; Leave Synced</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">On-Duty (OD)</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">Paperless Approvals</p>
                        <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Faculty Signed Letters</p>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className="w-full py-3 px-4 rounded-xl bg-[#003087] hover:bg-[#002070] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/15"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Sign In to Student Portal</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}

                {/* 2. FACULTY PORTAL PREVIEW */}
                {activePortalTab === "faculty" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between gap-3 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                          Faculty &amp; Class Incharge Desk
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          Section Attendance &amp; Verification Workflow
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Assigned class attendance marking, student OD approvals, and student leave reviews with proof inspection.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 shrink-0">
                        Restricted
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Classes</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">Dedicated Incharges</p>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Daily Register Lock</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Document Proofs</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">In-App Inspection</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Zoom &amp; Verified Badges</p>
                      </div>
                    </div>

                    <Link
                      href="/ops"
                      className="w-full py-3 px-4 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/15"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Access Faculty Portal (/ops)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}

                {/* 3. HOD SUITE PREVIEW */}
                {activePortalTab === "admin" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                          Executive Administration
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          HOD Analytics &amp; Institutional Governance
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Master reports, date-range achievements PDF exports with certificate annexures, and security audit logs.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 shrink-0">
                        Admin Only
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Formal Reports</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">PDF &amp; Annexures</p>
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Official Proof Copies</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Security Audit</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">Full Log Trails</p>
                        <p className="text-[10px] text-purple-700 font-semibold mt-0.5">IP &amp; Geolocation Logs</p>
                      </div>
                    </div>

                    <Link
                      href="/ops"
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Open HOD Administration (/ops)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}

              </div>

              {/* Bottom Institutional Accreditations Footer Strip */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Autonomous Institution
                </span>
                <span className="text-slate-300">•</span>
                <span>NBA &amp; NAAC &apos;A+&apos;</span>
                <span className="text-slate-300">•</span>
                <span>Anna University</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── Video Modal: Plays /intro_animation.mp4 when clicked ── */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full">
              <video
                src="/intro_animation.mp4"
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
