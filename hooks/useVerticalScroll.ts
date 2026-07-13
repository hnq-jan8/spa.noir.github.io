"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks whether a scrollable element has more content off-screen above/below.
 * Mirrors useHorizontalScroll but for the vertical axis (used to drive fade
 * overlays on internally-scrolling card content).
 */
export function useVerticalScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
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

  return { ref, canScrollUp, canScrollDown };
}
