"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { saveLocale } from "@/i18n/preference";

export default function RememberLocale() {
  const params = useParams();
  // Locale hiển thị chứ không phải locale trên URL: ghé URL của ngôn ngữ đã
  // tắt không được ghi đè lựa chọn đã lưu / `lang` bằng ngôn ngữ đó.
  // useContentData chỉ để render lại khi content.json về — lúc đó tập ngôn
  // ngữ đang bật mới chắc, và useLocale có thể đổi sang fallback.
  useContentData();
  const displayLocale = useLocale();
  const locale = params?.locale ? displayLocale : undefined;

  useEffect(() => {
    if (!locale) return;
    saveLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
