import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

/**
 * Firebase Admin SDK — for use in API routes and server-side code ONLY.
 *
 * Decodes the base64 encoded service account JSON from environment variables.
 */
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  let serviceAccount: ServiceAccount | undefined

  // Try the explicit base64 variable first
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  const legacyKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (base64Key) {
    try {
      const decoded = Buffer.from(base64Key, 'base64').toString('utf8')
      serviceAccount = JSON.parse(decoded) as ServiceAccount
      console.log("[Firebase Admin] Successfully parsed FIREBASE_SERVICE_ACCOUNT_BASE64")
    } catch (err) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", err)
    }
  } else if (legacyKey) {
    try {
      // Check if it's base64 encoded (Vercel workaround)
      if (!legacyKey.trim().startsWith('{')) {
        const decoded = Buffer.from(legacyKey, 'base64').toString('utf8')
        serviceAccount = JSON.parse(decoded) as ServiceAccount
        console.log("[Firebase Admin] Successfully parsed FIREBASE_SERVICE_ACCOUNT_KEY as Base64")
      } else {
        serviceAccount = JSON.parse(legacyKey) as ServiceAccount
        console.log("[Firebase Admin] Successfully parsed FIREBASE_SERVICE_ACCOUNT_KEY as raw JSON")
      }
    } catch (err) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err)
    }
  } else {
    console.warn("[Firebase Admin] No service account key found in environment variables.")
  }

  if (serviceAccount) {
    try {
      return initializeApp({ credential: cert(serviceAccount) })
    } catch (err) {
      console.error("[Firebase Admin] initializeApp threw an error with the parsed credential:", err)
    }
  }

  // Minimal fallback init with just the project ID
  console.warn("[Firebase Admin] Falling back to unauthenticated initialization (Firestore reads may fail if locked down).")
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  return initializeApp({ projectId })
}

const adminApp = getAdminApp()
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
