import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: staff, error } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[GET /api/faculty] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (staff || []).map((s) => ({
      uid: s.id,
      name: s.name,
      email: s.email,
      department: s.department,
      designation: s.designation,
      qualification: s.designation || "Faculty",
      specialization: s.designation || "AI & Machine Learning",
      experience: 5,
      photo: s.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=003087&color=fff&size=256`,
      staffCode: s.staff_code,
      phone: s.phone,
      roomLocation: s.room_location,
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("[GET /api/faculty] Error:", err);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

