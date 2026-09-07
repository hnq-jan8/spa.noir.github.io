"use client";

import { useCallback, useEffect, useState } from "react";

import { markForwardNavigation } from "@/lib/navigationDirection";

/** Query param carrying the open article's key. */
export const ARTICLE_PARAM = "a";

/**
 * Bài nào đang mở, giữ trong query string.
 *
 * Route riêng cho từng bài sẽ đóng băng danh sách route lúc build, nên bài
 * đăng qua deploy content-only sẽ 404. Query param giữ mọi bài truy cập được
 * từ đúng một trang prerender.
 *
 * Để ở module chứ không phải state: language selector (mang `?a=` qua khi đổi
 * locale) và nav (xoá nó) đều nằm ngoài trang bài viết.
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
 * Bind một lần, không bao giờ gỡ: back/forward có thể quay lại một bài từ tab
 * chưa từng mount trang bài viết, listener theo vòng đời trang sẽ mất trước đó.
 */
function bindPopstate() {
  if (popstateBound || typeof window === "undefined") return;
  popstateBound = true;
  window.addEventListener("popstate", () => setKey(readFromLocation()));
}

/**
 * Đóng trang chi tiết mà không đụng history, dùng khi next/link đã tự đổi URL.
 * Xoá ở mọi cú bấm nav là thứ khiến bấm lại tab hiện tại = "về danh sách".
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
    markForwardNavigation();
    setKey(next);
    window.scrollTo({ top: 0 });
  }, []);

  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(ARTICLE_PARAM);
    window.history.pushState(null, "", url);
    markForwardNavigation();
    setKey(null);
    // Mirrors `open`: the mobile back button sits at the bottom of the
    // article, and without this the list reappears scrolled to wherever
    // that scroll position happened to be instead of its own top.
    window.scrollTo({ top: 0 });
  }, []);

  return { key, open, close };
}
