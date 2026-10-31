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
      return NextResponse.json({ error: "No student records found in file" }, { status: 400 });
    }

    // Fetch existing staff to map staff_code and class incharge
    const { data: existingStaff } = await supabaseAdmin
      .from("staff")
      .select("staff_code, name");

    const validStaffCodes = new Set<string>();
    const staffNameMap = new Map<string, string>();

    (existingStaff || []).forEach((s) => {
      if (s.staff_code) {
        const codeUpper = String(s.staff_code).trim().toUpperCase();
        validStaffCodes.add(codeUpper);
        if (s.name) {
          staffNameMap.set(s.name.trim().toLowerCase(), s.staff_code);
        }
      }
    });

    const records: any[] = [];
    const errors: string[] = [];
    let mappedInchargeCount = 0;

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

      const name = getVal(["Name", "Student Name", "name"]);
      const regNo = getVal(["Register No", "Register Number", "Reg No", "register_no"]);
      const email = getVal(["Email", "Email ID", "Mail", "email"]).toLowerCase();
      const phone = getVal(["Phone", "Phone Number", "Mobile", "phone"]);
      const className = getVal(["Class", "class"]);
      const semester = getVal(["Semester", "Sem", "semester"]);
      const section = getVal(["Section", "Sec", "section"]).toUpperCase();
      const course = getVal(["Course", "course"]) || "B.Tech";
      const department = getVal(["Department", "dept", "department"]) || "Artificial Intelligence & Machine Learning";
      const degreeType = getVal(["Degree Type", "degree_type", "Degree"]) || "UG";
      const batch = getVal(["Batch", "batch"]);
      const classIncharge = getVal(["Class Incharge", "Incharge", "class_incharge"]);
      let rawStaffCode = getVal(["Staff Code", "StaffCode", "staff_code"]);
      const hosteler = getVal(["Hosteler", "hosteler", "Day Scholar"]);
      const rawProfile = getVal(["Profile", "profile", "Photo", "image", "Profile Pic"]);
      const gender = getVal(["Gender", "gender"]);

      if (!name || !regNo) {
        errors.push(`Row ${rowNum}: Missing Name or Register Number`);
        continue;
      }

      // Map staff_code
      let matchedStaffCode: string | null = null;
      if (rawStaffCode && validStaffCodes.has(rawStaffCode.toUpperCase())) {
        matchedStaffCode = rawStaffCode;
        mappedInchargeCount++;
      } else if (classIncharge) {
        // Try matching by class incharge name
        const inchargeLower = classIncharge.toLowerCase();
        for (const [sName, sCode] of staffNameMap.entries()) {
          if (inchargeLower.includes(sName) || sName.includes(inchargeLower)) {
            matchedStaffCode = sCode;
            mappedInchargeCount++;
            break;
          }
        }
      }

      records.push({
        name,
        register_no: regNo,
        email: email || `${regNo.toLowerCase()}@aiml.ritchennai.edu.in`,
        phone: phone || null,
        class: className || null,
        semester: semester || null,
        section: section || null,
        course,
        department,
        degree_type: degreeType,
        batch: batch || null,
        class_incharge_name: classIncharge || null,
        staff_code: matchedStaffCode,
        hosteler: hosteler || null,
        profile_url: formatProfileUrl(rawProfile),
        gender: gender || null,
        role: "student"
      });
    }

    if (records.length === 0) {
      return NextResponse.json({ 
        error: "No valid student records found", 
        errors 
      }, { status: 400 });
    }

    // Upsert into Supabase students table on conflict 'register_no'
    // Split into chunks of 100 for reliable upserting
    const CHUNK_SIZE = 100;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseAdmin
        .from("students")
        .upsert(chunk, { onConflict: "register_no" });

      if (error) {
        console.error("[import-students] Supabase Chunk Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      importedCount: records.length,
      mappedInchargeCount,
      errors,
      sample: records.slice(0, 3)
    });

  } catch (err: any) {
    console.error("[import-students] Exception:", err);
    return NextResponse.json({ error: err.message || "Failed to process students file" }, { status: 500 });
  }
}
