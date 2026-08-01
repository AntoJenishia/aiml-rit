import { getStorage } from "firebase-admin/storage";
import { getApps } from "firebase-admin/app";
import "../src/lib/firebaseAdmin"; // init admin app

async function testStorage() {
  const app = getApps()[0];
  const storage = getStorage(app);
  
  try {
    const [buckets] = await storage.getBuckets();
    console.log("Available buckets:");
    buckets.forEach(b => console.log(" -", b.name));
  } catch (err) {
    console.error("Error listing buckets:", err);
  }
}

testStorage();
