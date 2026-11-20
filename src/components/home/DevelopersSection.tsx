"use client";

import { ExternalLink, Code2, Sparkles, Terminal } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";

interface Developer {
  name: string;
  role: string;
  headline: string;
  department: string;
  initials: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  linkedinUrl: string;
  skills: string[];
}

const developers: Developer[] = [
  {
    name: "Devaprakash J",
    role: "Lead Full-Stack Developer",
    headline: "System Architecture & Core Engineering",
    department: "Department of AIML",
    initials: "DJ",
    gradient: "from-blue-600 via-indigo-600 to-sky-500",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "Lead Developer",
    linkedinUrl: "https://www.linkedin.com/in/devaprakashj/",
    skills: ["Next.js", "System Design", "Cloud Infra", "API Architecture"],
  },
  {
    name: "Anto Jenishia",
    role: "Full-Stack Developer",
    headline: "UI/UX & Portal Engineering",
    department: "Department of AIML",
    initials: "AJ",
    gradient: "from-violet-600 via-purple-600 to-indigo-500",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeText: "Full-Stack Dev",
    linkedinUrl: "https://www.linkedin.com/in/antojenishia/",
    skills: ["React & Next.js", "TypeScript", "Tailwind CSS", "Database Design"],
  },
  {
    name: "Praveen M",
    role: "Full-Stack Developer",
    headline: "Backend Services & System Integration",
    department: "Department of AIML",
    initials: "PM",
    gradient: "from-cyan-600 via-teal-600 to-blue-600",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    badgeText: "Full-Stack Dev",
    linkedinUrl: "https://www.linkedin.com/in/praveen-m-899438309/",
    skills: ["Full-Stack Dev", "Security & Auth", "PDF Engine", "Performance"],
  },
];

// SVG Icon for LinkedIn
function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default function DevelopersSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50/70 to-white relative overflow-hidden border-t border-slate-100">
      {/* Background Tech Mesh / Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-teal-400/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <RevealSection>
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Engineering &amp; Innovation</span>
            </div>
            <SectionHeading
              title="Portal Developers"
              subtitle="Designed, architected, and engineered by passionate students and developers from the Department of Artificial Intelligence & Machine Learning."
              align="center"
            />
          </div>
        </RevealSection>

        {/* 3 Developer Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {developers.map((dev, idx) => (
            <RevealSection key={dev.name} delayMs={idx * 150}>
              <div className="group relative h-full flex flex-col justify-between bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1.5">
                {/* Subtle top card accent line */}
                <div
                  className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${dev.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                <div>
                  {/* Top: Avatar & Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6 pt-1">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${dev.gradient} flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20 ring-4 ring-white group-hover:scale-105 transition-transform duration-300`}
                      >
                        {dev.initials}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${dev.badgeBg}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {dev.badgeText}
                    </span>
                  </div>

                  {/* Name & Headline */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dev.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      {dev.role}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      {dev.department}
                    </p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {dev.headline}
                    </p>
                  </div>

                  {/* Skill Chips */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 mb-6">
                    {dev.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* LinkedIn Button */}
                <a
                  href={dev.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:shadow-[#0077B5]/20 group-hover:translate-y-0"
                >
                  <LinkedInIcon className="w-4 h-4 text-white" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-100 ml-0.5" />
                </a>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
