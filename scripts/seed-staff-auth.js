const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1);
      process.env[key] = value.replace(/\\n/g, '\n');
    }
  });
}

// 2. Init Firebase Admin
if (getApps().length === 0) {
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64Key) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 missing");
  const decoded = Buffer.from(base64Key, 'base64').toString('utf8');
  initializeApp({ credential: cert(JSON.parse(decoded)) });
}
const adminAuth = getAuth();

// 3. Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("Fetching all staff from Supabase...");
  const { data: staffList, error } = await supabase
    .from('staff')
    .select('id, name, staff_code, email, role, designation')
    .order('staff_code');

  if (error || !staffList) {
    console.error("Error fetching staff:", error);
    process.exit(1);
  }

  console.log(`Found ${staffList.length} staff members.`);

  const credentialsSummary = [];

  for (const member of staffList) {
    if (!member.staff_code) continue;

    const staffCodeUpper = member.staff_code.trim().toUpperCase();
    const staffCodeLower = member.staff_code.trim().toLowerCase();
    const internalEmail = `${staffCodeLower}@internal.aiml.rit`;
    // Password standard format: Rit@<STAFF_CODE> (e.g. Rit@CS91, Rit@CS195)
    const password = `Rit@${staffCodeUpper}`;

    try {
      // Check if user already exists in Firebase Auth
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(internalEmail);
        // Update password to ensure it matches
        await adminAuth.updateUser(userRecord.uid, {
          password: password,
          displayName: member.name,
        });
      } catch (err) {
        // User doesn't exist, create
        userRecord = await adminAuth.createUser({
          email: internalEmail,
          password: password,
          displayName: member.name,
          emailVerified: true,
        });
      }

      credentialsSummary.push({
        "Staff Code (Username)": staffCodeUpper,
        "Name": member.name,
        "Designation": member.designation || "Faculty",
        "Role": member.role || (staffCodeUpper === "CS91" ? "hod" : "staff"),
        "Password": password,
      });

      console.log(`✅ [${staffCodeUpper}] ${member.name} -> Password: ${password}`);
    } catch (e) {
      console.error(`❌ Failed for ${member.staff_code}:`, e.message);
    }
  }

  console.log("\n========================================================");
  console.log(`Successfully generated credentials for ${credentialsSummary.length} staff members!`);
  console.log("========================================================\n");
  console.table(credentialsSummary.slice(0, 10)); // Display first 10 preview
}

main().catch(console.error);

