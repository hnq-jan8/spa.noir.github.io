"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ContentPayload, ContentData } from "@/lib/contentData";
import { resolveLocale } from "@/lib/contentData";
import { useLocale } from "@/hooks/useLocale";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let cachedPromise: Promise<ContentPayload> | null = null;
let cachedPayload: ContentPayload | null = null;
let lastPathname: string | null = null;
const listeners = new Set<() => void>();

function fetchPayload(): Promise<ContentPayload> {
  if (cachedPromise) return cachedPromise;
  // URL ổn định + `no-cache`: vẫn revalidate mỗi lần nhưng content không đổi
  // thì chỉ tốn một 304. Độ tươi do status.json (since) điều phối.
  cachedPromise = fetch(`${basePath}/content.json`, {
    cache: "no-cache",
  })
    .then((res) => {
      if (!res.ok) throw new Error(`content.json ${res.status}`);
      return res.json() as Promise<ContentPayload>;
    })
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
  // Giữ cachedPayload để UI còn dữ liệu cũ hiển thị trong lúc revalidate.
  cachedPromise = null;
  listeners.forEach((l) => l());
}

// Đã invalidate nhưng chưa fetch xong — chặn nhiều poller bắn trùng cùng
// một "since".
let pendingSince: string | null = null;

/** Gọi từ poller nền: chỉ invalidate khi bản đang cache thực sự cũ hơn. */
export function syncContentSince(since: string) {
  if (!cachedPayload || cachedPayload.generatedAt === since) return;
  if (pendingSince === since) return;
  pendingSince = since;
  invalidateContent();
}

/**
 * Kèm `failed` để trang phân biệt được "đang tải" với "tải hỏng" — nếu không,
 * content.json lỗi sẽ để lại vùng nội dung trắng vĩnh viễn, không cách nào thử lại.
 */
export function useContentState(): {
  data: ContentData | null;
  failed: boolean;
} {
  const pathname = usePathname();
  const locale = useLocale();
  // Khởi tạo bằng dữ liệu stale (nếu có) để trang mới render tức thì,
  // không bị khoảng trắng chờ fetch sau mỗi lần chuyển route.
  const [data, setData] = useState<ContentData | null>(() =>
    cachedPayload ? resolveLocale(cachedPayload, locale) : null,
  );
  const [failed, setFailed] = useState(false);
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
        if (cancelled) return;
        setData(resolveLocale(payload, locale));
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, version]);

  return { data, failed };
}

export function useContentData(): ContentData | null {
  return useContentState().data;
}
