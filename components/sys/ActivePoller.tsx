"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const POLL_INTERVAL_MS = 30_000;

export default function ActivePoller({
  officialSiteUrl,
}: {
  officialSiteUrl: string;
}) {
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      fetch(`${basePath}/status.json?_=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { active: boolean }) => {
          if (!cancelled && data.active === false) {
            window.location.replace(officialSiteUrl);
          }
        })
        .catch(() => {});
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [officialSiteUrl]);

  return null;
}
