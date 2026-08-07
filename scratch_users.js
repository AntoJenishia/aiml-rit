const { adminDb } = require("./src/lib/firebaseAdmin.js");

async function run() {
  const users = await adminDb.collection("users").get();
  console.log("USERS:");
  users.docs.forEach(doc => {
    console.log(doc.id, doc.data().name, doc.data().role, doc.data().classId);
  });
}
run();
