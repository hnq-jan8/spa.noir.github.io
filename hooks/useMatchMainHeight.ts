"use client";

import { useEffect, useRef } from "react";

/**
 * Mobile article-detail wrappers pull themselves up with a negative margin
 * to reach the breadcrumb, then need to reach exactly down to `main`'s own
 * (flex-grown) bottom — otherwise a short article leaves the page's
 * bg-page gray showing through underneath it. A CSS percentage min-height
 * can't do this (percentages don't reliably resolve against a flex-grown
 * `main` in practice), and a fixed-height filler either falls short or
 * badly overshoots — inflating the page's scrollable height and shoving
 * the footer up under the sticky navbar — depending on how short the
 * article is. Measuring the actual gap avoids both failure modes.
 */
export function useMatchMainHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const mainEl = el?.closest("main");
    if (!el || !mainEl) return;

    const recalc = () => {
      if (window.innerWidth >= 768) {
        el.style.minHeight = "";
        return;
      }
      const gap = mainEl.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
      el.style.minHeight = `${Math.max(0, gap)}px`;
    };

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  });

  return ref;
}
