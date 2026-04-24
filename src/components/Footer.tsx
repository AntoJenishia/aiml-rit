import Link from "next/link";
import { footerData, navLinks, contactData } from "@/data/quickLinks";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#1e3a8a] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-white">AIML</span>
            <span className="mt-1 text-xs font-medium tracking-widest uppercase text-blue-200">
              Dept. of AI &amp; ML
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-blue-200">{footerData.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {footerData.socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-blue-100 transition-colors duration-200 hover:bg-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-blue-300" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            {footerData.quickLinksTitle}
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-blue-200">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            {footerData.contactTitle}
          </p>
          <div className="mt-4 space-y-3 text-sm text-blue-200">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <span>{contactData.addressLines.join(", ")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <span>
                {contactData.phoneLabel}:{" "}
                <span className="font-semibold text-white">{contactData.phone}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <span>
                {footerData.emailLabel}:{" "}
                <a
                  className="font-semibold text-white underline underline-offset-4 transition-colors hover:text-blue-100"
                  href={`mailto:${contactData.email}`}
                >
                  {contactData.email}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-700">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-blue-200 sm:px-6 lg:px-8">
          {footerData.rightsText}
        </div>
      </div>
    </footer>
  );
}
