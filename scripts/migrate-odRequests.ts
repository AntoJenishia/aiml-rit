/**
 * Firestore Migration script for Phase 2:
 * 1. Set department: "AIML" for all existing records
 * 2. Delete isFacultyRequest field
 * 3. Map old status strings to ODStatus enum canonical values
 * 
 * Usage: npx tsx --env-file=.env.local scripts/migrate-odRequests.ts
 */

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length > 0) return;
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64Key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 not found in env");
  }
  const decoded = Buffer.from(base64Key, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(decoded) as ServiceAccount;
  initializeApp({ credential: cert(serviceAccount) });
}

const STATUS_MAP: Record<string, string> = {
  "FACULTY_VERIFICATION": "PENDING_FACULTY",
  "pending_faculty": "PENDING_FACULTY",
  "REJECTED": "REJECTED_FACULTY", 
  "rejected_faculty": "REJECTED_FACULTY",
  "HOD_APPROVAL": "PENDING_HOD",
  "pending_hod": "PENDING_HOD",
  "HOD_REJECTED": "REJECTED_HOD",
  "rejected_hod": "REJECTED_HOD",
  "HOD_APPROVED": "APPROVED",
  "VERIFIED": "APPROVED", 
  "approved": "APPROVED",
  "post_pending_faculty": "PROOF_PENDING_FACULTY",
  "post_pending_hod": "PROOF_PENDING_HOD",
  "ACTIVITY_COMPLETED": "COMPLETED",
  "COMPLETED": "COMPLETED",
  "completed": "COMPLETED"
};

async function runMigration() {
  initAdmin();
  const db = getFirestore();
  console.log("🚀 Starting Phase 2 Migration...");

  const odRequestsSnap = await db.collection("odRequests").get();
  let updatedCount = 0;
  
  const batch = db.batch();

  for (const doc of odRequestsSnap.docs) {
    const data = doc.data();
    const updatePayload: any = {};
    let needsUpdate = false;

    // 1. Tag with department
    if (data.department !== "AIML") {
      updatePayload.department = "AIML";
      needsUpdate = true;
    }

    // 2. Remove old isFacultyRequest field
    if (data.isFacultyRequest !== undefined) {
      updatePayload.isFacultyRequest = FieldValue.delete();
      needsUpdate = true;
    }

    // 3. Normalize status
    if (data.status) {
      const canonicalStatus = STATUS_MAP[data.status];
      if (canonicalStatus && canonicalStatus !== data.status) {
        updatePayload.status = canonicalStatus;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      batch.update(doc.ref, updatePayload);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`✅ Successfully migrated ${updatedCount} OD requests!`);
  } else {
    console.log(`✅ No records needed migration.`);
  }

  console.log("🎉 Phase 2 Migration Complete!");
}

runMigration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
