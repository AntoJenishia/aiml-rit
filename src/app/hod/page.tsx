"use client";

import { hodData, hodPageData } from "@/data/hod";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function HodPage() {
  return (
    <div>
      {/* ─── Navy HOD Spotlight ─── */}
      <section className="bg-[#1e3a8a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-14 items-center">
            {/* Left: Photo */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-full ring-4 ring-white ring-offset-2 ring-offset-[#1e3a8a] shadow-2xl">
                <Image
                  src={hodData.photo}
                  alt={hodData.name}
                  width={208}
                  height={208}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                {hodPageData.heroSubtitle}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{hodData.name}</h1>
              <p className="mt-2 text-base font-medium text-[#93c5fd]">{hodData.designation}</p>

              {/* Message */}
              <div className="relative mt-6">
                <span className="pointer-events-none absolute -top-4 -left-3 text-7xl font-extrabold text-[#93c5fd] opacity-20 select-none" aria-hidden="true">
                  &ldquo;
                </span>
                <p className="relative text-base italic leading-8 text-blue-100">{hodData.message}</p>
              </div>

              {/* Quick stat chips */}
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                  {hodData.experience} Experience
                </span>
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                  {hodData.qualification}
                </span>
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                  {hodData.highlights.find((h) => h.label === "Publications")?.value ?? "35+"} Publications
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlights ─── */}
      <section className="bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-3xl">
            {hodPageData.highlightsSectionTitle}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          <div className="mt-10 grid gap-5 grid-cols-2 lg:grid-cols-4">
            {hodData.highlights.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-blue-600 p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <p className="text-4xl font-extrabold text-[#1e3a8a]">{item.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#64748b]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Expertise ─── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-3xl">
            {hodPageData.expertiseSectionTitle}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#2563eb]" aria-hidden="true" />

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {hodData.expertise.map((text) => (
              <span
                key={text}
                className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-[#1e3a8a] transition-all duration-200 hover:bg-[#2563eb] hover:text-white hover:border-transparent"
              >
                {text}
              </span>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-10 flex justify-center">
            <a
              href={`mailto:${hodData.email}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:text-[#1e3a8a] transition-colors"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {hodData.email}
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-[#1e3a8a] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white">{hodPageData.ctaTitle}</h2>
          <p className="mt-4 text-blue-200">{hodPageData.ctaSubtitle}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={hodPageData.ctaPrimaryHref}
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#1e3a8a] transition-all duration-200 hover:bg-blue-50 active:scale-95"
            >
              {hodPageData.ctaPrimaryText}
            </Link>
            <Link
              href={hodPageData.ctaSecondaryHref}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
            >
              {hodPageData.ctaSecondaryText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
