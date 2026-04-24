"use client";

import { navLinks } from "@/data/quickLinks";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <nav
      className={clsx(
        "sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "shadow-md" : "shadow-none"
      )}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-3" aria-label="AIML Department Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
            AIML
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-800">AIML</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Dept. of AI &amp; ML
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-300 hover:text-blue-600",
                  "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300 hover:after:scale-x-100",
                  active && "font-semibold text-blue-600 after:scale-x-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={clsx(
          "overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto grid max-w-7xl gap-1 px-6 py-3">
          {navLinks.map((link, i) => {
            const active = isActive(link.href);
            const delayClass = i === 0 ? "delay-[0ms]" : i === 1 ? "delay-[50ms]" : i === 2 ? "delay-[100ms]" : i === 3 ? "delay-[150ms]" : i === 4 ? "delay-[200ms]" : i === 5 ? "delay-[250ms]" : i === 6 ? "delay-[300ms]" : "delay-[350ms]";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  delayClass,
                  open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
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
