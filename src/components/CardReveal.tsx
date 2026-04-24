"use client";

import { useInView } from "@/lib/hooks/useInView";
import type { ReactNode, CSSProperties } from "react";

interface CardRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps any card/element so it fades + slides up when it enters the viewport.
 * Each card is tracked independently — stagger via `delay` prop.
 */
export default function CardReveal({ children, delay = 0, className = "", style }: CardRevealProps) {
  const [ref, visible] = useInView<HTMLDivElement>({ threshold: 0.08, once: true });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.97)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
