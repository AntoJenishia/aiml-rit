"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  Cpu, 
  ArrowRight, 
  Play, 
  X,
  Sparkles,
  BookOpen,
  CalendarCheck,
  Bell,
  Calendar,
  MessageSquare,
  UserCheck
} from "lucide-react";

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f3f8fe] via-[#f9fbff] to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      
      {/* ── Background Circuit Pattern & Subtle Tech Glows ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div 
          className="absolute right-0 top-0 h-[650px] w-[650px] -translate-y-1/4 translate-x-1/4 rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, #0284c7 40%, transparent 70%)" }}
        />
        <div 
          className="absolute left-[-100px] top-[10%] h-[400px] w-[400px] rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)" }}
        />

        {/* Subtle Decorative Circuit Traces */}
        <svg 
          className="absolute inset-0 h-full w-full opacity-35" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M 50 120 H 220 L 260 160 H 420" 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="1.5" 
            strokeDasharray="4 6"
          />
          <circle cx="50" cy="120" r="3" fill="#0284c7" />
          <circle cx="420" cy="160" r="3" fill="#0284c7" />

          <path 
            d="M 850 80 H 1050 L 1100 130 H 1350" 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="1.5" 
            strokeDasharray="6 6"
          />
          <circle cx="850" cy="80" r="3.5" fill="#38bdf8" />
          <circle cx="1100" cy="130" r="3" fill="#38bdf8" />
          <circle cx="1350" cy="130" r="3.5" fill="#38bdf8" />

          <path 
            d="M 750 360 L 850 420 H 1150" 
            fill="none" 
            stroke="#93c5fd" 
            strokeWidth="1.5"
          />
          <circle cx="750" cy="360" r="3" fill="#3b82f6" />
          <circle cx="1150" cy="420" r="3" fill="#3b82f6" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ════════════════ LEFT COLUMN: CONTENT ════════════════ */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Small Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold text-[#0284c7] ring-1 ring-blue-100 shadow-sm w-fit mb-6">
              <span className="text-sm font-bold">→</span>
              <span className="tracking-wide">RIT • AIML DEPARTMENT</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12] mb-6">
              Welcome to <br />
              <span className="text-[#0284c7]">AIML Department Portal</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-lg text-base sm:text-lg text-slate-500 font-normal leading-relaxed mb-8">
              Your one-stop platform for academics, resources, events and everything AI &amp; ML.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <span>→</span>
                <span>Go to Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-700 group-hover:border-[#0284c7] group-hover:text-[#0284c7]">
                  <Play className="h-2.5 w-2.5 fill-slate-700 text-slate-700 group-hover:fill-[#0284c7] group-hover:text-[#0284c7] translate-x-0.5" />
                </div>
                <span className="group-hover:text-[#0284c7] transition-colors">Watch Overview</span>
              </button>
            </div>

            {/* 3 Department Stats Row */}
            <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0284c7]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-tight">400+</p>
                  <p className="text-xs font-medium text-slate-500">AIML Students</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-slate-200" aria-hidden="true" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0284c7]">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-tight">25+</p>
                  <p className="text-xs font-medium text-slate-500">Faculty Members</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-slate-200" aria-hidden="true" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0284c7]">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-tight">50+</p>
                  <p className="text-xs font-medium text-slate-500">Research Projects</p>
                </div>
              </div>
            </div>

          </div>

          {/* ════════════════ RIGHT COLUMN: 3D LAPTOP & AI GRAPHIC ════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-8 lg:pt-0">
            
            <div className="relative w-full max-w-[560px] flex items-center justify-center">

              {/* 1. Artistic "Learn Build Innovate" handwritten script in top-right */}
              <div className="absolute -top-10 sm:-top-8 right-2 sm:right-6 z-30 select-none pointer-events-none transform rotate-[-6deg]">
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-[#0284c7] font-serif italic drop-shadow-sm">
                    Learn
                  </span>
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-[#0369a1] font-serif italic -mt-1 drop-shadow-sm ml-4">
                    Build
                  </span>
                  <span className="text-2xl sm:text-3xl font-black tracking-wider text-[#0284c7] font-serif italic -mt-1 drop-shadow-sm ml-8">
                    Innovate
                  </span>
                  {/* Decorative underline swoosh */}
                  <svg className="w-24 h-4 text-[#38bdf8] -mt-1" viewBox="0 0 100 20" fill="none">
                    <path d="M5 10 Q 50 20 95 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* 2. Glowing Circular AI Tree Graphic in Background */}
              <div className="absolute top-2 sm:top-4 left-6 sm:left-14 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full overflow-hidden shadow-2xl shadow-blue-500/20 z-0">
                {/* Radial Gradient Disc */}
                <div className="w-full h-full relative bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0f2b5c] p-4 flex items-center justify-center">
                  
                  {/* AI Neural Tree SVG */}
                  <svg viewBox="0 0 200 200" className="w-full h-full text-white/90">
                    {/* Trunk */}
                    <path d="M 100 170 L 100 115" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                    
                    {/* Major Branches */}
                    <path d="M 100 135 L 75 110 L 60 75" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 100 135 L 125 110 L 140 75" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    
                    <path d="M 100 115 L 100 70 L 90 45" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 100 115 L 100 70 L 110 45" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    
                    <path d="M 75 110 L 45 105 L 35 80" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 125 110 L 155 105 L 165 80" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />

                    <path d="M 60 75 L 45 55" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 60 75 L 75 50" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 140 75 L 125 50" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 140 75 L 155 55" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />

                    {/* Glowing Neural Nodes */}
                    <circle cx="35" cy="80" r="4.5" fill="#38bdf8" />
                    <circle cx="45" cy="55" r="4" fill="#38bdf8" />
                    <circle cx="75" cy="50" r="4.5" fill="#ffffff" />
                    <circle cx="90" cy="45" r="5" fill="#38bdf8" />
                    <circle cx="110" cy="45" r="5" fill="#ffffff" />
                    <circle cx="125" cy="50" r="4.5" fill="#38bdf8" />
                    <circle cx="155" cy="55" r="4" fill="#ffffff" />
                    <circle cx="165" cy="80" r="4.5" fill="#38bdf8" />
                    <circle cx="100" cy="70" r="4.5" fill="#38bdf8" />
                    <circle cx="60" cy="75" r="4" fill="#ffffff" />
                    <circle cx="140" cy="75" r="4" fill="#ffffff" />
                    <circle cx="75" cy="110" r="4" fill="#38bdf8" />
                    <circle cx="125" cy="110" r="4" fill="#38bdf8" />
                  </svg>
                </div>
              </div>

              {/* 3. The 3D Laptop Device Mockup */}
              <div className="relative z-10 w-full pt-12 sm:pt-16 pb-4">
                
                {/* Laptop Display Chassis */}
                <div className="relative mx-auto w-[90%] sm:w-[94%] rounded-t-2xl bg-[#0f172a] p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800">
                  
                  {/* Web Camera Dot */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-slate-600" />
                  </div>

                  {/* Inside Laptop Screen */}
                  <div className="relative overflow-hidden rounded-lg bg-slate-50 border border-slate-200 aspect-[16/10]">
                    
                    <div className="flex h-full">
                      {/* Left Mini-Sidebar */}
                      <div className="w-12 sm:w-14 bg-[#0a192f] p-2 flex flex-col items-center justify-between py-3 shrink-0">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-6 w-6 rounded-lg bg-[#0284c7] flex items-center justify-center text-[9px] font-black text-white">
                            AI
                          </div>
                          <div className="h-4 w-4 text-[#38bdf8] flex items-center justify-center">
                            <Sparkles className="h-3 w-3" />
                          </div>
                          <div className="h-4 w-4 text-slate-400 flex items-center justify-center">
                            <BookOpen className="h-3 w-3" />
                          </div>
                          <div className="h-4 w-4 text-slate-400 flex items-center justify-center">
                            <CalendarCheck className="h-3 w-3" />
                          </div>
                          <div className="h-4 w-4 text-slate-400 flex items-center justify-center">
                            <Bell className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-slate-700" />
                      </div>

                      {/* Main Screen Content */}
                      <div className="flex-1 p-2.5 sm:p-4 overflow-hidden flex flex-col justify-between bg-gradient-to-br from-slate-50 to-blue-50/40">
                        
                        {/* Header inside screen */}
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] sm:text-xs font-bold text-slate-900 leading-tight">
                                Good Morning, Devaprakash
                              </p>
                              <p className="text-[8px] sm:text-[9px] text-slate-500">
                                Keep learning, Keep building 🚀
                              </p>
                            </div>
                            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">
                              DP
                            </div>
                          </div>
                        </div>

                        {/* 6 Mini Service Cards on Screen */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-auto">
                          
                          {/* 1. My Profile */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                              <UserCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">My Profile</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">View details</p>
                          </div>

                          {/* 2. Attendance */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                              <CalendarCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">Attendance</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">Check record</p>
                          </div>

                          {/* 3. Notices */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                              <Bell className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">Notices</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">Latest news</p>
                          </div>

                          {/* 4. Events */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">Events</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">Seminars</p>
                          </div>

                          {/* 5. Resources */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1">
                              <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">Resources</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">Study notes</p>
                          </div>

                          {/* 6. Community */}
                          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-none">Community</p>
                            <p className="text-[6px] sm:text-[8px] text-slate-400 mt-0.5 hidden sm:block">Connect</p>
                          </div>

                        </div>

                        {/* Subtle bottom bar on screen */}
                        <div className="h-1.5 rounded-full bg-slate-200/80 w-1/3 mx-auto" />

                      </div>
                    </div>

                  </div>
                </div>

                {/* Laptop Keyboard Base & Trackpad */}
                <div className="relative mx-auto w-[100%] h-3.5 sm:h-4.5 bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#64748b] rounded-b-xl shadow-xl flex items-start justify-center">
                  {/* Trackpad Notch */}
                  <div className="w-16 sm:w-24 h-1.5 bg-[#475569] rounded-b-sm opacity-80" />
                </div>
                {/* Cast Shadow beneath laptop */}
                <div className="mx-auto w-[92%] h-3 bg-black/20 blur-md rounded-full -mt-1" />

              </div>

              {/* 4. Realistic Stack of 3 Books on the Left of Laptop Base */}
              <div className="absolute -bottom-2 left-0 sm:left-4 z-20 hidden sm:flex flex-col items-start select-none">
                {/* Top Book: Machine Learning */}
                <div className="w-28 sm:w-32 h-4 sm:h-4.5 rounded bg-[#0284c7] border-l-4 border-l-[#0369a1] shadow-md flex items-center px-2 text-[8px] font-bold text-white tracking-wider">
                  Machine Learning
                </div>
                {/* Middle Book: Deep Learning */}
                <div className="w-32 sm:w-36 h-4 sm:h-4.5 rounded bg-[#1e40af] border-l-4 border-l-[#172554] shadow-md -mt-0.5 flex items-center px-2 text-[8px] font-bold text-white tracking-wider">
                  Deep Learning
                </div>
                {/* Bottom Book: Artificial Intelligence */}
                <div className="w-34 sm:w-40 h-4.5 sm:h-5 rounded bg-[#0f172a] border-l-4 border-l-[#334155] shadow-lg -mt-0.5 flex items-center px-2 text-[8px] font-bold text-white tracking-wider">
                  Artificial Intelligence
                </div>
              </div>

              {/* 5. Desk Plant in Ceramic Pot on the Right of Laptop */}
              <div className="absolute -bottom-2 -right-2 sm:right-2 z-20 hidden sm:flex flex-col items-center select-none">
                {/* Green Leaves */}
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <div className="absolute bottom-1 -left-1 h-8 w-4 rounded-full bg-emerald-500 rotate-[-25deg] shadow-sm" />
                  <div className="absolute bottom-2 left-2 h-9 w-4 rounded-full bg-green-500 rotate-[-10deg] shadow-sm" />
                  <div className="absolute bottom-2 right-2 h-9 w-4 rounded-full bg-emerald-600 rotate-[10deg] shadow-sm" />
                  <div className="absolute bottom-1 -right-1 h-8 w-4 rounded-full bg-green-600 rotate-[25deg] shadow-sm" />
                </div>
                {/* Ceramic White Pot */}
                <div className="w-9 h-8 bg-gradient-to-b from-white to-slate-200 rounded-b-xl border border-slate-200 shadow-md flex items-start justify-center pt-1">
                  <div className="w-7 h-1 bg-amber-900/60 rounded-full" />
                </div>
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
