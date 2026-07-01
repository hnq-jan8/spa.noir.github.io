import { getIsActiveFromAppSetting, getSiteConfig } from "@/lib/directus";

export interface BuildMode {
  active: boolean;
  officialSiteUrl: string;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
}

let cached: BuildMode | null = null;

// `active` quyết định lúc build: 0 thì toàn bộ site chỉ render redirect về
// official_site_url, không build nội dung Dark Site thật.
export async function getBuildMode(): Promise<BuildMode> {
  if (cached) return cached;
  const [setting, config] = await Promise.all([
    getIsActiveFromAppSetting(),
    getSiteConfig(),
  ]);
  cached = {
    active: Boolean(setting.active),
    officialSiteUrl: config.official_site_url,
    seoTitle: Object.fromEntries(
      config.translations.map((t) => [t.languages_code, t.seo_title]),
    ),
    seoDescription: Object.fromEntries(
      config.translations.map((t) => [t.languages_code, t.seo_description]),
    ),
  };
  return cached;
}
