import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import type { UserRole } from "@/lib/auth"

export interface FirestoreUser {
  uid: string
  email: string
  name: string
  role: UserRole
  photoURL: string
  createdAt?: { seconds: number }
  lastLogin?: { seconds: number }
  // Student-specific profile fields
  department?: string
  deptCode?: string
  batch?: string
  currentYear?: string
  rollNumber?: string
  registerNumber?: string
  class?: string
  classId?: string | null
  semester?: string | number
  section?: string
  phone?: string
  profile?: string
  classIncharge?: string
  staffCode?: string
  // Faculty-specific fields
  isClassIncharge?: boolean
  designation?: string
  username?: string
  idCardData?: string
  idCardLinkedAt?: { seconds: number }
  // Profile completion flag
  profileComplete?: boolean
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

/**
 * Get a single student / user profile.
 * First calls /api/users (which queries Supabase), falls back to Firestore.
 */
export async function getStudentProfile(uid: string): Promise<FirestoreUser | null> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`)
      if (res.ok) {
        const data = await res.json()
        if (data) return data as FirestoreUser
      }
    }
  } catch {}

  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (!snap.exists()) return null
    return { uid: snap.id, ...snap.data() } as FirestoreUser
  } catch {
    return null
  }
}

/**
 * Update student profile fields directly.
 */
export async function updateStudentProfile(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  try {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, ...data }),
    })
  } catch {}

  try {
    await setDoc(doc(db, "users", uid), data, { merge: true })
  } catch {}
}
