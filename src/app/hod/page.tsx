"use client";

import { hodData } from "@/data/hod";
import Image from "next/image";
import { Mail, Quote } from "lucide-react";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import ParticleCanvas from "@/components/ParticleCanvas";

export default function HodPage() {
  return (
    <div>
      {/* Hero — dark */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-20">
        <ParticleCanvas subtle />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-15 blur-[130px]"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full blur-[100px] opacity-10"
          style={{ background: "#7c3aed" }} aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <RevealSection>
              <div className="flex justify-center lg:justify-start">
                <div className="relative inline-block">
                  <Image src={hodData.photo} alt={hodData.name} width={256} height={320}
                    className="h-80 w-64 rounded-2xl object-cover transition-transform duration-500 hover:scale-[1.02]" priority />
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/50 ring-offset-4 ring-offset-[#0a0f1e]" />
                  <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-blue-600/20" />
                </div>
              </div>
            </RevealSection>
            <RevealSection delayMs={120}>
              <p className="text-xs uppercase tracking-widest text-blue-300">HEAD OF DEPARTMENT</p>
              <h1 className="mt-2 text-3xl font-black text-white lg:text-4xl">{hodData.name}</h1>
              <p className="mb-6 text-blue-300">{hodData.designation}</p>
              <p className="mb-2 text-blue-400/40"><Quote className="h-10 w-10" /></p>
              <p className="text-base italic leading-relaxed text-blue-100">{hodData.message}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[hodData.qualification, hodData.experience, hodData.specialization].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/20">
                    {chip}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/20">
                  <Mail className="h-3.5 w-3.5" />{hodData.email}
                </span>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <RevealSection>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">LEADERSHIP IMPACT</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1e3a8a] lg:text-4xl">Track Record &amp; Recognition</h2>
            <p className="mb-10 mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Highlights of academic leadership, mentoring, and departmental growth outcomes.
            </p>
          </RevealSection>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {hodData.highlights.map((item, i) => (
              <CardReveal key={item.label} delay={i * 90}>
                <div className="premium-card hover-glow group h-full p-6 text-center">
                  <p className="font-mono text-4xl font-black text-[#1e3a8a] transition-colors duration-300 group-hover:text-blue-600">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                </div>
              </CardReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <RevealSection>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">AREAS OF EXPERTISE</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1e3a8a] lg:text-4xl">Research &amp; Academic Focus</h2>
            <p className="mb-10 mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Specialized domains driving curriculum innovation, publications, and student projects.
            </p>
          </RevealSection>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hodData.expertise.map((item, i) => (
              <CardReveal key={item} delay={i * 65}>
                <div className="premium-card group flex h-full items-center justify-between px-6 py-4">
                  <p className="text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">{item}</p>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_8px_3px_rgba(37,99,235,0.4)]" />
                </div>
              </CardReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
