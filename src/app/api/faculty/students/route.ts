import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, formatProfileUrl } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterClass = searchParams.get("class");

    const email = session.user.email?.toLowerCase().trim();
    const sessionUser = session.user as any;
    const username = (sessionUser?.username || sessionUser?.staffCode || "").trim();
    const uid = (sessionUser?.uid || sessionUser?.id || "").trim();
    const sessionName = (session.user.name || "").trim();

    // 1. Locate faculty member in Supabase staff table
    let faculty: any = null;

    let targetCode = username;
    if (!targetCode && email?.includes("@internal.aiml.rit")) {
      targetCode = email.split("@")[0].trim();
    }

    if (targetCode) {
      const { data } = await supabaseAdmin
        .from("staff")
        .select("*")
        .ilike("staff_code", targetCode)
        .maybeSingle();
      if (data) faculty = data;
    }

    if (!faculty && email && !email.includes("@internal.aiml.rit")) {
      const { data } = await supabaseAdmin
        .from("staff")
        .select("*")
        .ilike("email", email)
        .maybeSingle();
      if (data) faculty = data;
    }

    if (!faculty && sessionName && !sessionName.toLowerCase().includes("test")) {
      const { data } = await supabaseAdmin
        .from("staff")
        .select("*")
        .ilike("name", sessionName)
        .maybeSingle();
      if (data) faculty = data;
    }

    if (!faculty && uid) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
      if (isUUID) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .eq("id", uid)
          .maybeSingle();
        if (data) faculty = data;
      }
      if (!faculty) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .ilike("staff_code", uid)
          .maybeSingle();
        if (data) faculty = data;
      }
    }

    // Dev bypass fallback for test admin/HOD email
    if (!faculty && email === "antojenishiadev@gmail.com") {
      faculty = {
        name: "Anto Jenishia",
        staff_code: "CS91",
        role: "hod",
        department: "Artificial Intelligence & Machine Learning",
      };
    }

    if (!faculty) {
      return NextResponse.json({ error: "Faculty record not found" }, { status: 404 });
    }

    const isHod = faculty.staff_code?.toUpperCase() === "CS91" || faculty.role === "hod" || (session.user as any)?.role === "hod";

    // 2. Query students
    let query = supabaseAdmin
      .from("students")
      .select("*, staff:staff_code(name, designation, email, phone)");

    if (!isHod) {
      // Regular faculty: filter by their staff_code or incharge name
      query = query.or(`staff_code.ilike.${faculty.staff_code},class_incharge_name.ilike.%${faculty.name}%`);
    }

    if (filterClass) {
      query = query.ilike("class", `%${filterClass}%`);
    }

    const { data: studentRows, error } = await query.order("register_no", { ascending: true });

    if (error) {
      console.error("[GET /api/faculty/students] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Format students for StaffDash
    const mappedStudents = (studentRows || []).map((s) => ({
      uid: s.id,
      id: s.id,
      name: s.name,
      registerNumber: s.register_no,
      rollNumber: s.register_no?.slice(-3) || "",
      batch: s.batch,
      section: s.section,
      classId: s.class,
      class: s.class,
      currentYear: s.class || s.semester,
      semester: s.semester,
      email: s.email,
      phone: s.phone,
      profile: formatProfileUrl(s.profile_url),
      photoURL: formatProfileUrl(s.profile_url),
      profile_url: formatProfileUrl(s.profile_url),
      hosteler: s.hosteler,
      gender: s.gender,
      classIncharge: s.staff?.name || s.class_incharge_name || faculty.name,
      staffCode: s.staff_code,
    }));

    return NextResponse.json(mappedStudents);
  } catch (error: any) {
    console.error("[GET /api/faculty/students] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
