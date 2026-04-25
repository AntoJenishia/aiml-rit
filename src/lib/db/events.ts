import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface AdminEvent {
  id?: string
  title: string
  date: string
  description: string
  tag: string
  createdBy: string
  createdAt: Date | null
}

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), ms)
    ),
  ])
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const q = query(collection(db, "admin_events"), orderBy("date", "desc"))
  const snap = await withTimeout(getDocs(q))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminEvent))
}

export async function addAdminEvent(data: Omit<AdminEvent, "id" | "createdAt">) {
  return withTimeout(
    addDoc(collection(db, "admin_events"), { ...data, createdAt: serverTimestamp() })
  )
}

export async function deleteAdminEvent(id: string) {
  return withTimeout(deleteDoc(doc(db, "admin_events", id)))
}
