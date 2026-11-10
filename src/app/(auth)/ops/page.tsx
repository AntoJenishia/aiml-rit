import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata = {
  title: "Faculty & Staff Login | AIML Operations Portal",
  description: "Sign in to the RIT AIML Faculty and Administration Portal.",
}

export default function OpsLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #eef2ff 50%, #f8faff 100%)" }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-[#003087]" />
        </div>
      }
    >
      <LoginForm forcedMode="ops" />
    </Suspense>
  )
}

