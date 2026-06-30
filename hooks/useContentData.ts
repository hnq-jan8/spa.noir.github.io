"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ContentPayload, ContentData } from "@/lib/contentData";
import { resolveLocale } from "@/lib/contentData";
import { routing } from "@/i18n/routing";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let cached: Promise<ContentPayload> | null = null;

function fetchPayload(): Promise<ContentPayload> {
  if (!cached) {
    cached = fetch(`${basePath}/content.json`, { cache: "no-store" })
      .then((res) => res.json() as Promise<ContentPayload>)
      .catch((err) => {
        cached = null;
        throw err;
      });
  }
  return cached;
}

export function useContentData(): ContentData | null {
  const params = useParams();
  const locale = (params?.locale as string) ?? routing.defaultLocale;
  const [data, setData] = useState<ContentData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPayload()
      .then((payload) => {
        if (!cancelled) setData(resolveLocale(payload, locale));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return data;
}
