"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  EXPAND_GRID_TRANSITION_CLASS,
  expandTransition,
} from "@/lib/expandTransition";

// Less negative delay than EXPAND_GRID_TRANSITION_CLASS's -150ms: a rotation
// needs more of the curve on screen to read as motion.
const CHEVRON_TRANSITION_CLASS =
  "transition-transform duration-300 delay-[-100ms] ease-out";

interface FaqItem {
  question: string;
  answer: string;
}

function AccordionPanel({
  isOpen,
  panelId,
  children,
}: {
  isOpen: boolean;
  panelId: string;
  children: React.ReactNode;
}) {
  // grid-rows 0fr/1fr, no JS measuring (lib/expandTransition.ts). min-h-0 on
  // the inner wrapper is required or the track never reaches 0fr.
  return (
    <div
      id={panelId}
      role="region"
      aria-hidden={!isOpen}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      className={EXPAND_GRID_TRANSITION_CLASS}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

export default function FaqAccordion({
  items,
  animateFirstOpen = true,
  onFirstItemOpenChange,
  reopenFirstSignal,
}: {
  items: FaqItem[];
  /** False when the first item is the same one that was already showing —
   * opens it plainly instead of replaying the expand-in. */
  animateFirstOpen?: boolean;
  /** Reports item 0's open state so a non-remounting caller can tell an
   * unchanged remount apart from one the reader had closed. */
  onFirstItemOpenChange?: (isOpen: boolean) => void;
  /** Bump on every resolved search, even one that left the results untouched:
   * re-opens a closed item 0 as confirmation the search re-ran. Updates only,
   * so it never fights animateFirstOpen on mount. */
  reopenFirstSignal?: string | number;
}) {
  // Starts closed when animating in, so the mount effect has somewhere to
  // animate from; otherwise item 0 is open immediately.
  const [openSet, setOpenSet] = useState<Set<number>>(() =>
    animateFirstOpen ? new Set() : new Set(items.length > 0 ? [0] : []),
  );

  // FLIP: panel đổi kích thước sẽ reflow mọi card bên dưới ở từng frame —
  // đúng chỗ Safari mobile giật. Cho DOM nhảy thẳng tới layout mới trong một
  // lần reflow, rồi animate `transform` của các card lệch về 0 (chạy trên
  // compositor).
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevRects = useRef<Map<number, number>>(new Map());
  const cancelRef = useRef(0);

  const captureRects = () => {
    const rects = new Map<number, number>();
    cardRefs.current.forEach((el, idx) => {
      if (el) rects.set(idx, el.getBoundingClientRect().top);
    });
    prevRects.current = rects;
  };

  const toggle = (i: number) => {
    captureRects();
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // The first card's expand stands in for a reveal of the whole list. Double
  // rAF (as in Reveal.tsx) so Safari doesn't coalesce it into the first paint.
  useEffect(() => {
    if (!animateFirstOpen || items.length === 0) return;
    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => {
        captureRects();
        setOpenSet(new Set([0]));
      });
      cancelRef.current = inner;
    });
    cancelRef.current = outer;
    return () => cancelAnimationFrame(cancelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onFirstItemOpenChange?.(openSet.has(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSet]);

  // Every applied search re-opens a closed item 0 — a plain state flip, since
  // the instance is already live. Skips its own mount run so it doesn't race
  // the entrance animation above.
  const hasHandledMountRef = useRef(false);
  useEffect(() => {
    if (!hasHandledMountRef.current) {
      hasHandledMountRef.current = true;
      return;
    }
    if (items.length === 0 || openSet.has(0)) return;
    captureRects();
    setOpenSet((prev) => new Set(prev).add(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reopenFirstSignal]);

  useLayoutEffect(() => {
    const prev = prevRects.current;
    if (prev.size === 0) return;
    prevRects.current = new Map();

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const before = prev.get(idx);
      if (before === undefined) return;
      const after = el.getBoundingClientRect().top;
      const dy = before - after;
      if (dy === 0) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      el.getBoundingClientRect(); // force reflow before re-enabling transition
      el.style.transition = expandTransition("transform");
      el.style.transform = "";
    });
  }, [openSet]);

  const renderCard = (item: FaqItem, i: number) => {
    const isOpen = openSet.has(i);
    const panelId = `faq-panel-${i}`;
    return (
      <div
        key={i}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        className="bg-white rounded-2xl overflow-hidden card-shadow"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          // Rounded on the button itself: the focus outline follows the
          // button's own radius, not the card's. Top/bottom as separate
          // longhands so the bottom pair can transition when the panel opens.
          className={`w-full rounded-t-2xl ${isOpen ? "rounded-b-none" : "rounded-b-2xl"} flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4 text-left transition-[border-radius] duration-300 ease-out hover:bg-cardHover active:bg-cardHover`}
          onClick={() => toggle(i)}
        >
          <span className="pr-4 text-gray-900 font-medium">
            {item.question}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`flex-shrink-0 text-gray-500 ${CHEVRON_TRANSITION_CLASS}`}
            style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <AccordionPanel isOpen={isOpen} panelId={panelId}>
          <div className="mx-4 sm:mx-6 border-t border-gray-200 pt-3 sm:pt-4 pb-4 sm:pb-6 text-gray-700 leading-relaxed text-sm">
            {item.answer}
          </div>
        </AccordionPanel>
      </div>
    );
  };

  return <div className="space-y-3">{items.map(renderCard)}</div>;
}
