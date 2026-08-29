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
  layout = "list",
  hideExcerpt = false,
  compact = false,
}: {
  article: ResolvedArticle;
  locale: string;
  onOpen: () => void;
  readMoreLabel?: string;
  /** e.g. "Nổi bật" / "Mới nhất" on the lead item. */
  badge?: string;
  featured?: boolean;
  /** "grid": compact tile below the fold — image + title only, no excerpt. */
  layout?: "list" | "grid";
  /** "list" layout without the excerpt paragraph — the wide half of a 2/1 grid split. */
  hideExcerpt?: boolean;
  /** Force the shared grid-row height (h-24 sm:h-28) — the "list" layout's
   * wide half needs this to line up with its "grid" neighbor; the plain
   * mobile fallback (no grid, no neighbor to match) doesn't. */
  compact?: boolean;
}) {
  const excerpt =
    layout === "grid" || hideExcerpt
      ? null
      : excerptOf(article, featured ? 220 : 150);
  const heading = titleOf(article);
  const hasImage = Boolean(article.previewImage);

  return (
    <button
      type="button"
      onClick={onOpen}
      // No padding on the card: the thumbnail runs flush to its edges and the
      // text block supplies its own insets.
      className={`group w-full text-left bg-white rounded-2xl overflow-hidden card-shadow hover:bg-cardHover active:bg-cardHover ${
        featured
          ? ""
          : layout === "grid"
            ? // Both halves of a grid row share this fixed height so they
              // line up regardless of which layout each one renders. No
              // excerpt on either half, so this only needs to fit a date
              // line + a wrapped title, not a card2/3-sized block.
              "h-24 sm:h-28 flex flex-col"
            : compact
              ? "h-24 sm:h-28 flex items-stretch"
              : "flex items-stretch"
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
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
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
              <span className="text-gray-500">
                {article.date && formatTimestamp(article.date, locale)}
              </span>
              {readMoreLabel && (
                <span className="text-gray-600 font-semibold inline-flex items-center gap-1">
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
      ) : layout === "grid" ? (
        hasImage ? (
          // Text overlaid on the image (not stacked below it) keeps the
          // tile at just the image's own height.
          <div className="relative w-full flex-1">
            <PreviewImage
              src={article.previewImage as string}
              alt=""
              className="absolute inset-0 w-full h-full"
            />
            {/* Fade sits on the date's own row (not a separate strip above
                it) and bottoms out at fully opaque — matching the title
                row's solid `bg-white` exactly, so there's no opacity jump
                at the seam between them. Eased middle stops avoid the
                "looks hard-edged" effect a plain 2-stop linear gradient
                gets over a busy photo. */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col">
              {article.date && (
                <div className="relative h-12 sm:h-14 flex flex-col justify-end px-3.5 pb-1 sm:px-4">
                  <div className="absolute inset-0 card-fade" />
                  <p className="relative text-xs text-gray-500">
                    {formatTimestamp(article.date, locale)}
                  </p>
                </div>
              )}
              {/* The button's own hover:bg-cardHover never shows here — the
                  image and this panel sit on top of it, fully opaque — so
                  the panel carries its own group-hover instead. */}
              <div className="bg-white group-hover:bg-cardHover group-active:bg-cardHover flex items-start justify-between gap-2 px-3.5 pb-2.5 sm:px-4 sm:pb-3">
                {heading && (
                  <h3 className="flex-1 font-semibold text-sm leading-snug text-balance line-clamp-2 text-gray-900">
                    {heading}
                  </h3>
                )}
                <ChevronRight
                  className="w-5 h-5 mt-0.5 text-gray-300 flex-shrink-0 transition-transform group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        ) : (
          // No image to overlay text on — same top inset and centered-title
          // treatment as the 1x2/1x3 tiles (date pinned tight to the top,
          // title centered in the space below it), just on a flat white
          // background instead of a photo.
          <div className="relative flex-1 pl-3.5 pr-3.5 sm:pl-4 sm:pr-4">
            {article.date && (
              <p className="absolute top-2 sm:top-2.5 left-3.5 sm:left-4 text-xs text-gray-500">
                {formatTimestamp(article.date, locale)}
              </p>
            )}
            <div className="h-full pt-3 flex items-center">
              {heading && (
                <div className="flex-1 flex items-center justify-between gap-2">
                  <h3 className="flex-1 font-semibold text-sm leading-snug text-balance line-clamp-2">
                    {heading}
                  </h3>
                  <ChevronRight
                    className="w-5 h-5 text-gray-300 flex-shrink-0 transition-transform group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <>
          {hasImage && (
            <PreviewImage
              src={article.previewImage as string}
              alt=""
              // The 2-slot half of a grid row (hideExcerpt) is a secondary
              // item — its image stays smaller than a full list card's.
              className={`${hideExcerpt ? "w-24 sm:w-32" : "w-32 sm:w-44"} self-stretch flex-shrink-0`}
            />
          )}
          {hideExcerpt && compact ? (
            // Fixed-height compact half of a grid row: date is pinned with
            // its own absolute top inset (out of flow) so title can center
            // against the box's *full* height instead of just the space
            // left below the date. `h-full` only resolves because `compact`
            // gives the button a definite height — drop compact and this
            // collapses onto the date (that's why the fallback below exists).
            <div
              // No image: the button has no padding of its own, so pl-3
              // reads too close to the edge next to the featured card's
              // p-5/p-6 above it — bump to match when there's no thumbnail
              // to supply that left margin instead.
              className={`relative flex-1 min-w-0 pr-3 sm:pr-4 ${
                hasImage ? "pl-3 sm:pl-3.5" : "pl-5 sm:pl-6"
              }`}
            >
              {article.date && (
                <p
                  className={`absolute top-2 sm:top-2.5 text-xs text-gray-500 ${
                    hasImage ? "left-3 sm:left-3.5" : "left-5 sm:left-6"
                  }`}
                >
                  {formatTimestamp(article.date, locale)}
                </p>
              )}
              {heading && (
                // pt-3 clears the absolutely-positioned date above before
                // centering starts, so a 2-line title can't run into it.
                <div className="h-full pt-3 flex items-center">
                  <h3 className="font-semibold text-sm sm:text-base leading-snug text-balance line-clamp-2">
                    {heading}
                  </h3>
                </div>
              )}
            </div>
          ) : (
            // Either a regular card (full excerpt, auto height) or
            // hideExcerpt without compact — mobile's stacked fallback, where
            // a grid row's fixed height doesn't apply. Auto-height either
            // way, so no absolute positioning needed to center within it.
            // `excerpt` is already null when hideExcerpt.
            <div
              // hideExcerpt cards (position 4+'s mobile-stacked fallback)
              // have nothing below the title — the same pt as an
              // excerpt-carrying card reads top-heavy there, so it gets less.
              className={`flex-1 min-w-0 flex flex-col justify-center pr-3 sm:pr-4 pb-4 sm:pb-5 ${
                hideExcerpt ? "pt-2 sm:pt-2.5" : "pt-3 sm:pt-3.5"
              } ${hasImage ? "pl-3 sm:pl-3.5" : "pl-5 sm:pl-6"}`}
            >
              {article.date && (
                <p
                  className={`text-xs text-gray-500 ${hideExcerpt ? "mb-1.5" : "mb-2.5"}`}
                >
                  {formatTimestamp(article.date, locale)}
                </p>
              )}
              {heading && (
                <h3
                  className={`font-semibold text-sm sm:text-base leading-snug text-balance ${hideExcerpt ? "line-clamp-2" : "mb-1"}`}
                >
                  {heading}
                </h3>
              )}
              {excerpt && (
                <p className="text-xs sm:text-sm text-gray-500">{excerpt}</p>
              )}
            </div>
          )}
          <ChevronRight
            className="w-5 h-5 mr-3 sm:mr-4 text-gray-300 flex-shrink-0 self-center transition-transform group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
            strokeWidth={2}
          />
        </>
      )}
    </button>
  );
}
