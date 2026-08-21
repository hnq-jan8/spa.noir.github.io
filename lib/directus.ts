import {
  LANGUAGES_QUERY,
  UI_LABELS_QUERY,
  OFFICIAL_UPDATES_QUERY,
  FLIGHTS_QUERY,
  FAQS_QUERY,
  PRESS_RELEASES_QUERY,
  SITE_CONFIG_QUERY,
  SITE_METADATA_QUERY,
  APP_SETTING_QUERY,
} from "../scripts/directus-queries.mjs";

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

// Một giá trị duy nhất cho cả lần build, dùng để "phá cache" cho những query
// cần đọc dữ liệu mới nhất (ví dụ app_setting) mà vẫn giữ route ở dạng static
// (dùng cache: "no-store" sẽ khiến Next coi route là dynamic, không export được).
const BUILD_NONCE = Date.now().toString();

async function get<T>(
  path: string,
  opts?: { bustCache?: boolean },
): Promise<T> {
  const url = opts?.bustCache
    ? `${BASE}${path}${path.includes("?") ? "&" : "?"}_=${BUILD_NONCE}`
    : `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "ngrok-skip-browser-warning": "true",
    },
    cache: process.env.NODE_ENV === "production" ? "force-cache" : "no-store",
  });
  if (!res.ok) throw new Error(`Directus ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Language {
  code: string;
  name: string;
}

export interface OfficialUpdateTranslation {
  languages_code: string;
  title: string;
  description: string;
  /** Đoạn preview trên card; để trống thì cắt từ `description`. */
  preview_excerpt: string | null;
  /** UUID file trong directus_files. */
  preview_image: string | null;
}
export interface OfficialUpdate {
  id: number;
  date: string;
  translations: OfficialUpdateTranslation[];
}

export interface Flight {
  flight_no: string;
  aircraft_type: string | null;
  capacity: number | null;
  dep: string | null;
  arr: string | null;
  srtd: string | null;
  atd: string | null;
  note: string | null;
}

export interface FaqTranslation {
  languages_code: string;
  question: string;
  answer: string;
}
export interface Faq {
  translations: FaqTranslation[];
}

export interface PressReleaseTranslation {
  languages_code: string;
  title: string;
  body: string;
  preview_excerpt: string | null;
  preview_image: string | null;
}
export interface PressRelease {
  id: number;
  slug: string | null;
  published_at: string | null;
  translations: PressReleaseTranslation[];
}

export interface SiteConfigTranslation {
  languages_code: string;
  flight_policy: string;
}
export interface SiteConfig {
  passenger_hotline: string;
  family_hotline: string;
  support_email: string;
  media_contact: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
  translations: SiteConfigTranslation[];
}

export interface SiteMetadataTranslation {
  languages_code: string;
  seo_title: string;
  seo_description: string;
}
export interface SiteMetadata {
  official_site_url: string;
  favicon: string | null;
  logo_on_black: string | null;
  logo_on_white: string | null;
  translations: SiteMetadataTranslation[];
}

export interface AppSetting {
  active: boolean;
}

export interface UiLabelTranslation {
  languages_code: string;
  value: string;
}
export interface UiLabel {
  namespace: string;
  key: string;
  translations: UiLabelTranslation[];
}

// ─── Fetch functions (một lần gọi, đủ tất cả locale) ─────────────────────────

export async function getOfficialUpdates(): Promise<OfficialUpdate[]> {
  return get(OFFICIAL_UPDATES_QUERY);
}

export async function getFlights(): Promise<Flight[]> {
  return get(FLIGHTS_QUERY);
}

export async function getFaqs(): Promise<Faq[]> {
  return get(FAQS_QUERY);
}

export async function getPressReleases(): Promise<PressRelease[]> {
  return get(PRESS_RELEASES_QUERY);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return get(SITE_CONFIG_QUERY);
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
  return get(SITE_METADATA_QUERY);
}

export async function getIsActiveFromAppSetting(): Promise<AppSetting> {
  return get(APP_SETTING_QUERY, { bustCache: true });
}

export async function getLanguages(): Promise<Language[]> {
  return get(LANGUAGES_QUERY);
}

export async function getUiLabels(): Promise<UiLabel[]> {
  return get(UI_LABELS_QUERY);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function assetUrl(id: string | null): string | null {
  return id ? `${BASE}/assets/${id}` : null;
}

export function t<T extends { translations: { languages_code: string }[] }>(
  item: T,
  locale: string,
): T["translations"][number] {
  return (
    item.translations.find((tr) => tr.languages_code === locale) ??
    item.translations[0]
  );
}
