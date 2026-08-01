"use client"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Shield, ArrowRight, UserCircle, Key } from "lucide-react"
import ParticleCanvas from "@/components/ParticleCanvas"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  
  // Staff credentials state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [staffLoading, setStaffLoading] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => { if (searchParams.get("error")) setError(true) }, [searchParams])

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    
    setStaffLoading(true)
    setError(false)
    
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    
    if (res?.error) {
      setError(true)
      setStaffLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

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
      <div className="relative z-10 flex flex-1 items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="premium-card"
            style={{ boxShadow: "0 12px 48px -12px rgba(37,99,235,0.18),0 2px 8px -2px rgba(15,23,42,0.06)" }}>

            {/* Gradient top line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] z-10 rounded-t-2xl"
              style={{ background:"linear-gradient(90deg,#2563eb,#818cf8,#60a5fa,#2563eb)", backgroundSize:"300%", animation:"gradientFlow 5s ease infinite" }} />

            <div className="p-5 sm:p-8 pb-5 sm:pb-6">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                  <Shield className="h-3.5 w-3.5" /> Secure Portal Access
                </span>
              </div>

              {/* Heading */}
              <div className="text-center mb-7">
                <h1 className="text-[2rem] sm:text-[2.6rem] font-black tracking-tight leading-[1.08]"
                  style={{ background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#818cf8 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Student &amp; Staff<br />Portal
                </h1>
                <p className="text-slate-500 text-sm mt-3 font-medium">Select your role to sign in</p>
              </div>

              {/* Role Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab("student"); setError(false) }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                    activeTab === "student"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("staff"); setError(false) }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                    activeTab === "staff"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Faculty / HOD
                </button>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">Access Denied</p>
                  <p className="text-xs text-red-500 mt-1">
                    {activeTab === "student" 
                      ? "Only valid college emails (name.regno@aiml.ritchennai.edu.in) are permitted."
                      : "Invalid username or password. Please try again."}
                  </p>
                </div>
              )}

              {activeTab === "student" ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sign In With</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Google button using hero-btn-primary */}
                  <button
                    onClick={() => { setLoading(true); signIn("google", { callbackUrl: "/dashboard" }) }}
                    disabled={loading}
                    className="group hero-btn-primary relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl py-4 px-6 min-h-[48px] font-semibold text-white active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
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
                </>
              ) : (
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. jsmith"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={staffLoading}
                    className="group relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 px-6 min-h-[48px] font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {staffLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Authenticating…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-slate-100 px-8 py-3 flex items-center justify-center gap-1.5 text-slate-400 text-[11px] bg-slate-50/60 rounded-b-2xl">
              <Shield className="h-3 w-3" />
              <span>{activeTab === "student" ? "RIT college email required · Secured by Google" : "Authorized faculty and staff only"}</span>
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
