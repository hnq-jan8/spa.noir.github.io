"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "spa:lastSeenUpdate";

/**
 * Drives the "new official update" dot on the nav tab. `newestDate` can change
 * mid-session (background content re-fetch), which is the case the badge
 * exists for — hence a persisted timestamp, not an in-memory "seen" flag.
 *
 *  - localStorage is read in an effect, never during render, so prerendered
 *    HTML and first paint agree (`ready` gates the badge until hydration).
 *  - A first-ever visit seeds the timestamp instead of badging: the dot means
 *    strictly "something arrived since you were last here".
 *  - Compares with `>`, so retracting the newest update doesn't read as new.
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
