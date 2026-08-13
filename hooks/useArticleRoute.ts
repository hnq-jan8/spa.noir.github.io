"use client";

import { useCallback, useEffect, useState } from "react";

/** Query param carrying the open article's key. */
export const ARTICLE_PARAM = "a";

/**
 * Which article the detail view is showing, kept in the URL query string.
 *
 * The site is a static export whose article text only exists in content.json
 * (fetched at runtime), so per-article HTML files would buy no SEO while
 * breaking the content-only deploy path — a release published through that
 * fast pipeline would 404 against a route list frozen at build time. Keeping
 * the key in a query param means every article is reachable from the one
 * prerendered page, so publishing stays a content-only deploy.
 *
 * The open key lives in a module-level store rather than component state
 * because things outside the article page need it: the language selector has
 * to carry `?a=` across a locale switch, and the nav has to clear it when you
 * re-click the tab you're already on. Neither of those can see React state
 * owned by the page component.
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
 * Bound once, ever, from the first `useArticleKey` mount — not from
 * `useArticleRoute`, which only the article-list pages call. Back/forward
 * can return to an article page from a tab (home, FAQs, flight info) that
 * never mounted that hook, so a listener scoped to the article page's own
 * lifetime would already be gone by the time the popstate for that came in,
 * leaving `currentKey` stuck at whatever `clearArticleRoute` last set it to
 * even though the URL bar is back to `?a=...`. A permanent, module-level
 * listener has no such gap.
 */
function bindPopstate() {
  if (popstateBound || typeof window === "undefined") return;
  popstateBound = true;
  window.addEventListener("popstate", () => setKey(readFromLocation()));
}

/**
 * Drops the detail view without touching history — for when something else
 * (a next/link nav) is already changing the URL. Clearing on *any* nav click
 * is what makes re-clicking the current tab behave like "back to list":
 * the pathname doesn't change, so nothing would otherwise remount.
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
