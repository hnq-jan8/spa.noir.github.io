"use client";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
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
        className="max-w-[602px] mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`w-full flex items-center justify-between pl-[22px] pr-6 py-4 text-left transition-colors
                    ${isOpen ? "hover:bg-gray-100 bg-gray-200" : "hover:bg-gray-50"}`}
          onClick={() => toggle(i)}
        >
          <span className="font-semibold text-gray-900 pr-4">
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
        <div
          id={panelId}
          role="region"
          aria-hidden={!isOpen}
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="px-6 pt-4 pb-6 text-gray-700 leading-relaxed text-sm">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <div className="space-y-3">{items.map(renderCard)}</div>;
}
