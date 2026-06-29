"use client";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openSet.has(i);
        return (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
          >
            <button
              className={`w-full flex items-center justify-between pl-[22px] pr-6 py-4 text-left transition-colors hover:bg-gray-50 ${isOpen ? "bg-gray-100" : ""}`}
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
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <div
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
      })}
    </div>
  );
}
