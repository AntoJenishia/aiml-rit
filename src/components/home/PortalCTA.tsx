"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import RevealSection from "../RevealSection";

export default function PortalCTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0f1e] text-white">
      
      {/* Dynamic tech background */}
      <div className="absolute inset-0 dot-grid opacity-20 -z-10" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-600/20 rounded-full blur-[140px] -z-10 animate-pulse" />
      
      <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
        <RevealSection>
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-600/20 mb-8 ring-4 ring-blue-500/10">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Your Department.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Digitally Connected.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-blue-200/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            Manage academic activities, achievements and departmental records through one centralized platform.
          </p>
          
          <Link 
            href="/login"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-10 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all hover:bg-blue-50 hover:shadow-blue-500/20 hover:-translate-y-1 active:scale-95"
          >
            <span className="relative z-10">Login to Portal</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </RevealSection>
      </div>
    </section>
  );
}
