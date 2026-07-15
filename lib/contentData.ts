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

export interface ContentSocialLinks {
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  tiktok: string | null;
}

// ─── Payload types (content.json cấu trúc theo từng route) ────────────────────

export interface ContentPayload {
  generatedAt: string;
  /** Dùng chung bởi Navbar + Footer, không thuộc riêng route nào. */
  common: {
    contacts: ContentContacts;
    logoOnBlack: string | null;
    logoOnWhite: string | null;
    social: ContentSocialLinks;
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
    labels: LabelMap;
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
    social: ContentSocialLinks;
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
    labels: ResolvedLabelMap;
  };
  pressReleases: {
    pressRelease: { title: string; body: string } | null;
  };
}

// ─── Locale resolution ──────────────────────────────────────────────────────

export function resolveLocale(payload: ContentPayload, locale: string): ContentData {
  return {
    generatedAt: payload.generatedAt,
    common: {
      contacts: payload.common.contacts,
      logoOnBlack: payload.common.logoOnBlack,
      logoOnWhite: payload.common.logoOnWhite,
      social: payload.common.social,
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
      labels: resolveLabels(payload.officialUpdates.labels, locale),
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
