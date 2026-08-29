/**
 * Read-only Firestore backup script
 * Extracts OD Requests and Users to local JSON files.
 * 
 * Usage: npx tsx --env-file=.env.local scripts/backup-odRequests.ts
 */

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

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

// Helper to convert Firestore Timestamps to ISO strings recursively
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  
  // Also handle raw object timestamps if they arrive that way {_seconds, _nanoseconds}
  if (data && typeof data === 'object' && typeof data._seconds === 'number' && typeof data._nanoseconds === 'number') {
    return new Date(data._seconds * 1000).toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      result[key] = serializeData(data[key]);
    }
    return result;
  }
  return data;
}

async function runBackup() {
  initAdmin();
  const db = getFirestore();

  console.log("🚀 Starting Read-Only Firestore Backup...");

  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // 1. Backup odRequests
  console.log("Fetching odRequests...");
  const odRequestsSnap = await db.collection("odRequests").get();
  const odRequests = odRequestsSnap.docs.map(doc => {
    return {
      id: doc.id,
      ...serializeData(doc.data())
    };
  });
  
  const odFilePath = path.join(backupsDir, `odRequests-backup-${timestamp}.json`);
  fs.writeFileSync(odFilePath, JSON.stringify(odRequests, null, 2));
  console.log(`✅ Exported ${odRequests.length} odRequests to ${odFilePath}`);

  // 2. Backup users
  console.log("Fetching users...");
  const usersSnap = await db.collection("users").get();
  const users = usersSnap.docs.map(doc => {
    return {
      id: doc.id,
      ...serializeData(doc.data())
    };
  });

  const usersFilePath = path.join(backupsDir, `users-backup-${timestamp}.json`);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  console.log(`✅ Exported ${users.length} users to ${usersFilePath}`);

  console.log("\n🎉 Backup Complete!");
}

runBackup().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
