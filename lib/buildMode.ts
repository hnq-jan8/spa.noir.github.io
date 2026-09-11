import { readFileSync } from "fs";
import { resolve } from "path";
import {
  getIsActiveFromAppSetting,
  getSiteMetadata,
  assetUrl,
  type SiteMetadata,
} from "@/lib/directus";
import { readMetadataSnapshot } from "../scripts/cms-assets.mjs";
import { fetchLiveStatus } from "../scripts/live-content.mjs";

export interface BuildMode {
  active: boolean;
  officialSiteUrl: string;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  favicon: string | null;
  logoOnBlack: string | null;
  logoOnWhite: string | null;
  /**
   * Chỉ đổi khi có full rebuild thật (bundle JS/HTML mới) — set 1 lần bởi
   * `pnpm build` (xem package.json), KHÔNG đổi bởi content-only deploy
   * (scripts/fetch-json.mjs giữ nguyên giá trị cũ khi ghi lại status.json).
   * Dùng để ActivePoller phát hiện tab đang mở chạy bundle cũ và tự reload.
   */
  buildId: string;
}

let cached: BuildMode | null = null;

// Manifest do scripts/fetch-cms-assets.mjs ghi lúc prebuild — tránh URL
// Directus sống vỡ nếu server offline lúc user xem site.
function resolveCmsAsset(id: string | null): string | null {
  if (!id) return null;
  try {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "public/cms-assets/manifest.json"), "utf-8"),
    );
    const filename = manifest[id];
    if (filename) return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cms-assets/${filename}`;
  } catch {
    // manifest chưa có (vd next dev chưa chạy prebuild) — fallback bên dưới.
  }
  return assetUrl(id);
}

// `active` quyết định lúc build: 0 thì toàn bộ site chỉ render redirect về
// official_site_url, không build nội dung Dark Site thật.
export async function getBuildMode(): Promise<BuildMode> {
  if (cached) return cached;

  let active: boolean;
  let meta: SiteMetadata;
  try {
    const [setting, fresh] = await Promise.all([
      getIsActiveFromAppSetting(),
      getSiteMetadata(),
    ]);
    active = Boolean(setting.active);
    meta = fresh;
  } catch (err) {
    // Cần CẢ HAI: bản chụp site_metadata do prebuild ghi, và `active` của site
    // đang live. Thiếu một thì thà hỏng còn hơn đoán — đoán sai `active` là
    // biến cả site thành trang redirect, hoặc dựng lại site khẩn cấp lẽ ra đã
    // phải tắt.
    const snapshot = readMetadataSnapshot(resolve(process.cwd(), "public"));
    const status = snapshot ? await fetchLiveStatus() : null;
    if (!snapshot || !status) throw err;
    active = status.active;
    meta = snapshot;
    console.warn(
      `⚠ Directus site_metadata fetch failed during build (${err instanceof Error ? err.message : err}) — dùng bản chụp của lượt prebuild gần nhất, active=${active} lấy từ status.json của site live.`,
    );
  }

  cached = {
    active,
    officialSiteUrl: meta.official_site_url,
    seoTitle: Object.fromEntries(
      meta.translations.map((t) => [t.languages_code, t.seo_title]),
    ),
    seoDescription: Object.fromEntries(
      meta.translations.map((t) => [t.languages_code, t.seo_description]),
    ),
    favicon: resolveCmsAsset(meta.favicon),
    logoOnBlack: resolveCmsAsset(meta.logo_on_black),
    logoOnWhite: resolveCmsAsset(meta.logo_on_white),
    buildId: process.env.BUILD_TIMESTAMP ?? "dev",
  };
  return cached;
}
