import {
  getOfficialUpdates,
  getFlights,
  getFaqs,
  getPressReleases,
  getSiteConfig,
  getLanguages,
  assetUrl,
} from "@/lib/directus";
import { routing } from "@/i18n/routing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type I18n<T> = Record<string, T>;

function pick<T>(map: I18n<T>, locale: string): T {
  return map[locale] ?? map[routing.defaultLocale];
}

type LabelMap = Record<string, Record<string, I18n<string>>>;
type ResolvedLabelMap = Record<string, Record<string, string>>;

function resolveLabels(labels: LabelMap, locale: string): ResolvedLabelMap {
  return Object.fromEntries(
    Object.entries(labels).map(([ns, keys]) => [
      ns,
      Object.fromEntries(Object.entries(keys).map(([key, i18n]) => [key, pick(i18n, locale)])),
    ]),
  );
}

async function buildLabels(namespaces: string[]): Promise<LabelMap> {
  const localeMap: Record<string, Record<string, Record<string, string>>> = {};
  for (const locale of routing.locales) {
    localeMap[locale] = (await import(`@/messages/${locale}.json`))
      .default as Record<string, Record<string, string>>;
  }
  const labels: LabelMap = {};
  for (const ns of namespaces) {
    labels[ns] = {};
    for (const key of Object.keys(localeMap[routing.defaultLocale][ns] ?? {})) {
      labels[ns][key] = Object.fromEntries(
        Object.entries(localeMap).map(([locale, msgs]) => [locale, msgs[ns]?.[key] ?? ""]),
      );
    }
  }
  return labels;
}

