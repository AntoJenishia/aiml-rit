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

    // Fetch staff directly from Supabase
    const { data: staff, error } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[GET /api/admin/staff] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Query students to aggregate class incharge assignments by staff_code
    const { data: studentRows } = await supabaseAdmin
      .from("students")
      .select("batch, section, class, staff_code")
      .not("staff_code", "is", null);

    const inchargeMap: Record<string, { batch: string; section: string; classTitle: string; count: number }[]> = {};
    for (const row of studentRows || []) {
      const code = (row.staff_code || "").trim().toUpperCase();
      if (!code) continue;
      if (!inchargeMap[code]) inchargeMap[code] = [];
      const existing = inchargeMap[code].find(
        (c) => c.batch === row.batch && c.section === row.section
      );
      if (existing) {
        existing.count += 1;
      } else {
        inchargeMap[code].push({
          batch: row.batch,
          section: row.section,
          classTitle: row.class || `Batch ${row.batch} - Section ${row.section}`,
          count: 1,
        });
      }
    }

    const formattedStaff = (staff || []).map((s) => {
      const codeUpper = (s.staff_code || "").trim().toUpperCase();
      const inchargeClasses = inchargeMap[codeUpper] || [];

      return {
        uid: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        designation: s.designation,
        staffCode: s.staff_code,
        phone: s.phone || "",
        gender: s.gender || "",
        roomLocation: s.room_location || "",
        profile: s.profile_url,
        role: s.staff_code?.toUpperCase() === "CS91" ? "hod" : (s.role || "staff"),
        specialization: s.specialization || "",
        qualification: s.qualification || "",
        experience: s.experience || "",
        bio: s.bio || "",
        isClassIncharge: inchargeClasses.length > 0,
        inchargeClasses,
      };
    });

    return NextResponse.json(formattedStaff);
  } catch (error: any) {
    console.error("[GET /api/admin/staff] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      (session?.user as any)?.username === "CS91" ||
      session?.user?.email === "antojenishiadev@gmail.com";

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Unauthorized: HOD access required" }, { status: 403 });
    }

    const body = await req.json();
    const { id, uid, name, staffCode, designation, phone, email, gender, roomLocation, profile } = body;
    const staffId = id || uid;

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (staffCode !== undefined) updatePayload.staff_code = staffCode.trim();
    if (designation !== undefined) updatePayload.designation = designation.trim();
    if (phone !== undefined) updatePayload.phone = phone.trim() || null;
    if (email !== undefined) updatePayload.email = email.trim().toLowerCase();
    if (gender !== undefined) updatePayload.gender = gender.trim() || null;
    if (roomLocation !== undefined) updatePayload.room_location = roomLocation.trim() || null;
    if (profile !== undefined) updatePayload.profile_url = profile.trim() || null;

    const { data, error } = await supabaseAdmin
      .from("staff")
      .update(updatePayload)
      .eq("id", staffId)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/admin/staff] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, staff: data });
  } catch (error: any) {
    console.error("[PATCH /api/admin/staff] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
