"use client";

import HeroSection from "@/components/HeroSection";
import AboutDepartments from "@/components/home/AboutDepartments";
import StudentAchievements from "@/components/home/StudentAchievements";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import FacultySpotlight from "@/components/home/FacultySpotlight";
import ResearchInnovation from "@/components/home/ResearchInnovation";
import BeyondClassroom from "@/components/home/BeyondClassroom";
import DepartmentGallery from "@/components/home/DepartmentGallery";
import LatestUpdates from "@/components/home/LatestUpdates";
import DepartmentImpact from "@/components/home/DepartmentImpact";
import DigitalPortalFeature from "@/components/home/DigitalPortalFeature";
import PortalCTA from "@/components/home/PortalCTA";
import ContactSection from "@/components/home/ContactSection";
import StatCard from "@/components/StatCard";
import RevealSection from "@/components/RevealSection";
import { Users, Calendar, Trophy, Briefcase } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-slate-50">
      
      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Department Statistics (Immediately below Hero) */}
      <section className="relative z-20 -mt-20 px-6 sm:-mt-24 lg:-mt-28 mb-16">
        <div className="mx-auto max-w-7xl">
          <RevealSection delay={800}>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Students" value="1200" suffix="+" delay={100} />
              <StatCard icon={Briefcase} label="Faculty" value="60" suffix="+" delay={200} />
              <StatCard icon={Trophy} label="Achievements" value="150" suffix="+" delay={300} />
              <StatCard icon={Calendar} label="Events" value="45" suffix="+" delay={400} />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 4 & 5. About Departments & Cards */}
      <AboutDepartments />

      {/* 6. Student Achievements */}
      <StudentAchievements />

      {/* 7. Upcoming Events */}
      <UpcomingEvents />

      {/* 8. Faculty Spotlight */}
      <FacultySpotlight />

      {/* 9. Research & Innovation */}
      <ResearchInnovation />

      {/* 10. Beyond the Classroom */}
      <BeyondClassroom />

      {/* 11. Department Gallery */}
      <DepartmentGallery />

      {/* 12. Latest Department Updates */}
      <LatestUpdates />

      {/* 13. Department Impact */}
      <DepartmentImpact />

      {/* 14. Digital Department Portal */}
      <DigitalPortalFeature />

      {/* 15. Portal CTA */}
      <PortalCTA />

      {/* 16. Contact Section */}
      <ContactSection />
      
    </div>
  );
}
