"use client";

import { useState } from "react";
import { ChevronRight, ImageOff } from "lucide-react";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

/**
 * Same failure handling as MarkdownImage: images live on the Directus host,
 * which can be unreachable even when the static site loads fine. The
 * placeholder keeps the card's geometry instead of collapsing it.
 */
function PreviewImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center overflow-hidden`}
        aria-hidden="true"
      >
        <ImageOff className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
      </div>
    );
  }
  // The hover zoom needs this fixed, overflow-hidden box to crop against —
  // on the <img> alone it grows into the text column instead of zooming.
  return (
    <div className={`${className} overflow-hidden bg-gray-100`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

/**
 * Strips markdown *and* raw HTML (authors paste `<img>`/`<br>` into CMS
 * bodies) so an auto-generated excerpt reads as plain prose.
 */
function toPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}>\s?/gm, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ")
    .replace(/[*_`~]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Heading to show on a list card.
 *
 * A blank `title` is the CMS's full-bleed convention: the body carries its own
 * hero headline. Fine on the article page, but a list card needs a heading, so
 * fall back to the body's first heading.
 */
export function titleOf(article: ResolvedArticle): string | null {
  const explicit = article.title?.trim();
  if (explicit) return explicit;
  // HTML too: full-bleed articles are often hand-written, so `# ...` misses them.
  const heading =
    article.body.match(/^\s{0,3}#{1,6}\s+(.+)$/m) ??
    article.body.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  if (!heading) return null;
  const text = toPlainText(heading[1]);
  return text || null;
}

export function excerptOf(article: ResolvedArticle, max = 180) {
  const explicit = article.previewExcerpt?.trim();
  if (explicit) return explicit;
  // No hand-written excerpt — fall back to the body.
  const plain = toPlainText(article.body);
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

export default function ArticleCard({
  article,
  locale,
  onOpen,
  readMoreLabel,
  badge,
  featured = false,
}: {
  article: ResolvedArticle;
  locale: string;
  onOpen: () => void;
  readMoreLabel?: string;
  /** e.g. "Nổi bật" / "Mới nhất" on the lead item. */
  badge?: string;
  featured?: boolean;
}) {
  const excerpt = excerptOf(article, featured ? 220 : 150);
  const heading = titleOf(article);
  const hasImage = Boolean(article.previewImage);

  return (
    <button
      type="button"
      onClick={onOpen}
      // No padding on the card: the thumbnail runs flush to its edges and the
      // text block supplies its own insets.
      className={`group w-full text-left bg-white rounded-2xl overflow-hidden shadow-[0_0_6px_rgba(0,0,0,0.03)] transition-colors hover:bg-cardHover active:bg-cardHover ${
        featured ? "" : "flex items-stretch"
      }`}
    >
      {featured ? (
        <>
          {hasImage && (
            <PreviewImage
              src={article.previewImage as string}
              alt=""
              className="w-full h-44 sm:h-56"
            />
          )}
          <div className="p-5 sm:p-6 pt-4 sm:pt-5 pb-4 sm:pb-5">
            {badge && (
              <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">
                {badge}
              </p>
            )}
            {heading && (
              <h2 className="font-bold text-lg sm:text-xl mb-2 text-balance">
                {heading}
              </h2>
            )}
            {excerpt && (
              <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
            )}
            <div className="flex items-center justify-between gap-4 text-xs mt-4 -mr-1">
              <span className="text-gray-400">
                {article.date && formatTimestamp(article.date, locale)}
              </span>
              {readMoreLabel && (
                <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                  {readMoreLabel}
                  <ChevronRight
                    className="w-3.5 h-4 pt-[0.1rem] transition-transform group-hover:translate-x-1 group-active:translate-x-1"
                    strokeWidth={2}
                  />
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {hasImage && (
            <PreviewImage
              src={article.previewImage as string}
              alt=""
              className="w-24 sm:w-32 self-stretch flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center pt-2 sm:pt-2.5 pl-3 sm:pl-3.5 pr-3 sm:pr-4 pb-3 sm:pb-4">
            {article.date && (
              <p className="text-xs text-gray-400 mb-2">
                {formatTimestamp(article.date, locale)}
              </p>
            )}
            {heading && (
              <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1 text-balance">
                {heading}
              </h3>
            )}
            {excerpt && (
              <p className="text-xs sm:text-sm text-gray-500">{excerpt}</p>
            )}
          </div>
          <ChevronRight
            className="w-5 h-5 mr-3 sm:mr-4 text-gray-300 flex-shrink-0 self-center transition-all group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
            strokeWidth={2}
          />
        </>
      )}
    </button>
  );
}
