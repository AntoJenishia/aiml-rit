import Link from "next/link";
import clsx from "clsx";
import { footerData, navLinks, contactData } from "@/data/quickLinks";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p
            className={clsx(
              "bg-gradient-to-r from-blue-200 via-blue-100 to-violet-200 bg-clip-text text-transparent",
              "text-lg font-extrabold"
            )}
          >
            {footerData.departmentName}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{footerData.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {footerData.socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-blue-500/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            {footerData.quickLinksTitle}
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-300">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">{footerData.contactTitle}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{contactData.addressLines.join(", ")}</p>
          <p className="mt-3 text-sm text-slate-300">
            {contactData.phoneLabel}: <span className="font-semibold text-white">{contactData.phone}</span>
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {footerData.emailLabel}:{" "}
            <a className="font-semibold text-white underline underline-offset-4" href={`mailto:${contactData.email}`}>
              {contactData.email}
            </a>
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
        {footerData.rightsText}
      </div>
    </footer>
  );
}
