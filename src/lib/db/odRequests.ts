import { db } from "../firebase"
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp, setDoc } from "firebase/firestore"

export interface ODRequest {
  id?: string
  studentUid: string
  referenceNumber: string
  qrCodeUrl: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  isSpecialNeed: boolean
  specialNeedJustification: string
  reason: string
  upfrontProofUrl: string
  status: 'pending_faculty' | 'rejected_faculty' | 'pending_hod' | 'rejected_hod' | 'approved' | 'completed'
  createdAt: any
  facultyRespondedAt?: any
  facultyRejectReason?: string
  hodRespondedAt?: any
  hodRejectReason?: string
  pdfUrl?: string
  finalPdfUrl?: string
  postEventProof?: {
    photosUrls: string[]
    certificateUrl: string
    feedback: string
    uploadedAt: any
    facultyValidatedAt?: any
    hodValidatedAt?: any
  }
}

// Collection reference
const collectionName = "odRequests"

export async function createODRequest(data: Omit<ODRequest, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getStudentODs(studentUid: string): Promise<ODRequest[]> {
  const q = query(
    collection(db, collectionName),
    where("studentUid", "==", studentUid),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ODRequest))
}

export async function getFacultyODs(studentUidsInClass: string[]): Promise<ODRequest[]> {
  if (studentUidsInClass.length === 0) return []
  
  // Note: Firestore 'in' query supports up to 30 items. If a class has more than 30 students,
  // we would need to batch queries. For simplicity here, we assume we fetch all ODs and filter, 
  // or use an array-contains if we remodel, but fetching all pending_faculty and filtering is safer for now.
  
  const q = query(
    collection(db, collectionName),
    where("status", "==", "pending_faculty"),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as ODRequest))
    .filter(req => studentUidsInClass.includes(req.studentUid))
}

export async function getPendingHODODs(): Promise<ODRequest[]> {
  const q = query(
    collection(db, collectionName),
    where("status", "==", "pending_hod"),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ODRequest))
}

export async function getODRequest(id: string): Promise<ODRequest | null> {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as ODRequest
}

export async function updateODStatus(id: string, updateData: Partial<ODRequest>) {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, updateData)
}
