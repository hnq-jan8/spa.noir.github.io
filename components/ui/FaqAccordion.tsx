"use client";
import { useLayoutEffect, useRef, useState } from "react";
import {
  EXPAND_GRID_TRANSITION_CLASS,
  expandTransition,
} from "@/lib/expandTransition";

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
  // grid-rows 0fr/1fr trick (no JS height measuring). min-h-0 on the inner
  // wrapper is required or the track never reaches 0fr. See
  // lib/expandTransition.ts for the negative-delay timing trick.
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

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(items.length > 0 ? [0] : []),
  );
  // Degrees keep accumulating (0, 180, 360, 540, ...) instead of toggling
  // back to 0 — rotating the chevron the same clockwise direction every
  // time instead of winding it back counter-clockwise on close.
  const [chevronDeg, setChevronDeg] = useState<Record<number, number>>(() =>
    items.length > 0 ? { 0: 180 } : ({} as Record<number, number>),
  );

  // FLIP: growing/shrinking a panel pushes every card below it through
  // normal flow, which forces the browser to recompute their position on
  // every animation frame (the actual jank source on mobile Safari — a
  // single card's own layout is cheap, but reflowing the whole list below
  // it every frame isn't). Instead we let the DOM jump straight to the new
  // layout in one reflow, then paper over the jump by animating each
  // shifted card's `transform` from its old position back to zero —
  // transform runs on the compositor, not main-thread layout.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevRects = useRef<Map<number, number>>(new Map());

  const toggle = (i: number) => {
    const rects = new Map<number, number>();
    cardRefs.current.forEach((el, idx) => {
      if (el) rects.set(idx, el.getBoundingClientRect().top);
    });
    prevRects.current = rects;

    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setChevronDeg((prev) => ({ ...prev, [i]: (prev[i] ?? 0) + 180 }));
  };

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
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-50"
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
            className="flex-shrink-0 text-gray-500 transition-transform duration-200"
            style={{ transform: `rotate(${chevronDeg[i] ?? 0}deg)` }}
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
