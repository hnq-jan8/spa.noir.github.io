"use client";

import { useState } from "react";
import { ChevronRight, ImageOff } from "lucide-react";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

/**
 * Ảnh nằm trên host Directus, có thể chết dù site tĩnh vẫn chạy — placeholder
 * giữ nguyên hình dạng card thay vì để nó xẹp (giống MarkdownImage).
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
 * Tiêu đề cho card danh sách. `title` rỗng là quy ước bài full-bleed (thân bài
 * tự mang hero headline) — card vẫn cần tiêu đề nên lấy heading đầu của body.
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
  /** Ép chiều cao chung của hàng lưới (h-24 sm:h-28): nửa rộng của layout
   * "list" cần nó để thẳng hàng với ô "grid" bên cạnh. */
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
              // line up regardless of which layout each one renders. Không
              // nửa nào có excerpt nên chỉ cần đủ chỗ cho ngày + tiêu đề.
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
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
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
          // Không có ảnh để phủ chữ lên: vẫn giữ cách bố trí của tile 1x2/1x3
          // (ngày ghim sát trên, tiêu đề căn giữa phần còn lại), nền trắng.
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
            // Nửa compact của hàng lưới: ngày ghim absolute (ra khỏi luồng)
            // để tiêu đề căn giữa theo TOÀN BỘ chiều cao hộp. `h-full` chỉ
            // giải được nhờ `compact` cho nút một chiều cao xác định — bỏ
            // compact là nó xẹp lên ngày, nên mới có nhánh fallback bên dưới.
            <div
              // Không ảnh thì nút không có padding riêng, pl-3 sát mép quá so
              // với p-5/p-6 của card nổi bật phía trên — nới ra cho khớp.
              className={`relative flex-1 min-w-0 pr-3 sm:pr-4 ${
                hasImage ? "pl-3 sm:pl-3.5" : "pl-5 sm:pl-6"
              }`}
            >
              {article.date && (
                <p
                  className={`absolute text-xs text-gray-500 ${
                    hasImage
                      ? "top-2 sm:top-2.5 left-3 sm:left-3.5"
                      : "top-3 sm:top-3.5 left-5 sm:left-6"
                  }`}
                >
                  {formatTimestamp(article.date, locale)}
                </p>
              )}
              {heading && (
                // pt-3 chừa chỗ cho ngày (absolute) trước khi căn giữa, để
                // tiêu đề 2 dòng không đâm vào. Nhánh không ảnh có inset trên
                // cao hơn nên pt giảm tương ứng, giữ tiêu đề đúng chỗ cũ.
                <div
                  className={`h-full flex items-center ${hasImage ? "pt-3" : "pt-2"}`}
                >
                  <h3 className="font-semibold text-sm sm:text-base leading-snug text-balance line-clamp-2">
                    {heading}
                  </h3>
                </div>
              )}
            </div>
          ) : (
            // Card thường (có excerpt) hoặc hideExcerpt mà không compact —
            // fallback xếp chồng ở mobile. Cả hai đều auto-height nên không
            // cần absolute để căn giữa.
            <div
              // hideExcerpt không có gì dưới tiêu đề nên cùng pt với card có
              // excerpt sẽ nhìn nặng đầu — giảm bớt.
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
