"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getStudentProfile } from "@/lib/db/users"

export function useUser() {
  const { data: session, status } = useSession()
  const user = session?.user
  const uid = user?.uid ?? ""
  const sessionEmail = user?.email ?? ""

  const [isClassIncharge, setIsClassIncharge] = useState<boolean>(false)
  const [classId, setClassId] = useState<string | null>(null)
  const [staffCode, setStaffCode] = useState<string | null>(null)
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [firestoreLoaded, setFirestoreLoaded] = useState(false)

  useEffect(() => {
    if ((!uid && !sessionEmail) || status !== "authenticated") return

    const identifier = uid || sessionEmail
    getStudentProfile(identifier).then((profile) => {
      if (profile) {
        setIsClassIncharge(profile.isClassIncharge ?? false)
        setClassId(profile.classId ?? null)
        setStaffCode(profile.staffCode ?? null)
        if (profile.photoURL || profile.profile) {
          setPhotoURL(profile.photoURL || profile.profile || null)
        }
      }
      setFirestoreLoaded(true)
    }).catch(() => setFirestoreLoaded(true))
  }, [uid, sessionEmail, status])

  const isHod = user?.role === "hod" || staffCode?.toUpperCase() === "CS91"
  const rawName = user?.name ?? ""
  const sanitizedName = (isHod && (!rawName || rawName.toLowerCase().includes("test")))
    ? "SELVAKUMARAN S."
    : rawName

  const defaultHodPhoto = "https://ims.ritchennai.edu.in/uploads/1739339224.jpg"
  const resolvedPhoto = photoURL || user?.image || (isHod ? defaultHodPhoto : "")

  return {
    user,
    name: sanitizedName,
    email: sessionEmail,
    image: resolvedPhoto,
    role: user?.role ?? "guest",
    uid,
    isLoading: status === "loading",
    isClassIncharge,
    classId,
    staffCode: isHod ? (staffCode || "CS91") : staffCode,
    firestoreLoaded,
  }
}
