"use client";
import { useRef, useState, useEffect, useCallback } from "react";

interface TimelineItem {
  title: string;
  description: string;
  date?: string;
}

export default function TimelineCarousel({ items }: { items: TimelineItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <div className="py-8 md:py-12">
      {/* ── Desktop layout (lg+): horizontal scroll ── */}
      <div className="hidden lg:block relative">
        {/* Left fade gradient — width matches scroll padding (px-8 = 32px = w-8) */}
        <div className="absolute left-0 top-0 -bottom-16 w-8 bg-gradient-to-r from-gray-50 to-transparent z-20 pointer-events-none" />
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 -bottom-16 w-8 bg-gradient-to-l from-gray-50 to-transparent z-20 pointer-events-none" />

        {/* Left arrow — overlays on top of gradient */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70
            bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full"
            aria-label="Scroll left"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Scrollable row — padding inside so start/end content stays visible at scroll edges */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-0 px-8 overflow-y-clip"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "3rem",
          }}
        >
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col flex-shrink-0 w-64">
              {/* Card */}
              <div className="timeline-card">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
              {/* Dot + date */}
              <div className="flex justify-start -ml-[7px] relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white" />
              </div>
              {item.date && (
                <div className="text-left text-xs text-gray-500 mt-2">
                  {item.date}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline line through dot centers — full width, no padding */}
        <div className="relative -mt-[calc(1.5rem+8px)] mb-6 pointer-events-none">
          <div className="h-px bg-gray-300 w-full" />
        </div>

        {/* Right arrow — overlays on top of gradient */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70
            bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full"
            aria-label="Scroll right"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Mobile / Tablet layout (< lg): vertical feed ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-0 px-4 sm:px-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 pb-6">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white mt-1" />
              <div className="w-px flex-1 bg-gray-300 mt-1" />
            </div>
            <div className="flex-1 pb-2">
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-1">
                {item.description}
              </p>
              {item.date && (
                <p className="text-xs text-gray-500">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
