"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clearArticleRoute } from "@/hooks/useArticleRoute";
import { invalidateContent } from "@/hooks/useContentData";
// Unlike the FAQ accordion's EXPAND_GRID_TRANSITION_CLASS, no negative delay:
// this opens rarely enough that playing the whole curve reads better than
// the half-elapsed perf trick used for the FAQ list.
const LANGUAGE_EXPAND_CLASS = "grid transition-[grid-template-rows] duration-300 ease-out";

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
      // Overlaps 8px into the header to swallow the sub-pixel rounding gap
      // sticky (header) vs. fixed (this drawer) can leave at fractional zoom
      // levels — safe since the header sits above it (z-50 > z-40) with an
      // opaque background. pt-2 compensates on the content side so the first
      // item doesn't end up 8px closer to the header.
      className={`md:hidden fixed inset-x-0 top-[calc(3rem-8px)] h-[calc(100dvh-3rem+8px)] pt-2 z-40 bg-chrome text-white overflow-y-auto overscroll-contain ${
        open
          ? "[clip-path:inset(0_0_0_0)] visible pointer-events-auto [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_0s]"
          : "[clip-path:inset(0_0_100%_0)] invisible pointer-events-none [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_500ms]"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <nav className="flex flex-col">
        {navItems.map((item, index) => {
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
              // Staggered reveal on open only — delay collapses to 0 on close
              // so the drawer's own clip-path handles the exit.
              style={{ transitionDelay: open ? `${100 + index * 50}ms` : "0ms" }}
              className={`flex items-center px-6 py-4 text-xl transition-[opacity,transform] duration-300 ease-out ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              } ${
                isActive
                  ? "text-white font-semibold"
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
        <div className="mt-2 relative">
          {/* Vertical guide line grown from the globe icon instead of a
              background fill, tracking the accordion's own expand transition. */}
          <div
            aria-hidden="true"
            style={{ gridTemplateRows: langExpanded ? "1fr" : "0fr" }}
            className={`absolute left-[33px] top-11 bottom-0 w-px ${LANGUAGE_EXPAND_CLASS}`}
          >
            <div style={{ overflow: "hidden" }} className="w-px bg-white/20 h-full" />
          </div>
          <button
            type="button"
            onClick={() => setLangExpanded((o) => !o)}
            style={{ transitionDelay: open ? `${100 + navItems.length * 50}ms` : "0ms" }}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base text-gray-300 transition-[opacity,transform] duration-300 ease-out ${
              open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            } hover:text-white active:text-white`}
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
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${langExpanded ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>
          <div
            style={{ gridTemplateRows: langExpanded ? "1fr" : "0fr" }}
            className={LANGUAGE_EXPAND_CLASS}
          >
            {/* -mt-2 offsets the toggle button's own py-4 so the gap above
                the first option matches the py-2 gap between options. */}
            <div style={{ overflow: "hidden" }} className="overflow-hidden -mt-2">
              {languageOptions.map((lang, index) => {
                const isActive = lang.code === locale;
                return (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}${pathWithoutLocale}`}
                    onClick={onNavigate}
                    // Same stagger cadence as the top-level nav items above,
                    // so both lists reveal at a matching pace.
                    style={{ transitionDelay: langExpanded ? `${40 + index * 50}ms` : "0ms" }}
                    className={`flex items-center justify-between pl-14 pr-6 py-2 text-base transition-[opacity,transform] duration-300 ease-out ${
                      langExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    } ${
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
