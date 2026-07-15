"use client";

import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";

export function useLocale(): string {
  const params = useParams();
  return (params?.locale as string) ?? routing.defaultLocale;
}
