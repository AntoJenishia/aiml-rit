"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0c1a30] text-white border-t border-slate-800">
      
      {/* Decorative Circuit Board Lines in bottom-right corner */}
      <div className="pointer-events-none absolute right-0 bottom-0 opacity-25">
        <svg width="220" height="90" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 90 L 80 40 H 150 L 180 10 H 220" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="80" cy="40" r="3" fill="#38bdf8" />
          <circle cx="150" cy="40" r="3" fill="#38bdf8" />
          <circle cx="180" cy="10" r="3" fill="#38bdf8" />

          <path d="M 10 90 L 50 50 H 110" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="110" cy="50" r="2.5" fill="#0284c7" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Left: College Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block transition-opacity hover:opacity-95">
              <div className="relative h-10 w-44 sm:w-48 filter brightness-0 invert">
                <Image
                  src="/new-logo.png"
                  alt="RIT"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* Center: Tagline */}
          <div className="text-xs sm:text-sm text-slate-300 font-medium">
            <span className="font-bold text-white">AIML Department Portal</span>
            <span className="mx-2 text-slate-500">|</span>
            <span className="text-slate-400">Smarter Learning. Stronger Tomorrow.</span>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Help
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} Department of Artificial Intelligence &amp; Machine Learning (AIML), Rajalakshmi Institute of Technology. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
