"use client";

import SectionHeading from "@/components/SectionHeading";
import { contactData, motionTokens } from "@/data/quickLinks";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
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
  const prefersReducedMotion = useReducedMotion();

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
    }, prefersReducedMotion ? 0 : 650);
  };

  return (
    <div className="grid gap-10">
      <motion.section
        className="relative flex h-48 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-8"
        initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">{contactData.pageTitle}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{contactData.pageHeroTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-200/80 sm:text-base">
            {contactData.pageHeroSubtitle}
          </p>
        </div>
      </motion.section>

      <SectionHeading title={contactData.pageTitle} subtitle={contactData.pageHeroSubtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          className={clsx(
            "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl",
            "p-8"
          )}
          initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }}
        >
          <h3 className="text-lg font-bold text-slate-900">{contactData.officeTitle}</h3>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>{contactData.addressLines.join(", ")}</p>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <span className="font-semibold text-slate-900">{contactData.phoneLabel}:</span>
              <span>{contactData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <span className="font-semibold text-slate-900">{contactData.emailLabel}:</span>
              <a className="font-medium text-blue-600 hover:text-blue-800" href={`mailto:${contactData.email}`}>
                {contactData.email}
              </a>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/60">
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
        </motion.section>

        <motion.section
          className={clsx(
            "bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-100/40 rounded-2xl",
            "p-8"
          )}
          initial={{ opacity: 0, y: motionTokens.sectionFadeInY }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: motionTokens.sectionFadeInDuration, ease: "easeOut" }}
        >
          <h3 className="text-lg font-bold text-slate-900">{contactData.formTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{contactData.formSubtitle}</p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <FloatingField
              value={form.name}
              onChange={(v) => onChange("name")(v)}
              label={contactData.formNameLabel}
              placeholder={contactData.formNamePlaceholder}
              type="text"
            />
            <FloatingField
              value={form.email}
              onChange={(v) => onChange("email")(v)}
              label={contactData.formEmailLabel}
              placeholder={contactData.formEmailPlaceholder}
              type="email"
            />
            <FloatingTextArea
              value={form.message}
              onChange={(v) => onChange("message")(v)}
              label={contactData.formMessageLabel}
              placeholder={contactData.formMessagePlaceholder}
            />

            <motion.button
              type="submit"
              className={clsx(
                "w-full rounded-full px-8 py-3 font-semibold text-white",
                "bg-gradient-to-r from-blue-600 to-violet-600 shadow-xl shadow-blue-200/30",
                "disabled:opacity-60"
              )}
              disabled={isSubmitting}
              whileHover={prefersReducedMotion || isSubmitting ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion || isSubmitting ? undefined : { scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {isSubmitting ? contactData.submittingText : contactData.submitText}
              </span>
            </motion.button>

            <AnimatePresence initial={false}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
                  className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-emerald-800">{contactData.successTitle}</p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-700">{contactData.successText}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </form>
        </motion.section>
      </div>
    </div>
  );
}

function FloatingField({
  label,
  placeholder,
  type,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  type: "text" | "email";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative">
      <input
        className={clsx(
          "peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900",
          "backdrop-blur-sm outline-none transition-all duration-200",
          "placeholder:text-transparent focus:border-transparent focus:ring-2 focus:ring-blue-500"
        )}
        placeholder={placeholder}
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
      />
      <span
        className={clsx(
          "pointer-events-none absolute left-4 top-3 text-sm text-slate-500 transition-all duration-200",
          "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500",
          "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-700",
          value.length > 0 && "-top-2 text-xs text-blue-700"
        )}
      >
        {label}
      </span>
    </label>
  );
}

function FloatingTextArea({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative">
      <textarea
        className={clsx(
          "peer w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900",
          "backdrop-blur-sm outline-none transition-all duration-200",
          "placeholder:text-transparent focus:border-transparent focus:ring-2 focus:ring-blue-500"
        )}
        placeholder={placeholder}
        rows={5}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
      />
      <span
        className={clsx(
          "pointer-events-none absolute left-4 top-3 text-sm text-slate-500 transition-all duration-200",
          "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500",
          "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-700",
          value.length > 0 && "-top-2 text-xs text-blue-700"
        )}
      >
        {label}
      </span>
    </label>
  );
}
