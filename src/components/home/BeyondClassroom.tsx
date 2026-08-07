"use client";

import { Code2, Trophy, Hammer, Building2, Cpu, Users } from "lucide-react";
import RevealSection from "../RevealSection";
import CardReveal from "../CardReveal";
import SectionHeading from "../SectionHeading";

const activities = [
  { title: "Hackathons", icon: Code2, color: "bg-rose-50 text-rose-600 ring-rose-100" },
  { title: "Competitions", icon: Trophy, color: "bg-amber-50 text-amber-600 ring-amber-100" },
  { title: "Workshops", icon: Hammer, color: "bg-blue-50 text-blue-600 ring-blue-100" },
  { title: "Industrial Visits", icon: Building2, color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  { title: "Technical Activities", icon: Cpu, color: "bg-violet-50 text-violet-600 ring-violet-100" },
  { title: "Student Clubs", icon: Users, color: "bg-sky-50 text-sky-600 ring-sky-100" }
];

export default function BeyondClassroom() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        
        <RevealSection>
          <SectionHeading
            title="Beyond the Classroom"
            subtitle="Learning extends beyond classrooms through competitions, innovation, technical activities, industry exposure and collaborative experiences."
            align="center"
          />
        </RevealSection>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {activities.map((item, i) => {
            const Icon = item.icon;
            return (
              <CardReveal key={item.title} delay={i * 75}>
                <div className="group flex flex-col items-center text-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1.5 hover:shadow-md hover:ring-blue-200 h-full">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">
                    {item.title}
                  </h4>
                </div>
              </CardReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
