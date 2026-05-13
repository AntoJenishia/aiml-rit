import Link from "next/link";
import { footerData, navLinks, contactData } from "@/data/quickLinks";
import { Mail, Phone, MapPin, Cpu } from "lucide-react";

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

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight text-white">AIML</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-400">
                Dept. of AI &amp; ML · RIT
              </span>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-blue-200/70">{footerData.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {footerData.socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-blue-200 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-600/15 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            {footerData.quickLinksTitle}
          </p>
          <ul className="mt-5 grid gap-2.5 text-sm text-blue-200/70">
            {navLinks.map((link) => (
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

        {/* Contact */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            {footerData.contactTitle}
          </p>
          <div className="mt-5 space-y-4 text-sm text-blue-200/70">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span>{contactData.addressLines.join(", ")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span>{contactData.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              <a
                href={`mailto:${contactData.email}`}
                className="transition-colors duration-200 hover:text-white"
              >
                {contactData.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-xs text-blue-400/60">
          © {new Date().getFullYear()} AIML Department · Rajalakshmi Institute of Technology · All rights reserved
        </div>
      </div>
    </footer>
  );
}
