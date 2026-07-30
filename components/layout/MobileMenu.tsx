"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
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
}) {
  const [langExpanded, setLangExpanded] = useState(false);

  useEffect(() => {
    if (!open) setLangExpanded(false);
  }, [open]);

  return (
    <div
      id="mobile-menu"
      // Inline style mirrors the closed-state Tailwind classes below, so
      // the drawer stays hidden by default even if the stylesheet fails
      // to load — otherwise it renders as plain unstyled content instead
      // of staying off-screen.
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
                if (isActive) invalidateContent();
              }}
              className={`px-6 py-4 text-xl transition-colors font-semibold ${
                isActive
                  ? "text-white bg-black/20"
                  : "text-gray-300 hover:text-white hover:bg-black/10 active:text-white active:bg-black/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {languageOptions.length > 1 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setLangExpanded((o) => !o)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base ${langExpanded ? "text-white" : "text-gray-300"} hover:text-white active:text-white transition-colors`}
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
            className={`grid bg-black/10 transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              langExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div style={{ overflow: "hidden" }} className="overflow-hidden">
              {languageOptions.map((lang) => {
                const isActive = lang.code === locale;
                return (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}${pathWithoutLocale}`}
                    onClick={onNavigate}
                    className={`flex items-center justify-between pl-14 pr-6 py-3 text-base transition-colors ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-300 hover:text-white active:text-white"
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
