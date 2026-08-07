import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  const odsSnap = await adminDb.collection("odRequests").get();
  const ods = odsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const usersSnap = await adminDb.collection("users").get();
  const users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));

  return NextResponse.json({ ods, users });
}
