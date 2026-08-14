"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import ArticleContent from "@/components/ui/ArticleContent";
import { titleOf } from "@/components/ui/ArticleCard";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

// Rough reading speed for mixed VI/EN prose. Deliberately a whole-word count
// rather than characters — CJK-style per-character counting would badly
// overestimate Vietnamese, which is written in spaced Latin words.
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
  // Entering the detail view is a navigation as far as the reader is
  // concerned, so it should start at the top like any other page would.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [article.key]);

  // Swaps the tab title to the article's own heading while it's open. This
  // is client-side only — it can't help link-preview crawlers (Zalo/
  // Facebook/Messenger don't execute JS), only the open tab/history/bookmark
  // — but the site is static-export with no per-article route, so there's no
  // server-rendered title to change instead. Captured once via ref rather
  // than read fresh each run, since after the first swap `document.title`
  // itself would be the article title, not the real page title to restore.
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

  // Mirrors ArticleContent's own check — a blank title is how a full-bleed
  // CMS article opts out of the default headline block.
  const isFullBleed = !article.title || article.title.trim().length === 0;

  return (
    <div>
      {/* Meta sits on this bar, outside the article card, rather than above
          the headline inside it. A full-bleed article has no headline block
          at all, so anything anchored there simply vanished on exactly the
          articles most likely to be shared. */}
      {/* Below md the mobile breadcrumb (see Navbar) already provides a way
          back, so the Back button is redundant there and hidden — the meta
          row is left on its own, flush left with the title below it. The
          `md:px-1` offset is optical and only matters at md+, where the card
          underneath has rounded corners and flush content would read as if
          it overhangs the edge; below md there's no card, so no offset. */}
      <div className="print:hidden flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-3 md:mb-4 md:px-1 text-xs">
        {labels["back"] && (
          <button
            type="button"
            onClick={onBack}
            className="hidden md:inline-flex group items-center gap-1 self-start text-sm text-gray-500 hover:text-amber-700 active:text-amber-700 transition-colors"
          >
            <ChevronLeft
              className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1"
              strokeWidth={2}
            />
            {labels["back"]}
          </button>
        )}
        <div className="flex items-center gap-3 text-gray-400 flex-wrap justify-start md:justify-end">
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
        </div>
      </div>
      <div
        className={`press-article-card md:bg-white md:border md:border-gray-200 md:rounded-2xl md:p-8 ${isFullBleed ? "full-bleed" : ""}`}
      >
        <ArticleContent title={article.title} body={article.body} />
      </div>
    </div>
  );
}
