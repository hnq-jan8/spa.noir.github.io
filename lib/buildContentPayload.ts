import { readFileSync } from "fs";
import { resolve } from "path";
import {
  getOfficialUpdates,
  getFlights,
  getFaqs,
  getPressReleases,
  getSiteConfig,
  getLanguages,
  getUiLabels,
} from "@/lib/directus";
import type { ContentPayload } from "@/lib/contentData";
import { assembleContentPayload } from "../scripts/content-payload.mjs";
import { fetchLiveContent } from "../scripts/live-content.mjs";

// Cache trong tiến trình build — phòng buildContentPayload() bị gọi nhiều
// lần trong cùng một route/worker (tránh gọi lại Directus không cần thiết).
let cached: ContentPayload | null = null;

// i18n/locales.generated.json đã được scripts/generate-i18n.mjs sinh ra
// trước khi `next build` chạy — tận dụng lại để LanguageSelector còn hoạt
// động dù content.json rỗng.
function fallbackLanguages(): { code: string; name: string }[] {
  try {
    const generated = JSON.parse(
      readFileSync(resolve(process.cwd(), "i18n/locales.generated.json"), "utf-8"),
    );
    return generated.languages ?? [];
  } catch {
    return [];
  }
}

function emptyContentPayload(): ContentPayload {
  return {
    generatedAt: process.env.BUILD_TIMESTAMP ?? new Date().toISOString(),
    common: {
      contacts: {
        passengerHotline: "",
        familyHotline: "",
        supportEmail: "",
        mediaContact: "",
      },
      social: {
        facebook: null,
        instagram: null,
        linkedin: null,
        youtube: null,
        tiktok: null,
      },
      languages: fallbackLanguages(),
      labels: {},
    },
    home: { labels: {} },
    faqs: { faqs: [], labels: {} },
    flightInfo: { flights: [], flightPolicy: {}, labels: {} },
    officialUpdates: { updates: [], labels: {} },
    pressReleases: { releases: [], labels: {} },
  };
}

// /content.json và /status.json là hai route tách biệt, mỗi route được
// `next build` static-export chạy ở module instance riêng — `cached` ở trên
// KHÔNG share được giữa chúng, nên nếu để mỗi bên tự gọi `new
// Date().toISOString()` thì hai timestamp sẽ lệch nhau vài ms. BUILD_TIMESTAMP
// được set một lần duy nhất bởi script build (xem package.json) trước khi
// `next build` chạy, nên cả hai route đọc cùng một giá trị.
const generatedAt = process.env.BUILD_TIMESTAMP ?? new Date().toISOString();

export async function buildContentPayload(): Promise<ContentPayload> {
  if (cached) return cached;

  try {
    const [rawUpdates, flights, faqs, releases, config, languages, labelRows] =
      await Promise.all([
        getOfficialUpdates(),
        getFlights(),
        getFaqs(),
        getPressReleases(),
        getSiteConfig(),
        getLanguages(),
        getUiLabels(),
      ]);

    cached = assembleContentPayload({
      generatedAt,
      officialUpdates: rawUpdates,
      flights,
      faqs,
      pressReleases: releases,
      siteConfig: config,
      languages,
      labelRows,
      directusUrl: process.env.DIRECTUS_URL ?? "http://localhost:8055",
    });
  } catch (err) {
    // content.json/status.json là JSON tĩnh, refresh lại được sau (xem
    // scripts/fetch-json.mjs, deploy-content.yml) — Directus sập giữa lúc
    // build không nên làm fail cả layout.
    const stale = await fetchLiveContent();
    console.warn(
      `⚠ Directus content fetch failed during build (${err instanceof Error ? err.message : err}) — ${stale ? "reusing the live site's last content.json" : "deploying layout with an empty content.json"}; a later content update will refill it.`,
    );
    cached = stale ?? emptyContentPayload();
  }
  return cached;
}
