"use client";

import { useParams } from "next/navigation";
import { routing, activeLocales } from "@/i18n/routing";
import { getCachedLanguageCodes } from "@/hooks/useContentData";

/** Locale đúng như trên URL — kể cả ngôn ngữ đang tắt. Chỉ LocaleGate cần. */
export function useRouteLocale(): string {
  const params = useParams();
  return (params?.locale as string) ?? routing.defaultLocale;
}

/**
 * Locale để HIỂN THỊ. URL của ngôn ngữ đang tắt vẫn có route (superset, xem
 * i18n/routing.ts) và LocaleGate trả 404 ở đó — nhưng nhãn, nút ngôn ngữ, link
 * về trang chủ… phải theo ngôn ngữ fallback (ngôn ngữ bật đầu tiên), không theo
 * ngôn ngữ đã tắt. Tập "đang bật" lấy từ content.json khi đã có, trước đó dùng
 * tập lúc build — nên lượt render đầu khớp HTML tĩnh. Không dùng locale đã lưu
 * làm fallback: localStorage không có lúc build, sẽ lệch hydrate.
 */
export function useLocale(): string {
  const routeLocale = useRouteLocale();
  const live = getCachedLanguageCodes();
  const active = live && live.length > 0 ? live : activeLocales;
  return active.includes(routeLocale) ? routeLocale : active[0];
}
