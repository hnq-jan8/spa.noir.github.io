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
  assetUrl,
} from "@/lib/directus";
import type { ContentPayload } from "@/lib/contentData";
import { assembleContentPayload } from "../scripts/content-payload.mjs";

// Server-only: dùng fs để đọc manifest logo CMS, tách khỏi lib/contentData.ts
// (được client-side hooks/useContentData.ts import cho type + resolveLocale —
// gộp chung sẽ kéo `fs` vào bundle client và làm webpack build fail).

// Manifest do scripts/fetch-cms-assets.mjs ghi lúc prebuild (chạy trong
// `pnpm build`, trước `next build`). Nếu không có (vd `next dev` chưa chạy
// prebuild), fallback về assetUrl (URL Directus sống) để dev vẫn thấy logo
// mới upload ngay.
function readCmsAssetManifest(): Record<string, string> {
  try {
    const raw = readFileSync(
      resolve(process.cwd(), "public/cms-assets/manifest.json"),
      "utf-8",
    );
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function makeResolveLogo() {
  const manifest = readCmsAssetManifest();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (id: string | null): string | null => {
    if (!id) return null;
    const filename = manifest[id];
    return filename ? `${basePath}/cms-assets/${filename}` : assetUrl(id);
  };
}

export async function buildContentPayload(): Promise<ContentPayload> {
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

  return assembleContentPayload({
    generatedAt: new Date().toISOString(),
    officialUpdates: rawUpdates,
    flights,
    faqs,
    pressReleases: releases,
    siteConfig: config,
    languages,
    labelRows,
    resolveLogo: makeResolveLogo(),
  });
}
