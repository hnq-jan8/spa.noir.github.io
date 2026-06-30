import {
  getOfficialUpdates,
  getSupportContacts,
  getFlights,
  getFaqs,
  getPressReleases,
  getSiteConfig,
  getAssetUrl,
  t as tr,
} from "@/lib/directus";
import { routing } from "@/i18n/routing";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type I18n<T> = Record<string, T>;

function pick<T>(map: I18n<T>, locale: string): T {
  return map[locale] ?? map[routing.defaultLocale];
}

// ─── Payload types (shape của file content.json) ──────────────────────────────

export interface ContentUpdate {
  date: string;
  title: I18n<string>;
  description: I18n<string>;
}

export interface ContentContact {
  key: "passengerHotline" | "familyHotline" | "supportEmail" | "mediaContact";
  value: string;
}

export interface ContentFlightRow {
  no: number;
  type: string;
  capacity: number | string;
  flightNo: string;
  departure: string;
  arrival: string;
  srtd: string;
  atd: string;
  note: string;
}

export interface ContentFaq {
  question: I18n<string>;
  answer: I18n<string>;
}

export interface ContentPressRelease {
  imageSrc: string;
  title: I18n<string>;
  body: I18n<string>;
  imageAlt: I18n<string>;
}

export interface ContentPayload {
  generatedAt: string;
  contacts: ContentContact[];
  flights: ContentFlightRow[];
  updates: ContentUpdate[];
  faqs: ContentFaq[];
  pressRelease: ContentPressRelease | null;
  flightPolicy: I18n<string>;
  /** UI labels từ messages/*.json — có thể edit trong file tĩnh sau khi export. */
  labels: Record<string, Record<string, I18n<string>>>;
}

// ─── Resolved types (hook trả về sau khi pick locale) ────────────────────────

export interface ContentData {
  generatedAt: string;
  contacts: ContentContact[];
  flights: ContentFlightRow[];
  updates: { date: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  pressRelease: {
    imageSrc: string;
    title: string;
    body: string;
    imageAlt: string;
  } | null;
  flightPolicy: string;
  /** UI labels đã resolve theo locale hiện tại. */
  labels: Record<string, Record<string, string>>;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

function formatTime(time: string | null): string {
  if (!time) return "–";
  return time.slice(0, 5);
}

function buildLabels(): ContentPayload["labels"] {
  const localeMap: Record<string, Record<string, Record<string, string>>> = {
    vi: viMessages as Record<string, Record<string, string>>,
    en: enMessages as Record<string, Record<string, string>>,
  };
  const labels: ContentPayload["labels"] = {};
  for (const ns of Object.keys(viMessages)) {
    labels[ns] = {};
    for (const key of Object.keys((viMessages as Record<string, Record<string, string>>)[ns])) {
      labels[ns][key] = Object.fromEntries(
        Object.entries(localeMap).map(([locale, msgs]) => [
          locale,
          msgs[ns]?.[key] ?? "",
        ]),
      );
    }
  }
  return labels;
}

export async function buildContentPayload(): Promise<ContentPayload> {
  const [rawUpdates, contacts, flights, faqs, releases, config] =
    await Promise.all([
      getOfficialUpdates(),
      getSupportContacts(),
      getFlights(),
      getFaqs(),
      getPressReleases(),
      getSiteConfig(),
    ]);

  const latestRelease = releases[0];

  return {
    generatedAt: new Date().toISOString(),
    contacts: contacts.map((c) => ({ key: c.key, value: c.value })),
    flights: flights.map((f, i) => ({
      no: i + 1,
      type: f.aircraft_type ?? "–",
      capacity: f.capacity ?? "–",
      flightNo: f.flight_no,
      departure: f.dep ?? "–",
      arrival: f.arr ?? "–",
      srtd: formatTime(f.srtd),
      atd: formatTime(f.atd),
      note: f.note ?? "–",
    })),
    updates: rawUpdates.map((u) => ({
      date: u.date,
      title: Object.fromEntries(u.translations.map((t) => [t.languages_code, t.title])),
      description: Object.fromEntries(
        u.translations.map((t) => [t.languages_code, t.description]),
      ),
    })),
    faqs: faqs.map((faq) => ({
      question: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.question])),
      answer: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.answer])),
    })),
    pressRelease: latestRelease
      ? {
          imageSrc:
            getAssetUrl(latestRelease.cover_image) ??
            `${basePath}/images/airplane.jpg`,
          title: Object.fromEntries(
            latestRelease.translations.map((t) => [t.languages_code, t.title]),
          ),
          body: Object.fromEntries(
            latestRelease.translations.map((t) => [t.languages_code, t.body]),
          ),
          imageAlt: Object.fromEntries(
            latestRelease.translations.map((t) => [t.languages_code, t.image_alt ?? ""]),
          ),
        }
      : null,
    flightPolicy: Object.fromEntries(
      config.translations.map((t) => [t.languages_code, t.flight_policy]),
    ),
    labels: buildLabels(),
  };
}

export function resolveLocale(payload: ContentPayload, locale: string): ContentData {
  return {
    generatedAt: payload.generatedAt,
    contacts: payload.contacts,
    flights: payload.flights,
    updates: payload.updates.map((u) => ({
      date: u.date,
      title: pick(u.title, locale),
      description: pick(u.description, locale),
    })),
    faqs: payload.faqs.map((f) => ({
      question: pick(f.question, locale),
      answer: pick(f.answer, locale),
    })),
    pressRelease: payload.pressRelease
      ? {
          imageSrc: payload.pressRelease.imageSrc,
          title: pick(payload.pressRelease.title, locale),
          body: pick(payload.pressRelease.body, locale),
          imageAlt: pick(payload.pressRelease.imageAlt, locale),
        }
      : null,
    flightPolicy: pick(payload.flightPolicy, locale),
    labels: Object.fromEntries(
      Object.entries(payload.labels).map(([ns, keys]) => [
        ns,
        Object.fromEntries(
          Object.entries(keys).map(([key, i18n]) => [key, pick(i18n, locale)]),
        ),
      ]),
    ),
  };
}
