"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "spa:lastSeenUpdate";

/**
 * Drives the "new official update" dot on the nav tab.
 *
 * content.json is re-fetched in the background (status.json poller →
 * syncContentSince), so `newestDate` can change mid-session without a
 * navigation. That's exactly the case the badge exists for, and it's why the
 * comparison is against a persisted timestamp rather than any in-memory
 * "seen" flag — a reload must not resurrect a dot the user already cleared.
 *
 * Three deliberate choices:
 *  - Reads localStorage in an effect, never during render, so the server-
 *    prerendered HTML and the first client paint agree (`ready` gates the
 *    badge off until after hydration).
 *  - A first-ever visit *seeds* the stored timestamp instead of badging.
 *    Otherwise every new visitor gets a dot for content they've never been
 *    told about, which makes it meaningless. The badge means strictly
 *    "something arrived since you were last here".
 *  - Compares with `>` rather than `!==`, so retracting the newest update
 *    (leaving an older one at the top) doesn't read as new content.
 */
export function useUnreadUpdate(
  newestDate: string | null | undefined,
  isOnUpdatesPage: boolean,
) {
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Private-mode / blocked storage — degrade to "never badge" rather
      // than throwing on every render.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !newestDate) return;
    // Seed on first visit, and clear while the user is actually on the
    // updates page (including when a newer one lands while they sit there).
    const shouldMarkSeen = lastSeen === null || isOnUpdatesPage;
    if (!shouldMarkSeen || lastSeen === newestDate) return;
    try {
      localStorage.setItem(STORAGE_KEY, newestDate);
    } catch {}
    setLastSeen(newestDate);
  }, [ready, newestDate, isOnUpdatesPage, lastSeen]);

  return Boolean(ready && newestDate && lastSeen && newestDate > lastSeen);
}
