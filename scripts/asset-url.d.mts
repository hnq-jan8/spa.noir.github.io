export interface AssetUrlOptions {
  /** Map id -> filename ảnh đã bake; có thì trả URL /cms-assets/ tĩnh. */
  assetManifest?: Record<string, string> | null;
  /** basePath của site (deploy dưới subpath); ghép trước /cms-assets/. */
  assetBasePath?: string;
}

export declare function resolveAssetBase(directusUrl: string): string;

export declare function cmsAssetUrl(
  filename: string,
  assetBasePath?: string,
): string;

export declare function buildAssetUrl(
  id: string | null | undefined,
  directusUrl: string,
  options?: AssetUrlOptions,
): string | null;

export declare function rewriteAssetUrls(
  text: string | null,
  directusUrl: string,
  options?: AssetUrlOptions,
): string | null;

export declare function collectAssetIds(input: {
  officialUpdates?: Array<{
    translations?: Array<{ preview_image?: string | null; description?: string | null }>;
  }>;
  pressReleases?: Array<{
    translations?: Array<{ preview_image?: string | null; body?: string | null }>;
  }>;
  siteConfig?: {
    translations?: Array<{ flight_policy?: string | null }>;
  };
}): string[];
