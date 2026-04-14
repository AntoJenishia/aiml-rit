"use client";

import { useEffect, useRef, useState } from "react";

type RevealAnimation = "fade-in-up" | "fade-in";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: RevealAnimation;
  once?: boolean;
}

export default function Reveal({
  children,
  className,
  animation = "fade-in-up",
  once = true
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const animationClass =
    animation === "fade-in" ? "motion-safe:animate-fade-in" : "motion-safe:animate-fade-in-up";

  return (
    <div
      ref={ref}
      className={[className ?? "", visible ? animationClass : "opacity-0"].join(" ")}
    >
      {children}
    </div>
  );
}
