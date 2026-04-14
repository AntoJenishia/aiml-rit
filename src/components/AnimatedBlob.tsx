"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type BlobColor = "blue" | "violet";
type BlobSize = "sm" | "md" | "lg";
type BlobPosition = "tl" | "tr" | "bl" | "br" | "center";

interface AnimatedBlobProps {
  color: BlobColor;
  size: BlobSize;
  position: BlobPosition;
}

const COLOR_CLASS: Record<BlobColor, string> = {
  blue: "bg-blue-300/40",
  violet: "bg-violet-300/40"
};

const SIZE_CLASS: Record<BlobSize, string> = {
  sm: "h-44 w-44",
  md: "h-72 w-72",
  lg: "h-[420px] w-[420px]"
};

const POSITION_CLASS: Record<BlobPosition, string> = {
  tl: "left-[-80px] top-[-80px]",
  tr: "right-[-80px] top-[-80px]",
  bl: "left-[-80px] bottom-[-80px]",
  br: "right-[-80px] bottom-[-80px]",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
};

export default function AnimatedBlob({ color, size, position }: AnimatedBlobProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={clsx(
        "pointer-events-none absolute rounded-full blur-3xl select-none",
        "will-change-transform",
        COLOR_CLASS[color],
        SIZE_CLASS[size],
        POSITION_CLASS[position]
      )}
      animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 8, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}

