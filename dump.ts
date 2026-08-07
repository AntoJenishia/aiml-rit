import { adminDb } from "./src/lib/firebaseAdmin";

async function run() {
  const users = await adminDb.collection("users").get();
  console.log("USERS:");
  users.docs.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Name: ${data.name} | Role: ${data.role} | ClassId: '${data.classId}'`);
  });
}
run().catch(console.error);
