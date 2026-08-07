import AdminNav from "@/components/admin/AdminNav"
import AdminTopbar from "@/components/admin/AdminTopbar"
import { Suspense } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Academic Header */}
      <Suspense fallback={<header className="h-16 bg-[#003087]" />}>
        <AdminTopbar />
      </Suspense>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Suspense fallback={<div className="w-64 bg-[#0A192F] hidden md:block shrink-0" />}>
          <AdminNav />
        </Suspense>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
