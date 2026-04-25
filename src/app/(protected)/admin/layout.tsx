import AdminNav from "@/components/admin/AdminNav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f5f8ff 100%)" }}>
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
