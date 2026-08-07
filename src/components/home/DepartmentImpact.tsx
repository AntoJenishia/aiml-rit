"use client";

import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import { Users, Calendar, Trophy, BookOpen, Award } from "lucide-react";
import StatCard from "../StatCard"; // Re-using existing StatCard

const impactStats = [
  { label: "Students Participated", value: "1500", suffix: "+", icon: Users },
  { label: "Events & Activities", value: "240", suffix: "+", icon: Calendar },
  { label: "Achievements", value: "85", suffix: "+", icon: Trophy },
  { label: "Research Publications", value: "120", suffix: "+", icon: BookOpen },
  { label: "Certifications", value: "450", suffix: "+", icon: Award }
];

export default function DepartmentImpact() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        <RevealSection>
          <SectionHeading
            title="Our Impact"
            subtitle="Transforming education into real-world technological impact."
            align="center"
          />
        </RevealSection>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {impactStats.map((stat, i) => (
            <StatCard 
              key={stat.label} 
              icon={stat.icon} 
              label={stat.label} 
              value={stat.value} 
              suffix={stat.suffix} 
              delay={i * 100} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}
