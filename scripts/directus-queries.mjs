// Query path tới Directus, dùng chung cho lib/directus.ts (next build),
// scripts/fetch-json.mjs (deploy content-only) và scripts/generate-i18n.mjs.
// Sửa filter/fields ở đây, một lần cho cả ba.

// status=true: ngôn ngữ đang tắt không sinh locale/route, không vào content.json.
export const LANGUAGES_QUERY =
  "/items/languages?fields=code,name&sort=sort&filter[deleted_at][_null]=true&filter[status][_eq]=true";

export const UI_LABELS_QUERY =
  "/items/ui_labels?fields=namespace,key,translations.languages_code,translations.value&limit=-1&filter[deleted_at][_null]=true";

export const OFFICIAL_UPDATES_QUERY =
  "/items/official_updates?fields=id,date,translations.languages_code,translations.title,translations.description,translations.preview_excerpt,translations.preview_image&sort=-date&filter[status][_eq]=published&filter[deleted_at][_null]=true";

export const FLIGHTS_QUERY =
  "/items/flights?fields=flight_no,date,dep,arr,srtd,atd,note&sort=sort&filter[deleted_at][_null]=true";

export const FAQS_QUERY =
  "/items/faqs?fields=translations.languages_code,translations.question,translations.answer&sort=sort&filter[deleted_at][_null]=true";

// sort=-published_at: bài mới nhất lên đầu, giống official_updates (sort=-date).
// Collection không còn field `sort` để biên tập viên kéo thả thứ tự nữa.
export const PRESS_RELEASES_QUERY =
  "/items/press_releases?fields=id,slug,published_at,translations.languages_code,translations.title,translations.body,translations.preview_excerpt,translations.preview_image&sort=-published_at&filter[status][_eq]=published&filter[deleted_at][_null]=true";

export const SITE_CONFIG_QUERY =
  "/items/site_config/1?fields=passenger_hotline,family_hotline,support_email,media_contact,social_facebook,social_instagram,social_linkedin,social_youtube,social_tiktok,translations.languages_code,translations.flight_policy";

export const SITE_METADATA_QUERY =
  "/items/site_metadata/1?fields=official_site_url,favicon,logo_on_black,logo_on_white,translations.languages_code,translations.seo_title,translations.seo_description";

export const APP_SETTING_QUERY = "/items/app_setting?fields=active";
