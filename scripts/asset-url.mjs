/**
 * Dựng URL public cho file Directus (favicon/logo, preview_image bài viết).
 *
 * Mặc định trỏ thẳng `${directusUrl}/assets/`. Nếu env `asset_url` được set
 * (vd CDN/reverse-proxy public đứng trước Directus, xem .env), dùng nó làm
 * base thay thế — tự chuẩn hoá có/không có dấu `/` cuối để nối id không bị
 * lặp hoặc thiếu slash.
 */
export function resolveAssetBase(directusUrl) {
  const override = process.env.asset_url?.trim();
  const base = override || `${directusUrl.replace(/\/$/, "")}/assets`;
  return base.endsWith("/") ? base : `${base}/`;
}

/**
 * URL tĩnh cho ảnh đã bake về `$web/cms-assets/` (xem deploy-content-endpoint
 * + fetch-cms-assets.mjs). `assetBasePath` khớp basePath của site khi deploy
 * dưới subpath; mặc định "" (site ở gốc domain).
 */
export function cmsAssetUrl(filename, assetBasePath = "") {
  const base = (assetBasePath || "").replace(/\/$/, "");
  return `${base}/cms-assets/${filename}`;
}

/**
 * preview_image UUID → URL. Nếu `assetManifest[id]` có (ảnh đã bake tĩnh) thì
 * trả path `/cms-assets/<file>`; nếu không, rơi về Directus/`asset_url` như cũ.
 */
export function buildAssetUrl(id, directusUrl, { assetManifest, assetBasePath } = {}) {
  if (!id) return null;
  if (assetManifest && assetManifest[id]) {
    return cmsAssetUrl(assetManifest[id], assetBasePath);
  }
  return `${resolveAssetBase(directusUrl)}${id}`;
}

/**
 * Rich-text (description/body) chứa <img src="..."> do editor Directus tự
 * ghi lúc chọn ảnh — là URL tuyệt đối `${directusUrl}/assets/<id>`, không
 * phải id rời để build lại như preview_image.
 *
 * Nếu có `assetManifest`: thay từng URL ảnh đã bake sang `/cms-assets/<file>`
 * (ảnh không nằm trong manifest giữ nguyên). Nếu không: hành vi cũ — chỉ swap
 * prefix sang `asset_url` khi env đó được set.
 */
export function rewriteAssetUrls(text, directusUrl, { assetManifest, assetBasePath } = {}) {
  if (!text) return text;
  if (assetManifest) {
    // Host-agnostic: bắt cả URL tuyệt đối (bất kỳ host nào) lẫn path tương đối
    // dạng /assets/<uuid>, để không phụ thuộc host editor đã ghi vào rich-text.
    const re = /(?:https?:\/\/[^/"'\s)]+)?\/assets\/([0-9a-fA-F-]{36})([^"'\s)]*)/g;
    return text.replace(re, (match, id) =>
      assetManifest[id] ? cmsAssetUrl(assetManifest[id], assetBasePath) : match,
    );
  }
  const directusBase = `${directusUrl.replace(/\/$/, "")}/assets/`;
  const override = process.env.asset_url?.trim();
  if (!override) return text;
  return text.split(directusBase).join(resolveAssetBase(directusUrl));
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
