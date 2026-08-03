export interface AdminEvent {
  id?: string
  title: string
  startDate: string
  endDate: string
  description: string
  venue: string
  type: string
  createdBy: string
  posterURL?: string
  createdAt?: { seconds: number } | null
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const res = await fetch("/api/events", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function addAdminEvent(data: Omit<AdminEvent, "id">) {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function updateAdminEvent(id: string, data: Partial<AdminEvent>) {
  const res = await fetch("/api/events", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function deleteAdminEvent(id: string) {
  const res = await fetch("/api/events", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}
