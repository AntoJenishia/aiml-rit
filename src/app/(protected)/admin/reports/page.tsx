// Server Component — can safely export metadata
import ReportsClient from "@/components/admin/ReportsClient"

export const metadata = { title: "Reports | AIML Admin" }

export default function ReportsPage() {
  return <ReportsClient />
}
