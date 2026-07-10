"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isBackNavigation } from "@/lib/navigationDirection";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function shouldSkipAnimation() {
  return (
    isBackNavigation() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && shouldSkipAnimation(),
  );

  useEffect(() => {
    if (visible) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
