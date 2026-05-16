"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { useUser } from "@/lib/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { parseStudentEmail, type ParsedStudentProfile } from "@/lib/parseStudentEmail"
import {
  CheckCircle2, ChevronRight, Hash, QrCode, User,
  Camera, Loader2, Shield, BookOpen, Calendar, GraduationCap,
  AlertTriangle,
} from "lucide-react"

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const { isLoading } = useAuth()
  const { uid, role, email, name: googleName } = useUser()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [parsed, setParsed] = useState<ParsedStudentProfile | null>(null)
  const [regNumber, setRegNumber] = useState("")
  const [qrData, setQrData] = useState("")
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  // Parse email client-side — no Firestore needed for auto-detection
  useEffect(() => {
    if (!email) return
    const result = parseStudentEmail(email)
    setParsed(result)
    setReady(true)
  }, [email])

  // Non-students skip onboarding
  useEffect(() => {
    if (!isLoading && role && role !== "student" && role !== "guest") {
      router.replace("/dashboard")
    }
  }, [isLoading, role, router])

  useEffect(() => {
    if (!uid) return
    fetch(`/api/users?uid=${uid}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.profileComplete) {
          router.replace("/dashboard/student")
        }
        if (data?.registerNumber) {
          setRegNumber(data.registerNumber)
          setStep(3)
        }
      })
      .catch(() => { })
  }, [uid, router])

  // Step 2: Save register number
  const handleSaveRegNumber = async () => {
    if (!regNumber.trim() || !uid) return
    setSaving(true)
    setError("")
    try {
      const payload: Record<string, unknown> = {
        uid,
        registerNumber: regNumber.trim(),
      }
      if (parsed) {
        payload.name = googleName || parsed.name
        payload.department = parsed.department
        payload.deptCode = parsed.deptCode
        payload.batch = parsed.batch
        payload.currentYear = parsed.currentYear
        payload.rollNumber = parsed.rollNumber
      }
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Check your connection.")
    }
    setSaving(false)
  }

  // Step 3: QR Scanner
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<unknown>(null)

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return
    setScanning(true)
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode("qr-reader")
      html5QrRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setQrData(decodedText)
          scanner.stop().catch(() => { })
          setScanning(false)
        },
        () => { } // ignore errors during scanning
      )
    } catch {
      setScanning(false)
      alert("Camera access denied or not available.")
    }
  }, [])

  const stopScanner = useCallback(() => {
    const scanner = html5QrRef.current as { stop: () => Promise<void> } | null
    if (scanner) {
      scanner.stop().catch(() => { })
    }
    setScanning(false)
  }, [])

  const handleComplete = async () => {
    if (!uid) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          idCardData: qrData || "manual-skip",
          profileComplete: true,
        }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      router.replace("/dashboard/student")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Check your connection.")
    }
    setSaving(false)
  }

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-400">Loading your profile…</p>
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1 as Step, label: "Confirm Details", icon: User },
    { num: 2 as Step, label: "Register No.", icon: Hash },
    { num: 3 as Step, label: "Link ID Card", icon: QrCode },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 mb-4">
            <GraduationCap className="h-3.5 w-3.5" /> Student Onboarding
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Complete Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Just a few steps to set up your student portal</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all
                ${step >= s.num
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "bg-slate-100 text-slate-400"}`}>
                {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className={`h-4 w-4 mx-1 ${step > s.num ? "text-blue-400" : "text-slate-300"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 text-xs font-semibold">Dismiss</button>
          </div>
        )}

        {/* Step Content Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">

          {/* ── STEP 1: Confirm Details ── */}
          {step === 1 && (
            <div className="p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" /> Confirm Your Details
              </h2>
              <p className="text-sm text-slate-500 mb-6">These were detected from your institutional email and are read-only.</p>

              <div className="space-y-3">
                <ProfileField icon={User} label="Name" value={googleName || "—"} />
                <ProfileField icon={BookOpen} label="Department" value={parsed?.department ?? "—"} />
                <ProfileField icon={Calendar} label="Batch" value={parsed?.batch ?? "—"} />
                <ProfileField icon={GraduationCap} label="Current Year" value={parsed?.currentYear ?? "—"} />
                <ProfileField icon={Hash} label="Roll Number" value={parsed?.rollNumber ?? "—"} />
                <ProfileField icon={Shield} label="Role" value="Student" />
              </div>

              <button onClick={() => setStep(2)}
                className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98]">
                Confirm & Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Register Number ── */}
          {step === 2 && (
            <div className="p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-600" /> Enter Register Number
              </h2>
              <p className="text-sm text-slate-500 mb-6">Enter your College register number. This cannot be changed later.</p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Register Number</label>
                <input
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. 7376222CS101"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base min-h-[44px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-2">This is your college-issued register number.</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 min-h-[44px] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  Back
                </button>
                <button
                  onClick={handleSaveRegNumber}
                  disabled={!regNumber.trim() || saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving…" : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Link ID Card ── */}
          {step === 3 && (
            <div className="p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" /> Link Your ID Card
              </h2>
              <p className="text-sm text-slate-500 mb-6">Scan the QR code on your student ID card to link it to your profile.</p>

              {/* QR Scanner area */}
              {!qrData ? (
                <div>
                  <div id="qr-reader" ref={scannerRef}
                    className="rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 min-h-[280px] flex items-center justify-center">
                    {!scanning && (
                      <div className="text-center p-8">
                        <Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm font-medium">Tap below to start scanning</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {!scanning ? (
                      <button onClick={startScanner}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                        <Camera className="h-4 w-4" /> Start Camera
                      </button>
                    ) : (
                      <button onClick={stopScanner}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 min-h-[44px] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                        Stop Scanning
                      </button>
                    )}
                  </div>

                  {/* Skip option */}
                  <button onClick={handleComplete}
                    disabled={saving}
                    className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 min-h-[44px] text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Skip for now →
                  </button>
                </div>
              ) : (
                <div>
                  {/* QR scan success */}
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-emerald-700">ID Card Linked Successfully!</p>
                    <p className="text-xs text-emerald-600 mt-1 font-mono break-all">{qrData}</p>
                  </div>

                  <button onClick={handleComplete}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all active:scale-[0.98]">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {saving ? "Finishing…" : "Complete Setup & Go to Dashboard"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress footer */}
        <p className="text-center text-xs text-slate-400 mt-6">Step {step} of 3</p>
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
