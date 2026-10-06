import { defineRouting } from "next-intl/routing";
import generated from "./locales.generated.json";

// Sinh lúc build bởi scripts/generate-i18n.mjs từ collection `languages` —
// không hardcode ở đây.
// `locales` là SUPERSET (cả ngôn ngữ status=false) để route tĩnh có sẵn: bật
// một ngôn ngữ chỉ cần quick build. `activeLocales`/`languages` chỉ là phần
// đang bật lúc build — dùng cho mọi thứ người dùng thấy/được dẫn tới.
export const languages = generated.languages;
export const activeLocales: string[] = generated.activeLocales ?? generated.locales;

export const routing = defineRouting({
  locales: generated.locales,
  defaultLocale: generated.defaultLocale,
});
