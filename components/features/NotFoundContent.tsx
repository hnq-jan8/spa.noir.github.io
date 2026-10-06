"use client";

import Link from "next/link";
import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";
import NotFoundLayout, {
  NOT_FOUND_ACTION_CLASS,
} from "@/components/ui/NotFoundLayout";

export default function NotFoundContent() {
  // Locale hiển thị: trong [locale] là locale trên URL (hoặc fallback nếu đã
  // tắt); ở 404 gốc (404.html, không có param) là ngôn ngữ đã lưu — xem useLocale.
  const locale = useLocale();
  const data = useContentData();
  const t =
    data?.common.labels["notFound"] ?? bundledLabels(locale, "notFound");

  return (
    <NotFoundLayout
      title={t?.["title"]}
      description={t?.["description"]}
      action={
        t?.["backHome"] && (
          <Link
            href={`/${locale}`}
            className={`inline-block px-5 ${NOT_FOUND_ACTION_CLASS}`}
          >
            {t["backHome"]}
          </Link>
        )
      }
    />
  );
}
