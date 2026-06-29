import { getAppSetting, getSiteConfig } from "@/lib/directus";

export interface BuildMode {
  active: boolean;
  officialSiteUrl: string;
}

let cached: BuildMode | null = null;

// `active` quyết định lúc build: 0 thì toàn bộ site chỉ render redirect về
// official_site_url, không build nội dung Dark Site thật.
export async function getBuildMode(): Promise<BuildMode> {
  if (cached) return cached;
  const [setting, config] = await Promise.all([
    getAppSetting(),
    getSiteConfig(),
  ]);
  cached = {
    active: Boolean(setting.active),
    officialSiteUrl: config.official_site_url,
  };
  return cached;
}
