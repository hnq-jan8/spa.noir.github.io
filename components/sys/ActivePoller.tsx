"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ActivePoller({
  officialSiteUrl,
}: {
  officialSiteUrl: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    fetch(`${basePath}/status.json?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { active: boolean }) => {
        if (!cancelled && data.active === false) {
          window.location.replace(officialSiteUrl);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [pathname, officialSiteUrl]);

  return null;
}
