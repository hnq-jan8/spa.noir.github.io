// Tự ghép ngày giờ từ các phần tử số của một locale cố định (`en-GB` chỉ để
// lấy chữ số Latin có padding) thay vì để Intl chọn thứ tự: mã ngôn ngữ trong
// CMS không phải BCP-47 (`cn`, `tw`, `hk`, `kr`) nên Intl rơi về mặc định Mỹ
// MM/dd/yyyy — thứ tự lúc đó là tai nạn, không phải lựa chọn.
const PART_SOURCE_LOCALE = "en-GB";
const TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Hậu tố hiển thị của TIME_ZONE; không phải nhãn dịch được. */
export const TIME_ZONE_LABEL = "GMT+7";

/** Tiếng Việt giữ dd/MM/yyyy; các ngôn ngữ còn lại dùng yyyy/MM/dd. */
const DAY_FIRST_LOCALES = new Set(["vi"]);

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * Ngày bay dạng ddMMM ("27AUG"), đủ ngắn cho một ô bảng. Giá trị CMS là
 * date-only nên tách thẳng từ chuỗi: qua `new Date` là ra UTC midnight rồi
 * format theo múi giờ khác, lệch một ngày. Tên tháng giữ tiếng Anh mọi locale.
 */
export function formatFlightDate(value: string | null) {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  const month = m ? MONTHS_SHORT[Number(m[2]) - 1] : undefined;
  return m && month ? `${m[3]}${month}` : "";
}

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
  return `${datePart} · ${timePart} ${TIME_ZONE_LABEL}`;
}
