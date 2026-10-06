"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { saveLocale } from "@/i18n/preference";

export default function RememberLocale() {
  const params = useParams();
  // `lang` theo locale hiển thị. Lựa chọn đã lưu chỉ ghi khi URL chính là locale
  // đang bật: ghé URL của ngôn ngữ đã tắt không được ghi đè lựa chọn cũ (lượt
  // render đầu useLocale chưa đọc được locale đã lưu nên đang là fallback tạm).
  // useContentData chỉ để render lại khi content.json về — lúc đó tập ngôn
  // ngữ đang bật mới chắc, và useLocale có thể đổi sang fallback.
  useContentData();
  const displayLocale = useLocale();
  const routeLocale = params?.locale as string | undefined;
  const locale = routeLocale ? displayLocale : undefined;
  const persist = locale !== undefined && routeLocale === locale;

  useEffect(() => {
    if (!locale) return;
    if (persist) saveLocale(locale);
    document.documentElement.lang = locale;
  }, [locale, persist]);

  return null;
}
