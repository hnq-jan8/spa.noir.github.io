import { readFileSync } from "fs";
import { resolve } from "path";
import { getIsActiveFromAppSetting, getSiteMetadata, assetUrl } from "@/lib/directus";

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
  const [setting, meta] = await Promise.all([
    getIsActiveFromAppSetting(),
    getSiteMetadata(),
  ]);
  cached = {
    active: Boolean(setting.active),
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
