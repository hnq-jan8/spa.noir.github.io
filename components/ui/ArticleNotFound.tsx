"use client";

import { ChevronLeft } from "lucide-react";
import NotFoundLayout, { NOT_FOUND_ACTION_CLASS } from "@/components/ui/NotFoundLayout";

/**
 * Shown in place of the article detail when `?a=` doesn't match anything —
 * same NotFoundLayout the site's real 404 (components/features/
 * NotFoundContent.tsx) uses, same centered action button, just with the
 * chevron icon ArticleDetail's own back button uses (this one returns to the
 * list rather than the homepage, hence the "back" affordance).
 */
export default function ArticleNotFound({
  title,
  description,
  backLabel,
  onBack,
}: {
  title?: string;
  description?: string;
  backLabel?: string;
  onBack: () => void;
}) {
  return (
    <NotFoundLayout
      title={title}
      description={description}
      action={
        backLabel && (
          <button
            type="button"
            onClick={onBack}
            className={`group inline-flex items-center gap-1.5 pl-4 pr-5 ${NOT_FOUND_ACTION_CLASS}`}
          >
            <ChevronLeft
              className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1"
              strokeWidth={2}
            />
            {backLabel}
          </button>
        )
      }
    />
  );
}
