export interface EventRegistration {
  id?: string
  eventId: string
  uid: string
  name: string
  email: string
  department?: string
  currentYear?: string
  registerNumber?: string
  registeredAt: string
}

export async function getRegistrationsByUser(uid: string): Promise<EventRegistration[]> {
  const res = await fetch(`/api/registrations?uid=${uid}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
  const res = await fetch(`/api/registrations?eventId=${eventId}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function getAllRegistrations(): Promise<EventRegistration[]> {
  const res = await fetch("/api/registrations", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function registerForEvent(eventId: string, uid: string, name: string, email: string) {
  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, uid, name, email }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function unregisterFromEvent(eventId: string, uid: string) {
  const res = await fetch("/api/registrations", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, uid }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}
