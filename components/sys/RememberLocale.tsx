"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { saveLocale } from "@/i18n/preference";

export default function RememberLocale() {
  const params = useParams();
  const locale = params?.locale as string | undefined;

  useEffect(() => {
    if (!locale) return;
    saveLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
