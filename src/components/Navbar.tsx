"use client";

import { navLinks } from "@/data/quickLinks";
import { 
  Menu, 
  X, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter
} from "lucide-react";
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
    const onScroll = () => setScrolled(window.scrollY > 150);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="w-full">
      {/* 1. Top Utility Bar */}
      <div className="hidden bg-[#003366] text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-6 text-[13px] font-medium">
            <a href="mailto:mail@ritchennai.edu.in" className="flex items-center gap-2 transition hover:text-blue-200">
              <Mail className="h-3.5 w-3.5" />
              mail@ritchennai.edu.in
            </a>
            <a href="tel:+918925977445" className="flex items-center gap-2 transition hover:text-blue-200">
              <Phone className="h-3.5 w-3.5" />
              +91 89259 77445
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-white/20 pr-4 text-[12px] font-semibold uppercase tracking-wider">
              <Link href="/contact" className="hover:text-blue-200">Contact Us</Link>
              <Link href="#" className="hover:text-blue-200">Admissions</Link>
              <Link href="#" className="hover:text-blue-200">Alumni</Link>
            </div>
            <div className="flex items-center gap-3">
              <Youtube className="h-3.5 w-3.5 cursor-pointer transition hover:text-blue-200" />
              <Instagram className="h-3.5 w-3.5 cursor-pointer transition hover:text-blue-200" />
              <Facebook className="h-3.5 w-3.5 cursor-pointer transition hover:text-blue-200" />
              <Linkedin className="h-3.5 w-3.5 cursor-pointer transition hover:text-blue-200" />
              <Twitter className="h-3.5 w-3.5 cursor-pointer transition hover:text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Branding Image Section */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex-1 transition-opacity hover:opacity-95">
              <div className="relative h-12 w-full md:h-16 lg:h-24">
                <Image 
                  src="/rit-header.png" 
                  alt="Rajalakshmi Institute of Technology AIML Department Header" 
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Link>
            
            {/* Mobile toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar (Sticky) */}
      <nav
        className={clsx(
          "z-50 w-full transition-all duration-300",
          scrolled 
            ? "fixed top-0 border-b border-slate-200 bg-white/95 shadow-lg backdrop-blur-md" 
            : "relative border-b border-slate-100 bg-white"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
          <div className="hidden w-full items-center justify-center gap-2 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "group relative px-5 py-4 text-[13px] font-bold uppercase tracking-wider transition-colors",
                    active ? "text-blue-700" : "text-slate-800 hover:text-blue-600"
                  )}
                >
                  {link.label}
                  <span className={clsx(
                    "absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-blue-700 transition-transform duration-300 group-hover:scale-x-100",
                    active && "scale-x-100"
                  )} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={clsx(
            "overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden",
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
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
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <a href="mailto:mail@ritchennai.edu.in" className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Mail className="h-3 w-3" /> EMAIL
              </a>
              <a href="tel:+918925977445" className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Phone className="h-3 w-3" /> CALL US
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer for sticky nav when scrolled */}
      {scrolled && <div className="hidden h-[54px] md:block" />}
    </header>
  );
}


