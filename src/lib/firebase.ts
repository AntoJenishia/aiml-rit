import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC7Qh8UsyyVSsE-l--P_AH5FYHVIET_YlI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aiml-rit-1db43.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aiml-rit-1db43",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aiml-rit-1db43.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "275059254215",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:275059254215:web:b39933c35dba83efd6efe2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LFNCW7CNG8",
}

// Prevent multiple Firebase app initializations in Next.js hot reload
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage = getStorage(app)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null
export default app

