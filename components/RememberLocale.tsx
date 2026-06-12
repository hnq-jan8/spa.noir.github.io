"use client";

import { useEffect } from "react";
import { saveLocale } from "@/i18n/preference";

export default function RememberLocale({ locale }: { locale: string }) {
  useEffect(() => {
    saveLocale(locale);
  }, [locale]);

  return null;
}
