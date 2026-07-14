"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import type { ContentPayload, ContentData } from "@/lib/contentData";
import { resolveLocale } from "@/lib/contentData";
import { routing } from "@/i18n/routing";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let cachedPromise: Promise<ContentPayload> | null = null;
let cachedPayload: ContentPayload | null = null;
let lastPathname: string | null = null;
const listeners = new Set<() => void>();

function fetchPayload(): Promise<ContentPayload> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetch(`${basePath}/content.json?_=${Date.now()}`, {
    cache: "no-store",
  })
    .then((res) => res.json() as Promise<ContentPayload>)
    .then((payload) => {
      cachedPayload = payload;
      return payload;
    })
    .catch((err) => {
      cachedPromise = null;
      throw err;
    });
  return cachedPromise;
}

export function invalidateContent() {
  // Chỉ xoá promise để lần fetch tới đi thẳng ra network; giữ lại
  // cachedPayload để UI vẫn có dữ liệu cũ hiển thị trong lúc revalidate.
  cachedPromise = null;
  listeners.forEach((l) => l());
}

// Version đã trigger invalidate nhưng chưa fetch xong — tránh gọi
// invalidateContent() lặp lại cho cùng một "since" khi có nhiều poller
// (hoặc nhiều chu kỳ poll) bắn trùng lúc fetch còn đang chạy dở.
let pendingSince: string | null = null;

/**
 * Gọi từ poller nền (status.json.since) — chỉ invalidate khi bản đang
 * cache thực sự cũ hơn, tránh tải lại content.json mỗi chu kỳ poll dù
 * không có gì thay đổi.
 */
export function syncContentSince(since: string) {
  if (!cachedPayload || cachedPayload.generatedAt === since) return;
  if (pendingSince === since) return;
  pendingSince = since;
  invalidateContent();
}

export function useContentData(): ContentData | null {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) ?? routing.defaultLocale;
  // Khởi tạo bằng dữ liệu stale (nếu có) để trang mới render tức thì,
  // không bị khoảng trắng chờ fetch sau mỗi lần chuyển route.
  const [data, setData] = useState<ContentData | null>(() =>
    cachedPayload ? resolveLocale(cachedPayload, locale) : null,
  );
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    listeners.add(bump);
    return () => {
      listeners.delete(bump);
    };
  }, []);

  useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname) {
      invalidateContent();
    }
    lastPathname = pathname;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetchPayload()
      .then((payload) => {
        if (!cancelled) setData(resolveLocale(payload, locale));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, version]);

  return data;
}
