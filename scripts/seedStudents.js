const fs = require('fs');
const path = require('path');
const { initializeApp, getApps, cert } = require("firebase-admin/app");
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

async function seed() {
  initAdmin();
  const adminDb = getFirestore();

  // CSV path: accept as first CLI arg, env var, or default download location
  const csvPath = process.argv[2]
    || process.env.STUDENT_CSV_PATH
    || "C:\\Users\\hp\\Downloads\\aiml_5th_sem_students.csv";
  
  console.log(`📄 CSV path: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found at:", csvPath);
    console.error("   Usage: node scripts/seedStudents.js [path/to/file.csv]");
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Skip header line
  const dataLines = lines.slice(1);
  console.log(`🌱 Found ${dataLines.length} student records in CSV. Seeding to Firestore...`);

  const batch = adminDb.batch();
  let count = 0;

  for (const line of dataLines) {
    // Basic CSV parser (split by comma, handle potential quotes if any)
    const fields = [];
    let currentField = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());

    if (fields.length < 7) {
      console.warn("⚠️ Skipping invalid line:", line);
      continue;
    }

    const [name, register_no, email, phone, fullClass, semester, section] = fields;
    
    // Parse admission year from email (e.g. name.240001@aiml.ritchennai.edu.in)
    const emailMatch = email.match(/\.(\d{2})\d+@/);
    let admissionYear = 2024; // fallback
    if (emailMatch) {
      const yr = parseInt(emailMatch[1], 10);
      admissionYear = yr >= 50 ? 1900 + yr : 2000 + yr;
    }

    // Determine current year Roman
    const sem = parseInt(semester, 10);
    let currentYear = "III"; // fallback for sem 5
    if (sem <= 2) currentYear = "I";
    else if (sem <= 4) currentYear = "II";
    else if (sem <= 6) currentYear = "III";
    else currentYear = "IV";

    // Set classId
    const secLower = section.toLowerCase();
    const classId = `${currentYear.toLowerCase()}-aiml-${secLower}-${admissionYear}`;

    // Extract roll number from register number or email
    const rollNumber = register_no.slice(-3);

    // Save student keyed by email (for seamless NextAuth linking on login)
    const studentRef = adminDb.collection("users").doc(email);
    batch.set(studentRef, {
      name,
      email,
      registerNumber: register_no,
      rollNumber,
      phone,
      role: "student",
      photoURL: "",
      department: "Artificial Intelligence & Machine Learning",
      deptCode: "aiml",
      batch: `${admissionYear} – ${admissionYear + 4}`,
      currentYear,
      semester: sem,
      section,
      classId,
      profileComplete: true, // Complete since we uploaded all details
      createdAt: new Date(),
      lastLogin: new Date(),
    }, { merge: true });

    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${count} students into Firestore!`);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
