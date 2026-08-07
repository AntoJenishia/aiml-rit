"use client";

import SectionHeading from "@/components/SectionHeading";
import FacultyCarousel from "@/components/FacultyCarousel";
import RevealSection from "@/components/RevealSection";
import { facultyPageData } from "@/data/quickLinks";
import { useState, useEffect } from "react";
import type { Faculty } from "@/lib/types";

export default function FacultyPage() {
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
    <div className="page-surface">
      {/* Header — constrained width */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <SectionHeading
          eyebrow={facultyPageData.pageHero.badgeLabel}
          title={facultyPageData.pageHero.title}
          subtitle={facultyPageData.pageHero.subtitle}
        />
      </div>

      {/* Carousel — full viewport width, no side padding */}
      <RevealSection delayMs={100}>
        <div className="w-full overflow-hidden">
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
        </div>
      </RevealSection>
    </div>
  );
}
