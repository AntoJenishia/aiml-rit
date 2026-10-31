import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const emailParam = searchParams.get("email");
    const classId = searchParams.get("classId");
    const studentEmail = searchParams.get("studentEmail");

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;

    // 1. Find class incharge by classId
    if (classId) {
      const { data: studentRows } = await supabaseAdmin
        .from("students")
        .select("staff_code, class_incharge_name, class")
        .ilike("class", `%${classId}%`)
        .limit(1);

      const studentMatch = studentRows?.[0];
      if (studentMatch) {
        if (studentMatch.staff_code) {
          const { data: staffMember } = await supabaseAdmin
            .from("staff")
            .select("*")
            .ilike("staff_code", studentMatch.staff_code)
            .maybeSingle();

          if (staffMember) {
            return NextResponse.json({
              uid: staffMember.id,
              name: staffMember.name,
              email: staffMember.email,
              phone: staffMember.phone,
              staffCode: staffMember.staff_code,
              designation: staffMember.designation,
              photoURL: staffMember.profile_url,
              profile: staffMember.profile_url,
              isClassIncharge: true,
            });
          }
        }

        if (studentMatch.class_incharge_name) {
          const { data: staffMember } = await supabaseAdmin
            .from("staff")
            .select("*")
            .ilike("name", `%${studentMatch.class_incharge_name}%`)
            .maybeSingle();

          return NextResponse.json({
            uid: staffMember?.id || "incharge",
            name: staffMember?.name || studentMatch.class_incharge_name,
            email: staffMember?.email || "",
            phone: staffMember?.phone || "",
            staffCode: staffMember?.staff_code || "",
            designation: staffMember?.designation || "Assistant Professor",
            photoURL: staffMember?.profile_url || "",
            profile: staffMember?.profile_url || "",
            isClassIncharge: true,
          });
        }
      }

      return NextResponse.json(null, { status: 404 });
    }

    // 2. Find class incharge by studentEmail
    if (studentEmail) {
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("staff_code, class_incharge_name")
        .ilike("email", studentEmail.trim())
        .maybeSingle();

      if (student) {
        if (student.staff_code) {
          const { data: staffMember } = await supabaseAdmin
            .from("staff")
            .select("*")
            .ilike("staff_code", student.staff_code)
            .maybeSingle();

          if (staffMember) {
            return NextResponse.json({
              uid: staffMember.id,
              name: staffMember.name,
              email: staffMember.email,
              phone: staffMember.phone,
              staffCode: staffMember.staff_code,
              designation: staffMember.designation,
              photoURL: staffMember.profile_url,
              profile: staffMember.profile_url,
              isClassIncharge: true,
            });
          }
        }

        if (student.class_incharge_name) {
          return NextResponse.json({
            name: student.class_incharge_name,
            isClassIncharge: true,
          });
        }
      }

      return NextResponse.json(null, { status: 404 });
    }

    // 3. Single user fetch by uid, emailParam, or current session email
    const targetEmail = (emailParam || (uid && uid.includes("@") ? uid : "") || sessionEmail || "").trim();
    const targetId = uid && !uid.includes("@") ? uid.trim() : "";

    // 3A. Check in Supabase students table
    let studentRecord: any = null;
    if (targetEmail) {
      const { data } = await supabaseAdmin
        .from("students")
        .select("*, staff:staff_code(name, designation, email, phone)")
        .ilike("email", targetEmail)
        .maybeSingle();
      if (data) studentRecord = data;
    }
    if (!studentRecord && targetId) {
      if (UUID_REGEX.test(targetId)) {
        const { data } = await supabaseAdmin
          .from("students")
          .select("*, staff:staff_code(name, designation, email, phone)")
          .eq("id", targetId)
          .maybeSingle();
        if (data) studentRecord = data;
      }
      if (!studentRecord) {
        const { data } = await supabaseAdmin
          .from("students")
          .select("*, staff:staff_code(name, designation, email, phone)")
          .eq("register_no", targetId)
          .maybeSingle();
        if (data) studentRecord = data;
      }
    }

    if (studentRecord) {
      const isHosteler = studentRecord.hosteler === "1" || studentRecord.hosteler === 1 || String(studentRecord.hosteler).toLowerCase() === "true" || String(studentRecord.hosteler).toLowerCase() === "yes";

      return NextResponse.json({
        uid: studentRecord.id,
        id: studentRecord.id,
        name: studentRecord.name,
        email: studentRecord.email,
        registerNumber: studentRecord.register_no,
        rollNumber: studentRecord.register_no?.slice(-3) || "",
        department: "Department of Artificial Intelligence & Machine Learning",
        deptCode: "AIML",
        course: studentRecord.course || "B.E. Computer Science & Engineering (AI & ML)",
        degreeType: studentRecord.degree_type || "UG",
        class: studentRecord.class || "",
        classId: studentRecord.class || "",
        semester: studentRecord.semester || "",
        section: studentRecord.section || "",
        batch: studentRecord.batch || "",
        currentYear: studentRecord.class || studentRecord.semester || "",
        phone: studentRecord.phone || "",
        photoURL: studentRecord.profile_url || "",
        profile: studentRecord.profile_url || "",
        gender: studentRecord.gender || "—",
        hosteler: isHosteler ? "1" : "0",
        hostelStatus: isHosteler ? "Hosteler" : "Day Scholar",
        classIncharge: studentRecord.staff?.name || studentRecord.class_incharge_name || "—",
        staffCode: studentRecord.staff_code || "",
        role: "student",
        profileComplete: true,
      });
    }

    // 3B. Check in Supabase staff table
    let staffRecord: any = null;
    if (targetEmail) {
      const { data } = await supabaseAdmin
        .from("staff")
        .select("*")
        .ilike("email", targetEmail)
        .maybeSingle();
      if (data) staffRecord = data;
    }
    if (!staffRecord && targetId) {
      if (UUID_REGEX.test(targetId)) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();
        if (data) staffRecord = data;
      }
      if (!staffRecord) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .ilike("staff_code", targetId)
          .maybeSingle();
        if (data) staffRecord = data;
      }
    }

    if (staffRecord) {
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
        uid: staffRecord.id,
        id: staffRecord.id,
        name: staffRecord.name,
        email: staffRecord.email,
        staffCode: staffRecord.staff_code,
        department: staffRecord.department || "Artificial Intelligence & Machine Learning",
        designation: staffRecord.designation || (isHod ? "Head of Department" : "Assistant Professor"),
        phone: staffRecord.phone || "",
        gender: staffRecord.gender || "",
        roomLocation: staffRecord.room_location || "",
        photoURL: staffRecord.profile_url || "",
        profile: staffRecord.profile_url || "",
        role: isHod ? "hod" : "staff",
        isClassIncharge,
        classId: assignedClass,
        profileComplete: true,
      });
    }

    // 3C. Fallback to legacy Firestore if targetId is provided
    if (targetId) {
      try {
        const snap = await getDoc(doc(db, "users", targetId));
        if (snap.exists()) {
          return NextResponse.json({ uid: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.warn("[API /users GET] Firestore fallback failed:", err);
      }
    }

    // If a specific query was made and nothing found, return 404
    if (uid || emailParam) {
      return NextResponse.json(null, { status: 404 });
    }

    // 4. No params: Return all users list from Supabase
    const [{ data: allStudents }, { data: allStaff }] = await Promise.all([
      supabaseAdmin.from("students").select("id, name, email, department, class, batch, register_no, phone, profile_url").order("name"),
      supabaseAdmin.from("staff").select("id, name, email, department, designation, staff_code, phone, profile_url, role").order("name")
    ]);

    const usersList: any[] = [];
    (allStaff || []).forEach(s => {
      const isHod = s.staff_code?.toUpperCase() === "CS91" || s.role === "hod";
      usersList.push({
        uid: s.id,
        name: s.name,
        email: s.email,
        role: isHod ? "hod" : "staff",
        department: s.department,
        designation: s.designation,
        staffCode: s.staff_code,
        phone: s.phone,
        photoURL: s.profile_url,
      });
    });

    (allStudents || []).forEach(st => {
      usersList.push({
        uid: st.id,
        name: st.name,
        email: st.email,
        role: "student",
        department: st.department,
        classId: st.class,
        batch: st.batch,
        registerNumber: st.register_no,
        phone: st.phone,
        photoURL: st.profile_url,
      });
    });

    return NextResponse.json(usersList);
  } catch (e: any) {
    console.error("[API /users GET] Error:", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, ...fields } = body;

    const identifier = uid || email;
    if (!identifier) {
      return NextResponse.json({ error: "uid or email required" }, { status: 400 });
    }

    // Update in Supabase students if exists
    let updated = false;
    const { data: studentMatch } = await supabaseAdmin
      .from("students")
      .select("id")
      .or(`id.eq.${identifier},email.ilike.${identifier}`)
      .maybeSingle();

    if (studentMatch) {
      const studentUpdates: any = {};
      if (fields.phone) studentUpdates.phone = fields.phone;
      if (fields.profile) studentUpdates.profile_url = fields.profile;
      if (fields.photoURL) studentUpdates.profile_url = fields.photoURL;

      await supabaseAdmin.from("students").update(studentUpdates).eq("id", studentMatch.id);
      updated = true;
    }

    // Update in Supabase staff if exists
    const { data: staffMatch } = await supabaseAdmin
      .from("staff")
      .select("id")
      .or(`id.eq.${identifier},email.ilike.${identifier},staff_code.ilike.${identifier}`)
      .maybeSingle();

    if (staffMatch) {
      const staffUpdates: any = {};
      if (fields.phone) staffUpdates.phone = fields.phone;
      if (fields.roomLocation) staffUpdates.room_location = fields.roomLocation;
      if (fields.profile) staffUpdates.profile_url = fields.profile;
      if (fields.photoURL) staffUpdates.profile_url = fields.photoURL;
      if (fields.designation) staffUpdates.designation = fields.designation;

      await supabaseAdmin.from("staff").update(staffUpdates).eq("id", staffMatch.id);
      updated = true;
    }

    // Fallback to Firestore
    if (uid) {
      try {
        await setDoc(doc(db, "users", uid), fields, { merge: true });
        updated = true;
      } catch (e) {
        console.warn("[API /users PATCH] Firestore update skipped:", e);
      }
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    console.error("[API /users PATCH] Error:", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
