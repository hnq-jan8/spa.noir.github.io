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

// Chỉ dùng khi CMS chết mà cũng chưa có bản chụp nào — lượt build đầu tiên sau
// khi thêm cơ chế chụp. Để trống chứ không bịa: trang ra không <title>/<meta
// description>, logo rơi về public/logo.svg, nội dung không ảnh hưởng. Một
// lượt build lành là có bản chụp, hố này đóng vĩnh viễn. `official_site_url`
// rỗng vô hại vì nhánh này chỉ chạy khi active=true.
const BLANK_METADATA: SiteMetadata = {
  official_site_url: "",
  favicon: null,
  logo_on_black: null,
  logo_on_white: null,
  translations: [],
};

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

    // Bản chụp site_metadata thì được phép thiếu. Nó do prebuild ghi nên lượt
    // build ĐẦU TIÊN gặp lúc CMS chết sẽ chưa có bản nào — bắt buộc phải có nó
    // là tự trói mình vào thứ chỉ tồn tại khi không cần tới.
    const snapshot = readMetadataSnapshot(resolve(process.cwd(), "public"));

    // Ngoại lệ duy nhất: site đang tắt thì cả trang chỉ là cú redirect sang
    // official_site_url, mà địa chỉ đó nằm trong site_metadata. Không biết đích
    // thì deploy ra một trang redirect đi đâu không rõ — thà hỏng.
    if (!snapshot && !status.active) throw err;

    active = status.active;
    meta = snapshot ?? BLANK_METADATA;
    console.warn(
      `⚠ Directus site_metadata fetch failed during build (${err instanceof Error ? err.message : err}) — active=${active} lấy từ status.json của site live, metadata ${snapshot ? "dùng bản chụp của lượt prebuild gần nhất" : "để trống (chưa có bản chụp nào): SEO/logo rơi về mặc định, nội dung không ảnh hưởng"}.`,
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
