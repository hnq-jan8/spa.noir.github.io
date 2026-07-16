import { routing } from "@/i18n/routing";

// Các helper thao tác pathname theo locale — gom về một chỗ để Navbar, Footer
// (và mọi nơi khác) không tự viết lại regex `^/(vi|en|…)` dễ lệch nhau.

const localePrefix = new RegExp(`^/(${routing.locales.join("|")})`);
const homePath = new RegExp(`^/(${routing.locales.join("|")})/?$`);

/** Bỏ đoạn `/<locale>` đầu path → phần dùng để dựng link đổi ngôn ngữ. */
export function stripLocale(pathname: string): string {
  return pathname.replace(localePrefix, "") || "/";
}

/** Bỏ dấu `/` cuối để so khớp href (Next dùng trailingSlash). */
export function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

/** Path có đang ở trang chủ của một locale bất kỳ không (`/vi`, `/en/`…). */
export function isHomePath(pathname: string): boolean {
  return homePath.test(pathname);
}
