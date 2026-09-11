"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Megaphone } from "lucide-react";
import { clearArticleRoute, useArticleKey } from "@/hooks/useArticleRoute";
import { useBreadcrumbHidden } from "@/hooks/useBreadcrumbVisibility";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { useNavItems } from "@/hooks/useNavItems";
import { bundledLabels } from "@/i18n/labels";
import { normalizePath } from "@/i18n/paths";

/**
 * Dải crumb dạng viên thuốc, chỉ có ở mobile và chỉ trên bốn route của nav
 * (trang chủ không cần). Nằm ngoài <header> của Navbar vì nó thuộc về trang,
 * không phải thanh điều hướng — nhưng vẫn là một dải sticky riêng, xem
 * `top-12` bám đúng chiều cao header.
 */
export default function Breadcrumb() {
  const locale = useLocale();
  const pathname = usePathname();
  const data = useContentData();
  const navItems = useNavItems();
  const articleKey = useArticleKey();
  const breadcrumbHidden = useBreadcrumbHidden();

  const nav = data?.common.labels["nav"] ?? bundledLabels(locale, "nav");
  const normalizedPath = normalizePath(pathname);
  const activeItem = navItems.find((item) => item.href === normalizedPath);

  // Third crumb: only the two listing pages open a detail view, and only while
  // active — articleKey lingers briefly during a cross-tab nav.
  const updatesHref = `/${locale}/official-updates`;
  const pressReleasesHref = `/${locale}/press-releases`;
  const openedArticle =
    articleKey &&
    (normalizedPath === updatesHref || normalizedPath === pressReleasesHref)
      ? (data?.officialUpdates.updates.find((u) => u.key === articleKey) ??
        data?.pressReleases.releases.find((r) => r.key === articleKey) ??
        null)
      : null;
  // Same glyphs the home cards use for these two sections.
  const ArticleIcon = normalizedPath === updatesHref ? Megaphone : FileText;

  if (!activeItem) return null;

  return (
    // `invisible`, not unmounted, when a page needs this row for something
    // else (FAQs search capsule) — keeps its layout space and is more
    // reliable than masking it (hooks/useBreadcrumbVisibility.ts).
    <div
      className={`md:hidden sticky top-12 z-10 px-4 pt-4 pb-6 ${breadcrumbHidden ? "invisible" : ""}`}
    >
      <div
        className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden whitespace-nowrap
                bg-white/75 backdrop-blur-md border border-gray-200 text-xs text-black max-w-full"
      >
        <Link
          href={`/${locale}`}
          onClick={() => clearArticleRoute()}
          className="focus-ring-gap inline-flex items-center min-h-[24px] text-gray-700 hover:text-gray-900 active:text-gray-900"
        >
          {nav?.["home"]}
        </Link>
        <ChevronRight
          className="w-3 h-3 text-gray-400 flex-shrink-0"
          strokeWidth={2}
        />
        <Link
          href={activeItem.href}
          onClick={() => {
            // Same as the tab bar: close the detail view (its query param is
            // invisible to Next's router) and refresh the list.
            clearArticleRoute();
            invalidateContent();
          }}
          // With an article open, "you are here" moves to the icon crumb and
          // this one drops back to a plain link.
          className={`focus-ring-gap inline-flex items-center min-h-[24px] truncate hover:text-gray-600 active:text-gray-600 ${
            openedArticle
              ? "text-gray-700 hover:text-gray-900 active:text-gray-900"
              : "font-medium"
          }`}
        >
          {activeItem.label}
        </Link>
        {openedArticle && (
          <>
            <ChevronRight
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              strokeWidth={2}
            />
            {/* Icon-only: a headline would blow out the pill's width or
                truncate to nothing. The title still reaches screen readers. */}
            <span
              aria-current="page"
              className="inline-flex items-center min-h-[24px] text-gray-900 flex-shrink-0"
            >
              <ArticleIcon
                className="w-3.5 h-3.5"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span className="sr-only">
                {openedArticle.title ?? activeItem.label}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
