"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks whether a scrollable element has more content off-screen to the
 * left/right. Uses ResizeObserver + MutationObserver (not just a mount-time
 * measurement) so it stays correct when content streams in asynchronously
 * (e.g. nav items arriving after content.json fetch resolves).
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(el, { childList: true, subtree: true });

    el.addEventListener("scroll", update);
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const scrollBy = useCallback((dir: "left" | "right", amount: number) => {
    ref.current?.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  return { ref, canScrollLeft, canScrollRight, scrollBy };
}
