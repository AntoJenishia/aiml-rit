import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const email = session?.user?.email?.toLowerCase();
    const username = (session?.user as any)?.username?.toUpperCase();

    // HOD or Admin verification
    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      username === "CS91" ||
      email === "antojenishiadev@gmail.com";

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Unauthorized: HOD or Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { batch, section, staffCode } = body;

    if (!batch || !section || !staffCode) {
      return NextResponse.json(
        { error: "Batch, section, and staffCode are all required" },
        { status: 400 }
      );
    }

    // 1. Fetch staff member to ensure they exist in Supabase
    const { data: staffMember, error: staffErr } = await supabaseAdmin
      .from("staff")
      .select("name, staff_code, email, phone, designation")
      .ilike("staff_code", staffCode.trim())
      .maybeSingle();

    if (staffErr || !staffMember) {
      return NextResponse.json(
        { error: `Staff member with code "${staffCode}" was not found.` },
        { status: 404 }
      );
    }

    // 2. Update students table in Supabase for the specified batch and section
    const { data: updatedStudents, error: updateErr } = await supabaseAdmin
      .from("students")
      .update({
        staff_code: staffMember.staff_code,
        class_incharge_name: staffMember.name,
      })
      .eq("batch", batch.trim())
      .eq("section", section.trim().toUpperCase())
      .select("id, name, register_no");

    if (updateErr) {
      console.error("[POST /api/admin/class-incharge] Update Error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const updatedCount = updatedStudents?.length || 0;

    return NextResponse.json({
      success: true,
      updatedCount,
      batch,
      section,
      staffCode: staffMember.staff_code,
      inchargeName: staffMember.name,
      message: `Successfully assigned ${staffMember.name} (${staffMember.staff_code}) as Class Incharge for Batch ${batch} - Section ${section} (${updatedCount} students updated).`
    });
  } catch (error: any) {
    console.error("[POST /api/admin/class-incharge] Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

