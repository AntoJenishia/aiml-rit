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

async function run() {
  const s = await db.collection('users').where('role', '==', 'staff').get();
  
  let lavanyaDoc = null;
  for (const doc of s.docs) {
    if (doc.data().name === 'LAVANYA R') {
      lavanyaDoc = doc;
    }
  }

  if (lavanyaDoc) {
    console.log('Found LAVANYA R. Setting as class incharge for iii-aiml-a-2024...');
    await lavanyaDoc.ref.update({
      isClassIncharge: true,
      classId: 'iii-aiml-a-2024'
    });
    
    // Also make sure the class document exists in the "classes" collection
    const classRef = db.collection('classes').doc('iii-aiml-a-2024');
    await classRef.set({
      classInchargeUid: lavanyaDoc.id,
      name: 'III Year AIML A Sec - 2024 Batch',
      batch: '2024-2028',
      createdAt: new Date()
    }, { merge: true });
    
    console.log('✅ Done!');
  } else {
    console.log('LAVANYA R not found!');
  }
}
run().catch(console.error);
