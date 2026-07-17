"use client";

import { useEffect } from "react";
import { syncContentSince } from "@/hooks/useContentData";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const POLL_INTERVAL_MS = 30_000;
const RELOAD_COOLDOWN_MS = 15_000;

// Nếu bundle mà tab này đang chạy cũ hơn buildId sống (full rebuild vừa
// deploy), tự reload cứng — tránh phải F5 tay hoặc thấy asset cũ (logo,
// label...) kẹt lại vì Next không tự re-render lại layout khi chỉ điều hướng
// SPA giữa các trang con. Guard bằng sessionStorage giống
// cssRecoveryScript/chunkRecoveryScript trong app/layout.tsx — cùng pattern,
// tránh reload loop nếu status.json trả buildId không ổn định.
function reloadOnceGuarded(key: string) {
  try {
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    if (!last || now - parseInt(last, 10) > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(key, String(now));
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
}

export default function ActivePoller({
  officialSiteUrl,
  buildId,
}: {
  officialSiteUrl: string;
  buildId: string;
}) {
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      fetch(`${basePath}/status.json?_=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { active: boolean; since?: string; buildId?: string }) => {
          if (cancelled) return;
          if (data.active === false) {
            window.location.replace(officialSiteUrl);
            return;
          }
          if (data.buildId && data.buildId !== buildId) {
            reloadOnceGuarded("darksite-build-recovery-ts");
            return;
          }
          if (data.since) syncContentSince(data.since);
        })
        .catch(() => {});
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [officialSiteUrl, buildId]);

  return null;
}
