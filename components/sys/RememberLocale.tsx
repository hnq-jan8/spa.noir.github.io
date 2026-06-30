"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { saveLocale } from "@/i18n/preference";

export default function RememberLocale() {
  const params = useParams();
  const locale = params?.locale as string | undefined;

  useEffect(() => {
    if (locale) saveLocale(locale);
  }, [locale]);

  return null;
}
