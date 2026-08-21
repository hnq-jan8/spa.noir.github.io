"use client";

import { useEffect, useState } from "react";

/**
 * Whether the mobile breadcrumb pill (Navbar) should render `invisible` —
 * mounted, so its layout space stays, but painting nothing.
 *
 * Module-level because Navbar is a sibling of the page content: a page that
 * needs the row (the FAQs search capsule) has no tree path to it — the same
 * problem useArticleRoute solves for the open-article key.
 *
 * A z-index mask isn't enough: iOS Safari's rubber-band bounce can desync
 * fixed/sticky layers for a frame and let the breadcrumb through.
 *
 * Counted, not boolean, so two callers can't stomp on each other.
 */
let hiddenCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function useBreadcrumbHidden(): boolean {
  const [hidden, setHidden] = useState(() => hiddenCount > 0);

  useEffect(() => {
    const sync = () => setHidden(hiddenCount > 0);
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return hidden;
}

/** For Navbar: whether the breadcrumb should currently render. */
export { useBreadcrumbHidden };

/** For a page: hide the breadcrumb for as long as `active` is true. */
export function useHideBreadcrumbWhen(active: boolean) {
  useEffect(() => {
    if (!active) return;
    hiddenCount += 1;
    emit();
    return () => {
      hiddenCount -= 1;
      emit();
    };
  }, [active]);
}
