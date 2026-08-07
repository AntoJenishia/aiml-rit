"use client";

import { navLinks } from "@/data/quickLinks";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/95 shadow-lg backdrop-blur-md border-slate-200" 
          : "bg-white border-slate-100"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4 relative">
        
        {/* Left: Logo */}
        <div className="z-10 flex shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-95">
            <div className="relative h-10 w-40 sm:h-12 sm:w-48 md:h-12 md:w-56 lg:h-14 lg:w-60 xl:w-64">
              <Image 
                src="/new-logo.png" 
                alt="Rajalakshmi Institute of Technology AIML Department" 
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-1 xl:gap-2 z-0 px-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group relative px-2 py-2 text-[11px] xl:text-[12px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                  active ? "text-blue-700" : "text-slate-800 hover:text-blue-600"
                )}
              >
                {link.label}
                <span className={clsx(
                  "absolute bottom-0 left-0 h-0.5 w-full scale-x-0 bg-blue-700 transition-transform duration-300 group-hover:scale-x-100",
                  active && "scale-x-100"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Right: Login Button & Mobile Toggle */}
        <div className="z-10 flex shrink-0 items-center gap-3 md:gap-4">
          <Link
            href="/login"
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-[12px] lg:text-[13px] font-bold uppercase tracking-wider text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
          >
            Portal Login
          </Link>
          
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "absolute left-0 top-full w-full overflow-hidden border-t border-slate-100 bg-white shadow-xl transition-all duration-300 xl:hidden",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 border-t-0 shadow-none"
        )}
      >
        <div className="grid gap-1 p-4">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all",
                  active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                )}
              >
                {link.label}
                <div className={clsx("h-1.5 w-1.5 rounded-full", active ? "bg-blue-600" : "bg-slate-200")} />
              </Link>
            );
          })}
          <Link
            href="/login"
            className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-blue-700"
          >
            Portal Login
          </Link>
        </div>
      </div>
    </header>
  );
}
