export declare function resolveAssetBase(directusUrl: string): string;

export declare function buildAssetUrl(
  id: string | null | undefined,
  directusUrl: string,
): string | null;

export declare function rewriteAssetUrls(
  text: string | null,
  directusUrl: string,
): string | null;
