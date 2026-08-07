"use client";

import Link from "next/link";
import { ChevronDown, Cpu, Network } from "lucide-react";
import NeuralNetCanvas from "./NeuralNetCanvas";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0a0f1e]">
      
      {/* ── Background Animations ── */}
      <NeuralNetCanvas />

      {/* ── Ambient glow orbs ── */}
      <div
        className="pointer-events-none absolute left-[15%] top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[10%] top-[60%] h-[380px] w-[380px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ── Main hero content ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 items-center px-6 pt-24 pb-32 lg:pt-0 lg:pb-40">
        
        <div className="flex flex-col items-center w-full text-center">
          
          {/* Main Content */}
          <div className="flex flex-col items-center justify-center">


            {/* Title */}
            <h1
              className="hero-fadein text-4xl font-black leading-[1.15] tracking-tighter text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "150ms" }}
            >
              Empowering <span className="hero-gradient-text">Innovation</span>.<br/>
              Building Intelligent <span className="hero-gradient-text">Futures</span>.
            </h1>
            
            {/* Supporting Identity */}
            <div 
              className="hero-fadein mt-8 flex flex-col items-center justify-center gap-4 border-y border-white/10 py-6 w-full max-w-2xl" 
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-base font-semibold leading-relaxed tracking-wide text-white/90 sm:text-lg lg:text-xl px-2">
                Department of Artificial Intelligence &amp; Machine Learning (AIML)
              </h2>
              <div className="h-px w-12 bg-blue-500/40 rounded-full" />
              <h2 className="text-base font-semibold leading-relaxed tracking-wide text-white/90 sm:text-lg lg:text-xl px-2">
                Department of Artificial Intelligence &amp; Data Science (AI&amp;DS)
              </h2>
            </div>

            {/* Description */}
            <p
              className="hero-fadein mt-10 max-w-2xl text-base sm:text-lg leading-loose text-slate-400 px-4"
              style={{ animationDelay: "450ms" }}
            >
              Building an intelligent academic ecosystem where students learn, innovate, research and create technology for the future.
            </p>

            {/* CTAs */}
            <div
              className="hero-fadein mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ animationDelay: "600ms" }}
            >
              <Link
                href="/about"
                className="hero-btn-primary group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold tracking-wide text-white"
              >
                <span className="relative z-10">Explore Departments</span>
                <span className="hero-btn-shine" aria-hidden="true" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold tracking-wide text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white active:scale-95"
              >
                Portal Login
              </Link>
            </div>
          </div>

          </div>

        </div>



      {/* ── Scroll indicator ── */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-500">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>

      {/* Add keyframes inline for floating animation since it's specific to this hero */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </section>
  );
}
