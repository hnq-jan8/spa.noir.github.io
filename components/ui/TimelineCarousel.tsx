"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { useVerticalScroll } from "@/hooks/useVerticalScroll";

interface TimelineItem {
  title: string;
  description: string;
  date?: string;
}

function TimelineCardBody({ description }: { description: string }) {
  const { ref, canScrollUp, canScrollDown } =
    useVerticalScroll<HTMLDivElement>();

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={ref} className="h-full overflow-y-auto pr-2">
        <MarkdownContent
          content={description}
          className="text-sm text-gray-600"
        />
      </div>
      <div
        className={`absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollUp ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollDown ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function TimelineCarousel({ items }: { items: TimelineItem[] }) {
  const {
    ref: scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollBy,
  } = useHorizontalScroll<HTMLDivElement>();

  const scroll = (dir: "left" | "right") => scrollBy(dir, 344);

  return (
    <div className="mb-12">
      {/* ── Desktop layout (lg+): horizontal scroll ── */}
      <div className="hidden lg:block relative">
        {/* Left fade gradient — width matches scroll padding */}
        <div className="absolute left-0 top-0 -bottom-16 w-12 bg-gradient-to-r from-page to-transparent z-20 pointer-events-none" />
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 -bottom-16 w-12 bg-gradient-to-l from-page to-transparent z-20 pointer-events-none" />

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

        {/* Scrollable row — padding inside so start/end content stays visible at scroll edges */}
        <div
          ref={scrollRef}
          className="flex items-start overflow-x-auto px-8 overflow-y-clip"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "3rem",
          }}
        >
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col flex-shrink-0 w-[23rem]">
              {/* Date, above the dot so its height never depends on card content */}
              <div className="-ml-[7px] h-4 text-left text-xs text-gray-500">
                {item.date}
              </div>
              {/* Dot — sits on the fixed timeline line above */}
              <div className="-ml-[7px] relative z-10 mt-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white" />
              </div>
              {/* Card — border starts right where the dot ends, no gap. Height tracks the
                  viewport so the section roughly fills the screen (footer stays just off
                  the fold) without depending on content length; 14.5rem is the fixed chrome
                  above/below the card (navbar + page padding + date/dot row + section
                  margins) measured at this breakpoint. Clamped so it never gets unreadably
                  short on small viewports. */}
              <div className="timeline-card flex flex-col h-[clamp(22rem,calc(90vh_-_14.5rem),50rem)]">
                <h3 className="text-xl font-bold mb-2 flex-shrink-0">
                  {item.title}
                </h3>
                <TimelineCardBody description={item.description} />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline line through dot centers — full width, reaches under the fade edges */}
        <div className="absolute left-0 right-0 top-8 h-px bg-gray-300 pointer-events-none" />

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
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white mt-1" />
              <div className="w-px flex-1 bg-gray-300 mt-1" />
            </div>
            <div className="flex-1 pb-6 pt-0.5">
              {item.date && (
                <p className="text-xs text-gray-500 mb-1">{item.date}</p>
              )}
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <MarkdownContent
                content={item.description}
                className="text-sm text-gray-600"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
