/**
 * Nguồn DUY NHẤT để lắp ráp content.json — dùng chung bởi:
 *   - lib/contentData.ts        (Next `build` → workflow deploy-layout)
 *   - scripts/fetch-json.mjs    (Node thuần, không build → workflow deploy-content)
 *
 * Đặt trong scripts/ vì deploy-content chỉ `sparse-checkout: scripts`, không thể
 * với tới lib/. Mỗi bên tự fetch dữ liệu Directus theo cách của mình rồi truyền
 * data thô vào assembleContentPayload() — cấu trúc payload + danh sách namespace
 * chỉ định nghĩa ở một chỗ, sửa route/field/label chỉ cần đụng file này.
 *
 * File .mjs (ESM thuần, không TypeScript / path-alias / next-intl) để chạy được
 * cả trong `next build` lẫn `node scripts/fetch-json.mjs`. Kiểu TS ở content-payload.d.mts.
 */

/** Namespace của ui_labels được nhúng vào từng phần của content.json. */
export const LABEL_NAMESPACES = {
  common: ["nav", "footer", "support", "emptyState"],
  home: ["home"],
  flightInfo: ["flightInfo"],
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

/**
 * Lắp ráp toàn bộ payload content.json từ data thô của Directus.
 * resolveLogo được truyền vào vì mỗi caller resolve logo theo cách riêng
 * (path local /cms-assets/... đã tải sẵn lúc build, hoặc URL Directus sống
 * làm fallback — xem scripts/cms-assets.mjs).
 */
export function assembleContentPayload({
  generatedAt,
  officialUpdates,
  flights,
  faqs,
  pressReleases,
  siteConfig,
  languages,
  labelRows,
  resolveLogo,
}) {
  const languageCodes = languages.map((l) => l.code);
  const labelsByNs = buildLabels(languageCodes, labelRows);
  const latestUpdate = officialUpdates[0];
  const latestRelease = pressReleases[0];

  return {
    generatedAt,
    common: {
      contacts: {
        passengerHotline: siteConfig.passenger_hotline,
        familyHotline: siteConfig.family_hotline,
        supportEmail: siteConfig.support_email,
        mediaContact: siteConfig.media_contact,
      },
      logoOnBlack: resolveLogo(siteConfig.logo_on_black),
      logoOnWhite: resolveLogo(siteConfig.logo_on_white),
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
      latestUpdate: latestUpdate
        ? {
            date: latestUpdate.date,
            title: i18nMap(latestUpdate.translations, "title"),
            description: i18nMap(latestUpdate.translations, "description"),
          }
        : null,
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.home),
    },
    faqs: {
      faqs: faqs.map((faq) => ({
        question: i18nMap(faq.translations, "question"),
        answer: i18nMap(faq.translations, "answer"),
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
      flightPolicy: i18nMap(siteConfig.translations, "flight_policy"),
      labels: pickNamespaces(labelsByNs, LABEL_NAMESPACES.flightInfo),
    },
    officialUpdates: {
      updates: officialUpdates.map((u) => ({
        date: u.date,
        title: i18nMap(u.translations, "title"),
        description: i18nMap(u.translations, "description"),
      })),
    },
    pressReleases: {
      pressRelease: latestRelease
        ? {
            title: i18nMap(latestRelease.translations, "title"),
            body: i18nMap(latestRelease.translations, "body"),
          }
        : null,
    },
  };
}
