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
  // wrapper is required or the track never reaches 0fr. Opacity cross-fade
  // + ease-out-expo mask the resize as a soft fade instead of a hard step.
  const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
  return (
    <div
      id={panelId}
      role="region"
      aria-hidden={!isOpen}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      className={`grid transition-[grid-template-rows] duration-300 ${EASE}`}
    >
      <div
        className={`overflow-hidden min-h-0 transition-opacity duration-300 ${EASE} ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(items.length > 0 ? [0] : []),
  );

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const renderCard = (item: FaqItem, i: number) => {
    const isOpen = openSet.has(i);
    const panelId = `faq-panel-${i}`;
    return (
      <div
        key={i}
        // own compositing layer + contained reflow, avoids cascading
        // repaint/layout to sibling cards on mobile Safari
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden isolate contain-content [transform:translateZ(0)]"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`w-full flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4 text-left transition-colors
                    ${isOpen ? "hover:bg-gray-100 active:bg-gray-100 bg-gray-200" : "hover:bg-gray-50 active:bg-gray-100"}`}
          onClick={() => toggle(i)}
        >
          <span className="font-medium text-gray-900 pr-4">
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
            className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <AccordionPanel isOpen={isOpen} panelId={panelId}>
          <div className="px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 text-gray-700 leading-relaxed text-sm">
            {item.answer}
          </div>
        </AccordionPanel>
      </div>
    );
  };

  return <div className="space-y-3">{items.map(renderCard)}</div>;
}
