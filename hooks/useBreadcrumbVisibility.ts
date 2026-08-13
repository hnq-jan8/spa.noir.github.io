"use client";

import { useEffect, useState } from "react";

/**
 * Whether the mobile breadcrumb pill (see Navbar) should render itself
 * `invisible` — kept mounted (so its layout space doesn't reflow the page
 * underneath) but painting and hit-testing nothing.
 *
 * Lives in a module-level store rather than page state because the
 * breadcrumb is rendered by Navbar — a sibling of the page content, not an
 * ancestor — so a page that needs to hide it (the FAQs mobile search capsule
 * expands directly over that row) has no React tree path to reach it, the
 * same problem useArticleRoute solves for the open-article key.
 *
 * A z-index mask alone isn't enough: iOS Safari's overscroll/rubber-band
 * bounce can shift `fixed` and `sticky` layers out of sync for a frame,
 * letting the breadcrumb show through beneath the mask. `visibility:hidden`
 * sidesteps that — nothing is painted regardless of layer alignment.
 *
 * Counted rather than boolean so two independent callers can't stomp on
 * each other's hide/show.
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
