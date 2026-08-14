"use client";

import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/** Shared by both the site's real 404 route and the in-page "article not
 * found" state, so the two never drift into two different-looking 404s.
 * No `inline-*` or horizontal padding here — callers add their own
 * (`inline-block px-5` for a plain link; a chevron-prefixed button wants
 * asymmetric padding instead, or the icon reads as pushed off-center within
 * a symmetric pill), since two conflicting utilities in one class string
 * race on stylesheet order rather than composing. */
export const NOT_FOUND_ACTION_CLASS =
  "mt-6 bg-black/5 hover:bg-black/10 active:bg-black/10 transition-colors text-sm text-gray-900 py-2 rounded-xl";

export default function NotFoundLayout({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      <Reveal>
        <p className="text-7xl font-semibold text-gray-300">404</p>
      </Reveal>
      <Reveal delay={50}>
        <div className="w-8 border-t border-gray-200 my-4 mx-auto" />
        {title && (
          <p className="text-base font-semibold text-gray-900">{title}</p>
        )}
        {description && (
          <p className="mt-1 text-sm text-gray-500 max-w-[300px] mx-auto">
            {description}
          </p>
        )}
        {action}
      </Reveal>
    </div>
  );
}
