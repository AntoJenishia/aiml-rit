import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata = {
  title: "Student Login | AIML Department Portal",
  description: "Sign in to the RIT AIML Student Portal.",
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      }
    >
      <LoginForm forcedMode="student" />
    </Suspense>
  )
}
