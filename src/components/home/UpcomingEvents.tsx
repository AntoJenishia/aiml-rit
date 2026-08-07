"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import RevealSection from "../RevealSection";
import CardReveal from "../CardReveal";
import SectionHeading from "../SectionHeading";

const upcomingEvents = [
  {
    id: 1,
    date: "Sep 15, 2026",
    title: "International Conference on AI",
    type: "Conference",
    organizer: "AIML Department",
    venue: "Main Auditorium, RIT",
    description: "Join global researchers and industry leaders to discuss the future of AI and machine learning.",
    tagColor: "bg-blue-100 text-blue-700"
  },
  {
    id: 2,
    date: "Oct 05, 2026",
    title: "Data Science Bootcamp",
    type: "Workshop",
    organizer: "AI&DS Department",
    venue: "Lab 4, Tech Block",
    description: "A hands-on workshop covering data preprocessing, visualization, and basic machine learning models.",
    tagColor: "bg-violet-100 text-violet-700"
  },
  {
    id: 3,
    date: "Nov 12, 2026",
    title: "AI Hackathon 2026",
    type: "Hackathon",
    organizer: "Student Club",
    venue: "Innovation Center",
    description: "A 48-hour hackathon to build intelligent solutions for real-world problems.",
    tagColor: "bg-emerald-100 text-emerald-700"
  }
];

export default function UpcomingEvents() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* Background element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-slate-50/50 skew-x-12 -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-16">
          <RevealSection>
            <SectionHeading
              title="What's Happening"
              subtitle="Upcoming workshops, hackathons, seminars and technical events."
            />
          </RevealSection>
          
          <RevealSection delay={200}>
            <Link 
              href="/events"
              className="group inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-200 active:scale-95 whitespace-nowrap"
            >
              View All Events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {upcomingEvents.map((event, i) => (
            <CardReveal key={event.id} delay={i * 100}>
              <div className="group h-full flex flex-col rounded-3xl bg-white p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 transition-all hover:-translate-y-2 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] hover:ring-blue-300">
                
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.tagColor}`}>
                    {event.type}
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {event.title}
                </h4>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-8 flex-grow">
                  {event.description}
                </p>
                
                <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{event.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    href={`/events/${event.id}`}
                    className="inline-flex items-center justify-center w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </CardReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
