const fs = require('fs');
const path = require('path');
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.replace(/\\n/g, '\n');
    }
  });
}

const INTERNAL_DOMAIN = "@internal.aiml.rit";
const TEST_HOD = {
  username: "hod_test01",
  password: "ChangeMe123!",
  displayName: "Test HOD",
  role: "hod",
  profileComplete: true,
};

const internalAuthEmail = `${TEST_HOD.username}${INTERNAL_DOMAIN}`;

function initAdmin() {
  if (getApps().length > 0) return;
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64Key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 not found in .env.local");
  }
  const decoded = Buffer.from(base64Key, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(decoded);
  initializeApp({ credential: cert(serviceAccount) });
}

async function seed() {
  initAdmin();
  const adminAuth = getAuth();
  const adminDb   = getFirestore();

  console.log("🌱 Seeding test HOD account...\n");

  let uid;
  try {
    const existing = await adminAuth.getUserByEmail(internalAuthEmail);
    uid = existing.uid;
    console.log(`ℹ️ Auth user already exists — uid: ${uid}`);
    
    // update password if user exists to ensure it matches
    await adminAuth.updateUser(uid, {
      password: TEST_HOD.password
    });
    console.log("✅ Updated password for existing Auth user");
  } catch (err) {
    const created = await adminAuth.createUser({
      email:         internalAuthEmail,
      password:      TEST_HOD.password,
      displayName:   TEST_HOD.displayName,
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`✅ Created Auth user — uid: ${uid}`);
  }

  const userRef = adminDb.doc(`users/${uid}`);
  await userRef.set({
    username:        TEST_HOD.username,
    name:            TEST_HOD.displayName,
    role:            TEST_HOD.role,
    photoURL:        "",
    profileComplete: TEST_HOD.profileComplete,
    createdAt:       new Date(),
    lastLogin:       new Date(),
  }, { merge: true });
  console.log("✅ Firestore user document written.");

  console.log(`
─────────────────────────────────────────────
  Test HOD Credentials Created!
  Username: ${TEST_HOD.username}
  Password: ${TEST_HOD.password}
─────────────────────────────────────────────
  You can now log in using these credentials under the Faculty / HOD tab.
  `);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
