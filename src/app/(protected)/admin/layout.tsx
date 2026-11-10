import AdminNav from "@/components/admin/AdminNav"
import AdminTopbar from "@/components/admin/AdminTopbar"
import { Suspense } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Academic Header with Mobile Hamburger */}
      <Suspense fallback={<header className="h-16 bg-[#003087]" />}>
        <AdminTopbar />
      </Suspense>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Sidebar Drawer on Mobile / Permanent on Desktop */}
        <Suspense fallback={<div className="w-64 bg-[#0A192F] hidden md:block shrink-0" />}>
          <AdminNav />
        </Suspense>

        {/* Content Area with Horizontal Scroll Prevention */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
