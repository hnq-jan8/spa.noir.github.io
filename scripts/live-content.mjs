/**
 * Lưới an toàn lúc build: khi Directus không gọi được, site đang live vẫn đang
 * phục vụ content.json của lần deploy trước — lấy tạm cái đó thay vì hỏng cả
 * lượt deploy.
 *
 * Dùng chung bởi scripts/generate-i18n.mjs (dựng lại locale + label) và
 * lib/buildContentPayload.ts (dựng lại nội dung trang). Nằm trong scripts/ và
 * là .mjs thuần vì generate-i18n chạy ngoài Next — xem content-payload.mjs.
 */

const TIMEOUT_MS = 15_000;

/**
 * @returns {Promise<any|null>} payload, hoặc null nếu không có
 *   NEXT_PUBLIC_SITE_URL / tải hỏng / trả về thứ không phải content.json.
 */
export async function fetchLiveContent() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  try {
    const res = await fetch(`${siteUrl.replace(/\/$/, "")}/content.json`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    // `common` là phần luôn có ở mọi content.json — dùng để phân biệt payload
    // thật với trang lỗi trả về 200 kèm JSON gì đó.
    return payload?.common ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Đảo content.json về lại dạng row của ui_labels. Label trong đó nằm rải theo
 * từng section (`common.labels`, `faqs.labels`, ...) dưới dạng
 * namespace -> key -> locale -> value; xem scripts/content-payload.mjs.
 *
 * @returns {{namespace: string, key: string,
 *            translations: {languages_code: string, value: string}[]}[]}
 */
export function labelRowsFromContent(payload) {
  const rows = [];
  for (const section of Object.values(payload)) {
    for (const [namespace, keys] of Object.entries(section?.labels ?? {})) {
      for (const [key, byLocale] of Object.entries(keys)) {
        rows.push({
          namespace,
          key,
          translations: Object.entries(byLocale).map(([code, value]) => ({
            languages_code: code,
            value,
          })),
        });
      }
    }
  }
  return rows;
}
