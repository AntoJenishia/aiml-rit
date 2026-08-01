import AdminNav from "@/components/admin/AdminNav"
import { Suspense } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
      <Suspense fallback={<div className="w-64 bg-[#091326] hidden md:block" />}>
        <AdminNav />
      </Suspense>
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
