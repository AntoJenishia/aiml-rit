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

const STAFF_DATA = [
  {
    name: "LAVANYA R",
    staffCode: "F001",
    department: "AI & ML",
    designation: "Assistant Professor",
    phone: "9962004261",
    gender: "FEMALE"
  },
  {
    name: "LIZY A",
    staffCode: "F002",
    department: "AI & ML",
    designation: "Assistant Professor",
    phone: "9940765514",
    gender: "FEMALE"
  },
  {
    name: "STARLIN M A",
    staffCode: "F003",
    department: "AI & ML",
    designation: "Assistant Professor",
    phone: "9698850179",
    gender: "FEMALE"
  }
];

async function seed() {
  initAdmin();
  const adminAuth = getAuth();
  const adminDb = getFirestore();

  console.log("🌱 Removing existing staff...\n");
  
  // 1. Find all staff in Firestore
  const snapshot = await adminDb.collection("users").where("role", "==", "staff").get();
  
  for (const doc of snapshot.docs) {
    console.log(`Deleting staff: ${doc.id}`);
    try {
      await adminAuth.deleteUser(doc.id);
    } catch (e) {
      console.log(`Auth delete failed for ${doc.id}: ${e.message}`);
    }
    await doc.ref.delete();
  }

  console.log("\n✅ Cleared existing staff. Now seeding new staff...\n");
  
  const results = [];

  // 2. Create new staff
  for (const staff of STAFF_DATA) {
    const password = staff.name.split(" ")[0].toLowerCase() + "123!";
    const email = `${staff.staffCode.toLowerCase()}@internal.aiml.rit`;
    
    const created = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: staff.name,
      emailVerified: true,
    });

    const uid = created.uid;

    await adminDb.doc(`users/${uid}`).set({
      name: staff.name,
      staffCode: staff.staffCode,
      department: staff.department,
      designation: staff.designation,
      email: email,
      phone: staff.phone,
      gender: staff.gender,
      role: "staff",
      photoURL: "",
      isClassIncharge: false,
      classId: null,
      profileComplete: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    results.push({
      Name: staff.name,
      Email: email,
      Password: password
    });
    
    console.log(`✅ Created ${staff.name} (${email})`);
  }

  console.log(`
─────────────────────────────────────────────
  New Staff Credentials Created!
─────────────────────────────────────────────
`);
  console.table(results);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
