"use client"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Shield, ArrowRight, UserCircle, Key, Eye, EyeOff, Briefcase, GraduationCap, Lock } from "lucide-react"
import ParticleCanvas from "@/components/ParticleCanvas"

interface LoginFormProps {
  forcedMode?: "student" | "ops"
}

function LoginFormInner({ forcedMode }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Determine mode: ops if forced, on /ops path, or role=ops/staff in query
  const isOps =
    forcedMode === "ops" ||
    pathname === "/ops" ||
    searchParams.get("role") === "ops" ||
    searchParams.get("role") === "staff" ||
    searchParams.get("role") === "hod"

  // Credentials state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (searchParams.get("error")) setError(true)
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setLoading(true)
    setError(false)

    const res = await signIn("credentials", {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    })

    if (res?.error || !res?.ok) {
      console.error("[LoginForm] Login failed with error:", res?.error)
      setError(true)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-3.5 sm:p-6"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #eef2ff 50%, #f8faff 100%)",
      }}
    >
      {/* Mouse-reactive particle canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleCanvas subtle />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />

      {/* Split Card Container */}
      <div className="w-full max-w-[880px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,32,100,0.12)] relative z-10 flex flex-col md:flex-row border border-white/60 my-auto overflow-hidden">
        {/* LEFT PANEL: Institutional Branding (Hidden on mobile) */}
        <div className="hidden md:flex w-full md:w-[44%] relative p-8 md:p-10 flex-col justify-between overflow-hidden bg-[#002855]">
          {/* Background Glows for Left Panel */}
          <div
            className="absolute -top-32 -left-32 h-[380px] w-[380px] rounded-full opacity-35 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #3b82f6, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #60a5fa, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-start text-left">
            {/* Logo Card */}
            <div className="bg-white p-3.5 rounded-2xl inline-block mb-8 shadow-xl">
              <div className="relative h-12 w-52">
                <Image
                  src="/new-logo.png"
                  alt="RIT"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="240px"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-3">
              {isOps ? (
                <>
                  <Briefcase className="w-3 h-3 text-sky-300" /> Faculty &amp; Staff Portal
                </>
              ) : (
                <>
                  <GraduationCap className="w-3 h-3 text-sky-300" /> Student Portal
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              {isOps ? (
                <>
                  Faculty &amp; Staff <br />
                  <span className="text-blue-400">Portal</span>
                </>
              ) : (
                <>
                  Student <br />
                  <span className="text-blue-400">Portal</span>
                </>
              )}
            </h1>

            <p className="text-blue-100/75 text-xs font-medium leading-relaxed max-w-[280px]">
              {isOps
                ? "Department of Artificial Intelligence & Machine Learning • Faculty & Administration Portal"
                : "Department of Artificial Intelligence & Machine Learning • Official Student Access"}
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            >
              ← Back to Department Home
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="w-full md:w-[56%] p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white relative">
          <div className="max-w-[350px] w-full mx-auto">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex flex-col items-center text-center mb-6 pb-4 border-b border-slate-100">
              <Link href="/">
                <div className="relative h-11 w-44 mb-3 mx-auto">
                  <Image
                    src="/new-logo.png"
                    alt="RIT"
                    fill
                    className="object-contain object-center"
                    priority
                    sizes="200px"
                  />
                </div>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#003087]">
                {isOps ? "Faculty & Staff Portal" : "Student Portal"}
              </span>
            </div>

            {/* Desktop Form Title */}
            <div className="mb-6 hidden md:block">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#003087] mb-2.5">
                <Shield className="h-3 w-3" />
                {isOps ? "Faculty & HOD Portal" : "Student Sign In"}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isOps
                  ? "Sign in with your staff code or college email"
                  : "Sign in with your register number or college email"}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 animate-in fade-in">
                <p className="text-xs font-bold text-red-700">Access Denied</p>
                <p className="text-[11px] text-red-500 mt-0.5">
                  {isOps
                    ? "Invalid staff code or password. Please verify your credentials."
                    : "Invalid register number or password. Please verify and try again."}
                </p>
              </div>
            )}

            {/* Form with Clean Inputs (No Cluttering Labels) */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isOps ? (
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  ) : (
                    <UserCircle className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(false)
                  }}
                  placeholder={
                    isOps
                      ? "Staff Code or College Email (e.g. CS91)"
                      : "Register Number or College Email"
                  }
                  aria-label={isOps ? "Staff Code or Email" : "Register Number or Email"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#003087] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]/15 transition-all shadow-2xs"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  placeholder="Password"
                  aria-label="Password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#003087] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]/15 transition-all shadow-2xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl py-3.5 px-5 font-bold text-white text-xs sm:text-sm bg-[#003087] hover:bg-[#002266] shadow-md shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {isOps ? "Sign In as Faculty / HOD" : "Sign In as Student"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                )}
              </button>

              {/* Bottom security assurance */}
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-medium pt-2">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>
                  {isOps
                    ? "Authorized AIML Faculty & HOD Access"
                    : "Verified RIT AIML Students only"}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginForm({ forcedMode }: LoginFormProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
        </div>
      }
    >
      <LoginFormInner forcedMode={forcedMode} />
    </Suspense>
  )
}
