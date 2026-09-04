"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import ArticleContent from "@/components/ui/ArticleContent";
import Reveal from "@/components/ui/Reveal";
import {
  ArticleBackBarSkeleton,
  ArticleBackSkeleton,
  ArticleMetaSkeleton,
} from "@/components/ui/skeletons/ArticleDetailSkeleton";
import { titleOf } from "@/components/ui/ArticleCard";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

// Rough reading speed for mixed VI/EN prose. Whole words, not characters:
// per-character counting badly overestimates spaced Latin script.
const WORDS_PER_MINUTE = 200;

/**
 * Full read view for one article. Rendered in place of the list on the same
 * route (see useArticleRoute) rather than as its own static page.
 *
 * `article` là `null` khi mở thẳng một link `?a=`: bài chưa về, nhưng khung
 * và các <Reveal> vẫn dựng ngay để placeholder và bài thật đi chung một chỗ
 * — bài về thì chỉ đổi ruột, hiệu ứng không chạy lại (xem Reveal.tsx).
 */
export default function ArticleDetail({
  article,
  locale,
  labels,
  onBack,
}: {
  article: ResolvedArticle | null;
  locale: string;
  labels: Record<string, string>;
  onBack: () => void;
}) {
  // Opening the detail view reads as a navigation, so start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [article?.key]);

  // Tab title follows the open article. Client-side only (no per-article
  // route to render a real <title>), so it reaches the tab/history/bookmark
  // but not link-preview crawlers. Captured once via ref — after the first
  // swap `document.title` is already the article's.
  const originalTitleRef = useRef<string | null>(null);
  useEffect(() => {
    if (!article) return;
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }
    const original = originalTitleRef.current;
    const heading = titleOf(article);
    if (heading) {
      const sepIndex = original.indexOf(" | ");
      const suffix = sepIndex !== -1 ? original.slice(sepIndex) : "";
      document.title = `${heading}${suffix}`;
    }
    return () => {
      document.title = original;
    };
  }, [article]);

  const minutes = article
    ? Math.max(
        1,
        Math.round(article.body.trim().split(/\s+/).length / WORDS_PER_MINUTE),
      )
    : 0;

  // Mirrors ArticleContent: a blank title opts the article out of the
  // default headline block.
  const isFullBleed =
    !!article && (!article.title || article.title.trim().length === 0);

  return (
    <div className="flex flex-col flex-1 md:block">
      {/* Meta sits outside the article card: a full-bleed article has no
          headline block, so anything anchored there vanished on exactly the
          articles most likely to be shared. Back is hidden below md, where the
          mobile breadcrumb already covers it; md:px-1 is an optical offset
          against the card's rounded corners, which only exist at md+. */}
      <div className="print:hidden flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-3 md:mb-4 md:px-1 text-xs">
        {!article && <ArticleBackSkeleton />}
        {labels["back"] && (
          <button
            type="button"
            onClick={onBack}
            className="hidden md:inline-flex group items-center gap-1 self-start text-sm text-gray-500 hover:text-gray-900 active:text-gray-900"
          >
            <ChevronLeft
              className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1"
              strokeWidth={2}
            />
            {labels["back"]}
          </button>
        )}
        <Reveal
          delay={100}
          className="flex items-center gap-3 text-gray-500 flex-wrap justify-start md:justify-end"
        >
          {!article && <ArticleMetaSkeleton />}
          {article?.date && (
            <span className="whitespace-nowrap">
              {formatTimestamp(article.date, locale)}
            </span>
          )}
          {article && labels["readingTime"] && (
            <span className="whitespace-nowrap">
              {minutes} {labels["readingTime"]}
            </span>
          )}
        </Reveal>
      </div>
      <div
        className={`press-article-card md:bg-white md:rounded-2xl md:p-8 md:card-shadow md:border md:border-white ${isFullBleed ? "full-bleed" : ""}`}
      >
        <ArticleContent
          title={article?.title ?? null}
          body={article?.body ?? null}
        />
      </div>
      {/* Mobile-only equivalent of the desktop back button above, placed
          after the article body as a full-width, edge-to-edge action bar
          instead of an inline link. `-mx-*` cancels container-page's
          padding to bleed it to the screen edges; `mt-auto` (root div is a
          flex column) rides a short article's leftover height down so the
          bar sits flush against the footer instead of floating mid-page,
          with `pt-6` as a floor when there's no leftover height to claim.
          The divider below it matches Footer.tsx's own rule above its
          copyright bar (same color + inset), so bar and footer read as one
          continuous band. */}
      {!article && <ArticleBackBarSkeleton />}
      {labels["back"] && (
        <div className="print:hidden md:hidden -mx-4 sm:-mx-6 pt-6 mt-auto">
          <button
            type="button"
            onClick={onBack}
            className="group flex w-full items-center justify-center gap-1 bg-surface px-5 py-3 text-sm text-gray-900 hover:bg-[#e4e4e4] active:bg-[#e4e4e4]"
          >
            <ChevronLeft
              className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1"
              strokeWidth={2}
            />
            {labels["back"]}
          </button>
          <div className="bg-surface px-4 sm:px-6">
            <div className="border-t border-black/10" />
          </div>
        </div>
      )}
    </div>
  );
}
