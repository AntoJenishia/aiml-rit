"use client";

import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import CardReveal from "../CardReveal";
import clsx from "clsx";

const updates = [
  {
    id: 1,
    date: "August 15, 2026",
    category: "Student Achievement",
    categoryColor: "text-amber-600 bg-amber-50",
    title: "1st Prize at National AI Hackathon",
    description: "Our AIML student team secured the first position at the National AI Hackathon 2026 for their innovative healthcare solution.",
    href: "#"
  },
  {
    id: 2,
    date: "August 10, 2026",
    category: "Workshop Announcement",
    categoryColor: "text-blue-600 bg-blue-50",
    title: "Upcoming Workshop on Generative AI",
    description: "A two-day hands-on workshop covering LLMs, diffusion models and prompt engineering techniques.",
    href: "#"
  },
  {
    id: 3,
    date: "August 02, 2026",
    category: "Research Publication",
    categoryColor: "text-violet-600 bg-violet-50",
    title: "Faculty Publishes Paper in IEEE",
    description: "Dr. Smith published a new research paper on deep learning optimizations in edge computing devices.",
    href: "#"
  }
];

export default function LatestUpdates() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
          <RevealSection>
            <SectionHeading
              title="Latest from the Department"
              subtitle="Stay updated with news, achievements and announcements."
            />
          </RevealSection>
          
          <RevealSection delay={200}>
            <Link 
              href="#"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All Updates
              <ArrowRight className="h-4 w-4" />
            </Link>
          </RevealSection>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {updates.map((update, i) => (
            <CardReveal key={update.id} delay={i * 100}>
              <div className="group h-full flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-900/5 hover:ring-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className={clsx("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider", update.categoryColor)}>
                    {update.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
                    <Calendar className="h-3.5 w-3.5" />
                    {update.date}
                  </div>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {update.title}
                </h4>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow">
                  {update.description}
                </p>
                
                <Link 
                  href={update.href}
                  className="inline-flex items-center gap-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600 mt-auto"
                >
                  Read More
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </CardReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
