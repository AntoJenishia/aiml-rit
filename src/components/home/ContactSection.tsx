"use client";

import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import RevealSection from "../RevealSection";
import SectionHeading from "../SectionHeading";

export default function ContactSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        <RevealSection>
          <SectionHeading
            title="Connect With Our Department"
            subtitle="Reach out for academic inquiries, collaborations, and admissions."
            align="center"
          />
        </RevealSection>

        <div className="mt-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Contact Info */}
          <RevealSection delay={100}>
            <div>
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Department of AIML &amp; AI&amp;DS
                </h3>
                <p className="text-slate-600">
                  Rajalakshmi Institute of Technology<br/>
                  Chennai, Tamil Nadu
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Email</p>
                    <a href="mailto:aiml.department@rit.edu.in" className="text-slate-600 hover:text-blue-600 transition-colors">
                      aiml.department@rit.edu.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Phone</p>
                    <a href="tel:+914440001234" className="text-slate-600 hover:text-blue-600 transition-colors">
                      +91 44 4000 1234
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Address</p>
                    <p className="text-slate-600 leading-relaxed">
                      Kuthambakkam, Chembarabakkam<br/>
                      Chennai, Tamil Nadu 600124<br/>
                      India
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="mt-10 pt-10 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-4">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {["LinkedIn", "Instagram", "YouTube"].map(social => (
                    <a 
                      key={social}
                      href="#"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {social}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Right: Map Placeholder */}
          <RevealSection delay={200}>
            <div className="h-full min-h-[400px] w-full rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3886.9596138459974!2d80.0428186!3d13.0382427!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528bae35449d29%3A0x37d13f08d672385b!2sRajalakshmi%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1777059037956!5m2!1sen!2sin" 
                className="absolute inset-0 w-full h-full border-0 grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100" 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </RevealSection>

        </div>
      </div>
    </section>
  );
}
