"use client";

import Link from "next/link";
import { ArrowRight, Brain, Network, Eye, LineChart } from "lucide-react";
import RevealSection from "../RevealSection";
import CardReveal from "../CardReveal";

const researchAreas = [
  {
    title: "Artificial Intelligence",
    description: "Developing intelligent systems capable of human-like reasoning and decision making.",
    icon: Brain,
    color: "blue"
  },
  {
    title: "Machine Learning",
    description: "Creating algorithms that improve through experience and data analysis.",
    icon: Network,
    color: "violet"
  },
  {
    title: "Computer Vision",
    description: "Extracting meaningful information from digital images, videos and visual inputs.",
    icon: Eye,
    color: "sky"
  },
  {
    title: "Data Science & Analytics",
    description: "Extracting knowledge and insights from structured and unstructured data.",
    icon: LineChart,
    color: "emerald"
  }
];

export default function ResearchInnovation() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#090f1d] text-white">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-12 items-end justify-between mb-16">
          <RevealSection>
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">
                Research &amp; Innovation
              </h2>
              <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                Pioneering the Future of Technology
              </h3>
              <p className="text-lg text-slate-400 leading-relaxed">
                Our faculty and students actively explore emerging technologies through research, projects, publications and innovation-driven initiatives.
              </p>
            </div>
          </RevealSection>
          
          <RevealSection delayMs={200}>
            <Link 
              href="/research"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 active:scale-95 whitespace-nowrap"
            >
              Explore Research
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {researchAreas.map((area, i) => {
            const Icon = area.icon;
            return (
              <CardReveal key={area.title} delay={i * 100}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="mb-6 inline-flex rounded-xl bg-white/10 p-3 text-white ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:ring-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-3">{area.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </CardReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
