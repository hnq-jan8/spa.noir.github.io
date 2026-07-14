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

// Cache trong tiến trình build — phòng buildContentPayload() bị gọi nhiều
// lần trong cùng một route/worker (tránh gọi lại Directus không cần thiết).
let cached: ContentPayload | null = null;

// /content.json và /status.json là hai route tách biệt, mỗi route được
// `next build` static-export chạy ở module instance riêng — `cached` ở trên
// KHÔNG share được giữa chúng, nên nếu để mỗi bên tự gọi `new
// Date().toISOString()` thì hai timestamp sẽ lệch nhau vài ms. BUILD_TIMESTAMP
// được set một lần duy nhất bởi script build (xem package.json) trước khi
// `next build` chạy, nên cả hai route đọc cùng một giá trị.
const generatedAt = process.env.BUILD_TIMESTAMP ?? new Date().toISOString();

export async function buildContentPayload(): Promise<ContentPayload> {
  if (cached) return cached;

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
    resolveLogo: makeResolveLogo(),
  });
  return cached;
}
