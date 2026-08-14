"use client";
import { useMemo, useState } from "react";
import { ChevronRight, ImageOff } from "lucide-react";
import { excerptOf, titleOf } from "@/components/ui/ArticleCard";
import type { ResolvedArticle } from "@/lib/contentData";
import { formatTimestamp } from "@/lib/siteData";

function Thumb({ src, size }: { src: string; size: "lg" | "md" }) {
  const [failed, setFailed] = useState(false);
  const box = size === "lg" ? "w-20 h-20 rounded-xl" : "w-11 h-11 rounded-lg";
  if (failed) {
    return (
      <div
        className={`${box} bg-gray-100 flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        <ImageOff
          className={size === "lg" ? "w-5 h-5 text-gray-300" : "w-3.5 h-3.5 text-gray-300"}
          strokeWidth={1.5}
        />
      </div>
    );
  }
  return (
    <div className={`${box} bg-gray-100 overflow-hidden flex-shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-active:scale-110"
      />
    </div>
  );
}

/**
 * Vertical update feed at every breakpoint. Each node is a preview card —
 * title, excerpt, optional image — that opens the full update rather than
 * expanding in place, so a long update can't push the rest of the timeline
 * far off-screen.
 *
 * The current-status group (isPassed) is set apart from older updates by
 * weight and color alone (bold heading, amber badge/date, larger image) —
 * not by an extra border, so the only vertical line in the layout is the
 * rail itself. Older nodes still show the full title + excerpt (same
 * content shape as latest), just de-emphasized: muted date, regular-weight
 * heading, no badge. Unlike the press-release list, no bordered/shadowed
 * card box is used anywhere here — this feed leans on the timeline rail
 * (dot + connecting line, which press releases don't have) to read as a
 * status log rather than a stack of article cards. `group` sits on the
 * whole row (not just the button), so the rail dot lights up together with
 * the date/title/excerpt/image — every group-hover here has a matching
 * group-active twin so the same feedback shows on a tap, since touch
 * devices never trigger :hover.
 */
export default function TimelineCarousel({
  items,
  viewDetailsLabel,
  latestLabel,
  locale,
  onOpen,
}: {
  items: ResolvedArticle[];
  viewDetailsLabel: string;
  latestLabel?: string;
  locale: string;
  onOpen: (key: string) => void;
}) {
  // Consecutive items sharing the same date collapse onto one timeline node.
  const groupStartOf = useMemo(() => {
    const map: number[] = [];
    let start = 0;
    items.forEach((item, idx) => {
      if (
        idx === 0 ||
        item.date === undefined ||
        item.date !== items[idx - 1].date
      ) {
        start = idx;
      }
      map[idx] = start;
    });
    return map;
  }, [items]);

  return (
    <div className="mb-12">
      {items.map((item, idx) => {
        const isGroupStart = groupStartOf[idx] === idx;
        // The newest (first) group is the current status — highlighted in
        // amber the same way the homepage's "as of" badge is.
        const isPassed = groupStartOf[idx] === 0;
        const isLast = idx === items.length - 1;
        const excerpt = excerptOf(item, 200);
        const heading = titleOf(item);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpen(item.key)}
            className="group flex gap-4 sm:gap-5 w-full text-left"
          >
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                // Latest dot reads the same as every other dot at rest —
                // hollow, white fill — just with an amber border instead of
                // gray, so the timeline reads as one consistent dot style.
                // Hover/active fills it solid amber and zooms in; no glow.
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 mt-1 transition-all duration-200 ${
                  isPassed
                    ? "bg-white border-amber-600 group-hover:scale-125 group-hover:bg-amber-600 group-active:scale-125 group-active:bg-amber-600"
                    : "bg-white border-gray-400 group-hover:scale-125 group-hover:border-gray-500 group-hover:bg-gray-500 group-active:scale-125 group-active:border-gray-500 group-active:bg-gray-500"
                }`}
              />
              {!isLast && (
                <div
                  className={`w-px flex-1 mt-1 ${isPassed ? "bg-amber-500" : "bg-gray-300"}`}
                />
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isLast ? "pb-1" : "pb-8 sm:pb-9"} pt-0.5`}>
              {isGroupStart && item.date && (
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className={`text-xs sm:text-sm transition-colors ${isPassed ? "text-amber-700 font-medium group-hover:text-amber-800 group-active:text-amber-800" : "text-gray-400 group-hover:text-gray-600 group-active:text-gray-600"}`}
                  >
                    {formatTimestamp(item.date, locale)}
                  </span>
                  {isPassed && latestLabel && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 rounded px-1.5 py-0.5">
                      {latestLabel}
                    </span>
                  )}
                </div>
              )}
              {isPassed ? (
                <div className="flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    {heading && (
                      <h3 className="text-base sm:text-lg font-bold mb-1.5 text-balance transition-colors group-hover:text-amber-800 group-active:text-amber-800">
                        {heading}
                      </h3>
                    )}
                    {excerpt && (
                      <p className="text-sm text-gray-600 mb-2.5 transition-colors group-hover:text-gray-700 group-active:text-gray-700">
                        {excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      {viewDetailsLabel}
                      <ChevronRight
                        className="w-3.5 h-4 pt-[0.06rem] transition-transform group-hover:translate-x-1 group-active:translate-x-1"
                        strokeWidth={2}
                      />
                    </span>
                  </div>
                  {item.previewImage && <Thumb src={item.previewImage} size="lg" />}
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  {item.previewImage && <Thumb src={item.previewImage} size="md" />}
                  <div className="flex-1 min-w-0">
                    {heading && (
                      <h4 className="text-sm sm:text-base font-semibold text-gray-800 text-balance mb-1 transition-colors group-hover:text-amber-800 group-active:text-amber-800">
                        <span className="inline-flex items-center gap-1">
                          {heading}
                          <ChevronRight
                            className="w-3.5 h-4 mt-0.5 text-gray-300 flex-shrink-0 transition-all group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                            strokeWidth={2}
                          />
                        </span>
                      </h4>
                    )}
                    {excerpt && (
                      <p className="text-xs sm:text-sm text-gray-500 transition-colors group-hover:text-gray-700 group-active:text-gray-700">
                        {excerpt}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
