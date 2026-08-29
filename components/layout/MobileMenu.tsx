"use client";

import Link from "next/link";
import { clearArticleRoute } from "@/hooks/useArticleRoute";
import { invalidateContent } from "@/hooks/useContentData";

interface NavItem {
  label: string;
  href: string;
}
interface LanguageOption {
  code: string;
  label: string;
}

/**
 * Drawer trượt toàn màn hình cho mobile (< md): danh sách route, hoặc — khi
 * `langView` bật (điều khiển bởi nút globe/back trong header, Navbar.tsx) —
 * danh sách ngôn ngữ full-screen thay cho danh sách route. Luôn được mount
 * (ẩn/hiện bằng clip-path) để animate mượt.
 */
export default function MobileMenu({
  open,
  langView,
  navItems,
  normalizedPath,
  nav,
  languageOptions,
  pathWithoutLocale,
  locale,
  onNavigate,
  unreadHref,
}: {
  open: boolean;
  /** true = hiện danh sách ngôn ngữ full-screen thay vì danh sách route. */
  langView: boolean;
  navItems: NavItem[];
  normalizedPath: string;
  nav: Record<string, string> | undefined;
  languageOptions: LanguageOption[];
  pathWithoutLocale: string;
  locale: string;
  onNavigate: () => void;
  /** Route carrying an unread official update, or null when there is none. */
  unreadHref?: string | null;
}) {
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
      // overflow-x-hidden: the two grid-stacked panels below sit off-canvas
      // via translate-x when hidden (for the slide-to-subscreen effect) —
      // a transformed child still extends its ancestor's scrollable overflow
      // even though it's invisible, which without this clip made the whole
      // drawer horizontally scrollable by exactly that offset.
      className={`md:hidden fixed inset-x-0 top-[calc(3rem-8px)] h-[calc(100dvh-3rem+8px)] pt-2 z-40 bg-chrome text-white overflow-y-auto overflow-x-hidden overscroll-contain ${
        open
          ? "[clip-path:inset(0_0_0_0)] visible pointer-events-auto [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_0s]"
          : "[clip-path:inset(0_0_100%_0)] invisible pointer-events-none [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_500ms]"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Grid-stack: both panels share one cell so the drawer's height always
          matches whichever is visible, no absolute positioning needed. The
          language panel slides in from the right / nav slides out to the
          left, mirrored on the way back — reads as moving to a sub-screen
          rather than a plain crossfade. */}
      <div className="grid">
        <nav
          className={`col-start-1 row-start-1 flex flex-col transition-[opacity,transform] duration-300 ease-out ${
            langView
              ? "opacity-0 -translate-x-6 pointer-events-none"
              : "opacity-100 translate-x-0"
          }`}
          aria-hidden={langView}
        >
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
                style={{
                  transitionDelay:
                    open && !langView ? `${100 + index * 50}ms` : "0ms",
                }}
                className={`flex items-center px-6 py-4 text-xl transition-[opacity,transform] duration-300 ease-out ${
                  open && !langView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
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
          <div
            className={`col-start-1 row-start-1 flex flex-col pt-2 transition-[opacity,transform] duration-300 ease-out ${
              langView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-6 pointer-events-none"
            }`}
            aria-hidden={!langView}
          >
            {nav?.["selectLanguage"] && (
              <div className="px-5 pb-3 text-sm text-gray-400">
                {nav["selectLanguage"]}
              </div>
            )}
            {languageOptions.map((lang, index) => {
              const isActive = lang.code === locale;
              return (
                <Link
                  key={lang.code}
                  href={`/${lang.code}${pathWithoutLocale}`}
                  onClick={onNavigate}
                  style={{
                    transitionDelay: langView ? `${100 + index * 50}ms` : "0ms",
                  }}
                  className={`flex items-center justify-between px-6 py-4 text-xl transition-[opacity,transform] duration-300 ease-out ${
                    langView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  } ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-gray-300 font-normal hover:text-white hover:font-medium active:text-white active:font-medium"
                  }`}
                >
                  <span>{lang.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
