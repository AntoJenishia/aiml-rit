import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import type { UserRole } from "@/lib/auth"

export interface FirestoreUser {
  uid: string
  email: string
  name: string
  role: UserRole
  photoURL: string
  createdAt: { seconds: number }
  lastLogin: { seconds: number }
  // Student-specific profile fields (auto-populated from email)
  department?: string
  deptCode?: string
  batch?: string
  currentYear?: string
  rollNumber?: string
  // Manually entered by student
  registerNumber?: string
  // QR-linked ID card data
  idCardData?: string
  idCardLinkedAt?: { seconds: number }
  // Profile completion flag
  profileComplete?: boolean
  // Faculty-specific fields
  isClassIncharge?: boolean
  classId?: string | null
  username?: string
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
 * Client-side Firestore: Get a single student profile directly.
 * Uses the Firebase JS SDK (WebChannel) which works reliably from the browser.
 */
export async function getStudentProfile(uid: string): Promise<FirestoreUser | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (!snap.exists()) return null
    return { uid: snap.id, ...snap.data() } as FirestoreUser
  } catch {
    return null
  }
}

/**
 * Client-side Firestore: Update student profile fields directly.
 * Uses setDoc with merge to create-or-update.
 */
export async function updateStudentProfile(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  await setDoc(doc(db, "users", uid), data, { merge: true })
}
