import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type HeadingAlign = "left" | "center";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: HeadingAlign;
}

export default function SectionHeading({ title, subtitle, align = "left" }: SectionHeadingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={clsx(align === "center" ? "text-center" : "text-left")}>
      <h2
        className={clsx(
          "bg-gradient-to-r from-blue-900 via-blue-600 to-violet-600 bg-clip-text text-transparent",
          "text-2xl font-extrabold tracking-tight sm:text-3xl"
        )}
      >
        {title}
      </h2>

      <motion.div
        aria-hidden="true"
        className={clsx(
          "mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-violet-500",
          align === "center" ? "mx-auto" : "mx-0"
        )}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
        style={{ transformOrigin: align === "center" ? "center" : "left" }}
      />

      {subtitle ? (
        <motion.p
          className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
