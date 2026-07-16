"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollButton from "@/components/ui/ScrollButton";
import {
  DescriptionPreview,
  ExpandableDescription,
} from "@/components/ui/timeline/Descriptions";
import DetailModal from "@/components/ui/timeline/DetailModal";
import { CIRCLE_BUTTON, type TimelineItem } from "@/components/ui/timeline/shared";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { formatTimestamp } from "@/lib/siteData";

// The dot sits this far into its column, clear of the card's rounded corner
// above it. Four places have to land on this exact same offset — the date
// label above it, the dot itself, and the incoming/outgoing line segments'
// color handoff either side of it — so they're named here instead of
// repeated as bare "1.5" literals that could drift out of sync.
const DOT = {
  offset: "ml-1.5", // dot's own inset, and the date label's matching inset
  outgoingStart: "left-1.5", // this column's line starts at the dot
  incomingWidth: "w-1.5", // previous column's line stub ends at the dot
};

export default function TimelineCarousel({
  items,
  viewDetailsLabel,
  collapseLabel,
  a11y,
  locale,
}: {
  items: TimelineItem[];
  viewDetailsLabel: string;
  collapseLabel: string;
  a11y: Record<string, string>;
  locale: string;
}) {
  const {
    ref: scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollBy,
  } = useHorizontalScroll<HTMLDivElement>();

  const scroll = (dir: "left" | "right") => scrollBy(dir, 376);

  const [modalIdx, setModalIdx] = useState<number | null>(null);

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

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  itemRefs.current = [];

  const computeActive = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const threshold = container.getBoundingClientRect().left + 40;

    let newActive = 0;
    for (let idx = 0; idx < itemRefs.current.length; idx++) {
      const el = itemRefs.current[idx];
      if (el && el.getBoundingClientRect().left <= threshold) newActive = idx;
    }
    setActiveIndex(newActive);
  }, [scrollRef]);

  useEffect(() => {
    computeActive();
    const container = scrollRef.current;
    if (!container) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeActive);
    };
    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [computeActive, scrollRef]);

  return (
    <div className="mb-12">
      {/* ── Desktop layout (lg+): horizontal scroll ── */}
      <div className="hidden lg:block relative">
        {/* Left fade gradient — width matches scroll padding */}
        <div className="absolute left-0 top-0 -bottom-16 w-9 bg-gradient-to-r from-page to-transparent z-20 pointer-events-none" />
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 -bottom-16 w-9 bg-gradient-to-l from-page to-transparent z-20 pointer-events-none" />

        {/* Left arrow — overlays on top of gradient */}
        <ScrollButton
          active={canScrollLeft}
          onClick={() => scroll("left")}
          label={a11y["scrollLeft"]}
          Icon={ChevronLeft}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 ${CIRCLE_BUTTON}`}
          iconClassName="w-5 h-5"
        />

        {/* Scrollable row — padding inside so start/end content stays visible at scroll edges;
            generous vertical padding keeps card shadows from getting clipped by overflow-y-clip. */}
        <div
          ref={scrollRef}
          className="flex items-start overflow-x-auto px-8 pt-1 pb-5 overflow-y-clip"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "3rem",
          }}
        >
          {items.map((item, idx) => {
            const isGroupStart = groupStartOf[idx] === idx;
            const isActiveGroup =
              groupStartOf[activeIndex] === groupStartOf[idx];
            // Segment is "passed" (highlighted) once its group is at or before the active one —
            // rendered per-column, inside the scrolling content, so it scrolls with the dots
            // instead of drifting out of sync like a viewport-fixed overlay would.
            const isPassed = groupStartOf[idx] <= groupStartOf[activeIndex];
            const isPassedPrev =
              idx > 0 && groupStartOf[idx - 1] <= groupStartOf[activeIndex];
            const isLast = idx === items.length - 1;
            // Segment stops at the card's right edge (the mr-4 below it) rather than
            // the full column width once there's no next card to butt up against.
            const outgoingRight = isLast ? "right-4" : "right-0";

            return (
              <div
                key={idx}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="flex flex-col flex-shrink-0 w-[24rem]"
              >
                {/* Date, above the dot so its height never depends on card content */}
                <div className="h-4 text-left text-xs">
                  {isGroupStart && (
                    <span
                      className={`${DOT.offset} whitespace-nowrap ${
                        isActiveGroup
                          ? "text-amber-700 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {item.date && formatTimestamp(item.date, locale)}
                    </span>
                  )}
                </div>
                {/* Dot + connecting line segment for this column. The dot sits ml-1.5
                    into the column (clear of the card's rounded corner above it), so the
                    color handoff between segments has to land on that same offset instead
                    of the column boundary — otherwise a sliver of the wrong color shows
                    right before the dot. Group-start columns therefore render two pieces:
                    an "incoming" stub (0 to the dot) in the previous segment's color, and
                    an "outgoing" run (the dot onward) in this column's own color. The very
                    last column's outgoing run stops at the card's right edge instead of
                    the column's, since there's no next card to butt up against. */}
                <div className="relative mt-2 h-4 flex items-center">
                  {isGroupStart && idx !== 0 && (
                    <div
                      className={`absolute left-0 ${DOT.incomingWidth} top-1/2 -translate-y-1/2 h-px ${isPassedPrev ? "bg-amber-500" : "bg-gray-300"}`}
                    />
                  )}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-px ${
                      isGroupStart ? DOT.outgoingStart : "left-0"
                    } ${outgoingRight} ${isPassed ? "bg-amber-500" : "bg-gray-300"}`}
                  />
                  {isGroupStart && (
                    <div
                      className={`relative z-10 ${DOT.offset} w-4 h-4 rounded-full border-2 transition-colors ${
                        isActiveGroup
                          ? "bg-amber-600 border-amber-600"
                          : "bg-white border-gray-400"
                      }`}
                    />
                  )}
                </div>
                {/* Card — full card treatment, height follows content; gap to the next
                    card comes from this card's own right margin only, so its left edge
                    stays flush with the dot/line above it. */}
                <div className="timeline-card flex flex-col flex-1 mr-4 mt-3">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <DescriptionPreview
                    description={item.description}
                    viewDetailsLabel={viewDetailsLabel}
                    onExpand={() => setModalIdx(idx)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow — overlays on top of gradient */}
        <ScrollButton
          active={canScrollRight}
          onClick={() => scroll("right")}
          label={a11y["scrollRight"]}
          Icon={ChevronRight}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 ${CIRCLE_BUTTON}`}
          iconClassName="w-5 h-5"
        />
      </div>

      {/* ── Mobile / Tablet layout (< lg): single-column vertical feed ── */}
      <div className="lg:hidden px-4 sm:px-6">
        {items.map((item, idx) => {
          const isGroupStart = groupStartOf[idx] === idx;
          // No horizontal scroll to track on mobile, so "passed" is simply
          // the newest (first) group — same amber used on desktop.
          const isPassed = groupStartOf[idx] === 0;

          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0 -ml-3">
                <div
                  className={`w-3 h-3 rounded-full border-2 mt-1 ${isPassed ? "bg-amber-600 border-amber-600" : "bg-white border-gray-400"}`}
                />
                <div
                  className={`w-px flex-1 mt-1 ${isPassed ? "bg-amber-500" : "bg-gray-300"}`}
                />
              </div>
              <div
                className={`flex-1 ${idx < items.length - 1 ? "pb-4" : "pb-1"} pt-0.5`}
              >
                {isGroupStart && item.date && (
                  <p
                    className={`text-xs mb-1.5 ${isPassed ? "text-amber-700 font-semibold" : "text-gray-500"}`}
                  >
                    {formatTimestamp(item.date, locale)}
                  </p>
                )}
                <div className="timeline-card flex flex-col">
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <ExpandableDescription
                    description={item.description}
                    viewDetailsLabel={viewDetailsLabel}
                    collapseLabel={collapseLabel}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalIdx !== null && (
        <DetailModal
          item={items[modalIdx]}
          locale={locale}
          onClose={() => setModalIdx(null)}
          closeLabel={a11y["close"]}
          scrollDownLabel={a11y["scrollDown"]}
        />
      )}
    </div>
  );
}
