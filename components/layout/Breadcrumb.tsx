"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Megaphone } from "lucide-react";
import { clearArticleRoute, useArticleKey } from "@/hooks/useArticleRoute";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { useNavItems } from "@/hooks/useNavItems";
import { bundledLabels } from "@/i18n/labels";
import { normalizePath } from "@/i18n/paths";

/**
 * Breadcrumb ở đầu footer (như apple.com), mọi size, trên bốn route của nav —
 * trang chủ không cần. Mục đầu là chữ "Trang chủ" chứ không phải logo: logo đã
 * nằm ngay bên dưới trong footer (mobile: icon ngôi nhà). Đang mở bài thì thêm
 * mục cuối là icon của mục đó (tiêu đề chỉ cho trình đọc màn hình).
 */
/**
 * Viền ngoài của lucide `House`, bỏ khung cửa: ở 16px nét cửa của bản gốc
 * thành hai vạch lắt nhắt.
 */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export default function Breadcrumb() {
  const locale = useLocale();
  const pathname = usePathname();
  const data = useContentData();
  const navItems = useNavItems();
  const articleKey = useArticleKey();

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

  // Mọi icon cùng 16px và nét 2 nên dày nét như nhau; không mục nào được
  // tô đậm hay làm nổi — mục hiện tại chỉ báo bằng aria-current.
  const chevron = (
    <ChevronRight
      className="w-4 h-4 text-gray-400 flex-shrink-0"
      strokeWidth={2}
      aria-hidden="true"
    />
  );

  return (
    // Không aria-label: nhãn phải qua ui_labels (chưa có khoá nào cho nó) —
    // footer chỉ có mỗi landmark <nav> này nên vẫn nhận ra được.
    <nav
      // Cao đúng 44px như thanh "Quay lại" (py-3 + text-sm) của ArticleDetail
      // ngay phía trên; -mt-8 ăn phần py-8 đầu footer để dải bám sát mép trên.
      className="flex items-center gap-2 min-w-0 h-11 -mt-8 mb-8 border-b border-black/10 text-sm text-gray-600"
    >
      <Link
        href={`/${locale}`}
        onClick={() => clearArticleRoute()}
        className="group focus-ring-gap flex-shrink-0 inline-flex items-center hover:text-gray-900"
      >
        {/* Mobile: icon ngôi nhà nhường chỗ cho tiêu đề bài; nhãn vẫn tới
            trình đọc màn hình. */}
        <HomeIcon className="md:hidden w-4 h-4 text-gray-500 group-hover:text-gray-700" />
        <span className="max-md:sr-only">{nav?.["home"]}</span>
      </Link>
      {chevron}
      <Link
        href={activeItem.href}
        onClick={() => {
          // Same as the tab bar: close the detail view (its query param is
          // invisible to Next's router) and refresh the list.
          clearArticleRoute();
          invalidateContent();
        }}
        aria-current={openedArticle ? undefined : "page"}
        className="focus-ring-gap truncate whitespace-nowrap hover:text-gray-900"
      >
        {activeItem.label}
      </Link>
      {openedArticle && (
        <>
          {chevron}
          {/* Icon-only: a headline would blow out the row's width or truncate
              to nothing. The title still reaches screen readers. */}
          <span
            aria-current="page"
            className="inline-flex items-center flex-shrink-0 text-gray-500"
          >
            <ArticleIcon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">
              {openedArticle.title ?? activeItem.label}
            </span>
          </span>
        </>
      )}
    </nav>
  );
}
