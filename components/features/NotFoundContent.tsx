"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { bundledLabels } from "@/i18n/labels";
import { getSavedLocale } from "@/i18n/preference";
import { routing } from "@/i18n/routing";
import Reveal from "@/components/ui/Reveal";

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
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      <Reveal>
        <p className="text-5xl font-semibold text-gray-300">404</p>
      </Reveal>
      <Reveal delay={50}>
        <div className="w-8 border-t border-gray-200 my-4 mx-auto" />
        {t?.["title"] && (
          <p className="text-base font-semibold text-gray-900">{t["title"]}</p>
        )}
        {t?.["description"] && (
          <p className="mt-1 text-sm text-gray-500 max-w-[300px] mx-auto">{t["description"]}</p>
        )}
        <Link
          href={`/${locale}`}
          className="inline-block mt-6 bg-black/5 hover:bg-black/10 transition-colors text-sm text-gray-900 px-5 py-2 rounded-xl"
        >
          {t?.["backHome"]}
        </Link>
      </Reveal>
    </div>
  );
}
