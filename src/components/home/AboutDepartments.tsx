"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Cpu } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import CardReveal from "../CardReveal";

export default function AboutDepartments() {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-50/50 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 dot-grid opacity-50 -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Intro text */}
        <RevealSection>
          <div className="max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">
              About the Department
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Where Intelligence Meets Innovation
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              The Department of Artificial Intelligence &amp; Machine Learning (AIML) is committed to developing technically skilled, innovative and industry-ready professionals.
              <br/><br/>
              Our academic ecosystem combines strong foundations in computer science, artificial intelligence, machine learning, and emerging intelligent technologies with practical learning, research and real-world experiences.
            </p>
            <Link 
              href="/about" 
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-95"
            >
              Explore More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </RevealSection>

        {/* Department Focus Pillars */}
        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {/* Card 1: Core AI & Intelligent Systems */}
          <CardReveal delay={100}>
            <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 transition-all hover:shadow-xl hover:shadow-blue-900/5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                  Artificial Intelligence &<br/>Cognitive Systems
                </h4>
                <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                  Focused on intelligent systems, neural architectures, computer vision, natural language processing, and cutting-edge generative AI models.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
                >
                  Explore Specialization
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </CardReveal>

          {/* Card 2: Machine Learning & Applied Engineering */}
          <CardReveal delay={250}>
            <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 transition-all hover:shadow-xl hover:shadow-indigo-900/5">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-transform duration-500 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                  <Cpu className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                  Machine Learning &<br/>Applied Engineering
                </h4>
                <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                  Focused on predictive modeling, reinforcement learning, deep learning workflows, intelligent automation, and production-grade AI deployment.
                </p>
                <Link
                  href="/syllabus"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  View Curriculum & Labs
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </CardReveal>
        </div>

      </div>
    </section>
  );
}
