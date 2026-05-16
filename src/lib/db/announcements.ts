export interface Announcement {
  id?: string
  title: string
  body: string
  target: "all" | "students" | "staff"
  postedBy: string
  createdAt?: { seconds: number } | null
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/announcements", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function addAnnouncement(data: Omit<Announcement, "id" | "createdAt">) {
  const res = await fetch("/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
  const res = await fetch("/api/announcements", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function deleteAnnouncement(id: string) {
  const res = await fetch("/api/announcements", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}
