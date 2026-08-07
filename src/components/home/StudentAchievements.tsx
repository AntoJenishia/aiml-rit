"use client";

import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import CardReveal from "../CardReveal";

const achievements = [
  {
    id: 1,
    prize: "1st Prize",
    event: "National AI Hackathon 2026",
    student: "John Doe",
    department: "AIML",
    year: "3rd Year",
    date: "Aug 2026"
  },
  {
    id: 2,
    prize: "Gold Medal",
    event: "State Level Data Science Symposium",
    student: "Jane Smith",
    department: "AI&DS",
    year: "4th Year",
    date: "Jul 2026"
  },
  {
    id: 3,
    prize: "Best Project Award",
    event: "Tech Innovators Challenge",
    student: "Alex Johnson",
    department: "AIML",
    year: "Final Year",
    date: "May 2026"
  },
  {
    id: 4,
    prize: "Runner Up",
    event: "Global Codeathon",
    student: "Sarah Lee",
    department: "AI&DS",
    year: "2nd Year",
    date: "Apr 2026"
  }
];

export default function StudentAchievements() {
  return (
    <section className="py-24 bg-[#0a0f1e] text-white relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-16">
          <RevealSection>
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">
                Student Excellence
              </h2>
              <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4 text-white">
                Celebrating Innovations and Accomplishments
              </h3>
              <p className="text-lg text-slate-400 leading-relaxed">
                Showcasing the achievements, innovations and milestones reached by our students on national and global platforms.
              </p>
            </div>
          </RevealSection>
          
          <RevealSection delayMs={200}>
            <Link 
              href="/achievements"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 active:scale-95 whitespace-nowrap"
            >
              View All Achievements
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, i) => (
            <CardReveal key={achievement.id} delay={i * 100}>
              <div className="group h-full flex flex-col rounded-3xl bg-white/5 p-6 border border-white/10 backdrop-blur-md transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-amber-500/30">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 ring-1 ring-amber-500/20">
                    <Award className="h-3.5 w-3.5" />
                    {achievement.prize}
                  </div>
                  <span className="text-xs font-medium text-slate-400">{achievement.date}</span>
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                  {achievement.event}
                </h4>
                
                <div className="mt-auto pt-6">
                  <p className="text-sm font-bold text-slate-200 mb-1">{achievement.student}</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {achievement.department} · {achievement.year}
                  </p>
                </div>
              </div>
            </CardReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
