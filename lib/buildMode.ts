import { getIsActiveFromAppSetting, getSiteMetadata, assetUrl } from "@/lib/directus";

export interface BuildMode {
  active: boolean;
  officialSiteUrl: string;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  favicon: string | null;
}

let cached: BuildMode | null = null;

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
    favicon: assetUrl(meta.favicon),
  };
  return cached;
}
