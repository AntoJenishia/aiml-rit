"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import FacultyCarousel from "../FacultyCarousel";
import { faculty as staticFaculty } from "@/data/faculty";
import { useState, useEffect } from "react";
import type { Faculty } from "@/lib/types";

export default function FacultySpotlight() {
  const [liveFaculty, setLiveFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const users = await res.json();
          const staffUsers = users.filter((u: any) => u.role === 'staff' || u.role === 'hod');
          
          if (staffUsers.length > 0) {
            // Remove duplicates based on email
            const uniqueStaff = Array.from(new Map(staffUsers.map((u: any) => [u.email, u])).values());
            
            const mappedFaculty: Faculty[] = (uniqueStaff as any[]).map((u: any) => ({
              uid: u.uid || u.id || `staff-${Math.random()}`,
              name: u.name || "Faculty Member",
              qualification: u.qualification || "",
              specialization: u.specialization || "",
              experience: parseInt(u.experience) || 0,
              photo: u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Faculty')}&background=1e3a8a&color=fff&size=256`
            }));
            
            setLiveFaculty(mappedFaculty);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-16">
          <RevealSection>
            <SectionHeading
              title="Meet Our Faculty"
              subtitle="Learn from experienced educators, researchers and technology professionals."
            />
          </RevealSection>
          
          <RevealSection delayMs={200}>
            <Link 
              href="/faculty"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              View All Faculty
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>

        {/* Reusing FacultyCarousel which expects `faculties` */}
        <div className="-mx-6 px-6 pb-8">
          <RevealSection delayMs={300}>
            {loading ? (
              <div className="flex justify-center items-center h-[280px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
              </div>
            ) : liveFaculty.length > 0 ? (
              <FacultyCarousel faculty={liveFaculty} />
            ) : (
              <div className="flex justify-center items-center h-[280px]">
                <p className="text-slate-500 font-medium">No faculty members found.</p>
              </div>
            )}
          </RevealSection>
        </div>

      </div>
    </section>
  );
}
