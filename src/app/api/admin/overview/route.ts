import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!role || (role !== "hod" && role !== "admin")) {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 });
    }

    // 1. Get real counts from Supabase
    const { count: studentCount, error: studentError } = await supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true });

    const { count: staffCount, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("*", { count: "exact", head: true });

    const aimlStudents = studentCount || 0;
    const aimlFaculty = staffCount || 0;
    const aimlPendingOD = 0;
    const totalBatches = 4;
    const activeSections = 8;
    const upcomingEvents = 0;

    const metrics = {
      totalStudents: aimlStudents,
      totalFaculty: aimlFaculty,
      totalBatches,
      activeSections,
      pendingOD: aimlPendingOD,
      pendingAchievements: 0,
      pendingPortfolios: 0,
      upcomingEvents,
      aiml: {
        students: aimlStudents,
        faculty: aimlFaculty,
        pendingOD: aimlPendingOD,
        achievements: 0
      }
    };

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("[HOD Overview API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
