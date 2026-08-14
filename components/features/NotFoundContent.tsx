"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { bundledLabels } from "@/i18n/labels";
import { getSavedLocale } from "@/i18n/preference";
import { routing } from "@/i18n/routing";
import NotFoundLayout, { NOT_FOUND_ACTION_CLASS } from "@/components/ui/NotFoundLayout";

export default function NotFoundContent() {
  const params = useParams();
  const paramLocale = params?.locale as string | undefined;
  // Route gốc (ngoài [locale], vd 404.html tĩnh trên GitHub Pages) không có
  // param locale — render locale mặc định trước để khớp SSR, rồi đổi sang
  // locale đã lưu (nếu có) sau khi mount, tránh lệch nội dung server/client.
  const [savedLocale, setSavedLocale] = useState<string | null>(null);
  useEffect(() => {
    if (!paramLocale) setSavedLocale(getSavedLocale());
  }, [paramLocale]);
  const locale = paramLocale ?? savedLocale ?? routing.defaultLocale;
  const data = useContentData();
  const t = data?.common.labels["notFound"] ?? bundledLabels(locale, "notFound");

  return (
    <NotFoundLayout
      title={t?.["title"]}
      description={t?.["description"]}
      action={
        t?.["backHome"] && (
          <Link href={`/${locale}`} className={`inline-block px-5 ${NOT_FOUND_ACTION_CLASS}`}>
            {t["backHome"]}
          </Link>
        )
      }
    />
  );
}
