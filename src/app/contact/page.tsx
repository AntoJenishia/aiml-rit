"use client";

import { contactData } from "@/data/quickLinks";
import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

const initialState: FormState = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setForm(initialState);
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8">
          <SectionHeading
            eyebrow={contactData.pageTitle}
            title={contactData.pageHeroTitle}
            subtitle={contactData.pageHeroSubtitle}
          />

          <RevealSection>
            <div className="grid gap-8 lg:grid-cols-3">

              {/* Contact info cards */}
              <div className="space-y-4 lg:col-span-1">
                <h3 className="text-xl font-bold text-[#1e3a8a]">{contactData.officeTitle}</h3>

                {[
                  { Icon: MapPin, label: "Address", value: contactData.addressLines.join(", "), color: "text-blue-600" },
                  { Icon: Phone, label: contactData.phoneLabel, value: contactData.phone, color: "text-emerald-600" },
                  { Icon: Mail, label: contactData.emailLabel, value: contactData.email, color: "text-violet-600" },
                ].map(({ Icon, label, value, color }, i) => (
                  <div
                    key={label}
                    className="card-reveal premium-card group p-5"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`flex shrink-0 rounded-xl bg-slate-50 p-3 ${color} transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                        <p className="mt-1 text-sm text-slate-800">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form card */}
              <div className="premium-card rounded-3xl p-8 lg:col-span-2">
                <h3 className="text-xl font-bold text-[#1e3a8a]">{contactData.formTitle}</h3>
                <p className="mt-2 text-slate-500">{contactData.formSubtitle}</p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="relative">
                      <input
                        id="name"
                        required
                        placeholder=" "
                        className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 pb-2 pt-6 text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                      <label htmlFor="name" className="absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600">
                        {contactData.formNameLabel}
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        required
                        placeholder=" "
                        className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 pb-2 pt-6 text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      <label htmlFor="email" className="absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600">
                        {contactData.formEmailLabel}
                      </label>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder=" "
                      className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 pb-2 pt-6 text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                    <label htmlFor="message" className="absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600">
                      {contactData.formMessageLabel}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="hero-btn-primary relative mt-2 w-full overflow-hidden rounded-xl py-4 font-semibold text-white disabled:opacity-70"
                  >
                    <span className="hero-btn-shine" aria-hidden="true" />
                    <span className="relative flex items-center justify-center gap-2">
                      {status === "submitting" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />{contactData.submittingText}</>
                      ) : (
                        <><Send className="h-4 w-4" />{contactData.submitText}</>
                      )}
                    </span>
                  </button>

                  {status === "success" && (
                    <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-blue-700">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{contactData.successTitle}</p>
                        <p className="text-xs">{contactData.successText}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </RevealSection>

          <RevealSection delayMs={120}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title={contactData.mapEmbedTitle}
                src={contactData.mapEmbedUrl}
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}
