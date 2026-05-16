import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Firebase Admin SDK — for use in API routes and server-side code ONLY.
 *
 * Uses Application Default Credentials when GOOGLE_APPLICATION_CREDENTIALS is set,
 * otherwise falls back to project ID from env vars for minimal init.
 */
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // If a service account key is provided via env var
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount
      return initializeApp({ credential: cert(serviceAccount) })
    } catch {
      // Fall through to project ID init
    }
  }

  // Minimal init with just the project ID
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  return initializeApp({ projectId })
}

const adminApp = getAdminApp()
export const adminDb = getFirestore(adminApp)
