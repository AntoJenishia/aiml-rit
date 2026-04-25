"use client";

import { contactData } from "@/data/quickLinks";
import SectionHeading from "@/components/SectionHeading";
import RevealSection from "@/components/RevealSection";
import CardReveal from "@/components/CardReveal";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const INFO_ITEMS = [
  { Icon: MapPin, key: "address",  color: "text-blue-600",    bg: "bg-blue-50"   },
  { Icon: Phone,  key: "phone",    color: "text-emerald-600", bg: "bg-emerald-50" },
  { Icon: Mail,   key: "email",    color: "text-violet-600",  bg: "bg-violet-50"  },
] as const;

interface FormState { name: string; email: string; message: string; }
const initial: FormState = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm]     = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle"|"submitting"|"success">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setForm(initial);
      setTimeout(() => setStatus("idle"), 5000);
    }, 1400);
  };

  const infoValues = [
    contactData.addressLines.join(", "),
    contactData.phone,
    contactData.email,
  ];
  const infoLabels = ["Address", contactData.phoneLabel, contactData.emailLabel];

  return (
    <div className="page-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10">

          <RevealSection>
            <SectionHeading eyebrow={contactData.pageTitle}
              title={contactData.pageHeroTitle}
              subtitle={contactData.pageHeroSubtitle} />
          </RevealSection>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Info cards */}
            <div className="space-y-4 lg:col-span-1">
              {INFO_ITEMS.map(({ Icon, key, color, bg }, i) => (
                <CardReveal key={key} delay={i * 80}>
                  <div className="premium-card group flex items-start gap-4 p-5">
                    <span className={`flex shrink-0 rounded-xl ${bg} ${color} p-3 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{infoLabels[i]}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{infoValues[i]}</p>
                    </div>
                  </div>
                </CardReveal>
              ))}
            </div>

            {/* Form */}
            <CardReveal delay={120} className="lg:col-span-2">
              <div className="premium-card rounded-3xl p-8">
                <h3 className="text-lg font-bold text-[#1e3a8a]">{contactData.formTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{contactData.formSubtitle}</p>

                <form className="mt-7 space-y-5" onSubmit={submit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[
                      { id: "name",  label: contactData.formNameLabel,  type: "text",  val: form.name,  key: "name"  },
                      { id: "email", label: contactData.formEmailLabel, type: "email", val: form.email, key: "email" },
                    ].map(({ id, label, type, val, key }) => (
                      <div key={key} className="relative">
                        <input id={id} type={type} required placeholder=" "
                          className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 pb-2 pt-6 text-sm text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          value={val}
                          onChange={e => setForm({ ...form, [key]: e.target.value })} />
                        <label htmlFor={id}
                          className="absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <textarea id="message" rows={5} required placeholder=" "
                      className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 pb-2 pt-6 text-sm text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })} />
                    <label htmlFor="message"
                      className="absolute left-4 top-4 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600">
                      {contactData.formMessageLabel}
                    </label>
                  </div>

                  <button type="submit" disabled={status === "submitting"}
                    className="hero-btn-primary relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-70">
                    <span className="hero-btn-shine" aria-hidden="true" />
                    <span className="relative flex items-center justify-center gap-2">
                      {status === "submitting"
                        ? <><Loader2 className="h-4 w-4 animate-spin" />{contactData.submittingText}</>
                        : <><Send className="h-4 w-4" />{contactData.submitText}</>}
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
            </CardReveal>
          </div>

          <CardReveal delay={150}>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
              <iframe title={contactData.mapEmbedTitle} src={contactData.mapEmbedUrl}
                width="100%" height="260" style={{ border: 0 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </CardReveal>
        </div>
      </div>
    </div>
  );
}
