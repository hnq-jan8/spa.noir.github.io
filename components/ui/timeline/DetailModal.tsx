"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import MarkdownContent from "@/components/ui/MarkdownContent";
import ScrollButton from "@/components/ui/ScrollButton";
import { formatTimestamp } from "@/lib/siteData";
import { CIRCLE_BUTTON, type TimelineItem } from "./shared";

export default function DetailModal({
  item,
  locale,
  onClose,
  closeLabel,
  scrollDownLabel,
}: {
  item: TimelineItem;
  locale: string;
  onClose: () => void;
  closeLabel: string;
  scrollDownLabel: string;
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
            aria-label={closeLabel}
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
          <div className="p-6 pb-8">
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
        <ScrollButton
          active={canScrollDown}
          onClick={scrollDown}
          label={scrollDownLabel}
          Icon={ChevronDown}
          className={`absolute bottom-3 right-3 z-20 ${CIRCLE_BUTTON}`}
          iconClassName="w-5 h-5"
        />
      </div>
    </div>,
    document.body,
  );
}
