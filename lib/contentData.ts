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

/** Một official update trong danh sách (kèm dữ liệu preview cho card). */
export interface ContentUpdateItem extends ContentUpdate {
  id: string;
  previewExcerpt: I18n<string | null>;
  previewImage: I18n<string | null>;
}

/** Một thông cáo báo chí trong danh sách. */
export interface ContentReleaseItem {
  id: string;
  slug: string;
  publishedAt: string | null;
  title: I18n<string | null>;
  body: I18n<string>;
  previewExcerpt: I18n<string | null>;
  previewImage: I18n<string | null>;
}

/**
 * Hình dạng chung sau khi pick locale cho cả official update lẫn thông cáo —
 * hai collection có tên field khác nhau (description/body, date/published_at),
 * quy về một shape ở đây để card danh sách và trang chi tiết dùng chung một
 * component thay vì viết hai bản gần giống nhau.
 */
export interface ResolvedArticle {
  /** Khoá dùng trên URL trang chi tiết (`?a=`). */
  key: string;
  date: string | null;
  title: string | null;
  body: string;
  previewExcerpt: string | null;
  previewImage: string | null;
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
    social: ContentSocialLinks;
    languages: ContentLanguage[];
    labels: LabelMap;
  };
  /** Trang chủ "/" */
  home: {
    labels: LabelMap;
  };
  /** "/faqs" */
  faqs: {
    faqs: ContentFaq[];
    labels: LabelMap;
  };
  /** "/flight-info" */
  flightInfo: {
    flights: ContentFlightRow[];
    flightPolicy: I18n<string>;
    labels: LabelMap;
  };
  /** "/official-updates" */
  officialUpdates: {
    updates: ContentUpdateItem[];
    labels: LabelMap;
  };
  /** "/press-releases" */
  pressReleases: {
    releases: ContentReleaseItem[];
    labels: LabelMap;
  };
}

// ─── Resolved types (sau khi pick locale) ──────────────────────────────────────

export interface ContentData {
  generatedAt: string;
  common: {
    contacts: ContentContacts;
    social: ContentSocialLinks;
    languages: ContentLanguage[];
    labels: ResolvedLabelMap;
  };
  home: {
    labels: ResolvedLabelMap;
  };
  faqs: {
    faqs: { question: string; answer: string; searchText: string }[];
    labels: ResolvedLabelMap;
  };
  flightInfo: {
    flights: ContentFlightRow[];
    flightPolicy: string;
    labels: ResolvedLabelMap;
  };
  officialUpdates: {
    updates: ResolvedArticle[];
    labels: ResolvedLabelMap;
  };
  pressReleases: {
    releases: ResolvedArticle[];
    labels: ResolvedLabelMap;
  };
}

// ─── Locale resolution ──────────────────────────────────────────────────────

export function resolveLocale(payload: ContentPayload, locale: string): ContentData {
  return {
    generatedAt: payload.generatedAt,
    common: {
      contacts: payload.common.contacts,
      social: payload.common.social,
      languages: payload.common.languages,
      labels: resolveLabels(payload.common.labels, locale),
    },
    home: {
      labels: resolveLabels(payload.home.labels, locale),
    },
    faqs: {
      // searchText spans every locale's question + answer, not just the
      // page's own — so typing an English word still surfaces its Vietnamese
      // translation (same FAQ item) when browsing /vi, and vice versa.
      faqs: payload.faqs.faqs.map((f) => ({
        question: pick(f.question, locale),
        answer: pick(f.answer, locale),
        searchText: [...Object.values(f.question), ...Object.values(f.answer)]
          .join(" ")
          .toLocaleLowerCase(),
      })),
      labels: resolveLabels(payload.faqs.labels, locale),
    },
    flightInfo: {
      flights: payload.flightInfo.flights,
      flightPolicy: pick(payload.flightInfo.flightPolicy, locale),
      labels: resolveLabels(payload.flightInfo.labels, locale),
    },
    officialUpdates: {
      updates: payload.officialUpdates.updates.map((u) => ({
        key: u.id,
        date: u.date,
        title: pick(u.title, locale),
        body: pick(u.description, locale),
        previewExcerpt: pick(u.previewExcerpt, locale),
        previewImage: pick(u.previewImage, locale),
      })),
      labels: resolveLabels(payload.officialUpdates.labels, locale),
    },
    pressReleases: {
      releases: payload.pressReleases.releases.map((r) => ({
        key: r.slug,
        date: r.publishedAt,
        title: pick(r.title, locale),
        body: pick(r.body, locale),
        previewExcerpt: pick(r.previewExcerpt, locale),
        previewImage: pick(r.previewImage, locale),
      })),
      labels: resolveLabels(payload.pressReleases.labels, locale),
    },
  };
}
