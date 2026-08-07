import Link from "next/link";
import Image from "next/image";
import { footerData, navLinks, contactData } from "@/data/quickLinks";
import { Mail, Phone, MapPin, Cpu, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-[#0a0f1e] text-white"
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #60a5fa 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      {/* Top glow accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
        style={{ background: "linear-gradient(90deg, transparent, #3b82f6, transparent)" }}
        aria-hidden="true"
      />
      {/* Ambient orb */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full opacity-10 blur-[100px]"
        style={{ background: "#2563eb" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Brand */}
        <div>
          <div className="flex flex-col items-start gap-5">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-xl shadow-lg transition-transform hover:scale-105">
              <div className="relative h-10 w-40 sm:h-12 sm:w-48">
                <Image 
                  src="/new-logo.png" 
                  alt="RIT AIML Department" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <div className="flex flex-col leading-tight border-l-2 border-blue-500/50 pl-3">
              <span className="text-base font-extrabold tracking-tight text-white">AIML &amp; AI&amp;DS</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-400 mt-1">
                Rajalakshmi Institute of Technology
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-blue-200/70">
            Building intelligent systems, shaping responsible innovators for the future of technology.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Quick Links
          </p>
          <ul className="mt-5 grid gap-2.5 text-sm text-blue-200/70">
            {navLinks.filter(link => ["Home", "About", "Faculty", "Achievements", "Events", "Research", "Contact"].includes(link.label)).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center gap-2 transition-colors duration-200 hover:text-white"
                >
                  <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Portal */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Portal
          </p>
          <ul className="mt-5 grid gap-2.5 text-sm text-blue-200/70">
            <li>
              <Link href="/login" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                Student Portal
              </Link>
            </li>
            <li>
              <Link href="/login" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                Faculty Portal
              </Link>
            </li>
            <li>
              <Link href="/login" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                HOD Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Connect */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Connect
          </p>
          <ul className="mt-5 grid gap-2.5 text-sm text-blue-200/70">
            <li>
              <a href="#" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-px w-3 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-xs text-blue-400/60">
          © {new Date().getFullYear()} Department of AIML &amp; AI&amp;DS, Rajalakshmi Institute of Technology. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
