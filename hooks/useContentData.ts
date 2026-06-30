"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import type { ContentPayload, ContentData } from "@/lib/contentData";
import { resolveLocale } from "@/lib/contentData";
import { routing } from "@/i18n/routing";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let cachedPromise: Promise<ContentPayload> | null = null;
let cachedPath: string | null = null;

function fetchPayload(path: string): Promise<ContentPayload> {
  if (cachedPromise && cachedPath === path) return cachedPromise;
  cachedPromise = fetch(`${basePath}/content.json?_=${Date.now()}`, { cache: "no-store" })
    .then((res) => res.json() as Promise<ContentPayload>)
    .catch((err) => {
      cachedPromise = null;
      throw err;
    });
  cachedPath = path;
  return cachedPromise;
}

export function useContentData(): ContentData | null {
  const params = useParams();
  const locale = (params?.locale as string) ?? routing.defaultLocale;
  const pathname = usePathname();
  const [data, setData] = useState<ContentData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPayload(pathname)
      .then((payload) => {
        if (!cancelled) setData(resolveLocale(payload, locale));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, pathname]);

  return data;
}
