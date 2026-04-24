"use client";
import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Custom hook that uses IntersectionObserver to detect when an element enters the viewport.
 * Zero external dependencies — no Framer Motion required.
 */
export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = "-60px", once = true } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

/**
 * Convenience hook that adds/removes a CSS class on the observed element.
 * Attach the returned `ref` to the element; the class is added when it enters view.
 */
export function useRevealOnScroll(className = "visible", options: UseInViewOptions = {}) {
  const { ref, inView } = useInView(options);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) {
      el.classList.add(className);
    }
  }, [inView, className, ref]);

  return ref;
}
