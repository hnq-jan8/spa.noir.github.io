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
  });
  return cached;
}
