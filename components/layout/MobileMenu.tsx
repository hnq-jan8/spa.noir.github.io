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
 * Drawer toàn màn hình cho mobile (< md): danh sách route, hoặc danh sách ngôn
 * ngữ khi `langView` bật (nút globe/back ở Navbar). Luôn mount, ẩn/hiện bằng
 * clip-path để animate mượt.
 */
export default function MobileMenu({
  open,
  langView,
  navItems,
  normalizedPath,
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
      // Chồm 8px vào header để nuốt khe hở sub-pixel giữa sticky (header) và
      // fixed (drawer) ở mức zoom lẻ — an toàn vì header nằm trên (z-50 > z-40)
      // và có nền đục; pt-2 bù lại phía nội dung.
      //
      // overflow-x-hidden: hai panel xếp chồng bên dưới nằm ngoài khung bằng
      // translate-x lúc ẩn, mà con đã transform vẫn nới overflow của cha —
      // không clip thì cả drawer cuộn ngang được đúng bằng khoảng đó.
      className={`md:hidden fixed inset-x-0 top-[calc(3rem-8px)] h-[calc(100dvh-3rem+8px)] pt-2 z-40 bg-chrome text-white overflow-y-auto overflow-x-hidden overscroll-contain ${
        open
          ? "[clip-path:inset(0_0_0_0)] visible pointer-events-auto [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_0s]"
          : "[clip-path:inset(0_0_100%_0)] invisible pointer-events-none [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_500ms]"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Grid-stack: both panels share one cell so the drawer's height always
          matches whichever is visible, no absolute positioning needed. Plain
          opacity crossfade between nav and the language panel — no slide. */}
      <div className="grid">
        <nav
          className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-300 ease-out ${
            langView ? "opacity-0 pointer-events-none" : "opacity-100"
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
            className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-300 ease-out ${
              langView ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!langView}
          >
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
