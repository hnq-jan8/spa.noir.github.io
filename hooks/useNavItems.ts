"use client";

import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Bốn route của thanh nav, dùng chung cho Navbar (tabs + drawer) và Breadcrumb
 * — hai bên phải ra cùng một danh sách thì crumb thứ hai mới khớp tab đang mở.
 *
 * Fallback về label bundle lúc build để nav hiện ngay first paint, không chờ
 * content.json; bản trong content.json ghi đè khi về.
 */
export function useNavItems(): NavItem[] {
  const locale = useLocale();
  const data = useContentData();
  const nav = data?.common.labels["nav"] ?? bundledLabels(locale, "nav");

  if (!nav) return [];
  return [
    { label: nav["officialUpdates"], href: `/${locale}/official-updates` },
    { label: nav["flightInfo"], href: `/${locale}/flight-info` },
    { label: nav["faqs"], href: `/${locale}/faqs` },
    { label: nav["pressReleases"], href: `/${locale}/press-releases` },
  ];
}
