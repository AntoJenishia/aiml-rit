"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck 
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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setUserDropdown(false);
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

        {/* Right: User / Portal Dropdown & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* User Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-[#0284c7] hover:bg-sky-50/50"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="max-w-[100px] truncate">
                {session?.user?.name ? session.user.name.split(" ")[0] : "Student"}
              </span>
              <ChevronDown className={clsx("h-3 w-3 text-slate-400 transition-transform", userDropdown && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {userDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {session ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{session.user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#0284c7]" />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Portal
                    </p>
                    <Link
                      href="/login?role=student"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]"
                    >
                      <GraduationCap className="h-4 w-4 text-[#0284c7]" />
                      Student Portal
                    </Link>
                    <Link
                      href="/login?role=staff"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]"
                    >
                      <Briefcase className="h-4 w-4 text-emerald-600" />
                      Faculty Portal
                    </Link>
                    <Link
                      href="/login?role=hod"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      HOD / Admin Portal
                    </Link>
                    <div className="mt-1 pt-1 border-t border-slate-100">
                      <Link
                        href="/login"
                        className="flex items-center justify-center rounded-xl bg-[#0284c7] px-3 py-2 text-xs font-bold text-white hover:bg-[#0369a1]"
                      >
                        Portal Login
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

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
                className="flex items-center justify-center rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
              >
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
