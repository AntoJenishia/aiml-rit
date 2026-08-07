"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import FacultyCarousel from "../FacultyCarousel";
import { faculty } from "@/data/faculty";

export default function FacultySpotlight() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-16">
          <RevealSection>
            <SectionHeading
              title="Meet Our Faculty"
              subtitle="Learn from experienced educators, researchers and technology professionals."
            />
          </RevealSection>
          
          <RevealSection delay={200}>
            <Link 
              href="/faculty"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              View All Faculty
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>

        {/* Reusing FacultyCarousel which expects `faculties` */}
        <div className="-mx-6 px-6 pb-8">
          <RevealSection delay={300}>
            <FacultyCarousel faculty={faculty.slice(0, 8)} />
          </RevealSection>
        </div>

      </div>
    </section>
  );
}
