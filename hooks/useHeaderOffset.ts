"use client";

import { useEffect } from "react";

const HEADER_HEIGHT = 48; // h-12 — header mobile

/**
 * Dưới md header không sticky: trôi đi theo trang, chỉ breadcrumb bám mép
 * trên. Hook này gắn lên <html> cho CSS (globals.css) đọc:
 * - `--header-offset`: phần header còn thấy trong khung nhìn (48px → 0 khi
 *   cuộn). Thứ `fixed` phải nằm ngay dưới header (ô tìm kiếm FAQ, drawer) bám
 *   theo nó; thứ `sticky` (breadcrumb, dải as-of) tự lo bằng `top-0`.
 * - `--crumb-top`: mép trên viên breadcrumb — 64px dưới header, cuộn thì
 *   lên dần tới 6px (Breadcrumb: mt-2.5 cuộn đi cùng header, pt-1.5 ở lại). Ô tìm
 *   kiếm FAQ (fixed) đứng ngang hàng nó.
 * - `data-scrolled`: header đã cuộn khuất hẳn, dải ở mobile nhỏ đang bám
 *   mép trên — lúc đó mới hiện nền + viền đáy (.strip-flat).
 */
export function useHeaderOffset() {
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => {
      const y = Math.max(0, window.scrollY);
      html.toggleAttribute("data-scrolled", y >= HEADER_HEIGHT);
      html.style.setProperty(
        "--header-offset",
        `${Math.max(0, HEADER_HEIGHT - y)}px`,
      );
      html.style.setProperty(
        "--crumb-top",
        `${Math.max(6, HEADER_HEIGHT + 16 - y)}px`,
      );
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      html.style.removeProperty("--header-offset");
      html.style.removeProperty("--crumb-top");
    };
  }, []);
}
