const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    process.env[key] = value.replace(/\\n/g, '\n');
  }
});

const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decoded);
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function clearUsers() {
  console.log('Fetching users from Firestore...');
  const usersSnap = await db.collection('users').get();
  let deletedStudents = 0;
  let deletedStaff = 0;
  let preservedHod = 0;

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (data.role === 'hod' || data.role === 'admin') {
      preservedHod++;
      console.log('Preserving HOD/Admin:', doc.id, data.name || data.email);
    } else {
      await db.collection('users').doc(doc.id).delete();
      if (data.role === 'student') deletedStudents++;
      else if (data.role === 'staff') deletedStaff++;
      else console.log('Deleted other test user:', doc.id);
    }
  }

  // Also clear old OD requests
  try {
    const odSnap = await db.collection('odRequests').get();
    for (const doc of odSnap.docs) {
      await db.collection('odRequests').doc(doc.id).delete();
    }
  } catch (e) {
    console.warn('odRequests cleanup error:', e.message);
  }

  try {
    const odOldSnap = await db.collection('od').get();
    for (const doc of odOldSnap.docs) {
      await db.collection('od').doc(doc.id).delete();
    }
  } catch (e) {
    console.warn('od collection cleanup error:', e.message);
  }

  console.log(`Success! Deleted ${deletedStudents} students, ${deletedStaff} staff. Preserved ${preservedHod} HOD/Admin accounts.`);
}

clearUsers().catch(console.error);

