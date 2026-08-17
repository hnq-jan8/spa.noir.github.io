export function formatTimestamp(iso: string, locale: string) {
  const date = new Date(iso);
  // `Intl.format` throws RangeError on an invalid date, which would take the
  // whole page down over one malformed CMS value — render nothing instead.
  if (!iso || Number.isNaN(date.getTime())) return "";
  const datePart = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} · ${timePart} GMT+7`;
}
