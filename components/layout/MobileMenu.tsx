"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { clearArticleRoute } from "@/hooks/useArticleRoute";
import { invalidateContent } from "@/hooks/useContentData";
import { EXPAND_GRID_TRANSITION_CLASS } from "@/lib/expandTransition";

interface NavItem {
  label: string;
  href: string;
}
interface LanguageOption {
  code: string;
  label: string;
}

/**
 * Drawer trượt toàn màn hình cho mobile (< md): danh sách route + accordion
 * chọn ngôn ngữ. Luôn được mount (ẩn/hiện bằng clip-path) để animate mượt;
 * `langExpanded` sống tại đây và tự đóng lại mỗi khi drawer đóng.
 */
export default function MobileMenu({
  open,
  navItems,
  normalizedPath,
  nav,
  currentLanguage,
  languageOptions,
  pathWithoutLocale,
  locale,
  onNavigate,
  unreadHref,
}: {
  open: boolean;
  navItems: NavItem[];
  normalizedPath: string;
  nav: Record<string, string> | undefined;
  currentLanguage: LanguageOption | undefined;
  languageOptions: LanguageOption[];
  pathWithoutLocale: string;
  locale: string;
  onNavigate: () => void;
  /** Route carrying an unread official update, or null when there is none. */
  unreadHref?: string | null;
}) {
  const [langExpanded, setLangExpanded] = useState(false);

  useEffect(() => {
    if (!open) setLangExpanded(false);
  }, [open]);

  return (
    <div
      id="mobile-menu"
      // Mirrors the closed-state classes below so the drawer stays hidden even
      // if the stylesheet fails to load.
      style={open ? undefined : { visibility: "hidden", pointerEvents: "none" }}
      className={`md:hidden fixed inset-x-0 top-12 h-[calc(100dvh-3rem)] z-40 bg-chrome text-white overflow-y-auto overscroll-contain ${
        open
          ? "[clip-path:inset(0_0_0_0)] visible pointer-events-auto [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_0s]"
          : "[clip-path:inset(0_0_100%_0)] invisible pointer-events-none [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_500ms]"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <nav className="flex flex-col">
        {navItems.map((item) => {
          const isActive = normalizedPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                onNavigate();
                // As on the desktop tabs: same route = no remount, so the open
                // article has to be dismissed by hand.
                clearArticleRoute();
                if (isActive) invalidateContent();
              }}
              className={`flex items-center px-6 py-4 text-xl ${
                isActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-gray-300 font-normal hover:text-white hover:font-medium active:text-white active:font-medium"
              }`}
            >
              {/* Anchors the unread dot to the text, not the row, so it sits on
                  the label's corner whatever its length. */}
              <span className="relative">
                {item.label}
                {item.href === unreadHref && (
                  <span
                    aria-hidden="true"
                    // Steady, not pulsing: it marks a state, and a pulse would
                    // compete with the homepage's live "as of" dot.
                    className="absolute -top-0.5 -right-3 w-2 h-2 rounded-full bg-white shadow-[0_0_3px_1px_rgba(255,255,255,0.5)]"
                  />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {languageOptions.length > 1 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setLangExpanded((o) => !o)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base ${langExpanded ? "text-white" : "text-gray-300"} hover:text-white active:text-white`}
            aria-expanded={langExpanded}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="flex-1 text-left">
              {langExpanded ? nav?.["selectLanguage"] : currentLanguage?.label}
            </span>
            <ChevronRight
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${langExpanded ? "rotate-90" : ""}`}
              strokeWidth={2}
            />
          </button>
          <div
            style={{ gridTemplateRows: langExpanded ? "1fr" : "0fr" }}
            className={`${EXPAND_GRID_TRANSITION_CLASS} bg-black/20`}
          >
            <div style={{ overflow: "hidden" }} className="overflow-hidden">
              {languageOptions.map((lang) => {
                const isActive = lang.code === locale;
                return (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}${pathWithoutLocale}`}
                    onClick={onNavigate}
                    className={`flex items-center justify-between pl-14 pr-6 py-3 text-base ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-300 hover:text-white hover:font-medium active:text-white active:font-medium"
                    }`}
                  >
                    <span>{lang.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
