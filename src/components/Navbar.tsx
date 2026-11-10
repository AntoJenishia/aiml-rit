"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Menu, 
  X, 
  LogIn
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Academics", href: "/syllabus" },
  { label: "Resources", href: "/about" },
  { label: "Community", href: "/activities" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 shadow-md backdrop-blur-md border-slate-200/80"
          : "bg-white border-slate-100"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-36 sm:h-12 sm:w-44 md:w-48">
              <Image
                src="/new-logo.png"
                alt="Rajalakshmi Institute of Technology"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-slate-300" aria-hidden="true" />
            
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#0f2b5c]">
                AIML
              </span>
              <span className="rounded-full bg-[#0284c7] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm shadow-sky-500/30">
                DEPARTMENT PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative py-1 text-sm font-semibold transition-colors",
                  active
                    ? "text-[#0284c7] font-bold"
                    : "text-slate-600 hover:text-[#0284c7]"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-[#0284c7]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Direct Login Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#003087] hover:bg-[#002266] text-white px-5 py-2 text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Login</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-sky-50 text-[#0284c7]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#003087] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
