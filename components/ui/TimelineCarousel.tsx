"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { formatTimestamp } from "@/lib/siteData";

interface TimelineItem {
  title: string;
  description: string;
  date?: string;
}

// Collapsed preview height (px) before content is considered truncated —
// tall enough that a typical medium-length update shows in full, only
// genuinely long content gets truncated with "Xem chi tiết". This is a cap,
// not a fixed size — shorter descriptions keep their own natural (shorter)
// height instead of being stretched to match it.
const COLLAPSED_HEIGHT = 350;

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

function useOverflowMeasure(description: string) {
  const [overflowing, setOverflowing] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    // ResizeObserver (not just a mount-time measurement) so this stays correct
    // when the element starts out display:none (e.g. the desktop/mobile
    // layout that isn't active at the current breakpoint) and later becomes
    // visible after a viewport resize.
    const measure = () =>
      setOverflowing(el.scrollHeight > COLLAPSED_HEIGHT + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description]);

  return { innerRef, overflowing };
}

// Desktop: cards sit side by side, so expanding one in place would desync
// row heights. Preview is truncated with a max-height; "Xem chi tiết" opens
// the full content in a modal instead of growing the card.
function DescriptionPreview({
  description,
  viewDetailsLabel,
  onExpand,
}: {
  description: string;
  viewDetailsLabel: string;
  onExpand: () => void;
}) {
  const { innerRef, overflowing } = useOverflowMeasure(description);

  return (
    <div>
      <div
        className="relative overflow-hidden"
        style={{ maxHeight: COLLAPSED_HEIGHT }}
      >
        <div ref={innerRef}>
          <MarkdownContent
            content={description}
            className="text-sm text-gray-600"
          />
        </div>
        {overflowing && (
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={onExpand}
          className="group mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          {viewDetailsLabel}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}

// Mobile: items stack vertically, so growing one in place just pushes the
// rest of the feed down — no layout desync, so expand inline instead of
// opening a modal.
function ExpandableDescription({
  description,
  viewDetailsLabel,
  collapseLabel,
}: {
  description: string;
  viewDetailsLabel: string;
  collapseLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { innerRef, overflowing } = useOverflowMeasure(description);
  const fullHeight = innerRef.current?.scrollHeight ?? undefined;

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: expanded ? fullHeight : COLLAPSED_HEIGHT }}
      >
        <div ref={innerRef}>
          <MarkdownContent
            content={description}
            className="text-sm text-gray-600"
          />
        </div>
        {!expanded && overflowing && (
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 translate-y-1 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          {expanded ? collapseLabel : viewDetailsLabel}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

function DetailModal({
  item,
  locale,
  onClose,
}: {
  item: TimelineItem;
  locale: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [canScrollDown, setCanScrollDown] = useState(false);
  // Mounts hidden, then flips visible next frame so the opacity/scale
  // classes below actually transition instead of snapping straight in.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Moves focus into the modal on open, and back to whatever triggered it
  // (the "Xem chi tiết" button) on close — otherwise a keyboard user tabbing
  // after the modal closes resumes from the top of the page instead of
  // picking up where they left off.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab/Shift+Tab cycling within the modal instead of leaking focus
      // onto whatever's behind the (still-open) overlay.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    // Header height varies with title length (1 vs 2 lines) — measure it so
    // the scroll content's top padding always clears it exactly.
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [item]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // The native scrollbar is hidden (it would render stuck behind the
    // absolute header), so this drives a fade + button affordance instead —
    // same "can scroll further" pattern as the carousel's left/right arrows.
    const update = () =>
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    el.addEventListener("scroll", update);
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [item, headerHeight]);

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 240, behavior: "smooth" });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden transition-all duration-200 ease-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute (not sticky) — anchored to this outer box rather than the
            scrolling content below, so it can't judder during rubber-band
            overscroll on the inner scroll area. */}
        <div
          ref={headerRef}
          className="absolute top-0 inset-x-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 border-b border-gray-100 bg-gray-50/70 backdrop-blur-md"
        >
          <div>
            {item.date && (
              <p className="text-xs text-gray-500 mb-1">
                {formatTimestamp(item.date, locale)}
              </p>
            )}
            <h3 id={titleId} className="text-xl font-bold">
              {item.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 hover:text-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="overflow-y-auto scrollbar-hide"
          style={{ paddingTop: headerHeight }}
        >
          <div className="p-6 pt-4">
            <MarkdownContent
              content={item.description}
              className="text-sm text-gray-600"
            />
          </div>
        </div>

        {/* Bottom fade + button — same "more to scroll" affordance as the
            carousel's arrows, standing in for the hidden native scrollbar. */}
        <div
          className={`absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-200 ${
            canScrollDown ? "opacity-100" : "opacity-0"
          }`}
        />
        <button
          type="button"
          onClick={scrollDown}
          className={`absolute bottom-3 right-3 z-20 flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70
          bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full transition-opacity duration-200 ${
            canScrollDown ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Cuộn xuống"
          aria-hidden={!canScrollDown}
          tabIndex={canScrollDown ? 0 : -1}
        >
          <ChevronDown className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function TimelineCarousel({
  items,
  viewDetailsLabel,
  collapseLabel,
  locale,
}: {
  items: TimelineItem[];
  viewDetailsLabel: string;
  collapseLabel: string;
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
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70
          bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll left"
          aria-hidden={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>

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
        <button
          onClick={() => scroll("right")}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70
          bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll right"
          aria-hidden={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
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
        />
      )}
    </div>
  );
}
