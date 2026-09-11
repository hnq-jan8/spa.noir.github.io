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
 * Thời lượng hạ rèm, Navbar chờ theo mốc này lúc đóng. Phải sửa tay cho khớp
 * `500ms` trong class `[transition:clip-path_...]` bên dưới — Tailwind chỉ sinh
 * class từ chuỗi tĩnh, không nội suy hằng số vào được.
 */
export const MOBILE_MENU_ANIM_MS = 500;

/**
 * Drawer toàn màn hình cho mobile (< md): danh sách route, hoặc danh sách ngôn
 * ngữ khi `langView` bật (nút globe/back ở Navbar). Luôn mount, ẩn/hiện bằng
 * hiệu ứng hạ rèm: `clip-path` mở dần từ mép trên xuống.
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
      // top-12 = đúng chiều cao header, không chồm lên nó.
      //
      // Hạ rèm bằng `clip-path` chứ không phải translate/height: hộp đứng yên
      // đúng chỗ, chỉ phần lộ ra lớn dần, nên nội dung không trượt theo và
      // không reflow ở từng frame.
      //
      // overflow-x-hidden: hai panel xếp chồng bên dưới nằm ngoài khung bằng
      // translate-x lúc ẩn, mà con đã transform vẫn nới overflow của cha —
      // không clip thì cả drawer cuộn ngang được đúng bằng khoảng đó.
      className={`md:hidden fixed inset-x-0 top-12 h-[calc(100dvh-3rem)] z-40 bg-page text-gray-900 overflow-y-auto overflow-x-hidden overscroll-contain ${
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
                // so the curtain closing over them handles the exit.
                style={{
                  transitionDelay:
                    open && !langView ? `${100 + index * 50}ms` : "0ms",
                }}
                className={`focus-ring-inset flex items-center px-6 py-4 text-xl transition-[opacity,transform] duration-300 ease-out ${
                  open && !langView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                } ${
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 font-normal hover:text-gray-900 hover:font-medium active:text-gray-900 active:font-medium"
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
                      className="absolute -top-0.5 -right-3 w-2 h-2 rounded-full bg-gray-900 shadow-[0_0_3px_1px_rgba(0,0,0,0.35)]"
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
                  onClick={() => {
                    onNavigate();
                    // Cùng locale thì Link không điều hướng, không gì tự
                    // refetch. Giữ nguyên bài đang mở — đổi sang ngôn ngữ
                    // khác cũng giữ (href mang theo `?a=`).
                    if (isActive) invalidateContent();
                  }}
                  style={{
                    transitionDelay: langView ? `${100 + index * 50}ms` : "0ms",
                  }}
                  className={`focus-ring-inset flex items-center justify-between px-6 py-4 text-xl transition-[opacity,transform] duration-300 ease-out ${
                    langView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  } ${
                    isActive
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600 font-normal hover:text-gray-900 hover:font-medium active:text-gray-900 active:font-medium"
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
