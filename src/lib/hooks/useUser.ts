"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getStudentProfile } from "@/lib/db/users"

export function useUser() {
  const { data: session, status } = useSession()
  const user = session?.user
  const uid = user?.uid ?? ""

  const [isClassIncharge, setIsClassIncharge] = useState<boolean>(false)
  const [classId, setClassId] = useState<string | null>(null)
  const [firestoreLoaded, setFirestoreLoaded] = useState(false)

  useEffect(() => {
    if (!uid || status !== "authenticated") return
    // Fetch Firestore doc to get faculty-specific fields not in the JWT token
    getStudentProfile(uid).then((profile) => {
      if (profile) {
        setIsClassIncharge(profile.isClassIncharge ?? false)
        setClassId(profile.classId ?? null)
      }
      setFirestoreLoaded(true)
    }).catch(() => setFirestoreLoaded(true))
  }, [uid, status])

  return {
    user,
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? "",
    role: user?.role ?? "guest",
    uid,
    isLoading: status === "loading",
    isClassIncharge,
    classId,
    firestoreLoaded,
  }
}
