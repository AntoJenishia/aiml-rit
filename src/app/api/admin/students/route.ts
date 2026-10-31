import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!role || (role !== "hod" && role !== "admin" && role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch students from Supabase linked with staff incharge
    const { data: students, error } = await supabaseAdmin
      .from("students")
      .select("*, staff:staff_code(name, designation, email, phone)")
      .order("register_no", { ascending: true });

    if (error) {
      console.error("[GET /api/admin/students] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to frontend expected shape
    const formattedStudents = (students || []).map((s) => ({
      uid: s.id,
      name: s.name,
      email: s.email,
      department: s.department,
      batch: s.batch,
      section: s.section || "",
      semester: s.semester || "",
      currentYear: s.class || s.semester,
      rollNumber: s.register_no?.slice(-3) || "",
      registerNumber: s.register_no,
      phone: s.phone || "",
      classId: s.class || "",
      classIncharge: s.staff?.name || s.class_incharge_name || "—",
      staffCode: s.staff_code || "",
      profile: s.profile_url,
      gender: s.gender,
      hosteler: s.hosteler,
      profileComplete: true,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error: any) {
    console.error("[GET /api/admin/students] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
