"use client";

import Link from "next/link";
import { ArrowRight, Users, FileText, Trophy, PieChart } from "lucide-react";
import RevealSection from "../RevealSection";
import CardReveal from "../CardReveal";

const features = [
  {
    title: "Student Management",
    description: "Maintain structured student profiles, academic history and departmental activities.",
    icon: Users,
    color: "blue"
  },
  {
    title: "OD Tracking",
    description: "Track physical OD letters, approvals, official activities and supporting records digitally.",
    icon: FileText,
    color: "violet"
  },
  {
    title: "Achievement Management",
    description: "Collect, verify and maintain student achievements with supporting certificates and proof.",
    icon: Trophy,
    color: "amber"
  },
  {
    title: "Audit & Reports",
    description: "Generate monthly, semester-wise and departmental reports for efficient academic administration.",
    icon: PieChart,
    color: "emerald"
  }
];

export default function DigitalPortalFeature() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      
      {/* Decorative background */}
      <div className="absolute inset-0 bg-slate-50/50 -z-10" />
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-50/80 to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <RevealSection>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Digital Platform
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                One Department.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                  One Digital Ecosystem.
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
                A centralized platform designed to simplify student records, faculty portfolios, official activities, achievements and departmental reporting.
              </p>
              
              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95"
              >
                Access Department Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <CardReveal key={feature.title} delay={i * 100}>
                  <div className="group h-full bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:shadow-blue-900/5 hover:ring-blue-200 hover:-translate-y-1">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardReveal>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
