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

async function clean() {
  const snap = await db.collection('users').where('classId', '==', 'iii-aiml-a-2024').get();
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.name === 'Devamalyaa G R' || data.name === 'Devaprakash J' || (!data.section && data.role === 'student')) {
      console.log('Deleting:', doc.id, data.name);
      await db.collection('users').doc(doc.id).delete();
      count++;
    }
  }
  console.log('Deleted', count, 'documents.');
}
clean().catch(console.error);
