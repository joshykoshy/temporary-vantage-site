"use client";

import { LazyMotion, m, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

const loadFeatures = () => import("./motion-features").then((r) => r.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>;
}

// Reduced motion is handled in CSS (motion-reduce:*!) rather than with useReducedMotion, so the
// server and client render the same tree — no hydration mismatch, and content is never left hidden.
const still = "motion-reduce:transform-none! motion-reduce:opacity-100!";

/** Fade + short rise when scrolled into view. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.div
      className={`${still} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

/** Gentle parallax: content drifts and settles as its frame scrolls past. */
export function Parallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.04, 1.08]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <m.div style={{ y, scale }} className={`relative h-full w-full ${still}`}>
        {children}
      </m.div>
    </div>
  );
}
