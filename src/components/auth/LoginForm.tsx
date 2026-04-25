"use client"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Shield, ArrowRight } from "lucide-react"
import ParticleCanvas from "@/components/ParticleCanvas"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const searchParams          = useSearchParams()
  useEffect(() => { if (searchParams.get("error")) setError(true) }, [searchParams])

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(160deg,#f8faff 0%,#eef2ff 40%,#f0f4ff 70%,#f8faff 100%)" }}>

      {/* Mouse-reactive particle canvas — SAME component as public site */}
      <div className="absolute inset-0"><ParticleCanvas subtle /></div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#3b82f6,transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 bg-[#003366] text-white hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">
          <span className="text-[13px] font-medium text-white/70">
            AI &amp; Machine Learning Department — Rajalakshmi Institute of Technology
          </span>
          <Link href="/" className="text-[12px] font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors">
            ← Back to Public Site
          </Link>
        </div>
      </div>

      {/* RIT header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
          <div className="relative h-14 w-full md:h-20">
            <Image src="/rit-header.png" alt="RIT AIML" fill className="object-contain object-center" priority sizes="100vw" />
          </div>
        </div>
      </div>

      {/* Centered card */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="premium-card"
            style={{ boxShadow: "0 12px 48px -12px rgba(37,99,235,0.18),0 2px 8px -2px rgba(15,23,42,0.06)" }}>

            {/* Gradient top line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] z-10 rounded-t-2xl"
              style={{ background:"linear-gradient(90deg,#2563eb,#818cf8,#60a5fa,#2563eb)", backgroundSize:"300%", animation:"gradientFlow 5s ease infinite" }} />

            <div className="p-8 pb-6">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                  <Shield className="h-3.5 w-3.5" /> Secure Portal Access
                </span>
              </div>

              {/* Heading */}
              <div className="text-center mb-7">
                <h1 className="text-[2.6rem] font-black tracking-tight leading-[1.08]"
                  style={{ background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#818cf8 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Student &amp; Staff<br />Portal
                </h1>
                <p className="text-slate-500 text-sm mt-3 font-medium">Sign in with your RIT institutional Google account</p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">Access Denied</p>
                  <p className="text-xs text-red-500 mt-0.5">Only @ritchennai.edu.in accounts are allowed.</p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sign In With</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Google button using hero-btn-primary */}
              <button
                onClick={() => { setLoading(true); signIn("google", { callbackUrl: "/dashboard" }) }}
                disabled={loading}
                className="group hero-btn-primary relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl py-4 px-6 font-semibold text-white active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                <span className="hero-btn-shine" />
                <span className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue with Google<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                )}
              </button>
            </div>

            <div className="border-t border-slate-100 px-8 py-3 flex items-center justify-center gap-1.5 text-slate-400 text-[11px] bg-slate-50/60 rounded-b-2xl">
              <Shield className="h-3 w-3" />
              <span>RIT institutional email required · Secured by Google OAuth 2.0</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center md:hidden">
            <Link href="/" className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">← Back to Public Site</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
