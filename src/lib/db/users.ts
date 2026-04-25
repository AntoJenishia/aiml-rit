import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserRole } from "@/lib/auth"

export interface FirestoreUser {
  uid: string
  email: string
  name: string
  role: UserRole
  photoURL: string
  createdAt: Date
  lastLogin: Date
}

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), ms)
    ),
  ])
}

export async function getUser(uid: string): Promise<FirestoreUser | null> {
  const snap = await withTimeout(getDoc(doc(db, "users", uid)))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as FirestoreUser
}

export async function updateUserRole(uid: string, role: UserRole) {
  await withTimeout(updateDoc(doc(db, "users", uid), { role }))
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
  const snap = await withTimeout(getDocs(q))
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as FirestoreUser))
}
