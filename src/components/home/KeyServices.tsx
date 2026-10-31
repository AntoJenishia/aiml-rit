"use client";

import Link from "next/link";
import { 
  GraduationCap, 
  CalendarCheck, 
  Bell, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import RevealSection from "../RevealSection";
import CardReveal from "../CardReveal";

const services = [
  {
    id: "academics",
    title: "Academics",
    description: "Syllabus, Results, Course Materials",
    href: "/syllabus",
    icon: GraduationCap,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-200 hover:shadow-blue-500/10"
  },
  {
    id: "attendance",
    title: "Attendance",
    description: "View & Track Attendance",
    href: "/dashboard",
    icon: CalendarCheck,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-200 hover:shadow-emerald-500/10"
  },
  {
    id: "notices",
    title: "Notices",
    description: "Latest Updates & Announcements",
    href: "/events",
    icon: Bell,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-200 hover:shadow-amber-500/10"
  },
  {
    id: "events",
    title: "Events",
    description: "Workshops, Seminars, Hackathons",
    href: "/events",
    icon: Calendar,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    hoverBorder: "hover:border-purple-200 hover:shadow-purple-500/10"
  },
  {
    id: "resources",
    title: "Resources",
    description: "Notes, PDFs, Important Links",
    href: "/syllabus",
    icon: BookOpen,
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    hoverBorder: "hover:border-cyan-200 hover:shadow-cyan-500/10"
  },
  {
    id: "community",
    title: "Community",
    description: "Connect, Collaborate, Grow",
    href: "/activities",
    icon: Users,
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    hoverBorder: "hover:border-rose-200 hover:shadow-rose-500/10"
  }
];

export default function KeyServices() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50/60 to-white relative overflow-hidden">
      
      {/* Subtle circuit background hint */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="services-circuit" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 0 60 L 40 60 L 60 40 L 100 40" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="60" cy="40" r="2.5" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#services-circuit)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading and info */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <RevealSection>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284c7] mb-3">
                <span className="w-5 h-0.5 bg-[#0284c7] rounded-full" />
                QUICK ACCESS
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15] mb-4">
                Explore <span className="text-[#0284c7]">Key Services</span>
              </h2>
              
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
                Access your academic resources, manage your profile, track events and stay connected with the AIML community.
              </p>
              
              <div>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0284c7] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#0284c7] transition-all hover:bg-[#0284c7] hover:text-white shadow-sm hover:shadow-md hover:shadow-sky-500/20 active:scale-95"
                >
                  <span>View All Services</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </RevealSection>
          </div>

          {/* Right Column: 6 Cards in 2x3 Grid */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <CardReveal key={service.id} delay={index * 60}>
                    <Link
                      href={service.href}
                      className={`group relative flex items-start gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-slate-100 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${service.hoverBorder}`}
                    >
                      {/* Icon */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${service.bgColor} ${service.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pr-4">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug">
                          {service.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      {/* Arrow in bottom right */}
                      <div className="absolute right-4 bottom-4 text-slate-300 group-hover:text-[#0284c7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </CardReveal>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

