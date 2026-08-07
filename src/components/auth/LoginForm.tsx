"use client"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Shield, ArrowRight, UserCircle, Key, Eye, EyeOff } from "lucide-react"
import ParticleCanvas from "@/components/ParticleCanvas"

import { Suspense } from "react"

function LoginFormInner() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  
  // Staff credentials state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #eef2ff 50%, #f8faff 100%)" }}>

      {/* Mouse-reactive particle canvas */}
      <div className="absolute inset-0 overflow-hidden"><ParticleCanvas subtle /></div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      {/* Split Card Container */}
      <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative z-10 flex flex-col md:flex-row border border-white/50 my-auto">
        
        {/* LEFT PANEL: Branding (Hidden on Mobile) */}
        <div className="hidden md:flex w-full md:w-[45%] bg-[#002855] relative p-8 md:p-10 flex-col justify-between overflow-hidden rounded-l-3xl">
          {/* Background Glows for Left Panel */}
          <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle,#3b82f6,transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }} />
            
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Logo */}
            <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-xl">
              <div className="relative h-14 w-56 sm:w-64">
                <Image src="/new-logo.png" alt="RIT" fill className="object-contain object-center" priority sizes="300px" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-[2rem] font-black text-white leading-tight mb-3">
              Student &amp; Staff <br/><span className="text-blue-400">Portal</span>
            </h1>
            <p className="text-blue-100/80 text-[13px] font-medium leading-relaxed max-w-[280px]">
              AI &amp; Machine Learning Department <br/>
              Rajalakshmi Institute of Technology
            </p>
          </div>
          
          <div className="relative z-10 mt-10 md:mt-12">
            <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors">
              ← Back to Public Site
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col justify-center bg-white relative rounded-3xl md:rounded-l-none">
          
          <div className="max-w-[360px] w-full mx-auto">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
              <Link href="/">
                <div className="relative h-10 w-40 mb-3 mx-auto">
                  <Image src="/new-logo.png" alt="RIT" fill className="object-contain object-center" priority sizes="200px" />
                </div>
              </Link>
              <h1 className="text-lg font-black text-slate-800 leading-tight">
                Student &amp; Staff <span className="text-blue-600">Portal</span>
              </h1>
            </div>

            <div className="mb-6 hidden md:block">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-700 mb-3">
                <Shield className="h-3 w-3" /> Secure Access
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-0.5">Please sign in to your account</p>
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
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">Access Denied</p>
                <p className="text-xs text-red-500 mt-1">
                  {activeTab === "student" 
                    ? "Only valid college emails (name.regno@aiml.ritchennai.edu.in) are permitted."
                    : "Invalid username or password. Please try again."}
                </p>
              </div>
            )}

            {activeTab === "student" ? (
              <div className="space-y-6">
                <button
                  onClick={() => { setLoading(true); signIn("google", { callbackUrl: "/dashboard" }) }}
                  disabled={loading}
                  className="group hero-btn-primary relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl py-4 px-6 min-h-[52px] font-semibold text-white active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className="hero-btn-shine" />
                  <span className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
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
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium">
                  <Shield className="h-3 w-3" />
                  <span>RIT college email required · Secured by Google</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. jsmith"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-11 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="group relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-[#2563eb] py-4 px-6 min-h-[52px] font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-md shadow-blue-600/20"
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
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium mt-4">
                  <Shield className="h-3 w-3" />
                  <span>Authorized faculty and staff only</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginFormInner />
    </Suspense>
  )
}
