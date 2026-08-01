const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
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

async function check() {
  const s = await db.collection('odRequests').get();
  console.log(s.docs.map(d => ({ id: d.id, ...d.data() })));
}
check();
