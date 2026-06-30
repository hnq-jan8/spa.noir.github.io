export function formatTimestamp(iso: string, locale: string) {
  const date = new Date(iso);
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
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
