/**
 * Phase 0 — Seed Script: Create one test HOD account in Firebase Auth
 * and write the matching Firestore user document.
 *
 * Usage: npx tsx scripts/seedHOD.ts
 *
 * ⚠️  Run this ONCE. Re-running is safe (it checks existence first).
 */

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getAuth }      from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// ── Config ─────────────────────────────────────────────────────────────────
// Internal domain used to satisfy Firebase Auth's email requirement invisibly
const INTERNAL_DOMAIN = "@internal.aiml.rit"

// Read credentials from env to prevent hardcoding in git
const TEST_HOD = {
  username:        process.env.SEED_HOD_USERNAME || "hod_test01",
  password:        process.env.SEED_HOD_PASSWORD || "ChangeMe123!",
  displayName:     "Test HOD",
  role:            "hod" as const,
  profileComplete: true,
}

// The hidden email used for Firebase Auth
const internalAuthEmail = `${TEST_HOD.username}${INTERNAL_DOMAIN}`
// ────────────────────────────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) return

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (!base64Key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 not found in .env.local")
  }

  const decoded = Buffer.from(base64Key, 'base64').toString('utf8')
  const serviceAccount = JSON.parse(decoded) as ServiceAccount

  initializeApp({ credential: cert(serviceAccount) })
}

async function seed() {
  // Ensure we load environment variables if running directly
  // Note: normally npx tsx --env-file=.env.local is used, but we'll try to rely on env being present.
  initAdmin()
  const adminAuth = getAuth()
  const adminDb   = getFirestore()

  console.log("🌱  Seeding test HOD account…\n")

  // ── Step 1: Create or retrieve Firebase Auth user ───────────────────────
  let uid: string
  try {
    const existing = await adminAuth.getUserByEmail(internalAuthEmail)
    uid = existing.uid
    console.log(`ℹ️   Auth user already exists — uid: ${uid}`)
  } catch {
    const created = await adminAuth.createUser({
      email:         internalAuthEmail,
      password:      TEST_HOD.password,
      displayName:   TEST_HOD.displayName,
      emailVerified: true,
    })
    uid = created.uid
    console.log(`✅  Created Auth user — uid: ${uid}`)
  }

  // ── Step 2: Write Firestore user document ──────────────────────────────
  const userRef = adminDb.doc(`users/${uid}`)
  const snap    = await userRef.get()

  if (snap.exists) {
    console.log("ℹ️   Firestore user doc already exists — skipping write.")
  } else {
    await userRef.set({
      username:        TEST_HOD.username,
      name:            TEST_HOD.displayName,
      role:            TEST_HOD.role,
      photoURL:        "",
      isClassIncharge: false,
      classId:         null,
      profileComplete: TEST_HOD.profileComplete,
      createdAt:       new Date(),
      lastLogin:       new Date(),
    })
    console.log("✅  Firestore user document written.")
  }

  console.log(`
─────────────────────────────────────────────
  Test HOD Credentials
  Username: ${TEST_HOD.username}
  Password: ${TEST_HOD.password}
─────────────────────────────────────────────
  ⚠️  Change the password after first use.
`)
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err)
  process.exit(1)
})
