import { readFileSync } from "fs";
import { resolve } from "path";
import {
  getIsActiveFromAppSetting,
  getSiteMetadata,
  assetUrl,
  type SiteMetadata,
} from "@/lib/directus";
import { fetchLiveContent, fetchLiveStatus } from "../scripts/live-content.mjs";

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
    // `active` thì tuyệt đối không đoán: đoán sai là biến cả site thành trang
    // redirect, hoặc dựng lại site khẩn cấp lẽ ra đã phải tắt. status.json của
    // bản live nói đúng site đang làm gì, không có nó thì thà hỏng.
    const status = await fetchLiveStatus();
    if (!status) throw err;

    // site_metadata đi cùng content.json của site live — một nguồn duy nhất
    // cho mọi thứ cần khi CMS chết, xem scripts/content-payload.mjs. Chỉ thiếu
    // khi chưa từng deploy content nào (build rất đầu, hoặc content.json bị
    // xoá tay trong khi status.json vẫn còn).
    const live = await fetchLiveContent();
    const liveMeta = live?.siteMetadata;

    // Ngoại lệ duy nhất: site đang tắt thì cả trang chỉ là cú redirect sang
    // official_site_url, mà địa chỉ đó nằm trong site_metadata. Không biết đích
    // thì deploy ra một trang redirect đi đâu không rõ — thà hỏng.
    if (!liveMeta && !status.active) throw err;

    active = status.active;
    meta = liveMeta
      ? {
          official_site_url: liveMeta.officialSiteUrl,
          favicon: liveMeta.favicon,
          logo_on_black: liveMeta.logoOnBlack,
          logo_on_white: liveMeta.logoOnWhite,
          translations: Object.keys(liveMeta.seoTitle).map((code) => ({
            languages_code: code,
            seo_title: liveMeta.seoTitle[code],
            seo_description: liveMeta.seoDescription[code] ?? "",
          })),
        }
      : {
          official_site_url: "",
          favicon: null,
          logo_on_black: null,
          logo_on_white: null,
          translations: [],
        };
    console.warn(
      `⚠ Directus site_metadata fetch failed during build (${err instanceof Error ? err.message : err}) — active=${active} lấy từ status.json của site live, metadata ${liveMeta ? "lấy từ content.json của site live" : "để trống (chưa từng deploy nội dung nào): SEO/logo rơi về mặc định, nội dung không ảnh hưởng"}.`,
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
