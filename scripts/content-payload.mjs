/**
 * Nguồn duy nhất lắp ráp content.json, dùng chung bởi lib/buildContentPayload.ts
 * (`next build` → deploy-layout) và scripts/fetch-json.mjs (deploy-content).
 *
 * Nằm trong scripts/ vì deploy-content chỉ `sparse-checkout: scripts`, và là
 * .mjs thuần (không TS/path-alias) để chạy được ở cả hai đường. Kiểu TS ở
 * content-payload.d.mts.
 */

import { buildAssetUrl, rewriteAssetUrls } from "./asset-url.mjs";

/** Namespace của ui_labels được nhúng vào từng phần của content.json. */
export const LABEL_NAMESPACES = {
  common: ["nav", "footer", "support", "emptyState", "loadError", "a11y"],
  home: ["home"],
  flightInfo: ["flightInfo"],
  officialUpdates: ["officialUpdates"],
  faqs: ["faqs"],
  pressReleases: ["pressReleases"],
};

export function formatTime(time) {
  if (!time) return "–";
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

/** ui_labels rows → { [namespace]: { [key]: { [locale]: value } } } */
export function buildLabels(languageCodes, labelRows) {
  const labels = {};
  for (const row of labelRows) {
    labels[row.namespace] ??= {};
    labels[row.namespace][row.key] = Object.fromEntries(
      languageCodes.map((code) => [
        code,
        row.translations.find((t) => t.languages_code === code)?.value ?? "",
      ]),
    );
  }
  return labels;
}

function pickNamespaces(labelsByNs, namespaces) {
  const out = {};
  for (const ns of namespaces) {
    if (labelsByNs[ns]) out[ns] = labelsByNs[ns];
  }
  return out;
}

function i18nMap(translations, field) {
  return Object.fromEntries(
    translations.map((t) => [t.languages_code, t[field]]),
  );
}

/** Như i18nMap nhưng cho field rich-text (description/body): rewrite <img src>. */
function i18nRichText(translations, field, directusUrl) {
  return Object.fromEntries(
    translations.map((t) => [
      t.languages_code,
      rewriteAssetUrls(t[field], directusUrl),
    ]),
  );
}

/**
 * Như i18nMap nhưng cho field file (preview_image): UUID → URL asset (xem
 * asset-url.mjs — Directus trực tiếp, hoặc `asset_url` nếu có).
 * MarkdownImage/PreviewImage đã xử lý ảnh hỏng nên không cần fallback ở đây.
 */
function i18nAsset(translations, field, directusUrl) {
  return Object.fromEntries(
    translations.map((t) => [
      t.languages_code,
      buildAssetUrl(t[field], directusUrl),
    ]),
  );
}

/** Lắp ráp toàn bộ payload content.json từ data thô của Directus. */
export function assembleContentPayload({
  generatedAt,
  officialUpdates,
  flights,
  faqs,
  pressReleases,
  siteConfig,
  languages,
  labelRows,
  directusUrl = "",
}) {
  const languageCodes = languages.map((l) => l.code);
  const labelsByNs = buildLabels(languageCodes, labelRows);

  return {
    generatedAt,
    common: {
      contacts: {
        passengerHotline: siteConfig.passenger_hotline,
        familyHotline: siteConfig.family_hotline,
        supportEmail: siteConfig.support_email,
        mediaContact: siteConfig.media_contact,
      },
      social: {
        facebook: siteConfig.social_facebook || null,
        instagram: siteConfig.social_instagram || null,
        linkedin: siteConfig.social_linkedin || null,
        youtube: siteConfig.social_youtube || null,
        tiktok: siteConfig.social_tiktok || null,
      },
      languages: languages.map((l) => ({ code: l.code, name: l.name })),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.common),
    },
    home: {
      // Trang chủ đọc thẳng officialUpdates.updates[0] để card trang chủ và
      // mục đầu timeline không lệch nhau.
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.home),
    },
    faqs: {
      faqs: faqs.map((faq) => ({
        question: i18nMap(faq.translations, "question"),
        answer: i18nMap(faq.translations, "answer"),
      })),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.faqs),
    },
    flightInfo: {
      flights: flights.map((f, i) => ({
        no: i + 1,
        // Date-only từ CMS ("2026-08-27"); web tự format sang ddMMM.
        date: f.date ?? null,
        flightNo: f.flight_no ?? "–",
        departure: f.dep ?? "–",
        arrival: f.arr ?? "–",
        srtd: formatTime(f.srtd),
        atd: formatTime(f.atd),
        note: f.note ?? "–",
      })),
      flightPolicy: i18nMap(siteConfig.translations, "flight_policy"),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.flightInfo),
    },
    officialUpdates: {
      updates: officialUpdates.map((u) => ({
        id: String(u.id),
        date: u.date,
        title: i18nMap(u.translations, "title"),
        description: i18nRichText(u.translations, "description", directusUrl),
        previewExcerpt: i18nMap(u.translations, "preview_excerpt"),
        previewImage: i18nAsset(u.translations, "preview_image", directusUrl),
      })),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.officialUpdates),
    },
    pressReleases: {
      // Thứ tự do query lo (sort=-published_at); bài đầu là bài mới nhất.
      releases: pressReleases.map((r) => ({
        id: String(r.id),
        slug: r.slug || String(r.id),
        publishedAt: r.published_at ?? null,
        title: i18nMap(r.translations, "title"),
        body: i18nRichText(r.translations, "body", directusUrl),
        previewExcerpt: i18nMap(r.translations, "preview_excerpt"),
        previewImage: i18nAsset(r.translations, "preview_image", directusUrl),
      })),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.pressReleases),
    },
  };
}
