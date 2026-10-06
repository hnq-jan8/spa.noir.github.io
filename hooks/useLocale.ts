"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { activeLocales } from "@/i18n/routing";
import { getCachedLanguageCodes } from "@/hooks/useContentData";
import { getSavedLocale } from "@/i18n/preference";

// Locale đã lưu (localStorage) dưới dạng external store: server/hydrate đọc
// snapshot null (khớp HTML tĩnh), sau đó client mới đọc giá trị thật — không
// lệch hydrate như đọc localStorage thẳng trong render.
function subscribeSavedLocale(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/**
 * Locale đúng như trên URL — kể cả ngôn ngữ đang tắt; "" nếu route nằm ngoài
 * [locale] (vd 404.html). Chỉ LocaleGate cần.
 */
export function useRouteLocale(): string {
  const params = useParams();
  return (params?.locale as string) ?? "";
}

/**
 * Locale để HIỂN THỊ. URL của ngôn ngữ đang tắt vẫn có route (superset, xem
 * i18n/routing.ts) và LocaleGate trả 404 ở đó — nhưng nhãn, nút ngôn ngữ, link
 * về trang chủ… phải theo ngôn ngữ fallback, không theo ngôn ngữ đã tắt. Fallback
 * là ngôn ngữ user đã chọn trước đó (localStorage) nếu nó còn bật — giống 404
 * của route không tồn tại — không thì ngôn ngữ bật đầu tiên. Tập "đang bật" lấy
 * từ content.json khi đã có, trước đó dùng tập lúc build. Locale đã lưu chỉ có
 * sau hydrate (xem subscribeSavedLocale) nên lượt render đầu vẫn khớp HTML tĩnh.
 */
export function useLocale(): string {
  const routeLocale = useRouteLocale();
  const saved = useSyncExternalStore(subscribeSavedLocale, getSavedLocale, () => null);
  const live = getCachedLanguageCodes();
  const active = live && live.length > 0 ? live : activeLocales;
  if (active.includes(routeLocale)) return routeLocale;
  return saved && active.includes(saved) ? saved : active[0];
}
