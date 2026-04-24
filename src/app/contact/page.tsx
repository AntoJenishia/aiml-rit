"use client";

import { contactData } from "@/data/quickLinks";
import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

const initialState: FormState = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (key: keyof FormState) => (value: string) => {
    setSubmitted(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setForm(initialState);
    }, 650);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">{contactData.pageTitle}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1e3a8a] sm:text-4xl">
            {contactData.pageHeroTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
            {contactData.pageHeroSubtitle}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Info + Map */}
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-[#1e3a8a]">{contactData.officeTitle}</h3>

            {/* Info cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{contactData.addressLines.join(", ")}</p>
              </div>

              <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">{contactData.phoneLabel}:</span> {contactData.phone}
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="rounded-xl bg-blue-50 p-3 text-[#2563eb] shrink-0">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">{contactData.emailLabel}:</span>{" "}
                  <a href={`mailto:${contactData.email}`} className="font-medium text-[#2563eb] hover:text-[#1e3a8a]">
                    {contactData.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <iframe
                title={contactData.mapEmbedTitle}
                src={contactData.mapEmbedUrl}
                width="100%"
                height="260"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-extrabold text-[#1e3a8a]">{contactData.formTitle}</h3>
            <p className="mt-2 text-sm text-[#64748b]">{contactData.formSubtitle}</p>

            <form className="mt-6 grid gap-5" onSubmit={onSubmit}>
              {/* Name */}
              <div className="floating-label-group">
                <input
                  className="floating-input"
                  placeholder={contactData.formNamePlaceholder}
                  type="text"
                  value={form.name}
                  required
                  onChange={(e) => onChange("name")(e.target.value)}
                />
                <span className="floating-label">{contactData.formNameLabel}</span>
              </div>

              {/* Email */}
              <div className="floating-label-group">
                <input
                  className="floating-input"
                  placeholder={contactData.formEmailPlaceholder}
                  type="email"
                  value={form.email}
                  required
                  onChange={(e) => onChange("email")(e.target.value)}
                />
                <span className="floating-label">{contactData.formEmailLabel}</span>
              </div>

              {/* Message */}
              <div className="floating-label-group">
                <textarea
                  className="floating-textarea"
                  placeholder={contactData.formMessagePlaceholder}
                  rows={5}
                  value={form.message}
                  required
                  onChange={(e) => onChange("message")(e.target.value)}
                />
                <span className="floating-label">{contactData.formMessageLabel}</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={clsx(
                  "w-full rounded-xl bg-[#2563eb] py-3 text-sm font-semibold text-white shadow-sm",
                  "transition-all duration-200 hover:bg-blue-700 active:scale-95",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? contactData.submittingText : contactData.submitText}
                </span>
              </button>

              {/* Success message */}
              {submitted ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 animate-fadeUp">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-emerald-800">{contactData.successTitle}</p>
                      <p className="mt-1 text-sm text-emerald-700">{contactData.successText}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
