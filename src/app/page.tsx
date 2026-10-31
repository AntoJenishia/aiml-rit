"use client";

import HeroSection from "@/components/HeroSection";
import KeyServices from "@/components/home/KeyServices";
import AboutDepartments from "@/components/home/AboutDepartments";
import StudentAchievements from "@/components/home/StudentAchievements";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import FacultySpotlight from "@/components/home/FacultySpotlight";
import ResearchInnovation from "@/components/home/ResearchInnovation";
import BeyondClassroom from "@/components/home/BeyondClassroom";
import DepartmentGallery from "@/components/home/DepartmentGallery";
import LatestUpdates from "@/components/home/LatestUpdates";
import DepartmentImpact from "@/components/home/DepartmentImpact";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Hero Section (Welcome to AIML Department Portal + 3D Laptop + AI Tree + Stats) */}
      <HeroSection />

      {/* 2. Key Services (Explore Key Services 6 Cards from Mockup) */}
      <KeyServices />

      {/* 3. About Department & Focus Pillars */}
      <AboutDepartments />

      {/* 4. Student Achievements */}
      <StudentAchievements />

      {/* 5. Upcoming Events */}
      <UpcomingEvents />

      {/* 6. Faculty Spotlight */}
      <FacultySpotlight />

      {/* 7. Research & Innovation */}
      <ResearchInnovation />

      {/* 8. Beyond the Classroom */}
      <BeyondClassroom />

      {/* 9. Department Gallery */}
      <DepartmentGallery />

      {/* 10. Latest Department Updates */}
      <LatestUpdates />

      {/* 11. Department Impact */}
      <DepartmentImpact />

      {/* 12. Contact Section */}
      <ContactSection />
      
    </div>
  );
}
