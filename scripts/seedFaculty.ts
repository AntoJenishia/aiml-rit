/**
 * Phase 0 — Seed Script: Create one test faculty account in Firebase Auth
 * and write the matching Firestore user document.
 *
 * Usage — pass the path to your downloaded service account JSON:
 *   npx tsx scripts/seedFaculty.ts "C:\Users\antoj\Downloads\aiml-rit-1db43-firebase-adminsdk-fbsvc-108e814ddb.json"
 *
 * ⚠️  Run this ONCE. Re-running is safe (it checks existence first).
 *    Do not commit the service account JSON to the repo.
 */

import { readFileSync } from "fs"
import { resolve }      from "path"
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getAuth }      from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// ── Config ─────────────────────────────────────────────────────────────────
// Internal domain used to satisfy Firebase Auth's email requirement invisibly
const INTERNAL_DOMAIN = "@internal.aiml.rit"

// Read credentials from env to prevent hardcoding in git
const TEST_FACULTY = {
  username:        process.env.SEED_FACULTY_USERNAME || "faculty_test01",
  password:        process.env.SEED_FACULTY_PASSWORD || "ChangeMe123!",
  displayName:     "Test Faculty",
  role:            "staff" as const,
  isClassIncharge: false,
  classId:         null,
  profileComplete: true,
}

// The hidden email used for Firebase Auth
const internalAuthEmail = `${TEST_FACULTY.username}${INTERNAL_DOMAIN}`
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
  initAdmin()
  const adminAuth = getAuth()
  const adminDb   = getFirestore()

  console.log("🌱  Seeding test faculty account…\n")

  // ── Step 1: Create or retrieve Firebase Auth user ───────────────────────
  let uid: string
  try {
    const existing = await adminAuth.getUserByEmail(internalAuthEmail)
    uid = existing.uid
    console.log(`ℹ️   Auth user already exists — uid: ${uid}`)
  } catch {
    const created = await adminAuth.createUser({
      email:         internalAuthEmail,
      password:      TEST_FACULTY.password,
      displayName:   TEST_FACULTY.displayName,
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
      username:        TEST_FACULTY.username,
      name:            TEST_FACULTY.displayName,
      role:            TEST_FACULTY.role,
      photoURL:        "",
      isClassIncharge: TEST_FACULTY.isClassIncharge,
      classId:         TEST_FACULTY.classId,
      profileComplete: TEST_FACULTY.profileComplete,
      createdAt:       new Date(),
      lastLogin:       new Date(),
    })
    console.log("✅  Firestore user document written.")
  }

  console.log(`
─────────────────────────────────────────────
  Test Faculty Credentials
  Username: ${TEST_FACULTY.username}
  Password: ${TEST_FACULTY.password}
─────────────────────────────────────────────
  ⚠️  Change the password after first use.
`)
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err)
  process.exit(1)
})

