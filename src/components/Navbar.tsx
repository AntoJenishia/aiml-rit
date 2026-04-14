"use client";

import { navLinks } from "@/data/quickLinks";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname?.startsWith(href);
    };
  }, [pathname]);

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-white/30 bg-white/80 shadow-sm backdrop-blur-md"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="relative h-9 w-[140px] overflow-hidden rounded-md ring-1 ring-white/50">
            <Image src="/rit-header.png" alt="RIT" fill sizes="140px" className="object-contain" priority />
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                  "text-slate-700 hover:text-slate-900",
                  "transition-colors"
                )}
              >
                <Icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                <span>{link.label}</span>
                {active ? (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/50 bg-white/60 p-2 text-slate-800 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-6xl border-t border-white/30 px-4 py-3 sm:px-6 lg:px-8">
              <div className="grid gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold",
                        active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
