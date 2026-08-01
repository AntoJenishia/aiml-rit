import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function list() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return;
  const creds = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));

  const storage = new Storage({
    projectId: creds.project_id,
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key
    }
  });

  try {
    const [buckets] = await storage.getBuckets();
    console.log("Found buckets:");
    buckets.forEach(b => console.log(" - " + b.name));
  } catch (e) {
    console.error(e);
  }
}

list();
