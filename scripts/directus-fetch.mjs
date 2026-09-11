/**
 * fetch() tới Directus dùng chung cho ba script prebuild và lib/directus.ts.
 * Thêm hai thứ fetch trần không có: hạn giờ cho mỗi lần gọi, và thử lại những
 * lỗi tự hết.
 *
 * Vì sao: CMS nội bộ thỉnh thoảng trả 504 (gateway chờ Directus quá lâu) và một
 * cú như thế đang giết nguyên lượt deploy — build 20260911.1 chết ở
 * generate-i18n sau đúng 4 phút, đó là mốc timeout của gateway chứ không phải
 * script chạy lâu. Hạn giờ ở đây ngắn hơn mốc đó để còn kịp thử lại.
 */

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_ATTEMPTS = 3;
// Giãn dần: CMS sặc thì cần thời gian thở, dồn dập chỉ làm nó tệ thêm.
const BACKOFF_MS = [2_000, 6_000];

/**
 * 5xx là phía server, 408/429 là "thử lại sau" — đều tự hết. 4xx còn lại (401
 * token sai, 404 sai collection) thử bao nhiêu lần cũng thế, trả lỗi luôn cho
 * log khỏi loãng.
 */
function isRetryable(status) {
  return status >= 500 || status === 408 || status === 429;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Cầu dao. Một lượt build gọi Directus rất nhiều lượt (đo được 139 lượt khi
// CMS chết); để lượt nào cũng đi hết 3 lần × 30s thì riêng phần ngồi chờ đã
// kéo build dài hàng chục phút, mà kết cục vẫn là rơi về fallback. Hỏng hết
// lượt một lần = coi như CMS chết, từ đó trong cùng tiến trình chỉ thử một
// phát với hạn ngắn. Vẫn thử, phòng khi nó sống lại giữa chừng.
const TRIPPED_TIMEOUT_MS = 5_000;
let circuitOpen = false;

/**
 * @param {string} url
 * @param {{ token?: string, init?: RequestInit, label?: string,
 *           timeoutMs?: number, attempts?: number }} [opts]
 *   `label` là phần hiện trong thông báo lỗi — truyền path cho gọn, đừng để lộ
 *   nguyên URL kèm token nonce ra log. `timeoutMs: 0` tắt hạn giờ.
 * @returns {Promise<Response>}
 */
export async function directusFetch(url, opts = {}) {
  const {
    token = "",
    init = {},
    label = url,
    timeoutMs = circuitOpen ? TRIPPED_TIMEOUT_MS : DEFAULT_TIMEOUT_MS,
    attempts = circuitOpen ? 1 : DEFAULT_ATTEMPTS,
  } = opts;

  for (let attempt = 1; ; attempt++) {
    const isLast = attempt >= attempts;
    const retryIn =
      BACKOFF_MS[attempt - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1];

    let res;
    try {
      res = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          ...init.headers,
        },
        // Quá hạn -> TimeoutError, mạng đứt -> TypeError. Cả hai vào nhánh
        // catch bên dưới và đều đáng thử lại.
        ...(timeoutMs > 0 ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
      });
    } catch (err) {
      const reason =
        err?.name === "TimeoutError" ? `quá ${timeoutMs}ms` : err?.message;
      if (isLast) {
        circuitOpen = true;
        throw new Error(`Directus ${label} → ${reason}`, { cause: err });
      }
      console.warn(
        `⚠ Directus ${label} → ${reason}; thử lại sau ${retryIn}ms (${attempt}/${attempts})`,
      );
      await wait(retryIn);
      continue;
    }

    if (res.ok) {
      circuitOpen = false; // CMS trả lời được = sống lại, mở lại full retry
      return res;
    }
    if (isLast || !isRetryable(res.status)) {
      // Chỉ hết lượt vì 5xx/timeout mới là CMS chết — 401/403/404 ném ngay từ
      // lần đầu và không nói gì về việc nó còn sống hay không.
      if (isLast && isRetryable(res.status)) circuitOpen = true;
      throw new Error(`Directus ${label} → ${res.status}`);
    }
    console.warn(
      `⚠ Directus ${label} → ${res.status}; thử lại sau ${retryIn}ms (${attempt}/${attempts})`,
    );
    await wait(retryIn);
  }
}

/**
 * Bản dùng thẳng cho ba script prebuild: ghép base + path, trả `data` đã parse.
 * @param {string} base
 * @param {string} path
 * @param {{ token?: string, init?: RequestInit, label?: string }} [opts]
 */
export async function directusGet(base, path, opts = {}) {
  const res = await directusFetch(`${base}${path}`, { label: path, ...opts });
  return (await res.json()).data;
}
