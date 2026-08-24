"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import ArticleContent from "@/components/ui/ArticleContent";
import Reveal from "@/components/ui/Reveal";
import { titleOf } from "@/components/ui/ArticleCard";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

// Rough reading speed for mixed VI/EN prose. Whole words, not characters:
// per-character counting badly overestimates spaced Latin script.
const WORDS_PER_MINUTE = 200;

/**
 * Full read view for one article. Rendered in place of the list on the same
 * route (see useArticleRoute) rather than as its own static page.
 */
export default function ArticleDetail({
  article,
  locale,
  labels,
  onBack,
}: {
  article: ResolvedArticle;
  locale: string;
  labels: Record<string, string>;
  onBack: () => void;
}) {
  // Opening the detail view reads as a navigation, so start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [article.key]);

  // Tab title follows the open article. Client-side only (no per-article
  // route to render a real <title>), so it reaches the tab/history/bookmark
  // but not link-preview crawlers. Captured once via ref — after the first
  // swap `document.title` is already the article's.
  const originalTitleRef = useRef<string | null>(null);
  useEffect(() => {
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

  const minutes = Math.max(
    1,
    Math.round(article.body.trim().split(/\s+/).length / WORDS_PER_MINUTE),
  );

  // Mirrors ArticleContent: a blank title opts the article out of the
  // default headline block.
  const isFullBleed = !article.title || article.title.trim().length === 0;

  return (
    <div>
      {/* Meta sits outside the article card: a full-bleed article has no
          headline block, so anything anchored there vanished on exactly the
          articles most likely to be shared. Back is hidden below md, where the
          mobile breadcrumb already covers it; md:px-1 is an optical offset
          against the card's rounded corners, which only exist at md+. */}
      <div className="print:hidden flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-3 md:mb-4 md:px-1 text-xs">
        {labels["back"] && (
          <button
            type="button"
            onClick={onBack}
            className="hidden md:inline-flex group items-center gap-1 self-start text-sm text-gray-500 hover:text-amber-700 active:text-amber-700"
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
          className="flex items-center gap-3 text-gray-400 flex-wrap justify-start md:justify-end"
        >
          {article.date && (
            <span className="whitespace-nowrap">
              {formatTimestamp(article.date, locale)}
            </span>
          )}
          {labels["readingTime"] && (
            <span className="whitespace-nowrap">
              {minutes} {labels["readingTime"]}
            </span>
          )}
        </Reveal>
      </div>
      <div
        className={`press-article-card md:bg-white md:rounded-2xl md:p-8 md:card-shadow md:border md:border-white ${isFullBleed ? "full-bleed" : ""}`}
      >
        <ArticleContent title={article.title} body={article.body} />
      </div>
    </div>
  );
}
