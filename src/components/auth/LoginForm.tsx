"use client"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Shield, ArrowRight, Cpu, Brain, Network } from "lucide-react"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const searchParams          = useSearchParams()

  // Only run on client — prevents SSR/hydration mismatch
  useEffect(() => {
    if (searchParams.get("error")) setError(true)
  }, [searchParams])

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #f8faff 0%, #eef2ff 35%, #f5f8ff 65%, #f8faff 100%)",
      }}
    >
      {/* ── Dot grid (matches home page) ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2563eb22 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Atmospheric blue glows (matches BackgroundGlows) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }}
        />
      </div>

      {/* ── Floating AI icons (decorative) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { Icon: Cpu,     top: "12%",  left: "8%",   delay: "0s",   size: "h-8 w-8"   },
          { Icon: Brain,   top: "20%",  right: "10%", delay: "0.8s", size: "h-10 w-10" },
          { Icon: Network, bottom:"20%",left: "12%",  delay: "1.6s", size: "h-7 w-7"   },
          { Icon: Cpu,     bottom:"15%",right: "8%",  delay: "2.4s", size: "h-9 w-9"   },
        ].map(({ Icon, delay, size, ...pos }, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{ ...pos, animationDelay: delay, opacity: 0.06 }}
          >
            <Icon className={`${size} text-blue-700`} />
          </div>
        ))}
      </div>

      {/* ── Top bar (matches Navbar top utility bar) ── */}
      <div className="relative z-10 bg-[#003366] text-white hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">
          <span className="text-[13px] font-medium text-white/70">
            AI &amp; Machine Learning Department — RIT College of Engineering
          </span>
          <Link
            href="/"
            className="text-[12px] font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
          >
            ← Back to Public Site
          </Link>
        </div>
      </div>

      {/* ── RIT Header banner (matches Navbar branding section) ── */}
      <div className="relative z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
          <div className="relative h-14 w-full md:h-20">
            <Image
              src="/rit-header.png"
              alt="Rajalakshmi Institute of Technology — AIML Department"
              fill
              className="object-contain object-center"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700"
              style={{ boxShadow: "0 0 20px rgba(59,130,246,0.12)" }}
            >
              <Shield className="h-3.5 w-3.5" />
              Secure Portal Access
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-black tracking-tight leading-none"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Student &amp; Staff
              <br />Portal
            </h1>
            <p className="text-slate-500 text-sm mt-3 font-medium">
              Sign in with your RIT institutional Google account
            </p>
          </div>

          {/* Card — matches premium-card from the site */}
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-8"
            style={{ boxShadow: "0 2px 12px -4px rgba(15,23,42,0.08)" }}
          >
            {/* Shimmer sweep */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(115deg, transparent 25%, rgba(59,130,246,0.05) 50%, transparent 75%)",
              }}
            />

            {/* Top gradient line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, #2563eb, #60a5fa, #a78bfa, #2563eb)",
                backgroundSize: "200%",
                animation: "gradientFlow 4s ease infinite",
              }}
            />

            {/* Error alert */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">Access Denied</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Only @ritchennai.edu.in accounts are allowed.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Sign In With
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google button — hero-btn-primary style */}
            <button
              onClick={() => {
                setLoading(true)
                signIn("google", { callbackUrl: "/dashboard" })
              }}
              disabled={loading}
              className="group relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-4 px-6 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Hover shimmer */}
              <span className="hero-btn-shine" />

              {/* Google logo */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>

              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue with Google
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </button>

            {/* Supported accounts */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Supported Accounts
              </p>
              {[
                { label: "Students", value: "name.reg@aiml.ritchennai.edu.in", color: "text-emerald-600" },
                { label: "Staff",    value: "name@ritchennai.edu.in",           color: "text-blue-600"   },
                { label: "HOD",      value: "hod.aids@ritchennai.edu.in",       color: "text-violet-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className="w-14 shrink-0 font-semibold text-slate-400">{item.label}</span>
                  <span className={`font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
              <Shield className="h-3 w-3" />
              <span>RIT institutional email required · Secured by Google OAuth 2.0</span>
            </div>
          </div>

          {/* Back link for mobile */}
          <div className="mt-6 flex justify-center md:hidden">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
            >
              ← Back to Public Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
