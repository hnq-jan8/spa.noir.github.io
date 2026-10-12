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
    // Mỗi lần ghi lên <html> là style của cả trang bị tính lại. Các giá trị
    // chỉ đổi trong ~64px đầu, nên chỉ ghi khi thực sự khác lần trước — cuộn
    // sâu hơn thì handler không đụng gì tới DOM.
    let last = "";
    const sync = () => {
      const y = Math.max(0, window.scrollY);
      const scrolled = y >= HEADER_HEIGHT;
      const offset = Math.max(0, HEADER_HEIGHT - y);
      const crumbTop = Math.max(6, HEADER_HEIGHT + 16 - y);
      const key = `${scrolled}|${offset}|${crumbTop}`;
      if (key === last) return;
      last = key;
      html.toggleAttribute("data-scrolled", scrolled);
      html.style.setProperty("--header-offset", `${offset}px`);
      html.style.setProperty("--crumb-top", `${crumbTop}px`);
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
