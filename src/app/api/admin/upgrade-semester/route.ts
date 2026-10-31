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

    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      username === "CS91" ||
      email === "antojenishiadev@gmail.com";

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Unauthorized: HOD access required" }, { status: 403 });
    }

    const body = await req.json();
    const { batch, targetSemester, section, sectionIncharges } = body;

    if (!batch || targetSemester === undefined || targetSemester === null) {
      return NextResponse.json(
        { error: "Batch and targetSemester are required." },
        { status: 400 }
      );
    }

    const semNum = Number(targetSemester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return NextResponse.json(
        { error: "Target semester must be a number between 1 and 8." },
        { status: 400 }
      );
    }

    // 1. Fetch students for the specified batch (and section if provided)
    let query = supabaseAdmin
      .from("students")
      .select("id, name, class, semester, section, batch")
      .eq("batch", batch.trim());

    if (section && section !== "ALL") {
      query = query.eq("section", section.trim().toUpperCase());
    }

    const { data: students, error: fetchErr } = await query;

    if (fetchErr || !students || students.length === 0) {
      return NextResponse.json(
        { error: `No students found for Batch "${batch}"${section ? ` Section "${section}"` : ""}.` },
        { status: 404 }
      );
    }

    // 2. Perform updates for each student with transformed class string & optional incharge
    const updates = students.map((s) => {
      let updatedClass = s.class || "";
      if (updatedClass.includes("/")) {
        // e.g. "B.E. CSE (AI & ML) / 5 / A" -> replace the middle number with target semester
        updatedClass = updatedClass.replace(/\/\s*\d+\s*\//, `/ ${semNum} /`);
      } else {
        updatedClass = `B.E. CSE (AI & ML) / ${semNum} / ${s.section || "A"}`;
      }

      const updatePayload: Record<string, any> = {
        semester: String(semNum),
        class: updatedClass,
      };

      if (sectionIncharges && s.section && sectionIncharges[s.section.toUpperCase()]) {
        const inchargeInfo = sectionIncharges[s.section.toUpperCase()];
        if (inchargeInfo.staffCode) {
          updatePayload.staff_code = inchargeInfo.staffCode;
        }
        if (inchargeInfo.name) {
          updatePayload.class_incharge_name = inchargeInfo.name;
        }
      }

      return supabaseAdmin
        .from("students")
        .update(updatePayload)
        .eq("id", s.id);
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      batch,
      targetSemester: semNum,
      section: section || "ALL",
      updatedCount: students.length,
      message: `Successfully upgraded Batch ${batch}${section && section !== "ALL" ? ` (Sec ${section})` : ""} to Semester ${semNum} (${students.length} students updated).`
    });
  } catch (error: any) {
    console.error("[POST /api/admin/upgrade-semester] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

