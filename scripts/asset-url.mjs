/**
 * Dựng URL cho ảnh CMS trên site tĩnh. Ảnh public (logo/favicon, preview_image,
 * ảnh inline rich-text) được bake về `$web/assets/` lúc deploy (xem
 * fetch-cms-assets.mjs + deploy-content-endpoint), nên URL trỏ `/assets/<file>`
 * tĩnh — KHÔNG còn hit Directus `/assets` ở runtime (Public files:read đã gỡ).
 */
export function cmsAssetUrl(filename, assetBasePath = "") {
  const base = (assetBasePath || "").replace(/\/$/, "");
  return `${base}/assets/${filename}`;
}

/**
 * preview_image UUID → URL. Có `assetManifest[id]` (ảnh đã bake) → `/assets/
 * <file>` tĩnh. Fallback (id chưa bake) trỏ Directus `/assets/<id>` — chốt chặn
 * cuối, thực tế 403 vì Public files:read đã gỡ, nên mọi ảnh phải được bake.
 */
export function buildAssetUrl(id, directusUrl, { assetManifest, assetBasePath } = {}) {
  if (!id) return null;
  if (assetManifest && assetManifest[id]) {
    return cmsAssetUrl(assetManifest[id], assetBasePath);
  }
  return `${directusUrl.replace(/\/$/, "")}/assets/${id}`;
}

/**
 * Rich-text (description/body) chứa <img src="${directusUrl}/assets/<id>"> do
 * editor Directus ghi. Có `assetManifest` → thay từng URL ảnh đã bake sang
 * `/assets/<file>` tĩnh (ảnh ngoài manifest giữ nguyên). Không manifest → giữ
 * nguyên text (không còn cơ chế `asset_url` cũ).
 */
export function rewriteAssetUrls(text, directusUrl, { assetManifest, assetBasePath } = {}) {
  if (!text || !assetManifest) return text;
  // Host-agnostic: bắt cả URL tuyệt đối (bất kỳ host) lẫn path /assets/<uuid>
  // tương đối, không phụ thuộc host editor đã ghi.
  const re = /(?:https?:\/\/[^/"'\s)]+)?\/assets\/([0-9a-fA-F-]{36})([^"'\s)]*)/g;
  return text.replace(re, (match, id) =>
    assetManifest[id] ? cmsAssetUrl(assetManifest[id], assetBasePath) : match,
  );
}

/**
 * Thu toàn bộ id file public cần bake: preview_image của bài + id ảnh inline
 * trong rich-text (description/body/flight_policy). Dùng chung cho cả CMS
 * extension (deploy) lẫn build tĩnh darksite để hai bên bake đúng cùng tập.
 */
export function collectAssetIds({ officialUpdates = [], pressReleases = [], siteConfig = {} } = {}) {
  const ids = new Set();
  const UUID_IN_ASSETS = /\/assets\/([0-9a-fA-F-]{36})/g;

  const addInline = (text) => {
    if (!text) return;
    for (const m of String(text).matchAll(UUID_IN_ASSETS)) ids.add(m[1]);
  };

  for (const u of officialUpdates) {
    for (const t of u.translations ?? []) {
      if (t.preview_image) ids.add(t.preview_image);
      addInline(t.description);
    }
  }
  for (const r of pressReleases) {
    for (const t of r.translations ?? []) {
      if (t.preview_image) ids.add(t.preview_image);
      addInline(t.body);
    }
  }
  for (const t of siteConfig.translations ?? []) {
    addInline(t.flight_policy);
  }

  return [...ids];
}
