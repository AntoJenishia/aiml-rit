
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { adminDb } from "@/lib/firebaseAdmin";

async function findStaffRecord(session: any) {
  const sessionUser = session?.user as any;
  if (!sessionUser) return null;

  const email = (session.user.email || "").toLowerCase().trim();
  const staffCode = (sessionUser.staffCode || sessionUser.username || "").trim();
  const uid = (sessionUser.uid || sessionUser.id || "").trim();
  const sessionName = (session.user.name || "").trim();

  // 1. Check if email contains internal domain (e.g. cs255@internal.aiml.rit)
  let extractedCode = staffCode;
  if (!extractedCode && email.includes("@internal.aiml.rit")) {
    extractedCode = email.split("@")[0].trim();
  }

  // 2. Query by staff code
  if (extractedCode) {
    const { data } = await supabaseAdmin
      .from("staff")
      .select("*")
      .ilike("staff_code", extractedCode)
      .maybeSingle();
    if (data) return data;
  }

  // 3. Query by official email
  if (email && !email.includes("@internal.aiml.rit")) {
    const { data } = await supabaseAdmin
      .from("staff")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (data) return data;
  }

  // 4. Query by exact or partial staff name
  if (sessionName && !sessionName.toLowerCase().includes("test")) {
    const { data } = await supabaseAdmin
      .from("staff")
      .select("*")
      .ilike("name", sessionName)
      .maybeSingle();
    if (data) return data;
  }

  // 5. Query by UID (UUID)
  if (uid) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
    if (isUUID) {
      const { data } = await supabaseAdmin
        .from("staff")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (data) return data;
    }

    // 6. Check Firestore user doc
    try {
      const docSnap = await adminDb.collection("users").doc(uid).get();
      if (docSnap.exists) {
        const udata = docSnap.data();
        const fCode = udata?.staffCode || udata?.username;
        if (fCode) {
          const { data } = await supabaseAdmin
            .from("staff")
            .select("*")
            .ilike("staff_code", fCode)
            .maybeSingle();
          if (data) return data;
        }
      }
    } catch {
      // Ignore firestore lookup error
    }
  }

  // 7. Dev bypass for test account or HOD
  if (email === "antojenishiadev@gmail.com" || sessionUser.role === "hod") {
    const { data } = await supabaseAdmin
      .from("staff")
      .select("*")
      .ilike("staff_code", "CS91")
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffRecord = await findStaffRecord(session);

    if (!staffRecord) {
      const sessionUser = session.user as any;
      const fallbackName = session.user.name || "Faculty Member";
      const isHodRole = sessionUser.role === "hod";

      return NextResponse.json({
        name: isHodRole ? "Dr. Selvakumaran S." : fallbackName,
        staffCode: isHodRole ? "CS91" : (sessionUser.staffCode || ""),
        department: "Department of Artificial Intelligence & Machine Learning",
        designation: isHodRole ? "Head of Department" : "Assistant Professor",
        email: session.user.email || "",
        phone: "",
        gender: "MALE",
        roomLocation: "AIML Faculty Cabin",
        profile: isHodRole ? "https://ims.ritchennai.edu.in/uploads/1739339224.jpg" : "",
        photoURL: isHodRole ? "https://ims.ritchennai.edu.in/uploads/1739339224.jpg" : "",
        role: isHodRole ? "hod" : "staff",
        isClassIncharge: false,
        classId: null,
        bio: "",
        qualification: "Assistant Professor",
        experience: "5",
        specialization: "Artificial Intelligence & Machine Learning"
      });
    }

    const isHod = staffRecord.staff_code?.toUpperCase() === "CS91" || staffRecord.role === "hod";

    // Check if faculty is class incharge for any students
    const { data: inchargeStudents } = await supabaseAdmin
      .from("students")
      .select("class")
      .ilike("staff_code", staffRecord.staff_code)
      .limit(1);

    const isClassIncharge = Boolean(inchargeStudents && inchargeStudents.length > 0);
    const assignedClass = inchargeStudents?.[0]?.class || null;

    return NextResponse.json({
      name: staffRecord.name,
      staffCode: staffRecord.staff_code,
      department: staffRecord.department || "Department of Artificial Intelligence & Machine Learning",
      designation: staffRecord.designation || (isHod ? "Head of Department" : "Assistant Professor"),
      email: staffRecord.email,
      phone: staffRecord.phone || "",
      gender: staffRecord.gender || "",
      roomLocation: staffRecord.room_location || "AIML Faculty Cabin",
      profile: staffRecord.profile_url || "",
      photoURL: staffRecord.profile_url || "",
      role: isHod ? "hod" : "staff",
      isClassIncharge,
      classId: assignedClass,
      bio: staffRecord.bio || "",
      qualification: staffRecord.qualification || staffRecord.designation || "Assistant Professor",
      experience: staffRecord.experience || "5",
      specialization: staffRecord.specialization || "Artificial Intelligence & Machine Learning",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffRecord = await findStaffRecord(session);
    if (!staffRecord) {
      return NextResponse.json({ error: "Staff record not found" }, { status: 404 });
    }

    const body = await req.json();

    const updates: any = {};
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.qualification !== undefined) updates.qualification = body.qualification;
    if (body.designation !== undefined) updates.designation = body.designation;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.specialization !== undefined) updates.specialization = body.specialization;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.roomLocation !== undefined) updates.room_location = body.roomLocation;

    const { error } = await supabaseAdmin
      .from("staff")
      .update(updates)
      .eq("id", staffRecord.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
