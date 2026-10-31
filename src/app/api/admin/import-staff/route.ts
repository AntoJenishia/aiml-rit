import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, formatProfileUrl } from "@/lib/supabase";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    // Auth check — HOD or Admin
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!role || (role !== "hod" && role !== "admin")) {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let rawRows: any[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    } else {
      const body = await req.json();
      rawRows = body.rows || [];
    }

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ error: "No data rows found in file" }, { status: 400 });
    }

    const records: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2;

      // Extract field helpers with flexible casing
      const getVal = (keys: string[]) => {
        for (const k of keys) {
          for (const rowKey of Object.keys(row)) {
            if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
              return String(row[rowKey] || "").trim();
            }
          }
        }
        return "";
      };

      const name = getVal(["Name", "Staff Name", "faculty_name"]);
      const staffCode = getVal(["Staff Code", "StaffCode", "Code", "staff_code"]);
      const email = getVal(["Email", "Email ID", "Mail", "email"]).toLowerCase();
      const phone = getVal(["Phone", "Phone Number", "Mobile", "phone"]);
      const designation = getVal(["Designation", "designation", "Role"]);
      const department = getVal(["Department", "dept", "department"]) || "Artificial Intelligence & Machine Learning";
      const gender = getVal(["Gender", "gender"]);
      const roomLocation = getVal(["room_location", "Room Location", "Cabin", "location"]);
      const rawProfile = getVal(["Profile", "profile", "Photo", "image", "Profile Pic"]);

      if (!name || !staffCode) {
        errors.push(`Row ${rowNum}: Skipped due to missing Name or Staff Code`);
        continue;
      }

      const isHOD = staffCode.toUpperCase() === "CS91";
      const staffRole = isHOD ? "hod" : "staff";
      const finalDesignation = isHOD 
        ? (designation.toLowerCase().includes("head") || designation.toLowerCase().includes("hod") 
            ? designation 
            : `Head of Department — AIML`)
        : (designation || "Assistant Professor");

      records.push({
        name,
        staff_code: staffCode,
        email: email || `${staffCode.toLowerCase()}@ritchennai.edu.in`,
        phone: phone || null,
        designation: finalDesignation,
        department,
        gender: gender || null,
        room_location: roomLocation || null,
        profile_url: formatProfileUrl(rawProfile),
        role: staffRole
      });
    }

    if (records.length === 0) {
      return NextResponse.json({ 
        error: "No valid staff records found", 
        errors 
      }, { status: 400 });
    }

    // Upsert into Supabase staff table on conflict 'staff_code'
    const { data, error } = await supabaseAdmin
      .from("staff")
      .upsert(records, { onConflict: "staff_code" })
      .select();

    if (error) {
      console.error("[import-staff] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If HOD was imported, ensure Firestore user record also reflects role: "hod"
    const hodRecord = records.find(r => r.role === "hod");
    if (hodRecord && hodRecord.email) {
      try {
        const { adminDb } = await import("@/lib/firebaseAdmin");
        // Check by email
        const existing = await adminDb.collection("users").where("email", "==", hodRecord.email).get();
        if (!existing.empty) {
          for (const d of existing.docs) {
            await adminDb.collection("users").doc(d.id).set({
              role: "hod",
              designation: hodRecord.designation,
              name: hodRecord.name,
              staffCode: hodRecord.staff_code,
              department: "Artificial Intelligence & Machine Learning"
            }, { merge: true });
          }
        } else {
          // Create document with email as ID
          await adminDb.collection("users").doc(hodRecord.email).set({
            email: hodRecord.email,
            role: "hod",
            designation: hodRecord.designation,
            name: hodRecord.name,
            staffCode: hodRecord.staff_code,
            department: "Artificial Intelligence & Machine Learning",
            createdAt: new Date(),
          }, { merge: true });
        }
        console.log(`[import-staff] Successfully set HOD role in Firestore for ${hodRecord.email}`);
      } catch (err: any) {
        console.warn("[import-staff] Could not sync HOD to Firestore:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      importedCount: records.length,
      errors,
      sample: records.slice(0, 3)
    });

  } catch (err: any) {
    console.error("[import-staff] Exception:", err);
    return NextResponse.json({ error: err.message || "Failed to process staff file" }, { status: 500 });
  }
}

