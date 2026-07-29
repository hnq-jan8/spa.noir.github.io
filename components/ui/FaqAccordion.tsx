"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [height, setHeight] = useState(isOpen ? "auto" : "0px");

  // Once we leave the initial "auto" resting state we stay in explicit px
  // from then on (0px when closed, measured px when open), so a close
  // always has a concrete value to transition from — no double-rAF dance
  // needed to fake a transition out of "auto".
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setHeight(isOpen ? `${content.scrollHeight}px` : "0px");
  }, [isOpen]);

  // Keep the pinned px height correct while open if content reflows
  // (e.g. viewport rotation, font load) instead of ever falling back to
  // "auto", which can't be transitioned from later.
  useEffect(() => {
    const content = contentRef.current;
    if (!isOpen || !content) return;
    const ro = new ResizeObserver(() =>
      setHeight(`${content.scrollHeight}px`),
    );
    ro.observe(content);
    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div
      id={panelId}
      role="region"
      aria-hidden={!isOpen}
      style={{ height, overflow: "hidden" }}
      className="transition-[height] duration-300 ease-in-out"
    >
      <div ref={contentRef}>{children}</div>
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
        // isolate + translateZ(0): own compositing layer, so Safari doesn't
        // repaint the rounded-corner clip mask every frame the panel
        // resizes. contain-content: scopes layout/paint to this card, so
        // the height change doesn't force Safari to re-run layout on every
        // FAQ card below it in the list — on mobile Safari that cascading
        // reflow across all the other cards was the actual source of the
        // jank, not just this card's own animation.
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
