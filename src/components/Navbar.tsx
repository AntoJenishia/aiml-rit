"use client";

import { navLinks } from "@/data/quickLinks";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  /* scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname?.startsWith(href);
    };
  }, [pathname]);

  return (
    <nav
      className={clsx(
        "sticky top-0 z-50 transition-shadow duration-300",
        "bg-white/90 backdrop-blur-md border-b border-slate-100",
        scrolled ? "shadow-md shadow-slate-200/60" : "shadow-none"
      )}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group" aria-label="AIML Department Home">
          <span className="text-xl font-extrabold tracking-tight text-[#2563eb] group-hover:text-[#1e3a8a] transition-colors duration-200">
            AIML
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400 mt-0.5">
            Dept. of AI &amp; ML
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  "text-slate-600 hover:text-blue-600",
                  "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600",
                  "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left",
                  active && "text-blue-600 font-semibold after:scale-x-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors duration-200 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu — CSS slide-down, stagger fade-in via delay classes */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={clsx(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto max-w-7xl border-t border-slate-100 px-4 pt-2 pb-4 sm:px-6 lg:px-8 grid gap-1">
          {navLinks.map((link, index) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: open ? `${index * 40}ms` : "0ms" }}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
                  "transition-colors duration-200",
                  open ? "animate-slideDown" : "",
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
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
