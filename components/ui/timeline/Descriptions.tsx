"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { COLLAPSED_HEIGHT, useOverflowMeasure } from "./shared";

// Desktop: cards sit side by side, so expanding one in place would desync
// row heights. Preview is truncated with a max-height; "Xem chi tiết" opens
// the full content in a modal instead of growing the card.
export function DescriptionPreview({
  description,
  viewDetailsLabel,
  onExpand,
}: {
  description: string;
  viewDetailsLabel: string;
  onExpand: () => void;
}) {
  const { innerRef, overflowing } = useOverflowMeasure(description);

  return (
    <div>
      <div
        className="relative overflow-hidden"
        style={{ maxHeight: COLLAPSED_HEIGHT }}
      >
        <div ref={innerRef}>
          <MarkdownContent
            content={description}
            className="text-sm text-gray-600"
          />
        </div>
        {overflowing && (
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={onExpand}
          className="group mt-2 inline-flex items-center gap-1 min-h-[44px] md:min-h-0 text-sm font-medium text-amber-700 hover:text-amber-800 active:text-amber-800"
        >
          {viewDetailsLabel}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}

// Mobile: items stack vertically, so growing one in place just pushes the
// rest of the feed down — no layout desync, so expand inline instead of
// opening a modal.
export function ExpandableDescription({
  description,
  viewDetailsLabel,
  collapseLabel,
}: {
  description: string;
  viewDetailsLabel: string;
  collapseLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { innerRef, overflowing } = useOverflowMeasure(description);
  const fullHeight = innerRef.current?.scrollHeight ?? undefined;

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: expanded ? fullHeight : COLLAPSED_HEIGHT }}
      >
        <div ref={innerRef}>
          <MarkdownContent
            content={description}
            className="text-sm text-gray-600"
          />
        </div>
        {!expanded && overflowing && (
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 translate-y-1 inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-amber-700 hover:text-amber-800 active:text-amber-800"
        >
          {expanded ? collapseLabel : viewDetailsLabel}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
