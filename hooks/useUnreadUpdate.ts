"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "spa:lastSeenUpdate";

/**
 * Chấm "có cập nhật mới" trên tab nav. `newestDate` có thể đổi giữa phiên (poller
 * tải lại content) — chính là ca badge sinh ra để phục vụ, nên dùng timestamp
 * lưu lại chứ không phải cờ "đã xem" trong bộ nhớ.
 *
 *  - Đọc localStorage trong effect, không đọc lúc render, để HTML prerender và
 *    first paint khớp nhau (`ready` chặn badge tới khi hydrate xong).
 *  - Lần đầu vào chỉ gieo mốc chứ không báo: chấm nghĩa là "có cái mới KỂ TỪ
 *    lần bạn ghé".
 *  - So bằng `>` nên gỡ bài mới nhất xuống không bị hiểu là có bài mới.
 */
export function useUnreadUpdate(
  newestDate: string | null | undefined,
  isOnUpdatesPage: boolean,
) {
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Private-mode / blocked storage — degrade to "never badge" rather
      // than throwing on every render.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !newestDate) return;
    // Seed on first visit, and clear while the user is actually on the
    // updates page (including when a newer one lands while they sit there).
    const shouldMarkSeen = lastSeen === null || isOnUpdatesPage;
    if (!shouldMarkSeen || lastSeen === newestDate) return;
    try {
      localStorage.setItem(STORAGE_KEY, newestDate);
    } catch {}
    setLastSeen(newestDate);
  }, [ready, newestDate, isOnUpdatesPage, lastSeen]);

  return Boolean(ready && newestDate && lastSeen && newestDate > lastSeen);
}
