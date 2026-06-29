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
  direction: "ltr" | "rtl";
}

export interface OfficialUpdateTranslation {
  languages_code: string;
  title: string;
  description: string;
}
export interface OfficialUpdate {
  id: number;
  date: string;
  status: string;
  translations: OfficialUpdateTranslation[];
}

export interface SupportContact {
  id: number;
  key: "passengerHotline" | "familyHotline" | "supportEmail" | "mediaContact";
  value: string;
}

export interface Flight {
  id: number;
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
  id: number;
  translations: FaqTranslation[];
}

export interface PressReleaseTranslation {
  languages_code: string;
  title: string;
  body: string;
  image_alt: string | null;
}
export interface PressRelease {
  id: number;
  slug: string;
  published_at: string;
  cover_image: string | null;
  translations: PressReleaseTranslation[];
}

export interface SiteConfigTranslation {
  languages_code: string;
  flight_policy: string;
}
export interface SiteConfig {
  id: number;
  official_site_url: string;
  translations: SiteConfigTranslation[];
}

export interface AppSetting {
  active: boolean;
}

// ─── Fetch functions (một lần gọi, đủ tất cả locale) ─────────────────────────

export async function getOfficialUpdates(): Promise<OfficialUpdate[]> {
  return get(
    "/items/official_updates?fields=*,translations.*&sort=-date&filter[status][_eq]=published",
  );
}

export async function getSupportContacts(): Promise<SupportContact[]> {
  return get("/items/support_contacts?sort=id&filter[status][_eq]=published");
}

export async function getFlights(): Promise<Flight[]> {
  return get("/items/flights?sort=sort&filter[status][_eq]=published");
}

export async function getFaqs(): Promise<Faq[]> {
  return get(
    "/items/faqs?fields=*,translations.*&sort=sort&filter[status][_eq]=published",
  );
}

export async function getPressReleases(): Promise<PressRelease[]> {
  return get(
    "/items/press_releases?fields=*,translations.*&sort=sort&filter[status][_eq]=published",
  );
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return get("/items/site_config/1?fields=*,translations.*");
}

export async function getIsActiveFromAppSetting(): Promise<AppSetting> {
  return get("/items/app_setting?fields=active", { bustCache: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function t<T extends { translations: { languages_code: string }[] }>(
  item: T,
  locale: string,
): T["translations"][number] {
  return (
    item.translations.find((tr) => tr.languages_code === locale) ??
    item.translations[0]
  );
}

export function getAssetUrl(fileId: string | null): string | null {
  return fileId ? `${BASE}/assets/${fileId}` : null;
}
