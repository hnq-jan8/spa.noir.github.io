import { defineRouting } from "next-intl/routing";
import generated from "./locales.generated.json";

// Danh sách ngôn ngữ được sinh lúc build bởi scripts/generate-locales.mjs,
// lấy trực tiếp từ collection `languages` trong Directus — không hardcode ở đây.
export const languages = generated.languages;

export const routing = defineRouting({
  locales: generated.locales,
  defaultLocale: generated.defaultLocale,
});
