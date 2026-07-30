"use client";

import { Inbox, WifiOff } from "lucide-react";
import type { ContentData } from "@/lib/contentData";
import { invalidateContent } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";
import Reveal from "./Reveal";

/** Shown in place of a page whose content.json fetch failed. */
export function ContentLoadError() {
  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <EmptyState variant="error" />
    </div>
  );
}

export default function EmptyState({
  data,
  variant = "empty",
}: {
  /** Absent in the "error" case — content.json is exactly what failed to load. */
  data?: ContentData | null;
  variant?: "empty" | "error";
}) {
  const locale = useLocale();
  const isError = variant === "error";
  const ns = isError ? "loadError" : "emptyState";
  // Falls back to the build-time bundle because the error case is reached
  // precisely when content.json (and therefore data.common.labels) is missing.
  const t =
    data?.common.labels[ns] ??
    (Object.keys(bundledLabels(locale, ns)).length > 0
      ? bundledLabels(locale, ns)
      : bundledLabels(locale, "emptyState"));
  const Icon = isError ? WifiOff : Inbox;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      <Reveal>
        <button
          type="button"
          aria-label={t?.["retry"] ?? t?.["title"]}
          onClick={() => invalidateContent()}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4"
        >
          <Icon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
      </Reveal>
      <Reveal delay={50}>
        {t?.["title"] && (
          <p className="text-base font-semibold text-gray-900">{t["title"]}</p>
        )}
        {t?.["description"] && (
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            {t["description"]}
          </p>
        )}
        {isError && t?.["retry"] && (
          <button
            type="button"
            onClick={() => invalidateContent()}
            className="inline-block mt-6 bg-black/5 text-sm text-gray-900 px-5 py-2 rounded-xl"
          >
            {t["retry"]}
          </button>
        )}
      </Reveal>
    </div>
  );
}
