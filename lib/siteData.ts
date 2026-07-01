import { routing, languages } from "@/i18n/routing";

export function formatTimestamp(iso: string, locale: string) {
  const date = new Date(iso);
  const intlLocale =
    languages.find((lang) => lang.code === locale)?.localeTag ??
    languages.find((lang) => lang.code === routing.defaultLocale)?.localeTag ??
    locale;
  const datePart = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} · ${timePart} GMT+7`;
}
