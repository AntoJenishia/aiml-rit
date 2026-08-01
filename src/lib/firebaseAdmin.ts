import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Firebase Admin SDK — for use in API routes and server-side code ONLY.
 *
 * Decodes the base64 encoded service account JSON from environment variables.
 */
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (base64Key) {
    try {
      const decoded = Buffer.from(base64Key, 'base64').toString('utf8')
      const serviceAccount = JSON.parse(decoded) as ServiceAccount
      return initializeApp({ credential: cert(serviceAccount) })
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", err)
    }
  }

  // Minimal fallback init with just the project ID
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  return initializeApp({ projectId })
}

const adminApp = getAdminApp()
export const adminDb = getFirestore(adminApp)
