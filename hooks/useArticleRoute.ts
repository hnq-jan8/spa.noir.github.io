"use client";

import { useCallback, useEffect, useState } from "react";

/** Query param carrying the open article's key. */
export const ARTICLE_PARAM = "a";

/**
 * Which article the detail view is showing, kept in the URL query string.
 *
 * Per-article routes would freeze the route list at build time, so an article
 * published through the content-only deploy would 404. A query param keeps
 * every article reachable from the one prerendered page.
 *
 * Module-level, not component state: the language selector (carrying `?a=`
 * across a locale switch) and the nav (clearing it) both live outside the
 * article page.
 */
let currentKey: string | null = null;
let initialised = false;
let popstateBound = false;
const listeners = new Set<() => void>();

function readFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(ARTICLE_PARAM);
}

function emit() {
  listeners.forEach((l) => l());
}

function setKey(next: string | null) {
  if (currentKey === next) return;
  currentKey = next;
  emit();
}

/**
 * Bound once from the first `useArticleKey` mount, and never unbound: back/
 * forward can return to an article from a tab that never mounted the article
 * page, so a listener scoped to that page's lifetime would already be gone.
 */
function bindPopstate() {
  if (popstateBound || typeof window === "undefined") return;
  popstateBound = true;
  window.addEventListener("popstate", () => setKey(readFromLocation()));
}

/**
 * Drops the detail view without touching history, for when a next/link nav is
 * already changing the URL. Clearing on any nav click is what makes
 * re-clicking the current tab read as "back to list".
 */
export function clearArticleRoute() {
  setKey(null);
}

/** Current open article key, for components outside the article page. */
export function useArticleKey(): string | null {
  const [key, setLocal] = useState<string | null>(currentKey);

  useEffect(() => {
    if (!initialised) {
      initialised = true;
      currentKey = readFromLocation();
    }
    bindPopstate();
    const sync = () => setLocal(currentKey);
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return key;
}

export function useArticleRoute() {
  const key = useArticleKey();

  const open = useCallback((next: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(ARTICLE_PARAM, next);
    window.history.pushState(null, "", url);
    setKey(next);
    window.scrollTo({ top: 0 });
  }, []);

  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(ARTICLE_PARAM);
    window.history.pushState(null, "", url);
    setKey(null);
  }, []);

  return { key, open, close };
}