function formatTime(time: string | null): string {
  if (!time) return "–";
  const [hours = "", minutes = ""] = time.split(":");
  if (!hours || !minutes) return "–";
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

// ─── Shared value types ────────────────────────────────────────────────────────

export interface ContentContacts {
  passengerHotline: string;
  familyHotline: string;
  supportEmail: string;
  mediaContact: string;
}

export interface ContentUpdate {
  date: string;
  title: I18n<string>;
  description: I18n<string>;
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
  title: I18n<string>;
  body: I18n<string>;
}

export interface ContentLanguage {
  code: string;
  name: string;
}

// ─── Payload types (content.json cấu trúc theo từng route) ────────────────────

export interface ContentPayload {
  generatedAt: string;
  /** Dùng chung bởi Navbar + Footer, không thuộc riêng route nào. */
  common: {
    contacts: ContentContacts;
    logoOnBlack: string | null;
    logoOnWhite: string | null;
    languages: ContentLanguage[];
    labels: LabelMap;
  };
  /** Trang chủ "/" */
  home: {
    latestUpdate: ContentUpdate | null;
    labels: LabelMap;
  };
  /** "/faqs" */
  faqs: {
    faqs: ContentFaq[];
  };
  /** "/flight-info" */
  flightInfo: {
    flights: ContentFlightRow[];
    flightPolicy: I18n<string>;
    labels: LabelMap;
  };
  /** "/official-updates" */
  officialUpdates: {
    updates: ContentUpdate[];
  };
  /** "/press-releases" */
  pressReleases: {
    pressRelease: ContentPressRelease | null;
  };
}

// ─── Resolved types (sau khi pick locale) ──────────────────────────────────────

export interface ContentData {
  generatedAt: string;
  common: {
    contacts: ContentContacts;
    logoOnBlack: string | null;
    logoOnWhite: string | null;
    languages: ContentLanguage[];
    labels: ResolvedLabelMap;
  };
  home: {
    latestUpdate: { date: string; title: string; description: string } | null;
    labels: ResolvedLabelMap;
  };
  faqs: {
    faqs: { question: string; answer: string }[];
  };
  flightInfo: {
    flights: ContentFlightRow[];
    flightPolicy: string;
    labels: ResolvedLabelMap;
  };
  officialUpdates: {
    updates: { date: string; title: string; description: string }[];
  };
  pressReleases: {
    pressRelease: { title: string; body: string } | null;
  };
}

// ─── Builder ────────────────────────────────────────────────────────────────────

export async function buildContentPayload(): Promise<ContentPayload> {
  const [rawUpdates, flights, faqs, releases, config, languages, commonLabels, homeLabels, flightInfoLabels] =
    await Promise.all([
      getOfficialUpdates(),
      getFlights(),
      getFaqs(),
      getPressReleases(),
      getSiteConfig(),
      getLanguages(),
      buildLabels(["nav", "footer", "support", "emptyState"]),
      buildLabels(["home"]),
      buildLabels(["flightInfo"]),
    ]);

  const latestUpdate = rawUpdates[0];
  const latestRelease = releases[0];

  return {
    generatedAt: new Date().toISOString(),
    common: {
      contacts: {
        passengerHotline: config.passenger_hotline,
        familyHotline: config.family_hotline,
        supportEmail: config.support_email,
        mediaContact: config.media_contact,
      },
      logoOnBlack: assetUrl(config.logo_on_black),
      logoOnWhite: assetUrl(config.logo_on_white),
      languages: languages.map((l) => ({ code: l.code, name: l.name })),
      labels: commonLabels,
    },
    home: {
      latestUpdate: latestUpdate
        ? {
            date: latestUpdate.date,
            title: Object.fromEntries(
              latestUpdate.translations.map((t) => [t.languages_code, t.title]),
            ),
            description: Object.fromEntries(
              latestUpdate.translations.map((t) => [t.languages_code, t.description]),
            ),
          }
        : null,
      labels: homeLabels,
    },
    faqs: {
      faqs: faqs.map((faq) => ({
        question: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.question])),
        answer: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.answer])),
      })),
    },
    flightInfo: {
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
      flightPolicy: Object.fromEntries(
        config.translations.map((t) => [t.languages_code, t.flight_policy]),
      ),
      labels: flightInfoLabels,
    },
    officialUpdates: {
      updates: rawUpdates.map((u) => ({
        date: u.date,
        title: Object.fromEntries(u.translations.map((t) => [t.languages_code, t.title])),
        description: Object.fromEntries(
          u.translations.map((t) => [t.languages_code, t.description]),
        ),
      })),
    },
    pressReleases: {
      pressRelease: latestRelease
        ? {
            title: Object.fromEntries(
              latestRelease.translations.map((t) => [t.languages_code, t.title]),
            ),
            body: Object.fromEntries(
              latestRelease.translations.map((t) => [t.languages_code, t.body]),
            ),
          }
        : null,
    },
  };
}

export function resolveLocale(payload: ContentPayload, locale: string): ContentData {
  return {
    generatedAt: payload.generatedAt,
    common: {
      contacts: payload.common.contacts,
      logoOnBlack: payload.common.logoOnBlack,
      logoOnWhite: payload.common.logoOnWhite,
      languages: payload.common.languages,
      labels: resolveLabels(payload.common.labels, locale),
    },
    home: {
      latestUpdate: payload.home.latestUpdate
        ? {
            date: payload.home.latestUpdate.date,
            title: pick(payload.home.latestUpdate.title, locale),
            description: pick(payload.home.latestUpdate.description, locale),
          }
        : null,
      labels: resolveLabels(payload.home.labels, locale),
    },
    faqs: {
      faqs: payload.faqs.faqs.map((f) => ({
        question: pick(f.question, locale),
        answer: pick(f.answer, locale),
      })),
    },
    flightInfo: {
      flights: payload.flightInfo.flights,
      flightPolicy: pick(payload.flightInfo.flightPolicy, locale),
      labels: resolveLabels(payload.flightInfo.labels, locale),
    },
    officialUpdates: {
      updates: payload.officialUpdates.updates.map((u) => ({
        date: u.date,
        title: pick(u.title, locale),
        description: pick(u.description, locale),
      })),
    },
    pressReleases: {
      pressRelease: payload.pressReleases.pressRelease
        ? {
            title: pick(payload.pressReleases.pressRelease.title, locale),
            body: pick(payload.pressReleases.pressRelease.body, locale),
          }
        : null,
    },
  };
}
