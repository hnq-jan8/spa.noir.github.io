import { defineRouting } from "next-intl/routing";
import generated from "./locales.generated.json";

// Sinh lúc build bởi scripts/generate-i18n.mjs từ collection `languages`
// (chỉ ngôn ngữ status=true) — không hardcode ở đây.
export const languages = generated.languages;

export const routing = defineRouting({
  locales: generated.locales,
  defaultLocale: generated.defaultLocale,
});
