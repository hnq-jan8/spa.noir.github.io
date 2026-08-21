// Ngày giờ luôn dựng từ các phần tử số của một locale cố định (`en-GB` chỉ
// dùng để lấy chữ số Latin + 2 chữ số có padding), rồi tự ghép theo thứ tự
// mong muốn — không giao cho Intl chọn thứ tự theo locale. Lý do: mã ngôn ngữ
// trong CMS không phải BCP-47 (`cn`, `tw`, `hk`, `kr` không phải mã ngôn ngữ
// hợp lệ), Intl không nhận ra nên rơi về mặc định kiểu Mỹ MM/dd/yyyy — thứ tự
// ngày tháng khi đó là tai nạn chứ không phải lựa chọn.
const PART_SOURCE_LOCALE = "en-GB";
const TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Tiếng Việt giữ dd/MM/yyyy; các ngôn ngữ còn lại dùng yyyy/MM/dd. */
const DAY_FIRST_LOCALES = new Set(["vi"]);

export function formatTimestamp(iso: string, locale: string) {
  const date = new Date(iso);
  // `Intl.format` throws RangeError on an invalid date, which would take the
  // whole page down over one malformed CMS value — render nothing instead.
  if (!iso || Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(PART_SOURCE_LOCALE, {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const datePart = DAY_FIRST_LOCALES.has(locale)
    ? `${parts.day}/${parts.month}/${parts.year}`
    : `${parts.year}/${parts.month}/${parts.day}`;
  const timePart = new Intl.DateTimeFormat(PART_SOURCE_LOCALE, {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} · ${timePart} GMT+7`;
}
