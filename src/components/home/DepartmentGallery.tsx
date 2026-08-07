"use client";

import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";
import CardReveal from "../CardReveal";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

const categories = ["All", "Events", "Workshops", "Hackathons", "Industrial Visits", "Activities"];

const galleryItems = [
  { id: 1, category: "Events", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", title: "National AI Symposium", colSpan: 2, rowSpan: 2 },
  { id: 2, category: "Workshops", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80", title: "Deep Learning Workshop", colSpan: 1, rowSpan: 1 },
  { id: 3, category: "Hackathons", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80", title: "24Hr CodeFest", colSpan: 1, rowSpan: 2 },
  { id: 4, category: "Activities", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", title: "Team Building", colSpan: 1, rowSpan: 1 },
  { id: 5, category: "Industrial Visits", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", title: "Tech Park Visit", colSpan: 2, rowSpan: 1 },
];

export default function DepartmentGallery() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredItems = galleryItems.filter(
    item => activeTab === "All" || item.category === activeTab
  );

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        
        <RevealSection>
          <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
            <SectionHeading
              title="Department Highlights"
              subtitle="Glimpses of academic, technical and extracurricular events."
            />
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all",
                    activeTab === cat 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Masonry/Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {filteredItems.map((item, i) => (
            <CardReveal 
              key={item.id} 
              delay={i * 100}
              className={clsx(
                "relative group overflow-hidden rounded-2xl bg-slate-100",
                item.colSpan === 2 && "col-span-2 md:col-span-2",
                item.rowSpan === 2 && "row-span-2"
              )}
            >
              <div className="w-full h-full relative">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 block">
                      {item.category}
                    </span>
                    <h4 className="text-white font-bold text-lg leading-tight">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>
            </CardReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
