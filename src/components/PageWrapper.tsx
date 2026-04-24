"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Re-trigger animation on route change
    el.classList.remove("page-enter-active");
    void el.offsetWidth; // force reflow
    el.classList.add("page-enter-active");
  }, [pathname]);

  return (
    <div ref={wrapRef} className="page-enter-active min-h-screen">
      {children}
    </div>
  );
}
