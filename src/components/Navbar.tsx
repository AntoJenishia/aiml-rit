"use client";

import { navLinks } from "@/data/quickLinks";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

function AimlLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="17" fill="url(#nbg)" />
      <circle cx="18" cy="9"  r="2.5" fill="white" opacity="0.95" />
      <circle cx="9"  cy="24" r="2.5" fill="white" opacity="0.85" />
      <circle cx="27" cy="24" r="2.5" fill="white" opacity="0.85" />
      <circle cx="18" cy="18" r="2"   fill="white" opacity="0.55" />
      <line x1="18" y1="9"  x2="9"  y2="24" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <line x1="18" y1="9"  x2="27" y2="24" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <line x1="9"  y1="24" x2="27" y2="24" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <line x1="18" y1="9"  x2="18" y2="18" stroke="white" strokeWidth="1"   opacity="0.35" />
      <line x1="9"  y1="24" x2="18" y2="18" stroke="white" strokeWidth="1"   opacity="0.35" />
      <line x1="27" y1="24" x2="18" y2="18" stroke="white" strokeWidth="1"   opacity="0.35" />
      <defs>
        <linearGradient id="nbg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav
      className={clsx(
        "sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl transition-all duration-300",
        scrolled ? "shadow-md shadow-slate-200/50" : "shadow-none"
      )}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5" aria-label="AIML Home">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <AimlLogo />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">AIML</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Dept. of AI &amp; ML
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  "hover:bg-blue-50 hover:text-blue-700",
                  "after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full",
                  "after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-250",
                  "hover:after:scale-x-100",
                  active ? "bg-blue-50 font-semibold text-blue-700 after:scale-x-100" : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto grid max-w-7xl gap-1 px-6 py-3">
          {navLinks.map((link, i) => {
            const active = isActive(link.href);
            const delay = ["0ms","50ms","100ms","150ms","200ms","250ms","300ms","350ms"][i] ?? "350ms";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                  active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
                style={{ transitionDelay: delay }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
