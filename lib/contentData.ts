import { routing } from "@/i18n/routing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type I18n<T> = Record<string, T>;

function pick<T>(map: I18n<T>, locale: string): T {
  return map[locale] ?? map[routing.defaultLocale];
}

/**
 * Same as `pick`, but for fields every consumer treats as a plain string.
 *
 * The CMS lets an editor save an article with an empty body (and a locale can
 * be missing its translation row entirely), so these arrive as `null`/absent
 * even where the shape suggests otherwise. Downstream code calls string
 * methods on them directly — `body.trim()` for reading time, `body.match()`
 * for the fallback heading — so a null here took the whole page down with a
 * client-side exception rather than degrading to an article with no body.
 */
function pickText(map: I18n<string | null> | undefined, locale: string): string {
  return (map ? pick(map, locale) : null) ?? "";
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
  title: I18n<string | null>;
  /** Nullable: the CMS accepts an update saved with an empty body. */
  description: I18n<string | null>;
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
  /** Nullable: same as ContentUpdate.description. */
  body: I18n<string | null>;
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
      // site_config's hotline/email fields are nullable — a cleared one used
      // to reach `value.includes("@")` in the footer/homepage contact grids
      // and crash the page. Coerce to "" here; both grids skip empties.
      contacts: Object.fromEntries(
        Object.entries(payload.common.contacts).map(([k, v]) => [k, v ?? ""]),
      ) as ContentContacts,
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
        question: pickText(f.question, locale),
        answer: pickText(f.answer, locale),
        searchText: [...Object.values(f.question), ...Object.values(f.answer)]
          .join(" ")
          .toLocaleLowerCase(),
      })),
      labels: resolveLabels(payload.faqs.labels, locale),
    },
    flightInfo: {
      flights: payload.flightInfo.flights,
      flightPolicy: pickText(payload.flightInfo.flightPolicy, locale),
      labels: resolveLabels(payload.flightInfo.labels, locale),
    },
    officialUpdates: {
      updates: payload.officialUpdates.updates.map((u) => ({
        key: u.id,
        date: u.date,
        title: pick(u.title, locale) ?? null,
        body: pickText(u.description, locale),
        previewExcerpt: pick(u.previewExcerpt, locale) ?? null,
        previewImage: pick(u.previewImage, locale) ?? null,
      })),
      labels: resolveLabels(payload.officialUpdates.labels, locale),
    },
    pressReleases: {
      releases: payload.pressReleases.releases.map((r) => ({
        key: r.slug,
        date: r.publishedAt,
        title: pick(r.title, locale) ?? null,
        body: pickText(r.body, locale),
        previewExcerpt: pick(r.previewExcerpt, locale) ?? null,
        previewImage: pick(r.previewImage, locale) ?? null,
      })),
      labels: resolveLabels(payload.pressReleases.labels, locale),
    },
  };
}
