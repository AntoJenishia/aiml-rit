const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"')) val = val.substring(1, val.length - 1);
    process.env[match[1]] = val;
  }
});

const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
initializeApp({ credential: cert(sa) });
const db = getFirestore();

db.collection('users')
  .where('classId', '==', 'iii-aiml-a-2024')
  .where('isClassIncharge', '==', true)
  .get()
  .then(snap => console.log("Result:", snap.docs.map(d => d.id)))
  .catch(console.error);
