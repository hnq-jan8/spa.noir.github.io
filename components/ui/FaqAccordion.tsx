"use client";
import { useState } from "react";

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
  // wrapper is required or the track never reaches 0fr.
  //
  // duration-300 + a negative delay of half that: the browser computes the
  // very first rendered frame as if 150ms had already elapsed, so it jumps
  // straight to the midpoint and only actually animates the remaining
  // 150ms. Half as many frames need a layout recalc per toggle.
  return (
    <div
      id={panelId}
      role="region"
      aria-hidden={!isOpen}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      className="grid transition-[grid-template-rows] duration-300 delay-[-150ms] ease-out"
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

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setChevronDeg((prev) => ({ ...prev, [i]: (prev[i] ?? 0) + 180 }));
  };

  const renderCard = (item: FaqItem, i: number) => {
    const isOpen = openSet.has(i);
    const panelId = `faq-panel-${i}`;
    return (
      <div
        key={i}
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
