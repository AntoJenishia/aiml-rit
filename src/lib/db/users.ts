import type { UserRole } from "@/lib/auth"

export interface FirestoreUser {
  uid: string
  email: string
  name: string
  role: UserRole
  photoURL: string
  createdAt: { seconds: number }
  lastLogin: { seconds: number }
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  const res = await fetch("/api/users", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function updateUserRole(uid: string, role: UserRole) {
  const res = await fetch("/api/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, role }),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}
